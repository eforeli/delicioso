import express from 'express'
import { query } from '../config/database.js'
import { verifyToken, verifyAdmin } from '../middleware/auth.js'
import createCsvWriter from 'csv-writer'
import fs from 'fs'
import path from 'path'

const router = express.Router()

// 獲取所有訂單 (管理員)
router.get('/orders', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT o.*, u.name as customer_name, u.email, u.phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `)
    
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

// 獲取系統設定
router.get('/settings', async (req, res) => {
  try {
    const result = await query('SELECT * FROM settings')
    const settings = {}
    result.rows.forEach(row => {
      settings[row.key] = row.value
    })
    res.json(settings)
  } catch (error) {
    console.error('獲取設定錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// CSV 匯出所有訂單
router.get('/export/orders', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT o.id, o.total_amount, o.status, o.shipping_address, o.notes, 
             o.payment_last_five, o.created_at, o.updated_at,
             u.name as customer_name, u.email, u.phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `)
    
    // 創建臨時CSV文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `orders_export_${timestamp}.csv`
    const filepath = path.join(process.cwd(), 'exports', filename)
    
    // 確保exports目錄存在
    if (!fs.existsSync(path.join(process.cwd(), 'exports'))) {
      fs.mkdirSync(path.join(process.cwd(), 'exports'))
    }
    
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'id', title: '訂單編號' },
        { id: 'customer_name', title: '客戶姓名' },
        { id: 'email', title: '客戶信箱' },
        { id: 'phone', title: '客戶電話' },
        { id: 'total_amount', title: '訂單金額' },
        { id: 'status', title: '訂單狀態' },
        { id: 'shipping_address', title: '配送地址' },
        { id: 'notes', title: '備註' },
        { id: 'payment_last_five', title: '轉帳末五碼' },
        { id: 'created_at', title: '建立時間' },
        { id: 'updated_at', title: '更新時間' }
      ]
    })
    
    await csvWriter.writeRecords(result.rows)
    
    // 設定下載標頭
    res.setHeader('Content-disposition', `attachment; filename=${filename}`)
    res.setHeader('Content-type', 'text/csv; charset=utf-8')
    
    // 發送文件
    const fileStream = fs.createReadStream(filepath)
    fileStream.pipe(res)
    
    // 清理臨時文件（延遲10秒後刪除）
    setTimeout(() => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
    }, 10000)
    
  } catch (error) {
    console.error('CSV匯出錯誤:', error)
    res.status(500).json({ message: 'CSV匯出失敗' })
  }
})

// CSV 匯出客戶資料
router.get('/export/customers', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT u.id, u.name, u.email, u.phone, u.birthday, u.role, u.created_at,
             COUNT(o.id) as total_orders,
             COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.name, u.email, u.phone, u.birthday, u.role, u.created_at
      ORDER BY u.created_at DESC
    `)
    
    // 創建臨時CSV文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `customers_export_${timestamp}.csv`
    const filepath = path.join(process.cwd(), 'exports', filename)
    
    // 確保exports目錄存在
    if (!fs.existsSync(path.join(process.cwd(), 'exports'))) {
      fs.mkdirSync(path.join(process.cwd(), 'exports'))
    }
    
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'id', title: '客戶編號' },
        { id: 'name', title: '姓名' },
        { id: 'email', title: '信箱' },
        { id: 'phone', title: '電話' },
        { id: 'birthday', title: '生日' },
        { id: 'role', title: '角色' },
        { id: 'total_orders', title: '訂單數量' },
        { id: 'total_spent', title: '總消費金額' },
        { id: 'created_at', title: '註冊時間' }
      ]
    })
    
    await csvWriter.writeRecords(result.rows)
    
    // 設定下載標頭
    res.setHeader('Content-disposition', `attachment; filename=${filename}`)
    res.setHeader('Content-type', 'text/csv; charset=utf-8')
    
    // 發送文件
    const fileStream = fs.createReadStream(filepath)
    fileStream.pipe(res)
    
    // 清理臨時文件（延遲10秒後刪除）
    setTimeout(() => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
    }, 10000)
    
  } catch (error) {
    console.error('CSV匯出錯誤:', error)
    res.status(500).json({ message: 'CSV匯出失敗' })
  }
})

// Google Apps Script webhook 接收端點
router.post('/webhook/gas', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { type, data } = req.body
    
    switch (type) {
      case 'order_export':
        // 匯出訂單到 Google Sheets
        const ordersResult = await query(`
          SELECT o.id, o.total_amount, o.status, o.shipping_address, o.notes, 
                 o.payment_last_five, o.created_at, o.updated_at,
                 u.name as customer_name, u.email, u.phone
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          ORDER BY o.created_at DESC
          LIMIT 100
        `)
        res.json({ success: true, data: ordersResult.rows })
        break
        
      case 'customer_export':
        // 匯出客戶資料到 Google Sheets
        const customersResult = await query(`
          SELECT u.id, u.name, u.email, u.phone, u.birthday, u.role, u.created_at,
                 COUNT(o.id) as total_orders,
                 COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          GROUP BY u.id, u.name, u.email, u.phone, u.birthday, u.role, u.created_at
          ORDER BY u.created_at DESC
        `)
        res.json({ success: true, data: customersResult.rows })
        break
        
      case 'update_order_status':
        // 從 Google Sheets 更新訂單狀態
        const { orderId, status } = data
        const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled']
        
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ success: false, message: '無效的訂單狀態' })
        }
        
        await query(
          'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, orderId]
        )
        
        res.json({ success: true, message: '訂單狀態已更新' })
        break
        
      default:
        res.status(400).json({ success: false, message: '不支援的操作類型' })
    }
  } catch (error) {
    console.error('Google Apps Script webhook 錯誤:', error)
    res.status(500).json({ success: false, message: '處理請求失敗' })
  }
})

export default router