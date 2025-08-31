import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'

function Cart() {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [navigate])

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart')
      setCart(response.data)
    } catch (err) {
      setError('無法載入購物車資料')
      console.error('載入購物車錯誤:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    setUpdating(prev => ({ ...prev, [itemId]: true }))
    
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQuantity })
      await fetchCart() // 重新載入購物車
    } catch (err) {
      alert(err.response?.data?.message || '更新失敗')
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const removeItem = async (itemId) => {
    setUpdating(prev => ({ ...prev, [itemId]: true }))
    
    try {
      await api.delete(`/cart/${itemId}`)
      await fetchCart() // 重新載入購物車
    } catch (err) {
      alert(err.response?.data?.message || '移除失敗')
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const clearCart = async () => {
    if (!confirm('確定要清空購物車嗎？')) return
    
    setLoading(true)
    try {
      await api.delete('/cart')
      await fetchCart()
    } catch (err) {
      alert(err.response?.data?.message || '清空失敗')
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold mb-8">購物車</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">購物車</h1>
        {cart.items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            清空購物車
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl text-gray-500 mb-4">購物車是空的</h3>
          <p className="text-gray-400 mb-6">快去挑選一些美味的香腸吧！</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            開始購物
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 購物車商品列表 */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-2xl">🍖</div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                      <p className="text-gray-600">NT$ {item.price}</p>
                      <p className="text-sm text-gray-500">庫存: {item.stock}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating[item.id]}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating[item.id] || item.quantity >= item.stock}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold">NT$ {item.subtotal}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating[item.id]}
                        className="text-red-600 hover:text-red-800 mt-2 disabled:opacity-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 結帳摘要 */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h3 className="text-lg font-semibold mb-4">訂單摘要</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>商品數量</span>
                  <span>{cart.count} 件</span>
                </div>
                <div className="flex justify-between">
                  <span>小計</span>
                  <span>NT$ {cart.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>運費</span>
                  <span className="text-green-600">免費</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>總計</span>
                  <span className="text-red-600">NT$ {cart.total}</span>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                前往結帳
              </button>
              
              <button
                onClick={() => navigate('/products')}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium mt-3"
              >
                繼續購物
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart