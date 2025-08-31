import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

// 獲取所有商品
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('獲取商品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 獲取單個商品
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await query('SELECT * FROM products WHERE id = $1 AND is_active = TRUE', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '商品不存在' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('獲取商品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

export default router