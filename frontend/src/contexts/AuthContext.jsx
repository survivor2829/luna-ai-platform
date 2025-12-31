import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      auth.me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("token")
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (phone, password) => {
    const res = await auth.login(phone, password)
    localStorage.setItem("token", res.access_token)
    setUser(res.user)
    return res.user
  }

  const register = async (phone, password) => {
    await auth.register(phone, password)
    return login(phone, password)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const userData = await auth.me()
      setUser(userData)
    } catch {
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
