import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../database.sqlite')
const db = new Database(dbPath)

// 啟用外鍵約束
db.pragma('foreign_keys = ON')

export const query = (sql, params = []) => {
  try {
    if (sql.trim().toLowerCase().startsWith('select')) {
      // SELECT 查詢
      const stmt = db.prepare(sql)
      const rows = stmt.all(params)
      return { rows }
    } else {
      // INSERT, UPDATE, DELETE
      const stmt = db.prepare(sql)
      const result = stmt.run(params)
      return { 
        rows: [{ 
          id: result.lastInsertRowid,
          changes: result.changes 
        }]
      }
    }
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export default db