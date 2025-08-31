import express from 'express'
import { query } from '../config/database.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// 獲取購物車內容
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url, p.stock,
              (ci.quantity * p.price) as subtotal
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? AND p.is_active = 1`,
      [req.user.id]
    )
    
    const total = result.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
    
    res.json({
      items: result.rows,
      total: total.toFixed(2),
      count: result.rows.reduce((sum, item) => sum + item.quantity, 0)
    })
  } catch (error) {
    console.error('獲取購物車錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 加入商品到購物車
router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body
    
    // 檢查商品是否存在且有庫存
    const productResult = await query(
      'SELECT id, name, stock, is_active FROM products WHERE id = ?',
      [productId]
    )
    
    if (productResult.rows.length === 0 || !productResult.rows[0].is_active) {
      return res.status(404).json({ message: '商品不存在' })
    }
    
    const product = productResult.rows[0]
    if (product.stock < quantity) {
      return res.status(400).json({ message: '庫存不足' })
    }
    
    // 檢查是否已在購物車中
    const existingItem = await query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    )
    
    if (existingItem.rows.length > 0) {
      // 更新數量
      const newQuantity = existingItem.rows[0].quantity + quantity
      if (newQuantity > product.stock) {
        return res.status(400).json({ message: '數量超過庫存限制' })
      }
      
      await query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItem.rows[0].id]
      )
    } else {
      // 新增項目
      await query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, productId, quantity]
      )
    }
    
    res.json({ message: '已加入購物車' })
  } catch (error) {
    console.error('加入購物車錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 更新購物車項目數量
router.put('/:itemId', verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params
    const { quantity } = req.body
    
    if (quantity <= 0) {
      return res.status(400).json({ message: '數量必須大於 0' })
    }
    
    // 檢查項目是否屬於該用戶
    const itemResult = await query(
      `SELECT ci.id, ci.product_id, p.stock 
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = ? AND ci.user_id = ?`,
      [itemId, req.user.id]
    )
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: '購物車項目不存在' })
    }
    
    const item = itemResult.rows[0]
    if (quantity > item.stock) {
      return res.status(400).json({ message: '數量超過庫存限制' })
    }
    
    await query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, itemId]
    )
    
    res.json({ message: '數量已更新' })
  } catch (error) {
    console.error('更新購物車錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 從購物車移除項目
router.delete('/:itemId', verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params
    
    const result = await query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, req.user.id]
    )
    
    if (result.changes === 0) {
      return res.status(404).json({ message: '購物車項目不存在' })
    }
    
    res.json({ message: '已移除商品' })
  } catch (error) {
    console.error('移除購物車項目錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 清空購物車
router.delete('/', verifyToken, async (req, res) => {
  try {
    await query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id])
    res.json({ message: '購物車已清空' })
  } catch (error) {
    console.error('清空購物車錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

export default router