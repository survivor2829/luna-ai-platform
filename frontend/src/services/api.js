const API_BASE = "http://localhost:8000/api"

// 获取token
export const getToken = () => localStorage.getItem("token")

// 通用请求
async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  }

  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "请求失败" }))
    throw new Error(error.detail || "请求失败")
  }

  return res.json()
}

// 认证
export const auth = {
  login: (phone, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password })
    }),
  register: (phone, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ phone, password })
    }),
  me: () => request("/auth/me")
}

// 智能体
export const agents = {
  list: () => request("/agents"),
  get: (id) => request(`/agents/${id}`),
  getHistory: (id) => request(`/agents/${id}/history`),
  clearHistory: (id) => request(`/agents/${id}/history`, { method: "DELETE" })
}

// SSE对话
export async function chatWithAgent(agentId, message, onChunk) {
  const token = getToken()

  const res = await fetch(`${API_BASE}/agents/${agentId}/chat`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "请求失败" }))
    throw new Error(error.detail || "请求失败")
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split("\n")

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6)
        if (data === "[DONE]") return fullText

        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            fullText += parsed.content
            onChunk(fullText)
          }
          if (parsed.error) {
            throw new Error(parsed.error)
          }
        } catch (e) {
          if (e.message && !e.message.includes("JSON")) {
            throw e
          }
        }
      }
    }
  }

  return fullText
}

// 管理后台
export const admin = {
  agents: {
    list: () => request("/admin/agents"),
    create: (data) => request("/admin/agents", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/admin/agents/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) => request(`/admin/agents/${id}`, { method: "DELETE" })
  },
  users: {
    list: () => request("/admin/users"),
    update: (id, data) => request(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) })
  }
}
