import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { 
  ShoppingBagIcon, 
  ClipboardDocumentListIcon,
  UsersIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import api from '../utils/api'

function ProductManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    is_active: true
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/admin/all')
      setProducts(response.data)
    } catch (err) {
      alert('載入商品失敗')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      image_url: '',
      is_active: true
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData)
        alert('商品更新成功！')
      } else {
        await api.post('/products', formData)
        alert('商品新增成功！')
      }
      
      await fetchProducts()
      resetForm()
    } catch (err) {
      alert(err.response?.data?.message || '操作失敗')
    }
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || '',
      is_active: Boolean(product.is_active)
    })
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId) => {
    if (!confirm('確定要停用此商品嗎？')) return
    
    try {
      await api.delete(`/products/${productId}`)
      alert('商品已停用')
      await fetchProducts()
    } catch (err) {
      alert(err.response?.data?.message || '操作失敗')
    }
  }

  if (loading) {
    return <div className="text-center py-8">載入中...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">商品管理</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          新增商品
        </button>
      </div>

      {/* 商品表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">價格</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">庫存</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-lg">🍖</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">NT$ {product.price}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_active ? '啟用' : '停用'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新增/編輯表單 Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? '編輯商品' : '新增商品'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">商品名稱</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">價格</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">庫存</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">圖片網址</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                />
              </div>
              
              {editingProduct && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm">商品啟用</label>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                >
                  {editingProduct ? '更新' : '新增'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">管理員儀表板</h2>
      <p className="text-gray-600 mb-8">歡迎來到 Delicioso 後台管理系統</p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/products" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <ShoppingBagIcon className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">商品管理</h3>
          <p className="text-gray-600 text-sm">新增、編輯、管理商品</p>
        </Link>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ClipboardDocumentListIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">訂單管理</h3>
          <p className="text-gray-600 text-sm">處理客戶訂單</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <UsersIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">會員管理</h3>
          <p className="text-gray-600 text-sm">管理客戶資料</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <CogIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">系統設定</h3>
          <p className="text-gray-600 text-sm">網站基本設定</p>
        </div>
      </div>
    </div>
  )
}

function Admin() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // 檢查是否為管理員
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('需要管理員權限')
      navigate('/')
    }
  }, [user, navigate])

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div>
      <div className="bg-white shadow mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold">後台管理</h1>
            <nav className="flex space-x-6">
              <Link 
                to="/admin" 
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                儀表板
              </Link>
              <Link 
                to="/admin/products" 
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                商品管理
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/products" element={<ProductManagement />} />
      </Routes>
    </div>
  )
}

export default Admin