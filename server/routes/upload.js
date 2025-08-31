import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { verifyToken, verifyAdmin } from '../middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// 設定 multer 儲存配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/products'))
  },
  filename: (req, file, cb) => {
    // 產生唯一檔名：時間戳_隨機數_原檔名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${name}-${uniqueSuffix}${ext}`)
  }
})

// 檔案過濾器
const fileFilter = (req, file, cb) => {
  // 只允許圖片檔案
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('只能上傳圖片檔案'), false)
  }
}

// 設定 multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制
  },
  fileFilter: fileFilter
})

// 創建上傳目錄（如果不存在）
import fs from 'fs'
const uploadDir = path.join(__dirname, '../uploads/products')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 上傳商品圖片
router.post('/product', verifyToken, verifyAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '沒有上傳檔案' })
    }

    // 回傳圖片 URL
    const imageUrl = `/uploads/products/${req.file.filename}`
    
    res.json({
      message: '圖片上傳成功',
      imageUrl: imageUrl,
      filename: req.file.filename
    })
  } catch (error) {
    console.error('上傳圖片錯誤:', error)
    res.status(500).json({ message: '上傳失敗' })
  }
})

// 錯誤處理中間件
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: '檔案大小不能超過 5MB' })
    }
  }
  
  if (error.message === '只能上傳圖片檔案') {
    return res.status(400).json({ message: error.message })
  }
  
  res.status(500).json({ message: '上傳失敗' })
})

export default router