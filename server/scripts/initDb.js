import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import db from '../config/sqlite.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function initializeDatabase() {
  try {
    console.log('🔧 初始化資料庫...')
    
    // 讀取並執行 Schema
    const schemaPath = path.join(__dirname, '../models/sqlite-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // 分割 SQL 語句並執行
    const statements = schema.split(';').filter(stmt => stmt.trim())
    
    statements.forEach(statement => {
      if (statement.trim()) {
        db.exec(statement.trim() + ';')
      }
    })
    
    console.log('✅ 資料表建立完成')
    
    // 建立預設管理員帳戶
    const adminPassword = await bcrypt.hash('19900101', 10)
    
    try {
      const insertAdmin = db.prepare(`
        INSERT INTO users (name, email, phone, birth_date, password, role) 
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      
      insertAdmin.run([
        '管理員',
        'admin@delicioso.com',
        '0900000000',
        '1990-01-01',
        adminPassword,
        'admin'
      ])
      
      console.log('✅ 預設管理員帳戶建立完成')
      console.log('   帳號: admin@delicioso.com')
      console.log('   密碼: 19900101')
    } catch (err) {
      if (!err.message.includes('UNIQUE constraint failed')) {
        throw err
      }
      console.log('ℹ️  管理員帳戶已存在')
    }
    
    // 建立系統設定
    const settings = [
      ['bank_account', '', '收款銀行帳戶'],
      ['bank_name', '', '收款銀行名稱'],
      ['account_holder', '', '戶名'],
      ['store_address', '', '店家地址'],
      ['store_phone', '', '店家電話']
    ]
    
    const insertSetting = db.prepare(`
      INSERT OR IGNORE INTO settings (key, value, description) 
      VALUES (?, ?, ?)
    `)
    
    settings.forEach(([key, value, description]) => {
      insertSetting.run([key, value, description])
    })
    
    console.log('✅ 系統設定建立完成')
    
    // 插入範例商品
    try {
      const insertProduct = db.prepare(`
        INSERT INTO products (name, description, price, stock, is_active) 
        VALUES (?, ?, ?, ?, ?)
      `)
      
      const products = [
        ['經典原味香腸', '使用上等豬肉製作，口感鮮美', 30, 100, 1],
        ['蒜味香腸', '加入新鮮蒜頭，香氣濃郁', 35, 80, 1],
        ['辣味香腸', '微辣口感，適合重口味愛好者', 40, 60, 1]
      ]
      
      products.forEach(product => {
        insertProduct.run(product)
      })
      
      console.log('✅ 範例商品建立完成')
    } catch (err) {
      if (!err.message.includes('UNIQUE constraint failed')) {
        throw err
      }
      console.log('ℹ️  範例商品已存在')
    }
    
    console.log('🎉 資料庫初始化完成！')
    
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error)
    process.exit(1)
  }
}

initializeDatabase()