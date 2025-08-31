import express from 'express'
import { query } from '../config/database.js'
import { verifyToken, verifyAdmin } from '../middleware/auth.js'

const router = express.Router()

// 創建訂單（從購物車結帳）
router.post('/', verifyToken, async (req, res) => {
  try {
    const { shipping_address, notes } = req.body
    
    if (!shipping_address) {
      return res.status(400).json({ message: '配送地址為必填項' })
    }
    
    // 獲取用戶購物車
    const cartResult = await query(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.stock,
              (ci.quantity * p.price) as subtotal
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? AND p.is_active = 1`,
      [req.user.id]
    )
    
    if (cartResult.rows.length === 0) {
      return res.status(400).json({ message: '購物車是空的' })
    }
    
    // 檢查庫存
    for (const item of cartResult.rows) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ 
          message: `商品 ${item.name} 庫存不足（剩餘 ${item.stock} 件）` 
        })
      }
    }
    
    // 計算總金額
    const totalAmount = cartResult.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
    
    // 創建訂單
    await query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, notes, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, totalAmount.toFixed(2), shipping_address, notes || '', 'pending']
    )
    
    // 獲取剛創建的訂單
    const orderResult = await query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [req.user.id]
    )
    const order = orderResult.rows[0]
    
    // 創建訂單項目
    for (const item of cartResult.rows) {
      await query(
        'INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [order.id, item.product_id, item.name, item.price, item.quantity, item.subtotal]
      )
      
      // 更新庫存
      await query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      )
    }
    
    // 清空購物車
    await query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id])
    
    res.status(201).json({
      message: '訂單創建成功',
      order: {
        id: order.id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at
      }
    })
  } catch (error) {
    console.error('創建訂單錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 獲取用戶訂單
router.get('/my', verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    )
    
    // 獲取每個訂單的項目
    const orders = []
    for (const order of result.rows) {
      const itemsResult = await query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      )
      orders.push({
        ...order,
        items: itemsResult.rows
      })
    }
    
    res.json(orders)
  } catch (error) {
    console.error('獲取訂單錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 獲取單個訂單詳情
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params
    
    // 獲取訂單基本信息
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    )
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: '訂單不存在' })
    }
    
    // 獲取訂單項目
    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    )
    
    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows
    })
  } catch (error) {
    console.error('獲取訂單詳情錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 更新付款資訊（填寫轉帳末五碼）
router.patch('/:orderId/payment', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params
    const { payment_last_five } = req.body
    
    if (!payment_last_five || payment_last_five.length !== 5) {
      return res.status(400).json({ message: '請提供轉帳帳號末五碼' })
    }
    
    // 檢查訂單是否存在且屬於該用戶
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    )
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: '訂單不存在' })
    }
    
    if (orderResult.rows[0].status !== 'pending') {
      return res.status(400).json({ message: '此訂單無法修改付款資訊' })
    }
    
    // 更新付款資訊並將狀態改為已付款
    await query(
      'UPDATE orders SET payment_last_five = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [payment_last_five, 'paid', orderId]
    )
    
    res.json({ message: '付款資訊已更新，等待商家確認' })
  } catch (error) {
    console.error('更新付款資訊錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 管理員獲取所有訂單
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = ''
    let params = []
    
    if (status) {
      whereClause = 'WHERE o.status = ?'
      params.push(status)
    }
    
    const result = await query(
      `SELECT o.*, u.name as customer_name, u.email, u.phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    
    // 獲取每個訂單的項目
    const orders = []
    for (const order of result.rows) {
      const itemsResult = await query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      )
      orders.push({
        ...order,
        items: itemsResult.rows
      })
    }
    
    res.json(orders)
  } catch (error) {
    console.error('獲取訂單錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 管理員更新訂單狀態
router.patch('/admin/:orderId/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body
    
    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: '無效的訂單狀態' })
    }
    
    const result = await query(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, orderId]
    )
    
    if (result.changes === 0) {
      return res.status(404).json({ message: '訂單不存在' })
    }
    
    res.json({ message: '訂單狀態已更新' })
  } catch (error) {
    console.error('更新訂單狀態錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

export default router