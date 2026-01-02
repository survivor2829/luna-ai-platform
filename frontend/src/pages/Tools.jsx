import { useState } from 'react'
import Header from '../components/Header'

const toolsData = [
  {
    id: 1,
    name: 'ChatGPT',
    description: 'OpenAI的对话AI，支持文本生成、问答、编程辅助',
    category: 'text',
    icon: '💬',
    url: 'https://chat.openai.com',
    tags: ['免费+付费', '需翻墙']
  },
  {
    id: 2,
    name: 'Claude',
    description: 'Anthropic的AI助手，擅长长文本处理和分析',
    category: 'text',
    icon: '🤖',
    url: 'https://claude.ai',
    tags: ['免费+付费', '需翻墙']
  },
  {
    id: 3,
    name: 'Midjourney',
    description: '顶级AI绘画工具，生成高质量艺术图像',
    category: 'image',
    icon: '🎨',
    url: 'https://midjourney.com',
    tags: ['付费', '需翻墙']
  },
  {
    id: 4,
    name: 'Stable Diffusion',
    description: '开源AI绘画，可本地部署，高度可定制',
    category: 'image',
    icon: '🖼️',
    url: 'https://stability.ai',
    tags: ['免费', '可本地']
  },
  {
    id: 5,
    name: 'Cursor',
    description: 'AI编程IDE，基于VSCode，智能代码补全',
    category: 'coding',
    icon: '💻',
    url: 'https://cursor.com',
    tags: ['免费+付费']
  },
  {
    id: 6,
    name: 'Runway',
    description: 'AI视频生成和编辑，支持文生视频',
    category: 'video',
    icon: '🎬',
    url: 'https://runwayml.com',
    tags: ['付费', '需翻墙']
  },
  {
    id: 7,
    name: 'Notion AI',
    description: '笔记工具内置AI，辅助写作和整理',
    category: 'productivity',
    icon: '📝',
    url: 'https://notion.so',
    tags: ['免费+付费']
  },
  {
    id: 8,
    name: 'Perplexity',
    description: 'AI搜索引擎，实时联网搜索并总结答案',
    category: 'text',
    icon: '🔍',
    url: 'https://perplexity.ai',
    tags: ['免费+付费', '需翻墙']
  },
  {
    id: 9,
    name: '通义千问',
    description: '阿里巴巴AI助手，国内可直接使用',
    category: 'text',
    icon: '🌐',
    url: 'https://tongyi.aliyun.com',
    tags: ['免费', '国内可用']
  },
  {
    id: 10,
    name: '文心一言',
    description: '百度AI助手，中文能力强',
    category: 'text',
    icon: '📚',
    url: 'https://yiyan.baidu.com',
    tags: ['免费', '国内可用']
  },
  {
    id: 11,
    name: 'Kimi',
    description: '月之暗面出品，支持超长文本，国内可用',
    category: 'text',
    icon: '🌙',
    url: 'https://kimi.moonshot.cn',
    tags: ['免费', '国内可用']
  },
  {
    id: 12,
    name: '即梦',
    description: '字节跳动AI绘画，国内可直接使用',
    category: 'image',
    icon: '✨',
    url: 'https://jimeng.jianying.com',
    tags: ['免费', '国内可用']
  }
]

const categories = [
  { key: 'all', label: '全部' },
  { key: 'text', label: '文本生成' },
  { key: 'image', label: '图像生成' },
  { key: 'video', label: '视频生成' },
  { key: 'coding', label: '编程助手' },
  { key: 'productivity', label: '效率工具' }
]

export default function Tools() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTools = toolsData.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleToolClick = (url) => {
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title and Search */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] mb-2">AI 工具推荐</h1>
          <p className="text-[#86868B] mb-6">精选优质AI工具，助力效率提升</p>

          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索工具..."
              className="w-full px-4 py-2.5 pl-10 bg-white border border-[#E5E5E7] rounded-xl text-[#1D1D1F] placeholder-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-shadow"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AEAEB2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.key
                    ? 'bg-[#0066CC] text-white'
                    : 'bg-white text-[#86868B] hover:bg-[#E5E5E7]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool.url)}
              className="bg-white rounded-xl border border-[#E5E5E7] p-5 cursor-pointer hover:shadow-lg hover:border-[#0066CC]/20 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{tool.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1D1D1F] group-hover:text-[#0066CC] transition-colors truncate">
                    {tool.name}
                  </h3>
                </div>
                <svg className="w-5 h-5 text-[#AEAEB2] group-hover:text-[#0066CC] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>

              <p className="text-sm text-[#86868B] mb-4 line-clamp-2">
                {tool.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {tool.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      tag === '国内可用'
                        ? 'bg-green-50 text-green-700'
                        : tag === '免费'
                        ? 'bg-blue-50 text-blue-700'
                        : tag === '需翻墙'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-[#F5F5F7] text-[#86868B]'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-[#86868B]">没有找到匹配的工具</p>
          </div>
        )}
      </main>
    </div>
  )
}
