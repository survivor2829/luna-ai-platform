import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const tierLabels = {
  guest: '游客',
  '365': '365会员',
  '3980': '尊享会员'
}

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3" onClick={closeMenu}>
          <span className="text-xl sm:text-2xl">🤖</span>
          <span className="text-base sm:text-lg font-semibold text-gray-900">Luna AI</span>
          <span className="text-gray-400 text-xs sm:text-sm hidden sm:inline">智能体平台</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <span className="text-sm text-gray-500">
                {tierLabels[user.tier] || user.tier}
              </span>
              <Link
                to="/profile"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {user.phone}
              </Link>
              {user.is_admin && (
                <Link
                  to="/admin"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  管理后台
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                注册
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-11 h-11 flex items-center justify-center text-gray-600 hover:text-gray-900 -mr-2"
          aria-label="菜单"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100 mb-2">
                  {user.phone} · {tierLabels[user.tier] || user.tier}
                </div>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="block px-3 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  个人中心
                </Link>
                {user.is_admin && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="block px-3 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    管理后台
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  退出登录
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block px-3 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="block px-3 py-3 text-base text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  注册账号
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
