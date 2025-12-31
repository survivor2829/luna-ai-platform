import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(phone, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4 py-8 sm:p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <span className="text-3xl sm:text-3xl">🤖</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F]">
            登录
          </h1>
          <p className="text-[#86868B] mt-1 sm:mt-2 text-sm sm:text-base">Luna AI 智能体平台</p>
        </div>

        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-[#E5E5E7]">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5 sm:mb-2">手机号</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 bg-white border border-[#E5E5E7] rounded-lg text-base sm:text-sm text-[#1D1D1F] placeholder-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-shadow"
                placeholder="请输入手机号"
                required
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5 sm:mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 bg-white border border-[#E5E5E7] rounded-lg text-base sm:text-sm text-[#1D1D1F] placeholder-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-shadow"
                placeholder="请输入密码"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-2.5 bg-[#0066CC] hover:bg-[#0055AA] active:bg-[#004499] disabled:bg-[#AEAEB2] text-white font-medium rounded-lg transition-colors text-base sm:text-sm"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>

        <p className="text-[#86868B] text-sm text-center mt-5 sm:mt-6">
          还没有账号？{' '}
          <Link to="/register" className="text-[#0066CC] hover:text-[#0055AA] active:text-[#004499]">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
}
