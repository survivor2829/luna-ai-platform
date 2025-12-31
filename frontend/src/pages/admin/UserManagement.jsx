import { useState, useEffect } from 'react'
import { admin } from '../../services/api'

const tierLabels = {
  guest: '游客',
  '365': '365会员',
  '3980': '尊享会员'
}

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState({
    tier: 'guest',
    tier_expire_at: '',
    binded_agents: '[]',
    is_active: true
  })
  const [saving, setSaving] = useState(false)

  const loadUsers = async () => {
    try {
      const data = await admin.users.list()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const openEdit = (user) => {
    setEditingUser(user)
    setForm({
      tier: user.tier,
      tier_expire_at: user.tier_expire_at ? user.tier_expire_at.split('T')[0] : '',
      binded_agents: user.binded_agents || '[]',
      is_active: user.is_active
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = { ...form }
      if (data.tier_expire_at) {
        data.tier_expire_at = new Date(data.tier_expire_at).toISOString()
      } else {
        data.tier_expire_at = null
      }
      await admin.users.update(editingUser.id, data)
      setShowModal(false)
      loadUsers()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[#1D1D1F]">用户管理</h1>
      </div>

      {loading ? (
        <div className="text-[#AEAEB2]">加载中...</div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E7] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E7]">
                <th className="px-6 py-4 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">手机号</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">会员等级</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">到期时间</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">注册时间</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-[#86868B] uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E7]">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-[#F5F5F7]">
                  <td className="px-6 py-4 text-[#86868B] text-sm">{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#1D1D1F]">{user.phone}</span>
                      {user.is_admin && (
                        <span className="px-2 py-0.5 text-xs bg-red-50 text-red-700 rounded font-medium">
                          管理员
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      user.tier === '3980'
                        ? 'bg-amber-50 text-amber-700'
                        : user.tier === '365'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-[#F5F5F7] text-[#86868B]'
                    }`}>
                      {tierLabels[user.tier] || user.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#86868B] text-sm">
                    {user.tier_expire_at
                      ? new Date(user.tier_expire_at).toLocaleDateString()
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      user.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {user.is_active ? '正常' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#86868B] text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(user)}
                      className="text-[#0066CC] hover:text-[#0055AA] text-sm"
                    >
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-semibold text-[#1D1D1F]">
                编辑用户 - {editingUser.phone}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">会员等级</label>
                <select
                  value={form.tier}
                  onChange={(e) => setForm({ ...form, tier: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                >
                  <option value="guest">游客</option>
                  <option value="365">365会员</option>
                  <option value="3980">尊享会员</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">到期时间</label>
                <input
                  type="date"
                  value={form.tier_expire_at}
                  onChange={(e) => setForm({ ...form, tier_expire_at: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
                <p className="text-[#AEAEB2] text-xs mt-1">留空表示永久</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">绑定智能体ID (JSON数组)</label>
                <input
                  type="text"
                  value={form.binded_agents}
                  onChange={(e) => setForm({ ...form, binded_agents: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  placeholder="[1, 2, 3]"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm text-[#1D1D1F]">启用账户</label>
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
