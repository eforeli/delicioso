/**
 * Delicioso 香腸專賣店 - Google Apps Script 整合
 * 自動化訂單和客戶資料管理
 */

// 設定區域
const API_BASE_URL = 'https://your-server-url.com'; // 請替換為實際的服務器網址
const ADMIN_TOKEN = 'your-admin-token-here'; // 請替換為實際的管理員 Token

// Google Sheets 設定
const ORDERS_SHEET_ID = 'your-orders-sheet-id'; // 訂單試算表 ID
const CUSTOMERS_SHEET_ID = 'your-customers-sheet-id'; // 客戶資料試算表 ID

/**
 * 自動從 API 拉取最新訂單資料到 Google Sheets
 */
function syncOrdersToSheet() {
  try {
    console.log('開始同步訂單資料...');
    
    // 發送請求到後台 API
    const response = UrlFetchApp.fetch(`${API_BASE_URL}/admin/webhook/gas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        type: 'order_export'
      })
    });
    
    if (response.getResponseCode() !== 200) {
      throw new Error('API 請求失敗');
    }
    
    const data = JSON.parse(response.getContentText());
    if (!data.success) {
      throw new Error('API 回應錯誤: ' + data.message);
    }
    
    // 開啟 Google Sheets
    const sheet = SpreadsheetApp.openById(ORDERS_SHEET_ID).getActiveSheet();
    
    // 清除現有資料（保留標題列）
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
    
    // 設定標題列（如果是空白試算表）
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 11).setValues([[
        '訂單編號', '客戶姓名', '客戶信箱', '客戶電話', '訂單金額',
        '訂單狀態', '配送地址', '備註', '轉帳末五碼', '建立時間', '更新時間'
      ]]);
      
      // 格式化標題列
      const headerRange = sheet.getRange(1, 1, 1, 11);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
    }
    
    // 插入訂單資料
    if (data.data.length > 0) {
      const orderRows = data.data.map(order => [
        order.id,
        order.customer_name || '',
        order.email || '',
        order.phone || '',
        order.total_amount,
        getStatusText(order.status),
        order.shipping_address || '',
        order.notes || '',
        order.payment_last_five || '',
        order.created_at,
        order.updated_at
      ]);
      
      sheet.getRange(2, 1, orderRows.length, 11).setValues(orderRows);
      
      // 格式化金額欄位為貨幣格式
      sheet.getRange(2, 5, orderRows.length, 1).setNumberFormat('$#,##0');
      
      console.log(`成功同步 ${orderRows.length} 筆訂單資料`);
    }
    
    // 自動調整欄位寬度
    sheet.autoResizeColumns(1, 11);
    
    return `訂單同步完成！共更新 ${data.data.length} 筆資料`;
    
  } catch (error) {
    console.error('同步訂單錯誤:', error);
    return '同步失敗: ' + error.message;
  }
}

/**
 * 自動從 API 拉取客戶資料到 Google Sheets
 */
function syncCustomersToSheet() {
  try {
    console.log('開始同步客戶資料...');
    
    // 發送請求到後台 API
    const response = UrlFetchApp.fetch(`${API_BASE_URL}/admin/webhook/gas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        type: 'customer_export'
      })
    });
    
    if (response.getResponseCode() !== 200) {
      throw new Error('API 請求失敗');
    }
    
    const data = JSON.parse(response.getContentText());
    if (!data.success) {
      throw new Error('API 回應錯誤: ' + data.message);
    }
    
    // 開啟 Google Sheets
    const sheet = SpreadsheetApp.openById(CUSTOMERS_SHEET_ID).getActiveSheet();
    
    // 清除現有資料（保留標題列）
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
    
    // 設定標題列（如果是空白試算表）
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 9).setValues([[
        '客戶編號', '姓名', '信箱', '電話', '生日', 
        '角色', '訂單數量', '總消費金額', '註冊時間'
      ]]);
      
      // 格式化標題列
      const headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setBackground('#34a853');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
    }
    
    // 插入客戶資料
    if (data.data.length > 0) {
      const customerRows = data.data.map(customer => [
        customer.id,
        customer.name || '',
        customer.email || '',
        customer.phone || '',
        customer.birthday || '',
        customer.role === 'admin' ? '管理員' : '客戶',
        customer.total_orders || 0,
        customer.total_spent || 0,
        customer.created_at
      ]);
      
      sheet.getRange(2, 1, customerRows.length, 9).setValues(customerRows);
      
      // 格式化金額欄位為貨幣格式
      sheet.getRange(2, 8, customerRows.length, 1).setNumberFormat('$#,##0');
      
      console.log(`成功同步 ${customerRows.length} 筆客戶資料`);
    }
    
    // 自動調整欄位寬度
    sheet.autoResizeColumns(1, 9);
    
    return `客戶同步完成！共更新 ${data.data.length} 筆資料`;
    
  } catch (error) {
    console.error('同步客戶錯誤:', error);
    return '同步失敗: ' + error.message;
  }
}

/**
 * 從 Google Sheets 更新訂單狀態到後台系統
 * 使用方式：在試算表中修改訂單狀態後手動執行此函數
 */
function updateOrderStatusFromSheet() {
  try {
    console.log('開始從試算表更新訂單狀態...');
    
    const sheet = SpreadsheetApp.openById(ORDERS_SHEET_ID).getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) {
      return '沒有資料需要更新';
    }
    
    let updatedCount = 0;
    
    // 跳過標題列，從第二列開始處理
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const orderId = row[0]; // 訂單編號
      const statusText = row[5]; // 訂單狀態
      
      if (!orderId || !statusText) continue;
      
      // 將中文狀態轉換為英文
      const status = getStatusCode(statusText);
      if (!status) continue;
      
      try {
        // 發送更新請求到後台
        const response = UrlFetchApp.fetch(`${API_BASE_URL}/admin/webhook/gas`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          },
          payload: JSON.stringify({
            type: 'update_order_status',
            data: {
              orderId: orderId,
              status: status
            }
          })
        });
        
        if (response.getResponseCode() === 200) {
          const result = JSON.parse(response.getContentText());
          if (result.success) {
            updatedCount++;
            console.log(`訂單 #${orderId} 狀態已更新為 ${statusText}`);
          }
        }
      } catch (error) {
        console.error(`更新訂單 #${orderId} 失敗:`, error);
      }
    }
    
    return `狀態更新完成！共更新 ${updatedCount} 筆訂單`;
    
  } catch (error) {
    console.error('批量更新訂單狀態錯誤:', error);
    return '更新失敗: ' + error.message;
  }
}

/**
 * 設定自動同步觸發器（每小時執行一次）
 */
function setupAutoSync() {
  // 刪除現有的觸發器
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // 設定新的觸發器 - 每小時同步訂單
  ScriptApp.newTrigger('syncOrdersToSheet')
    .timeBased()
    .everyHours(1)
    .create();
  
  // 設定新的觸發器 - 每天同步客戶資料
  ScriptApp.newTrigger('syncCustomersToSheet')
    .timeBased()
    .everyDays(1)
    .atHour(9) // 每天早上 9 點
    .create();
  
  console.log('自動同步觸發器設定完成');
  return '自動同步已啟用！訂單每小時同步，客戶資料每日早上 9 點同步';
}

/**
 * 手動執行完整同步
 */
function fullSync() {
  const orderResult = syncOrdersToSheet();
  const customerResult = syncCustomersToSheet();
  
  return `完整同步結果：\n${orderResult}\n${customerResult}`;
}

/**
 * 發送每日營運報告郵件
 */
function sendDailyReport() {
  try {
    // 獲取今日訂單統計
    const sheet = SpreadsheetApp.openById(ORDERS_SHEET_ID).getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    const today = new Date();
    const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    let todayOrders = 0;
    let todayRevenue = 0;
    let pendingOrders = 0;
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const orderDate = new Date(row[9]); // 建立時間欄位
      const orderAmount = parseFloat(row[4]) || 0; // 訂單金額
      const orderStatus = row[5]; // 訂單狀態
      
      // 檢查是否為今日訂單
      const orderDateStr = Utilities.formatDate(orderDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (orderDateStr === todayStr) {
        todayOrders++;
        todayRevenue += orderAmount;
      }
      
      // 統計待處理訂單
      if (orderStatus === '待付款' || orderStatus === '已付款') {
        pendingOrders++;
      }
    }
    
    // 構建郵件內容
    const emailBody = `
【Delicioso 香腸專賣店 - 每日營運報告】

📊 今日營運數據 (${todayStr})：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 新訂單數量：${todayOrders} 筆
• 今日營收：NT$ ${todayRevenue.toLocaleString()}
• 待處理訂單：${pendingOrders} 筆

🔔 待辦事項：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${pendingOrders > 0 ? `• 請處理 ${pendingOrders} 筆待處理訂單` : '• 所有訂單處理完畢 ✅'}

📈 系統狀態：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 資料同步：正常 ✅
• 報告時間：${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}

此郵件由 Google Apps Script 自動發送
    `;
    
    // 發送郵件（請替換為實際的收件人郵箱）
    MailApp.sendEmail({
      to: 'admin@delicioso.com',
      subject: `Delicioso 每日營運報告 - ${todayStr}`,
      body: emailBody
    });
    
    console.log('每日報告郵件已發送');
    return '每日報告發送成功';
    
  } catch (error) {
    console.error('發送每日報告錯誤:', error);
    return '報告發送失敗: ' + error.message;
  }
}

/**
 * 輔助函數：將訂單狀態中文轉換為英文代碼
 */
function getStatusCode(statusText) {
  const statusMap = {
    '待付款': 'pending',
    '已付款': 'paid',
    '已出貨': 'shipped',
    '已完成': 'completed',
    '已取消': 'cancelled'
  };
  return statusMap[statusText] || null;
}

/**
 * 輔助函數：將訂單狀態英文代碼轉換為中文
 */
function getStatusText(statusCode) {
  const statusMap = {
    'pending': '待付款',
    'paid': '已付款',
    'shipped': '已出貨',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return statusMap[statusCode] || statusCode;
}

/**
 * 測試函數 - 檢查 API 連接
 */
function testApiConnection() {
  try {
    const response = UrlFetchApp.fetch(`${API_BASE_URL}/admin/webhook/gas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        type: 'order_export'
      })
    });
    
    if (response.getResponseCode() === 200) {
      return 'API 連接成功！';
    } else {
      return `API 連接失敗，狀態碼: ${response.getResponseCode()}`;
    }
    
  } catch (error) {
    return 'API 連接錯誤: ' + error.message;
  }
}

/**
 * 初始化設定 - 第一次使用時執行
 */
function initialize() {
  console.log('開始初始化 Google Apps Script...');
  
  // 提醒用戶修改設定
  const message = `
請先完成以下設定：

1. 修改 API_BASE_URL 為您的實際服務器網址
2. 修改 ADMIN_TOKEN 為您的管理員認證令牌  
3. 修改 ORDERS_SHEET_ID 為訂單試算表 ID
4. 修改 CUSTOMERS_SHEET_ID 為客戶資料試算表 ID
5. 修改郵件收件人地址

完成設定後，執行 setupAutoSync() 啟用自動同步功能。
  `;
  
  console.log(message);
  return message;
}