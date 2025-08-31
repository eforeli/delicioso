import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, CreditCardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'

function Payment() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [bankInfo, setBankInfo] = useState({})
  const [paymentCode, setPaymentCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [orderId, navigate])

  const fetchData = async () => {
    try {
      const [orderResponse, settingsResponse] = await Promise.all([
        api.get(`/orders/${orderId}`),
        api.get('/admin/settings')
      ])
      
      setOrder(orderResponse.data)
      setBankInfo(settingsResponse.data)
      
      // 如果訂單已經付款，顯示完成狀態
      if (orderResponse.data.status !== 'pending') {
        setCompleted(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || '載入訂單資料失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    
    if (paymentCode.length !== 5) {
      setError('請輸入正確的帳號末五碼')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      await api.patch(`/orders/${orderId}/payment`, {
        payment_last_five: paymentCode
      })
      
      setCompleted(true)
      alert('付款資訊已提交！我們會儘快確認您的轉帳')
    } catch (err) {
      setError(err.response?.data?.message || '提交失敗')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '待付款',
      'paid': '已付款',
      'shipped': '已出貨',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">載入中...</div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">付款</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-50 p-8 rounded-lg">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-800 mb-4">付款資訊已提交</h1>
          <p className="text-green-700 mb-6">
            我們已收到您的付款資訊，將在 1-2 個工作天內確認您的轉帳並開始準備出貨。
          </p>
          
          <div className="bg-white p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold">訂單編號：</span>
              <span>#{order.id}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-semibold">訂單狀態：</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => navigate('/orders')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              查看我的訂單
            </button>
            <button
              onClick={() => navigate('/products')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              繼續購物
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">完成付款</h1>
      
      {/* 訂單資訊 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
          訂單資訊
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-600">訂單編號</span>
            <p className="font-semibold">#{order.id}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">訂單金額</span>
            <p className="font-semibold text-red-600">NT$ {order.total_amount}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <span className="text-sm text-gray-600">配送地址</span>
          <p className="font-medium">{order.shipping_address}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium mb-2">訂單商品：</h4>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span>{item.product_name} x {item.quantity}</span>
              <span>NT$ {item.subtotal}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 轉帳資訊 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CreditCardIcon className="w-5 h-5 mr-2" />
          轉帳資訊
        </h3>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">銀行：</span>
              <span>{bankInfo.bank_name || '待設定'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">戶名：</span>
              <span>{bankInfo.account_holder || '待設定'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">帳號：</span>
              <span className="font-mono">{bankInfo.bank_account || '待設定'}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-3">
              <span className="font-medium text-red-600">轉帳金額：</span>
              <span className="font-bold text-red-600">NT$ {order.total_amount}</span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-700 space-y-1 mb-6">
          <p>• 請使用 ATM、網銀或臨櫃轉帳上述金額</p>
          <p>• 轉帳完成後，請在下方填寫您的轉帳帳號末五碼</p>
          <p>• 我們會在收到付款資訊後 1-2 個工作天內確認並出貨</p>
        </div>
      </div>
      
      {/* 付款確認表單 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">填寫轉帳資訊</h3>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmitPayment}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              轉帳帳號末五碼 *
            </label>
            <input
              type="text"
              maxLength="5"
              pattern="[0-9]{5}"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-lg"
              placeholder="請輸入 5 位數字"
              value={paymentCode}
              onChange={(e) => {
                // 只允許數字
                const value = e.target.value.replace(/\D/g, '').slice(0, 5)
                setPaymentCode(value)
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              例如：您的轉帳帳號為 1234567890，請填寫 67890
            </p>
          </div>
          
          <button
            type="submit"
            disabled={submitting || paymentCode.length !== 5}
            className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
              submitting || paymentCode.length !== 5
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {submitting ? '提交中...' : '確認已轉帳'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Payment