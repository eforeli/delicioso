import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardDocumentListIcon, TruckIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [navigate])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my')
      setOrders(response.data)
    } catch (err) {
      setError('無法載入訂單資料')
      console.error('載入訂單錯誤:', err)
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClipboardDocumentListIcon className="w-4 h-4" />
      case 'paid':
        return <ClipboardDocumentListIcon className="w-4 h-4" />
      case 'shipped':
        return <TruckIcon className="w-4 h-4" />
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />
      default:
        return <ClipboardDocumentListIcon className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">我的訂單</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">我的訂單</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl text-gray-500 mb-4">還沒有任何訂單</h3>
          <p className="text-gray-400 mb-6">快去挑選一些美味的香腸吧！</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            開始購物
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                {/* 訂單標題 */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="text-lg font-semibold">訂單 #{order.id}</h3>
                    <p className="text-sm text-gray-600">下單時間：{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusText(order.status)}</span>
                    </span>
                  </div>
                </div>
                
                {/* 配送地址 */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">配送地址：</p>
                  <p className="font-medium">{order.shipping_address}</p>
                  {order.notes && (
                    <p className="text-sm text-gray-600 mt-1">備註：{order.notes}</p>
                  )}
                </div>
                
                {/* 訂單商品 */}
                <div className="mb-4">
                  <h4 className="font-medium mb-3">訂單商品：</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                            <span className="text-sm">🍖</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.product_name}</p>
                            <p className="text-xs text-gray-600">單價：NT$ {item.product_price} × {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-sm">NT$ {item.subtotal}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 訂單總計和操作 */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-gray-200">
                  <div className="mb-2 sm:mb-0">
                    <span className="text-lg font-bold text-red-600">總計：NT$ {order.total_amount}</span>
                    {order.payment_last_five && (
                      <p className="text-sm text-gray-600">轉帳末五碼：{order.payment_last_five}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => navigate(`/payment/${order.id}`)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                      >
                        前往付款
                      </button>
                    )}
                    
                    {(order.status === 'paid' || order.status === 'shipped' || order.status === 'completed') && (
                      <div className="text-sm text-gray-600">
                        {order.status === 'paid' && '等待出貨'}
                        {order.status === 'shipped' && '商品已出貨'}
                        {order.status === 'completed' && '訂單已完成'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders