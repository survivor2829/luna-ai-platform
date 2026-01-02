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
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-[#AEAEB2]">加载中...</div>
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
    <div className="min-h-screen bg-[#F5F5F7] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-[#E5E5E7] flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-semibold text-[#1D1D1F]">Luna AI</span>
          </Link>
          <p className="text-[#AEAEB2] text-xs mt-1">管理后台</p>
        </div>

        <nav className="flex-1 px-3">
          <Link
            to="/admin/agents"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
              isActive('/admin/agents') || isActive('/admin')
                ? 'bg-[#F5F5F7] text-[#1D1D1F] font-medium'
                : 'text-[#86868B] hover:bg-[#F5F5F7]'
            }`}
          >
            <span>🤖</span>
            <span>智能体管理</span>
          </Link>
          <Link
            to="/admin/users"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
              isActive('/admin/users')
                ? 'bg-[#F5F5F7] text-[#1D1D1F] font-medium'
                : 'text-[#86868B] hover:bg-[#F5F5F7]'
            }`}
          >
            <span>👥</span>
            <span>用户管理</span>
          </Link>
          <Link
            to="/admin/feedbacks"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
              isActive('/admin/feedbacks')
                ? 'bg-[#F5F5F7] text-[#1D1D1F] font-medium'
                : 'text-[#86868B] hover:bg-[#F5F5F7]'
            }`}
          >
            <span>💬</span>
            <span>用户反馈</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-[#E5E5E7]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#86868B]">{user.phone}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-[#AEAEB2] hover:text-[#86868B] transition-colors"
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
