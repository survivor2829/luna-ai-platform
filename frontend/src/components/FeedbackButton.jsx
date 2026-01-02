import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { feedback } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const feedbackTypes = [
  { key: 'suggestion', label: '建议', icon: '💡' },
  { key: 'bug', label: '问题', icon: '🐛' },
  { key: 'question', label: '疑问', icon: '❓' }
]

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState('suggestion')
  const [content, setContent] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const panelRef = useRef(null)
  const location = useLocation()
  const { user } = useAuth()

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        const button = document.querySelector('[data-feedback-btn]')
        if (!button?.contains(e.target)) {
          setIsOpen(false)
        }
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // 提交成功后重置
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false)
        setIsOpen(false)
        setContent('')
        setContact('')
        setType('suggestion')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [submitted])

  // 未登录时不显示反馈按钮
  if (!user) return null

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('请输入反馈内容')
      return
    }

    setSubmitting(true)
    try {
      await feedback.submit({
        type,
        content: content.trim(),
        contact: contact.trim() || null,
        page_url: location.pathname
      })
      setSubmitted(true)
    } catch (err) {
      alert(err.message || '提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        data-feedback-btn
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all z-50 ${
          isOpen
            ? 'bg-[#86868B] hover:bg-[#6e6e73]'
            : 'bg-[#0066CC] hover:bg-[#0055AA]'
        }`}
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-xl">💬</span>
        )}
      </button>

      {/* 反馈表单弹窗 */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-20 right-6 w-80 bg-white rounded-xl shadow-xl border border-[#E5E5E7] z-50 overflow-hidden"
        >
          {submitted ? (
            // 提交成功状态
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-semibold text-[#1D1D1F] mb-1">感谢您的反馈！</h3>
              <p className="text-sm text-[#86868B]">我们会认真处理</p>
            </div>
          ) : (
            // 反馈表单
            <div className="p-4">
              <h3 className="font-semibold text-[#1D1D1F] mb-3">意见反馈</h3>

              {/* 反馈类型选择 */}
              <div className="flex gap-2 mb-3">
                {feedbackTypes.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      type === t.key
                        ? 'bg-[#0066CC] text-white'
                        : 'bg-[#F5F5F7] text-[#86868B] hover:bg-[#E5E5E7]'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* 反馈内容 */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请描述您的建议或遇到的问题..."
                className="w-full h-24 px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm text-[#1D1D1F] placeholder-[#AEAEB2] resize-none focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              />

              {/* 联系方式（可选） */}
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="联系方式（选填，方便我们回复您）"
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm text-[#1D1D1F] placeholder-[#AEAEB2] mt-2 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              />

              {/* 提交按钮 */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                className="w-full mt-3 py-2.5 bg-[#0066CC] hover:bg-[#0055AA] disabled:bg-[#AEAEB2] text-white rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? '提交中...' : '提交反馈'}
              </button>

            </div>
          )}
        </div>
      )}
    </>
  )
}
