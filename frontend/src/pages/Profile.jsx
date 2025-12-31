import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const tierLabels = {
  guest: '游客',
  '365': '365会员',
  '3980': '尊享会员'
}

export default function Profile() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-gray-100">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">个人中心</h1>
          </div>

          <div className="px-5 sm:px-8 py-4 sm:py-6 space-y-0">
            <div className="flex items-center justify-between py-4 sm:py-3">
              <span className="text-gray-500 text-sm sm:text-base">手机号</span>
              <span className="text-gray-900 text-sm sm:text-base">{user.phone}</span>
            </div>

            <div className="flex items-center justify-between py-4 sm:py-3 border-t border-gray-100">
              <span className="text-gray-500 text-sm sm:text-base">会员等级</span>
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                user.tier === '3980'
                  ? 'bg-amber-50 text-amber-700'
                  : user.tier === '365'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tierLabels[user.tier] || user.tier}
              </span>
            </div>

            {user.tier_expire_at && (
              <div className="flex items-center justify-between py-4 sm:py-3 border-t border-gray-100">
                <span className="text-gray-500 text-sm sm:text-base">到期时间</span>
                <span className="text-gray-900 text-sm sm:text-base">
                  {new Date(user.tier_expire_at).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-4 sm:py-3 border-t border-gray-100">
              <span className="text-gray-500 text-sm sm:text-base">注册时间</span>
              <span className="text-gray-900 text-sm sm:text-base">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>

            {user.is_admin && (
              <div className="flex items-center justify-between py-4 sm:py-3 border-t border-gray-100">
                <span className="text-gray-500 text-sm sm:text-base">身份</span>
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs sm:text-sm font-medium">
                  管理员
                </span>
              </div>
            )}
          </div>

          <div className="px-5 sm:px-8 py-5 sm:py-6 border-t border-gray-100 space-y-3">
            {user.tier === 'guest' && (
              <button className="w-full py-3 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg transition-colors text-base sm:text-sm">
                升级会员
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-3 sm:py-2.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors text-base sm:text-sm"
            >
              退出登录
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
