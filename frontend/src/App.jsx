import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Tools from './pages/Tools'
import Prompts from './pages/Prompts'

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AgentManagement from './pages/admin/AgentManagement'
import UserManagement from './pages/admin/UserManagement'
import FeedbackManagement from './pages/admin/FeedbackManagement'

// Components
import FeedbackButton from './components/FeedbackButton'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat/:agentId" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/prompts" element={<Prompts />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/agents" replace />} />
            <Route path="agents" element={<AgentManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="feedbacks" element={<FeedbackManagement />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Feedback Button */}
        <FeedbackButton />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
