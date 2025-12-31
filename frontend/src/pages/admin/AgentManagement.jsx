import { useState, useEffect } from 'react'
import { admin } from '../../services/api'

const defaultForm = {
  name: '',
  icon: '🤖',
  description: '',
  category: 'general',
  api_endpoint: '',
  api_token: '',
  project_id: '',
  tier_required: '365',
  status: 'active',
  sort_order: 0
}

export default function AgentManagement() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const loadAgents = async () => {
    try {
      const data = await admin.agents.list()
      setAgents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(defaultForm)
    setShowModal(true)
  }

  const openEdit = (agent) => {
    setEditingId(agent.id)
    setForm({
      name: agent.name,
      icon: agent.icon,
      description: agent.description || '',
      category: agent.category,
      api_endpoint: agent.api_endpoint,
      api_token: agent.api_token,
      project_id: agent.project_id,
      tier_required: agent.tier_required,
      status: agent.status,
      sort_order: agent.sort_order
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingId) {
        await admin.agents.update(editingId, form)
      } else {
        await admin.agents.create(form)
      }
      setShowModal(false)
      loadAgents()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除此智能体？')) return
    try {
      await admin.agents.delete(id)
      loadAgents()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[#1D1D1F]">智能体管理</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-[#0066CC] hover:bg-[#0055AA] text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 添加智能体
        </button>
      </div>

      {loading ? (
        <div className="text-[#AEAEB2]">加载中...</div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E7] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E7]">
                <th className="px-6 py-4 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">名称</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">分类</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">等级要求</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">排序</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-[#86868B] uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E7]">
              {agents.map(agent => (
                <tr key={agent.id} className="hover:bg-[#F5F5F7]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{agent.icon}</span>
                      <span className="text-[#1D1D1F] font-medium">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#86868B] text-sm">
                    {agent.category === 'custom' ? '定制' : '通用'}
                  </td>
                  <td className="px-6 py-4 text-[#86868B] text-sm">
                    {agent.tier_required}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      agent.status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {agent.status === 'active' ? '启用' : '即将上线'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#86868B] text-sm">{agent.sort_order}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(agent)}
                      className="text-[#0066CC] hover:text-[#0055AA] text-sm mr-4"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[#AEAEB2]">
                    暂无智能体
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-semibold text-[#1D1D1F]">
                {editingId ? '编辑智能体' : '添加智能体'}
              </h2>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">图标</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">分类</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                >
                  <option value="general">通用</option>
                  <option value="custom">定制</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">等级要求</label>
                <select
                  value={form.tier_required}
                  onChange={(e) => setForm({ ...form, tier_required: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                >
                  <option value="365">365会员</option>
                  <option value="3980">尊享会员</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">API Endpoint</label>
                <input
                  type="text"
                  value={form.api_endpoint}
                  onChange={(e) => setForm({ ...form, api_endpoint: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  placeholder="https://api.coze.com/..."
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">API Token</label>
                <input
                  type="password"
                  value={form.api_token}
                  onChange={(e) => setForm({ ...form, api_token: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Project ID</label>
                <input
                  type="text"
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">排序</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">状态</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                >
                  <option value="active">启用</option>
                  <option value="coming_soon">即将上线</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E5E5E7] flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-[#86868B] hover:text-[#1D1D1F] text-sm font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-[#0066CC] hover:bg-[#0055AA] disabled:bg-[#AEAEB2] text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
