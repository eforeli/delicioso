import { useState, useEffect } from 'react'
import { PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartLoading, setCartLoading] = useState({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (err) {
      setError('無法載入商品資料')
      console.error('載入商品錯誤:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('請先登入才能加入購物車')
      return
    }

    setCartLoading(prev => ({ ...prev, [productId]: true }))
    
    try {
      await api.post('/cart', {
        productId,
        quantity: 1
      })
      alert('已加入購物車！')
    } catch (err) {
      alert(err.response?.data?.message || '加入購物車失敗')
    } finally {
      setCartLoading(prev => ({ ...prev, [productId]: false }))
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
        <h1 className="text-3xl font-bold mb-8">商品列表</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">商品列表</h1>
        <p className="text-gray-600">共 {products.length} 項商品</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl text-gray-500 mb-4">目前還沒有商品</h3>
          <p className="text-gray-400">請稍後再來看看！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-4xl mb-2">🍖</div>
                    <div>暫無圖片</div>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 h-12 overflow-hidden">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-red-600">
                    NT$ {product.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    庫存: {product.stock}
                  </span>
                </div>
                
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0 || cartLoading[product.id]}
                  className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
                    product.stock === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : cartLoading[product.id]
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {cartLoading[product.id] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <ShoppingCartIcon className="w-4 h-4 mr-2" />
                  )}
                  {product.stock === 0 ? '已售完' : cartLoading[product.id] ? '加入中...' : '加入購物車'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products