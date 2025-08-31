import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/login', formData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">登入</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block text-sm font-medium mb-1">密碼 (生日 YYYYMMDD)</label>
          <input
            type="password"
            required
            placeholder="例如：19900315"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? '登入中...' : '登入'}
        </button>
      </form>

      <div className="mt-6">
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          使用 Google 登入
        </button>
      </div>

      <p className="text-center mt-4">
        還沒有帳號？
        <Link to="/register" className="text-red-600 hover:underline ml-1">
          立即註冊
        </Link>
      </p>
    </div>
  )
}

export default Login