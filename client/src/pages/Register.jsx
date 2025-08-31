import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post('/api/auth/register', formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || '註冊失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">註冊</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">姓名</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">電子郵件</label>
          <input
            type="email"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">手機號碼</label>
          <input
            type="tel"
            required
            placeholder="09xxxxxxxx"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">生日 (將作為密碼使用)</label>
          <input
            type="date"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.birthDate}
            onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
          />
          <small className="text-gray-500">密碼格式：YYYYMMDD (例如：19900315)</small>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? '註冊中...' : '註冊'}
        </button>
      </form>

      <p className="text-center mt-4">
        已有帳號？
        <Link to="/login" className="text-red-600 hover:underline ml-1">
          立即登入
        </Link>
      </p>
    </div>
  )
}

export default Register