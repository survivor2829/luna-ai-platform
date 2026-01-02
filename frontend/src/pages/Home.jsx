import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { agents, stats } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function Home() {
  const [agentList, setAgentList] = useState([])
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    agents.list()
      .then(setAgentList)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // 获取用户统计数据
  useEffect(() => {
    if (user) {
      setStatsLoading(true)
      stats.getUserStats()
        .then(setUserStats)
        .catch(() => {}) // 静默处理错误
        .finally(() => setStatsLoading(false))
    }
  }, [user])

  const customAgents = agentList.filter(a => a.category === 'custom')
  const generalAgents = agentList.filter(a => a.category === 'general')

  const handleAgentClick = (agent) => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!agent.can_access) {
      alert('您没有权限使用此智能体，请升级会员')
      return
    }
    if (agent.status !== 'active') {
      alert('该智能体即将上线，敬请期待')
      return
    }
    navigate(`/chat/${agent.id}`)
  }

  const AgentCard = ({ agent }) => (
    <div
      onClick={() => handleAgentClick(agent)}
      className={`bg-white rounded-xl p-5 sm:p-6 cursor-pointer border border-[#E5E5E7] shadow-sm
        active:scale-[0.98] sm:hover:shadow-md sm:hover:-translate-y-1 transition-all duration-200 ${
        agent.status !== 'active' ? 'opacity-60' : ''
      }`}
    >
      <div className="text-center">
        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{agent.icon}</div>
        <h3 className="text-base font-semibold text-[#1D1D1F] mb-1 sm:mb-2">{agent.name}</h3>
        <p className="text-sm text-[#86868B] mb-3 sm:mb-4 line-clamp-2">
          {agent.description || '暂无描述'}
        </p>
      </div>
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#E5E5E7]">
        {agent.status === 'coming_soon' ? (
          <span className="text-xs text-amber-600">即将上线</span>
        ) : agent.can_access ? (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            可用
          </span>
        ) : (
          <span className="text-xs text-[#AEAEB2] flex items-center gap-1">
            <span>🔒</span>
            需升级
          </span>
        )}
        <span className="text-xs text-[#AEAEB2]">
          {agent.tier_required === '3980' ? '尊享' : '365'}
        </span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        {/* 价值统计模块 - 仅登录用户显示 */}
        {user && (
          <div className="bg-white rounded-xl border border-[#E5E5E7] p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
            {statsLoading ? (
              // 骨架屏
              <div className="animate-pulse">
                <div className="h-5 w-40 bg-[#E5E5E7] rounded mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="text-center">
                      <div className="h-8 w-20 bg-[#E5E5E7] rounded mx-auto mb-2"></div>
                      <div className="h-4 w-16 bg-[#E5E5E7] rounded mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : userStats && userStats.total_conversations > 0 ? (
              <>
                <h3 className="text-[#1D1D1F] font-semibold mb-4 text-sm sm:text-base">
                  🎉 您已通过 Luna AI
                </h3>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                  {/* 节省成本 */}
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#0066CC]">
                      ¥{userStats.saved_cost.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-[#86868B]">节省人力成本</div>
                    <div className="text-[10px] sm:text-xs text-[#AEAEB2]">按每次¥15计算</div>
                  </div>

                  {/* 节省时间 */}
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#0066CC]">
                      {userStats.saved_time_minutes >= 60
                        ? `${Math.round(userStats.saved_time_minutes / 60)}小时`
                        : `${userStats.saved_time_minutes}分钟`}
                    </div>
                    <div className="text-xs sm:text-sm text-[#86868B]">节省时间</div>
                    <div className="text-[10px] sm:text-xs text-[#AEAEB2]">按每次5分钟计算</div>
                  </div>

                  {/* AI协助次数 */}
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#0066CC]">
                      {userStats.total_conversations}次
                    </div>
                    <div className="text-xs sm:text-sm text-[#86868B]">AI协助</div>
                    <div className="text-[10px] sm:text-xs text-[#AEAEB2]">累计对话</div>
                  </div>
                </div>

                {/* 智能推荐 */}
                {userStats.recommended_agent && (
                  <div className="bg-[#F5F5F7] rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg flex-shrink-0">{userStats.recommended_agent.icon}</span>
                      <span className="text-xs sm:text-sm text-[#1D1D1F] truncate">
                        💡 试试「{userStats.recommended_agent.name}」
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/chat/${userStats.recommended_agent.id}`)}
                      className="text-xs sm:text-sm text-[#0066CC] hover:underline flex-shrink-0 ml-2"
                    >
                      去体验 →
                    </button>
                  </div>
                )}
              </>
            ) : userStats ? (
              // 新用户欢迎语
              <div className="text-center py-2">
                <div className="text-2xl mb-2">👋</div>
                <h3 className="text-[#1D1D1F] font-semibold mb-1">欢迎使用 Luna AI</h3>
                <p className="text-sm text-[#86868B]">选择下方的智能体开始对话，体验AI的强大能力</p>
              </div>
            ) : null}
          </div>
        )}

        {loading ? (
          <div className="text-center text-[#AEAEB2] py-20">加载中...</div>
        ) : (
          <>
            {customAgents.length > 0 && (
              <section className="mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-base sm:text-lg font-semibold text-[#1D1D1F] mb-4 sm:mb-6">
                  定制智能体
                </h2>
                {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3-4 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                  {customAgents.map(agent => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </section>
            )}

            {generalAgents.length > 0 && (
              <section>
                <h2 className="text-base sm:text-lg font-semibold text-[#1D1D1F] mb-4 sm:mb-6">
                  通用智能体
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                  {generalAgents.map(agent => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </section>
            )}

            {agentList.length === 0 && (
              <div className="text-center text-[#AEAEB2] py-20">
                暂无可用的智能体
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
