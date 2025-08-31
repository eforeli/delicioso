import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'

const router = express.Router()

// 註冊
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, birthDate } = req.body

    // 檢查用戶是否已存在
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: '此電子郵件已被註冊' })
    }

    // 將生日轉換為密碼格式 (YYYYMMDD)
    const password = birthDate.replace(/-/g, '')
    const hashedPassword = await bcrypt.hash(password, 10)

    // 創建用戶
    const result = await query(
      `INSERT INTO users (name, email, phone, birth_date, password) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email`,
      [name, email, phone, birthDate, hashedPassword]
    )

    res.status(201).json({ 
      message: '註冊成功', 
      user: result.rows[0] 
    })
  } catch (error) {
    console.error('註冊錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// 登入
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // 查找用戶
    const result = await query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: '用戶不存在' })
    }

    const user = result.rows[0]

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ message: '密碼錯誤' })
    }

    // 創建 JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: '登入成功',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('登入錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
})

// Google 登入路由 (待實作)
router.get('/google', (req, res) => {
  res.json({ message: 'Google OAuth 待實作' })
})

export default router