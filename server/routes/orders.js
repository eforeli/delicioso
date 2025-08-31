import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

// 獲取用戶訂單
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const result = await query(
      `SELECT o.*, 
       json_agg(
         json_build_object(
           'product_name', oi.product_name,
           'quantity', oi.quantity,
           'price', oi.product_price,
           'subtotal', oi.subtotal
         )
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('獲取訂單錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

export default router