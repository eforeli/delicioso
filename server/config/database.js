import dotenv from 'dotenv'

dotenv.config()

// 根據環境選擇資料庫
let dbModule

if (process.env.NODE_ENV === 'production') {
  // 生產環境使用 PostgreSQL
  const pg = await import('pg')
  const { Pool } = pg.default
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  
  dbModule = {
    query: (text, params) => pool.query(text, params),
    db: pool
  }
} else {
  // 開發環境使用 SQLite
  const sqlite = await import('./sqlite.js')
  dbModule = {
    query: sqlite.query,
    db: sqlite.default
  }
}

export const { query, db } = dbModule
export default db