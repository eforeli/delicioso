import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  ShoppingCartIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon,
  CogIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import api from '../utils/api'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const isLoggedIn = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // 獲取購物車數量
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartCount()
    }
  }, [isLoggedIn, location.pathname])

  const fetchCartCount = async () => {
    try {
      const response = await api.get('/cart')
      setCartCount(response.data.count || 0)
    } catch (err) {
      console.log('無法載入購物車數量')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCartCount(0)
    navigate('/')
    setIsMenuOpen(false)
  }

  const isActiveLink = (path) => {
    return location.pathname === path ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:text-red-600'
  }

  const navLinks = [
    { path: '/products', label: '商品', icon: null },
  ]

  if (isLoggedIn) {
    navLinks.push(
      { path: '/cart', label: '購物車', icon: ShoppingCartIcon, badge: cartCount },
      { path: '/orders', label: '我的訂單', icon: ClipboardDocumentListIcon }
    )
    
    if (user.role === 'admin') {
      navLinks.push({ path: '/admin', label: '管理後台', icon: CogIcon })
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-3xl">🍖</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              Delicioso
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 font-medium ${isActiveLink(link.path)} hover:bg-red-50`}
              >
                {link.icon && <link.icon className="w-5 h-5" />}
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <UserIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 transition-colors duration-300 font-medium"
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors duration-300 font-medium"
                >
                  <UserIcon className="w-5 h-5" />
                  <span>登入</span>
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-2 rounded-full hover:from-red-700 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                >
                  註冊
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors duration-300"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${isActiveLink(link.path)} hover:bg-red-50`}
                >
                  <div className="flex items-center space-x-2">
                    {link.icon && <link.icon className="w-5 h-5" />}
                    <span>{link.label}</span>
                  </div>
                  {link.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-4">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center px-3 py-2 text-gray-600">
                      <UserIcon className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-red-600 transition-colors duration-300"
                    >
                      登出
                    </button>
                  </>
                ) : (
                  <div className="space-y-1">
                    <Link 
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 transition-colors duration-300"
                    >
                      <UserIcon className="w-5 h-5 mr-2" />
                      登入
                    </Link>
                    <Link 
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg text-center hover:from-red-700 hover:to-red-600 transition-all duration-300"
                    >
                      註冊
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar