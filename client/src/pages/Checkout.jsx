import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'

function Checkout() {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 })
  const [formData, setFormData] = useState({
    shipping_address: '',
    notes: ''
  })
  const [bankInfo, setBankInfo] = useState({
    bank_name: '',
    account_holder: '',
    bank_account: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [navigate])

  const fetchData = async () => {
    try {
      // 獲取購物車和銀行資訊
      const [cartResponse, settingsResponse] = await Promise.all([
        api.get('/cart'),
        api.get('/admin/settings')
      ])
      
      setCart(cartResponse.data)
      setBankInfo(settingsResponse.data)
      
      if (cartResponse.data.items.length === 0) {
        navigate('/cart')
      }
    } catch (err) {
      setError('載入資料失敗')
      console.error('載入結帳資料錯誤:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.shipping_address.trim()) {
      setError('請填寫配送地址')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      const response = await api.post('/orders', {
        shipping_address: formData.shipping_address,
        notes: formData.notes
      })
      
      // 成功創建訂單，導向付款頁面
      navigate(`/payment/${response.data.order.id}`)
    } catch (err) {
      setError(err.response?.data?.message || '結帳失敗')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">載入中...</div>
      </div>
    )
  }

  if (error && cart.items.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">結帳</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">結帳</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* 訂單摘要 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TruckIcon className="w-5 h-5 mr-2" />
              配送資訊
            </h3>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">配送地址 *</label>
                <textarea
                  required
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="請輸入完整的配送地址，包含縣市區域及詳細地址"
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">備註（可選）</label>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="特殊要求或備註..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold flex items-center mb-3">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  付款方式：銀行轉帳
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>銀行：</strong>{bankInfo.bank_name || '待設定'}</p>
                  <p><strong>戶名：</strong>{bankInfo.account_holder || '待設定'}</p>
                  <p><strong>帳號：</strong>{bankInfo.bank_account || '待設定'}</p>
                </div>
                <div className="mt-3 text-sm text-blue-700">
                  <p>• 請於下單後進行轉帳</p>
                  <p>• 轉帳後請填寫帳號末五碼以供核對</p>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                  submitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submitting ? '處理中...' : `確認訂單（NT$ ${cart.total}）`}
              </button>
            </form>
          </div>
        </div>
        
        {/* 訂單摘要 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">訂單摘要</h3>
            
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <span className="text-xs">🍖</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">數量: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">NT$ {item.subtotal}</div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>商品小計</span>
                <span>NT$ {cart.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>運費</span>
                <span className="text-green-600">免費</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>總計</span>
                <span className="text-red-600">NT$ {cart.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout