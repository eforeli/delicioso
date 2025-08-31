import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

// 獲取所有訂單 (管理員)
router.get('/orders', async (req, res) => {
  try {
    const result = await query(`
      SELECT o.*, u.name as customer_name, u.email, u.phone,
      json_agg(
        json_build_object(
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.product_price,
          'subtotal', oi.subtotal
        )
      ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, u.name, u.email, u.phone
      ORDER BY o.created_at DESC
    `)
    res.json(result.rows)
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

export default router