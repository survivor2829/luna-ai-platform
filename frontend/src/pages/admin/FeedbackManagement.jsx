import { useState, useEffect } from 'react'
import { admin } from '../../services/api'

const typeLabels = {
  suggestion: { label: '建议', icon: '💡', color: 'bg-blue-50 text-blue-700' },
  bug: { label: '问题', icon: '🐛', color: 'bg-red-50 text-red-700' },
  question: { label: '疑问', icon: '❓', color: 'bg-amber-50 text-amber-700' }
}

const statusLabels = {
  pending: { label: '待处理', color: 'bg-amber-50 text-amber-700' },
  read: { label: '已读', color: 'bg-blue-50 text-blue-700' },
  resolved: { label: '已解决', color: 'bg-green-50 text-green-700' }
}

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selectedFeedback, setSelectedFeedback] = useState(null)

  const loadFeedbacks = async () => {
    try {
      const data = await admin.feedbacks.list(filter || undefined)
      setFeedbacks(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedbacks()
  }, [filter])

  const handleStatusChange = async (id, newStatus) => {
    try {
      await admin.feedbacks.updateStatus(id, newStatus)
      loadFeedbacks()
      if (selectedFeedback?.id === id) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus })
      }
    } catch (err) {
      alert(err.message)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const pendingCount = feedbacks.filter(f => f.status === 'pending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-[#1D1D1F]">用户反馈</h1>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
              {pendingCount}
            </span>
          )}
        </div>

        {/* 筛选器 */}
        <div className="flex gap-2">
          {[
            { key: '', label: '全部' },
            { key: 'pending', label: '待处理' },
            { key: 'read', label: '已读' },
            { key: 'resolved', label: '已解决' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-[#F5F5F7] text-[#86868B] hover:bg-[#E5E5E7]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-[#AEAEB2]">加载中...</div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-12 text-center text-[#AEAEB2]">
          暂无反馈
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 反馈列表 */}
          <div className="space-y-3">
            {feedbacks.map(fb => (
              <div
                key={fb.id}
                onClick={() => setSelectedFeedback(fb)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedFeedback?.id === fb.id
                    ? 'border-[#0066CC] shadow-md'
                    : 'border-[#E5E5E7] hover:border-[#0066CC]/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeLabels[fb.type]?.color || 'bg-gray-100'}`}>
                      {typeLabels[fb.type]?.icon} {typeLabels[fb.type]?.label || fb.type}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusLabels[fb.status]?.color || 'bg-gray-100'}`}>
                      {statusLabels[fb.status]?.label || fb.status}
                    </span>
                  </div>
                  <span className="text-xs text-[#AEAEB2]">{formatDate(fb.created_at)}</span>
                </div>

                <p className="text-sm text-[#1D1D1F] line-clamp-2 mb-2">{fb.content}</p>

                <div className="flex items-center gap-3 text-xs text-[#86868B]">
                  <span>{fb.user_phone || '未知用户'}</span>
                  {fb.page_url && <span>{fb.page_url}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* 详情面板 */}
          {selectedFeedback && (
            <div className="bg-white rounded-xl border border-[#E5E5E7] p-6 h-fit sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1D1D1F]">反馈详情</h3>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-[#AEAEB2] hover:text-[#86868B]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* 类型和状态 */}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeLabels[selectedFeedback.type]?.color || 'bg-gray-100'}`}>
                    {typeLabels[selectedFeedback.type]?.icon} {typeLabels[selectedFeedback.type]?.label}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusLabels[selectedFeedback.status]?.color || 'bg-gray-100'}`}>
                    {statusLabels[selectedFeedback.status]?.label}
                  </span>
                </div>

                {/* 内容 */}
                <div>
                  <label className="text-xs text-[#86868B]">反馈内容</label>
                  <p className="text-sm text-[#1D1D1F] mt-1 whitespace-pre-wrap bg-[#F5F5F7] rounded-lg p-3">
                    {selectedFeedback.content}
                  </p>
                </div>

                {/* 用户信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#86868B]">用户</label>
                    <p className="text-sm text-[#1D1D1F] mt-1">{selectedFeedback.user_phone || '未知'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[#86868B]">提交时间</label>
                    <p className="text-sm text-[#1D1D1F] mt-1">{formatDate(selectedFeedback.created_at)}</p>
                  </div>
                </div>

                {selectedFeedback.contact && (
                  <div>
                    <label className="text-xs text-[#86868B]">联系方式</label>
                    <p className="text-sm text-[#1D1D1F] mt-1">{selectedFeedback.contact}</p>
                  </div>
                )}

                {selectedFeedback.page_url && (
                  <div>
                    <label className="text-xs text-[#86868B]">提交页面</label>
                    <p className="text-sm text-[#1D1D1F] mt-1">{selectedFeedback.page_url}</p>
                  </div>
                )}

                {/* 状态操作 */}
                <div className="pt-4 border-t border-[#E5E5E7]">
                  <label className="text-xs text-[#86868B] mb-2 block">更新状态</label>
                  <div className="flex gap-2">
                    {selectedFeedback.status !== 'read' && (
                      <button
                        onClick={() => handleStatusChange(selectedFeedback.id, 'read')}
                        className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        标记已读
                      </button>
                    )}
                    {selectedFeedback.status !== 'resolved' && (
                      <button
                        onClick={() => handleStatusChange(selectedFeedback.id, 'resolved')}
                        className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        标记已解决
                      </button>
                    )}
                    {selectedFeedback.status !== 'pending' && (
                      <button
                        onClick={() => handleStatusChange(selectedFeedback.id, 'pending')}
                        className="flex-1 py-2 bg-[#F5F5F7] text-[#86868B] rounded-lg text-sm font-medium hover:bg-[#E5E5E7] transition-colors"
                      >
                        重置待处理
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
