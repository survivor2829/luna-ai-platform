import { useState, useEffect, useRef, Component } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { agents, chatWithAgent, getToken } from '../services/api'

// 错误边界组件 - 防止 Markdown 渲染崩溃导致整个页面白屏
class MarkdownErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Markdown render error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // 降级显示纯文本
      return <span className="whitespace-pre-wrap">{this.props.fallback}</span>
    }
    return this.props.children
  }
}

// 安全的 Markdown 渲染组件
function SafeMarkdown({ content }) {
  // 确保 content 是字符串
  const safeContent = typeof content === 'string' ? content : String(content || '')

  if (!safeContent) {
    return null
  }

  return (
    <MarkdownErrorBoundary fallback={safeContent}>
      <ReactMarkdown
        className="prose prose-sm sm:prose-base max-w-none prose-gray prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:bg-[#F5F5F7] prose-pre:text-[#1D1D1F] prose-code:text-[#1D1D1F] prose-code:bg-[#F5F5F7] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
      >
        {safeContent}
      </ReactMarkdown>
    </MarkdownErrorBoundary>
  )
}

// 思考中动画组件
function ThinkingIndicator() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[#86868B] text-sm">思考中</span>
        <div className="flex gap-1">
          <span
            className="w-1.5 h-1.5 bg-[#0066CC] rounded-full animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '600ms' }}
          />
          <span
            className="w-1.5 h-1.5 bg-[#0066CC] rounded-full animate-bounce"
            style={{ animationDelay: '150ms', animationDuration: '600ms' }}
          />
          <span
            className="w-1.5 h-1.5 bg-[#0066CC] rounded-full animate-bounce"
            style={{ animationDelay: '300ms', animationDuration: '600ms' }}
          />
        </div>
      </div>
      <span className="text-[#AEAEB2] text-xs">通常需要2-5秒</span>
    </div>
  )
}

export default function Chat() {
  const { agentId } = useParams()
  const navigate = useNavigate()

  const [agent, setAgent] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const isFetching = useRef(false)

  // 加载数据
  useEffect(() => {
    if (isFetching.current) return
    isFetching.current = true

    if (!getToken()) {
      window.location.href = '/login'
      return
    }

    async function load() {
      try {
        const [agentData, historyData] = await Promise.all([
          agents.get(agentId),
          agents.getHistory(agentId)
        ])

        setAgent(agentData)

        if (historyData.messages?.length > 0) {
          setMessages(historyData.messages.map(m => ({
            role: m.role,
            content: String(m.content || '')
          })))
        }
      } catch (err) {
        console.error('Load failed:', err)
        window.location.href = '/'
      }
    }

    load()
  }, [])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 移动端键盘
  useEffect(() => {
    const handleResize = () => {
      if (document.activeElement === inputRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setError('')

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])
    setLoading(true)

    try {
      await chatWithAgent(agentId, userMessage, (text) => {
        // 确保 text 是字符串
        const safeText = typeof text === 'string' ? text : String(text || '')
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: safeText }
          return updated
        })
      })
    } catch (err) {
      setError(err.message || '发送失败')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearHistory = async () => {
    if (!window.confirm('确定要清空对话记录吗？')) return
    try {
      await agents.clearHistory(agentId)
      setMessages([])
    } catch (err) {
      setError('清空失败: ' + err.message)
    }
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-[#AEAEB2]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] bg-[#F5F5F7] flex flex-col">
      <header className="bg-white border-b border-[#E5E5E7] px-4 sm:px-6 h-12 sm:h-14 flex items-center flex-shrink-0 safe-area-top">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-3 sm:gap-4">
          <Link
            to="/"
            className="w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center text-[#AEAEB2] hover:text-[#86868B] transition-colors -ml-2 sm:ml-0"
          >
            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">← 返回</span>
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg sm:text-xl">{agent.icon}</span>
            <span className="font-medium text-[#1D1D1F] truncate text-sm sm:text-base">{agent.name}</span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 flex items-center justify-center text-[#AEAEB2] hover:text-[#86868B] sm:hover:bg-[#F5F5F7] rounded-lg transition-colors text-sm"
              title="清空对话"
            >
              <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">清空</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{agent.icon}</div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#1D1D1F] mb-2">
                我是{agent.name}
              </h2>
              <p className="text-[#86868B] text-sm sm:text-base mb-6">{agent.description || '有什么可以帮助你的？'}</p>

              {/* 快捷提问按钮 */}
              {(() => {
                // 解析quick_prompts，处理JSON解析错误
                let prompts = []
                try {
                  prompts = JSON.parse(agent.quick_prompts || '[]')
                  if (!Array.isArray(prompts)) prompts = []
                } catch {
                  prompts = []
                }
                // 如果没有配置，使用默认提问
                if (prompts.length === 0) {
                  prompts = ['你能帮我做什么？', '给我举个使用案例']
                }
                return (
                  <div className="space-y-2 max-w-sm mx-auto">
                    <p className="text-sm text-[#86868B] mb-3">试试这样问我：</p>
                    {prompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInput(prompt)
                          setTimeout(() => {
                            const btn = document.querySelector('[data-send-btn]')
                            btn?.click()
                          }, 100)
                        }}
                        className="w-full text-left px-4 py-3 bg-white border border-[#E5E5E7] rounded-xl text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] hover:border-[#0066CC]/30 transition-colors"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#0066CC] text-white'
                    : 'bg-white border border-[#E5E5E7] text-[#1D1D1F]'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-[#AEAEB2]">
                    <span>{agent.icon}</span>
                    <span>{agent.name}</span>
                  </div>
                )}
                <div className="leading-relaxed text-[15px] sm:text-base">
                  {msg.role === 'assistant' ? (
                    msg.content ? (
                      <SafeMarkdown content={msg.content} />
                    ) : (
                      loading && idx === messages.length - 1 ? (
                        <ThinkingIndicator />
                      ) : null
                    )
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {error && (
            <div className="text-center text-red-500 text-sm py-2">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-[#E5E5E7] px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 safe-area-bottom">
        <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            disabled={loading}
            className="flex-1 px-4 py-3 sm:py-2.5 bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl text-base sm:text-sm text-[#1D1D1F] placeholder-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:opacity-50 transition-shadow"
          />
          <button
            data-send-btn
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-5 sm:px-5 py-3 sm:py-2.5 bg-[#0066CC] hover:bg-[#0055AA] active:bg-[#004499] disabled:bg-[#E5E5E7] disabled:text-[#AEAEB2] text-white font-medium rounded-xl transition-colors min-w-[60px] sm:min-w-[80px]"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#AEAEB2] border-t-transparent rounded-full animate-spin"></span>
            ) : '发送'}
          </button>
        </div>
      </div>
    </div>
  )
}
