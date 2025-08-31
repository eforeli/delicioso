import express from 'express'
import { query } from '../config/database.js'
import { verifyToken, verifyAdmin } from '../middleware/auth.js'

const router = express.Router()

// 獲取所有商品（公開）
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('獲取商品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 獲取所有商品（管理員，包括未啟用）
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM products ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('獲取商品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 獲取單個商品（公開）
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await query('SELECT * FROM products WHERE id = ? AND is_active = 1', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '商品不存在' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('獲取商品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 創建新商品（管理員）
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, image_url } = req.body
    
    if (!name || !price) {
      return res.status(400).json({ message: '商品名稱和價格為必填項' })
    }
    
    await query(
      'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description || '', parseFloat(price), parseInt(stock) || 0, image_url || null]
    )
    
    // 獲取剛創建的商品
    const newProduct = await query(
      'SELECT * FROM products WHERE name = ? AND price = ? ORDER BY id DESC LIMIT 1',
      [name, parseFloat(price)]
    )
    
    res.status(201).json({
      message: '商品創建成功',
      product: newProduct.rows[0]
    })
  } catch (error) {
    console.error('創建商品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 更新商品（管理員）
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, stock, image_url, is_active } = req.body
    
    // 檢查商品是否存在
    const existing = await query('SELECT id FROM products WHERE id = ?', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: '商品不存在' })
    }
    
    await query(
      `UPDATE products SET 
       name = ?, description = ?, price = ?, stock = ?, 
       image_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name,
        description || '',
        parseFloat(price),
        parseInt(stock) || 0,
        image_url || null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        id
      ]
    )
    
    // 獲取更新後的商品
    const updatedProduct = await query('SELECT * FROM products WHERE id = ?', [id])
    
    res.json({
      message: '商品更新成功',
      product: updatedProduct.rows[0]
    })
  } catch (error) {
    console.error('更新商品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 刪除商品（軟刪除 - 設為未啟用）
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await query(
      'UPDATE products SET is_active = 0 WHERE id = ?',
      [id]
    )
    
    if (result.changes === 0) {
      return res.status(404).json({ message: '商品不存在' })
    }
    
    res.json({ message: '商品已停用' })
  } catch (error) {
    console.error('刪除商品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

export default router