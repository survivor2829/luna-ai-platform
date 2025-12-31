import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect } from 'react'

export default function AdminLayout() {
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      navigate('/admin/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!user || !user.is_admin) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-semibold text-gray-900">Luna AI</span>
          </Link>
          <p className="text-gray-400 text-xs mt-1">管理后台</p>
        </div>

        <nav className="flex-1 px-3">
          <Link
            to="/admin/agents"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
              isActive('/admin/agents') || isActive('/admin')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>🤖</span>
            <span>智能体管理</span>
          </Link>
          <Link
            to="/admin/users"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
              isActive('/admin/users')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>👥</span>
            <span>用户管理</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{user.phone}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
