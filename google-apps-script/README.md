# Delicioso 香腸專賣店 - Google Apps Script 整合

這是 Delicioso 香腸專賣店的 Google Apps Script 自動化腳本，用於同步訂單和客戶資料到 Google Sheets，並提供自動化營運管理功能。

## 功能特色

### 📊 資料同步
- **訂單同步**：自動從後台 API 拉取最新訂單資料到 Google Sheets
- **客戶資料同步**：自動同步客戶資料，包含消費統計
- **雙向同步**：支援從 Google Sheets 更新訂單狀態回後台系統

### 🤖 自動化功能
- **定時同步**：訂單每小時同步，客戶資料每日同步
- **每日報告**：自動發送營運數據郵件報告
- **狀態追蹤**：即時監控訂單處理進度

### 📈 營運分析
- **即時統計**：今日訂單數量、營收統計
- **待辦提醒**：自動提醒待處理訂單
- **格式化報表**：美觀的 Google Sheets 格式

## 安裝設定

### 1. 建立 Google Apps Script 專案

1. 前往 [Google Apps Script](https://script.google.com/)
2. 點選「新增專案」
3. 將 `Code.gs` 的內容複製貼上到編輯器
4. 儲存專案並命名為「Delicioso 管理系統」

### 2. 建立 Google Sheets

#### 訂單試算表
1. 建立新的 Google Sheets，命名為「Delicioso 訂單管理」
2. 複製試算表 ID（網址中的長字串）
3. 試算表會自動建立以下欄位標題：
   - 訂單編號、客戶姓名、客戶信箱、客戶電話、訂單金額
   - 訂單狀態、配送地址、備註、轉帳末五碼、建立時間、更新時間

#### 客戶資料試算表
1. 建立新的 Google Sheets，命名為「Delicioso 客戶資料」
2. 複製試算表 ID
3. 試算表會自動建立以下欄位標題：
   - 客戶編號、姓名、信箱、電話、生日、角色、訂單數量、總消費金額、註冊時間

### 3. 修改設定參數

在 `Code.gs` 檔案頂部修改以下設定：

```javascript
// 設定區域
const API_BASE_URL = 'http://localhost:5000'; // 您的後台 API 網址
const ADMIN_TOKEN = 'your-admin-token-here'; // 管理員登入後的 JWT Token

// Google Sheets 設定
const ORDERS_SHEET_ID = 'your-orders-sheet-id'; // 訂單試算表 ID
const CUSTOMERS_SHEET_ID = 'your-customers-sheet-id'; // 客戶資料試算表 ID
```

### 4. 設定郵件通知

修改 `sendDailyReport()` 函數中的收件人郵箱：

```javascript
MailApp.sendEmail({
  to: 'your-email@example.com', // 替換為您的郵箱
  subject: `Delicioso 每日營運報告 - ${todayStr}`,
  body: emailBody
});
```

## 使用方法

### 初始化設定

第一次使用時，執行以下步驟：

1. 在 Google Apps Script 編輯器中，選擇函數 `initialize`
2. 點選「執行」按鈕
3. 授權腳本存取 Google Sheets 和郵件服務
4. 根據提示完成所有設定

### 啟用自動同步

```javascript
// 執行此函數啟用自動同步觸發器
setupAutoSync()
```

### 手動同步功能

```javascript
// 同步訂單資料
syncOrdersToSheet()

// 同步客戶資料  
syncCustomersToSheet()

// 完整同步（訂單 + 客戶）
fullSync()
```

### 訂單狀態管理

1. 在訂單試算表中修改「訂單狀態」欄位
2. 狀態選項：待付款、已付款、已出貨、已完成、已取消
3. 執行 `updateOrderStatusFromSheet()` 同步回後台系統

### 營運報告

```javascript
// 發送每日營運報告郵件
sendDailyReport()
```

## API 整合說明

### 後台 API 端點

腳本會調用以下後台 API：

- `POST /admin/webhook/gas` - Google Apps Script webhook 接收端點
  - `type: 'order_export'` - 匯出訂單資料
  - `type: 'customer_export'` - 匯出客戶資料  
  - `type: 'update_order_status'` - 更新訂單狀態

### 認證方式

使用 JWT Token 進行 API 認證：

```javascript
headers: {
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
}
```

### 取得 Admin Token

1. 使用管理員帳號登入系統
2. 在瀏覽器開發者工具中查看 localStorage
3. 複製 `token` 欄位的值
4. 更新 `ADMIN_TOKEN` 設定

## 自動化排程

### 預設排程設定

- **訂單同步**：每小時執行一次
- **客戶資料同步**：每日早上 9:00 執行
- **每日報告**：需要手動設定觸發器

### 自訂排程設定

可以在 `setupAutoSync()` 函數中修改觸發器設定：

```javascript
// 自訂同步頻率
ScriptApp.newTrigger('syncOrdersToSheet')
  .timeBased()
  .everyMinutes(30) // 每 30 分鐘
  .create();
```

## 錯誤處理

### 常見問題

1. **API 連接失敗**
   - 檢查 `API_BASE_URL` 是否正確
   - 確認後台服務正在運行
   - 檢查網路連接

2. **認證失敗**
   - 更新 `ADMIN_TOKEN`
   - 確認 Token 未過期

3. **試算表權限問題**
   - 確認 Google Apps Script 有存取試算表權限
   - 檢查試算表 ID 是否正確

### 測試連接

```javascript
// 測試 API 連接是否正常
testApiConnection()
```

## 進階功能

### 資料驗證

腳本會自動驗證資料格式並處理錯誤：
- 空值處理
- 日期格式統一
- 數值格式化（貨幣顯示）

### 效能最佳化

- 批量寫入資料減少 API 調用
- 智能更新只修改變動的資料
- 錯誤重試機制

### 安全考量

- Token 加密儲存建議
- API 請求限制
- 資料存取權限控制

## 維護與監控

### 日誌查看

在 Google Apps Script 編輯器中：
1. 點選「執行」選單
2. 選擇「查看日誌」
3. 檢查同步狀態和錯誤訊息

### 效能監控

- 查看觸發器執行歷史
- 監控 API 回應時間
- 追蹤資料同步準確性

## 支援與幫助

如有問題或需要技術支援，請聯繫開發團隊。

---

*此文件最後更新：2025-08-31*