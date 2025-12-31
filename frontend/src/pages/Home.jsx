import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { agents } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function Home() {
  const [agentList, setAgentList] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    agents.list()
      .then(setAgentList)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
