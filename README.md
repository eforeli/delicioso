# 🍖 Delicioso 香腸專賣店訂餐系統

## 📋 專案概述
這是一個完整的食物訂餐系統，專為香腸專賣店設計，包含前台客戶訂購系統和後台管理系統。

## 🏗️ 技術架構
- **前端**: React 18 + Vite + Tailwind CSS + React Router
- **後端**: Node.js + Express + PostgreSQL
- **認證**: JWT + Google OAuth (可選)
- **部署**: Zeabur

## ✨ 核心功能

### 客戶前台
- ✅ 會員註冊/登入（email + 生日密碼）
- ✅ Google 第三方登入
- ⏳ 商品瀏覽與搜索
- ⏳ 購物車管理
- ⏳ 訂單下單與追蹤
- ⏳ 銀行轉帳付款（末五碼確認）

### 管理後台
- ⏳ 商品管理（CRUD + 圖片上傳）
- ⏳ 訂單管理（狀態更新、出貨管理）
- ⏳ 客戶管理（會員資料查詢）
- ⏳ 系統設定（銀行帳戶等）
- ⏳ 資料匯出（CSV 客戶名單/訂單）

## 🚀 開發狀態

### ✅ 已完成
- 專案架構建置
- 前端 React 基礎框架
- 後端 Express API 架構
- 資料庫 Schema 設計
- 基本路由與頁面

### ⏳ 開發中
- 會員認證系統完善
- 商品管理功能
- 購物車與訂單流程
- 後台管理介面

## 💻 開發環境設置

### 安裝依賴
```bash
# 安裝所有依賴
npm run install-all

# 或分別安裝
npm install          # 根目錄
cd client && npm install  # 前端
cd server && npm install  # 後端
```

### 環境變數設定
```bash
# 複製環境變數範例
cp .env.example server/.env

# 編輯 server/.env，設定資料庫連接等
```

### 啟動開發環境
```bash
# 同時啟動前後端 (推薦)
npm run dev

# 或分別啟動
npm run client  # 前端: http://localhost:3000
npm run server  # 後端: http://localhost:5000
```

## 🗄️ 資料庫設置

### PostgreSQL 設置 (生產環境)
1. 建立資料庫 `delicioso`
2. 執行 `server/models/schema.sql` 建立資料表
3. 更新 `server/.env` 中的 `DATABASE_URL`

## 📱 系統使用

### 密碼規則
- 一般註冊：使用生日作為密碼（格式：YYYYMMDD，如 19900315）
- Google 登入：首次需補填手機、生日、姓名

### 訂單流程
1. 客戶瀏覽商品 → 加入購物車
2. 結帳時填寫收貨資訊
3. 銀行轉帳付款
4. 填寫轉帳末五碼確認
5. 管理員確認後出貨

## 🎯 接下來的開發計畫
1. **完善會員系統** - Google OAuth 整合
2. **商品管理** - 圖片上傳、庫存管理  
3. **購物車功能** - 加入/移除商品、數量調整
4. **訂單系統** - 下單流程、狀態管理
5. **後台介面** - 完整的管理功能
6. **部署上線** - Zeabur 平台部署

## 📞 聯絡資訊
- 店家：Delicioso 香腸專賣店
- 聯絡 email：glamcialin@gmail.com

---
*由 Claude Code 協助開發* 🤖