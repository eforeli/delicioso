import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import cartRoutes from './routes/cart.js'
import uploadRoutes from './routes/upload.js'
import orderRoutes from './routes/orders.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 靜態檔案
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API 路由
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Delicioso API is running' })
})

// 錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: '服務器錯誤' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

export default app