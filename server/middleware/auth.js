import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'

// 驗證 JWT token 的中間件
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: '缺少認證 token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // 驗證用戶是否仍然存在
    const result = await query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.userId]
    )
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: '用戶不存在' })
    }
    
    req.user = result.rows[0]
    next()
  } catch (error) {
    console.error('Token 驗證錯誤:', error)
    res.status(401).json({ message: 'Token 無效' })
  }
}

// 驗證管理員權限的中間件
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理員權限' })
  }
  next()
}

// 可選的認證中間件（不強制要求登入）
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const result = await query(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [decoded.userId]
      )
      
      if (result.rows.length > 0) {
        req.user = result.rows[0]
      }
    }
    
    next()
  } catch (error) {
    // 忽略錯誤，繼續處理請求
    next()
  }
}