import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'

function Navbar() {
  const navigate = useNavigate()
  const isLoggedIn = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-red-600">
            Delicioso
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/products" className="text-gray-700 hover:text-red-600">
              商品
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link to="/cart" className="text-gray-700 hover:text-red-600 flex items-center">
                  <ShoppingCartIcon className="w-5 h-5 mr-1" />
                  購物車
                </Link>
                <Link to="/orders" className="text-gray-700 hover:text-red-600">
                  我的訂單
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600"
                >
                  登出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-red-600 flex items-center">
                  <UserIcon className="w-5 h-5 mr-1" />
                  登入
                </Link>
                <Link 
                  to="/register" 
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  註冊
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar