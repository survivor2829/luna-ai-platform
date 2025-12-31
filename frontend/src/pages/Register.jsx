import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少6位')
      return
    }

    setLoading(true)

    try {
      await register(phone, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 sm:p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <span className="text-3xl sm:text-3xl">🤖</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            注册
          </h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Luna AI 智能体平台</p>
        </div>

        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">手机号</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 bg-white border border-gray-200 rounded-lg text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="请输入手机号"
                required
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 bg-white border border-gray-200 rounded-lg text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="请输入密码（至少6位）"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 bg-white border border-gray-200 rounded-lg text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="请再次输入密码"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-2.5 bg-gray-900 hover:bg-gray-800 active:bg-gray-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors text-base sm:text-sm"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
        </div>

        <p className="text-gray-500 text-sm text-center mt-5 sm:mt-6">
          已有账号？{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 active:text-blue-800">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}
