import { useState, useEffect } from 'react'
import Header from '../components/Header'

const promptsData = [
  // ===== 获客引流 =====
  {
    id: 1,
    title: '小红书爆款笔记生成',
    description: '3分钟生成一篇小红书爆款笔记',
    category: 'acquisition',
    scenario: '想在小红书获客，但不知道怎么写爆款内容',
    expectedResult: '生成符合平台调性的笔记，提升曝光和私信量',
    prompt: `你是小红书爆款内容专家，帮我写一篇小红书笔记。

我的产品/服务：[填写你的产品]
目标客户：[填写目标人群]

要求：
1. 标题：5-20字，带emoji，制造好奇心
2. 开头：前2行必须有痛点共鸣或利益点
3. 正文：分点列出，每点1-2句话，口语化
4. 结尾：引导评论或私信
5. 标签：5-10个相关话题

风格：真实分享感，像朋友聊天，不要广告感`,
    example: {
      input: '产品：企业AI培训课程，目标客户：中小企业老板',
      output: '标题：老板们醒醒！你的对手已经在用AI偷偷赚钱了💰\n\n姐妹们我真的要说！！！\n上个月我们公司刚上了AI系统，结果...'
    },
    relatedAgent: '销冠智能体',
    tags: ['小红书', '获客', '引流']
  },
  {
    id: 2,
    title: '抖音短视频脚本',
    description: '生成15-60秒带货/获客短视频脚本',
    category: 'acquisition',
    scenario: '想做抖音但不会写脚本，拍出来没人看',
    expectedResult: '生成有hook的脚本，提升完播率和转化',
    prompt: `你是抖音爆款短视频编剧，帮我写一个短视频脚本。

视频目的：[获客/带货/涨粉]
产品/服务：[填写]
目标人群：[填写]
视频时长：[15秒/30秒/60秒]

脚本结构：
【前3秒-Hook】制造冲突或好奇，留住观众
【中间-价值】给出干货或展示产品
【结尾-CTA】引导关注/评论/私信/购买

要求：
- 口语化，像跟朋友说话
- 节奏快，每句话都有信息量
- 标注画面建议和字幕`,
    example: {
      input: '目的：获客，产品：企业AI咨询，人群：老板，时长：30秒',
      output: '【画面：老板加班场景】\n"你还在每天工作12小时？"\n【字幕：而你的对手...】\n"别人家老板已经让AI干活了"'
    },
    relatedAgent: 'AI情报官',
    tags: ['抖音', '短视频', '脚本']
  },
  {
    id: 3,
    title: '朋友圈获客文案',
    description: '生成不让人反感的朋友圈营销文案',
    category: 'acquisition',
    scenario: '发朋友圈要么没人看，要么被屏蔽',
    expectedResult: '生成有价值感的内容，吸引客户主动咨询',
    prompt: `你是私域营销专家，帮我写一条朋友圈文案。

我的身份：[行业+职位]
今天想分享：[主题/内容]
目的：[展示专业/获取咨询/成交转化]

要求：
1. 开头要有吸引力，不要"今天..."开头
2. 内容要有价值，不是硬广
3. 配图建议（几张图，什么内容）
4. 如果是获客目的，自然引导私聊

风格选择：[干货分享/客户案例/个人思考/行业洞察]`,
    example: {
      input: '身份：AI培训顾问，分享：客户用AI省了50%人力，目的：获取咨询',
      output: '"昨天客户发来消息，说用了我们的方法，客服团队从6人减到3人，服务质量反而提升了..."\n\n配图建议：聊天截图（打码）+ 数据对比图'
    },
    relatedAgent: '私聊承接官',
    tags: ['朋友圈', '私域', '文案']
  },

  // ===== 销售转化 =====
  {
    id: 4,
    title: '客户跟进话术',
    description: '不同阶段客户的跟进话术模板',
    category: 'sales',
    scenario: '客户聊了几句就不回复了，不知道怎么跟进',
    expectedResult: '根据客户状态生成合适的跟进话术，提升回复率',
    prompt: `你是销售跟进专家，帮我设计客户跟进话术。

客户情况：
- 客户来源：[小红书/抖音/转介绍/其他]
- 聊天阶段：[刚加微信/了解过产品/报过价/考虑中]
- 上次聊天：[几天前，聊了什么]
- 客户顾虑：[价格/效果/时间/其他/不清楚]

我的产品：[简述产品和价格]

请给出：
1. 开场白（不要"在吗"）
2. 价值点提醒
3. 制造紧迫感（如果合适）
4. 引导下一步动作
5. 如果不回复的备选方案`,
    example: {
      input: '来源：小红书，阶段：报过价3天没回复，顾虑：可能是价格',
      output: '方案一（价值强调）：\n"姐，上次咱们聊的那个方案，我又想到一个点可以帮你多省20%成本，你现在方便语音2分钟吗？"'
    },
    relatedAgent: '私聊承接官',
    tags: ['跟进', '销售', '话术']
  },
  {
    id: 5,
    title: '异议处理话术',
    description: '客户说"太贵了""再考虑"怎么回',
    category: 'sales',
    scenario: '客户提出异议就不知道怎么接，经常丢单',
    expectedResult: '针对性化解异议，推进成交',
    prompt: `你是销售异议处理专家，帮我应对客户异议。

客户说的话：[填写客户原话]
客户背景：[行业、规模、预算范围]
我的产品：[产品介绍和价格]

请给出3种回应方式：
1. 【认同+转化】先认同客户，再转化观点
2. 【案例证明】用类似客户的成功案例回应
3. 【提问引导】用提问让客户自己思考

要求：
- 语气真诚，不要套路感
- 给出具体话术，可以直接用
- 标注每种方式适合什么性格的客户`,
    example: {
      input: '客户说："你们太贵了，别家便宜很多"',
      output: '方案一【认同+转化】：\n"理解您的顾虑，价格确实是要考虑的。不过我想问下，您之前有了解过为什么有这个价格差异吗？我给您算一笔账..."'
    },
    relatedAgent: '销冠智能体',
    tags: ['异议', '成交', '话术']
  },
  {
    id: 6,
    title: '成交逼单话术',
    description: '临门一脚，推动客户下单',
    category: 'sales',
    scenario: '客户明显有意向但就是不付款',
    expectedResult: '自然推动成交，不让客户反感',
    prompt: `你是成交专家，帮我设计逼单话术。

当前情况：
- 客户已经了解了什么：[产品介绍/价格/案例]
- 客户态度：[很感兴趣/有点兴趣/还在犹豫]
- 可能的顾虑：[不确定效果/时机不对/要和人商量/其他]
- 我能给的优惠：[折扣/赠品/分期/其他]

请给出：
1. 3种不同风格的逼单话术
2. 制造紧迫感的方式（真实可信）
3. 如果客户还是不成交，怎么优雅收场并留有余地

原则：真诚、不让客户反感、保持长期关系`,
    example: {
      input: '客户了解了产品和价格，很感兴趣但说"我再想想"',
      output: '方案一（限时优惠）：\n"完全理解，这毕竟是个决定。这样，我跟公司申请了一个名额，这周内确定的话可以多送一个月服务..."'
    },
    relatedAgent: '销冠智能体',
    tags: ['成交', '逼单', '销售']
  },

  // ===== 客户服务 =====
  {
    id: 7,
    title: '售后问题回复',
    description: '处理客户投诉和售后问题',
    category: 'service',
    scenario: '客户投诉或不满意，不知道怎么回复',
    expectedResult: '化解客户情绪，解决问题并维护关系',
    prompt: `你是客户服务专家，帮我处理售后问题。

客户问题：[描述客户遇到的问题或投诉内容]
客户情绪：[生气/着急/失望/平和]
问题原因：[我们的问题/客户误解/第三方原因/不确定]
我们能做的：[退款/换货/补偿/重新服务/其他]

请给出：
1. 第一条回复（安抚情绪+表达重视）
2. 解决方案话术
3. 如果客户不接受的备选方案
4. 后续跟进话术

原则：先处理情绪，再处理问题；承认问题，快速解决`,
    example: {
      input: '客户买了课程说不值这个价，要求退款，情绪生气',
      output: '第一条回复：\n"真的很抱歉给您带来不好的体验，您的感受我完全理解。您具体是哪部分觉得没达到预期呢？我来帮您解决..."'
    },
    relatedAgent: '私聊承接官',
    tags: ['售后', '投诉', '客服']
  },

  // ===== 内容生产 =====
  {
    id: 8,
    title: '公众号文章框架',
    description: '快速生成公众号文章大纲和内容',
    category: 'content',
    scenario: '要写公众号但不知道怎么组织内容',
    expectedResult: '生成完整的文章框架，填充内容即可发布',
    prompt: `你是公众号写作专家，帮我写一篇文章。

文章主题：[填写]
目标读者：[谁会看这篇文章]
文章目的：[涨粉/获客/品牌/带货]
文章风格：[干货教程/观点输出/故事案例/行业分析]
字数要求：[1000/1500/2000字]

请输出：
1. 3个标题选项（带数字或疑问效果更好）
2. 文章大纲（每个部分的核心内容）
3. 开头段落（前3句话决定读者是否继续）
4. 每个段落的关键句
5. 结尾（引导关注/互动/转化）`,
    example: {
      input: '主题：中小企业如何用AI降本增效，读者：老板，目的：获客',
      output: '标题选项：\n1.《3个AI工具，让我每月省下2万人力成本》\n2.《老板必看：你的竞争对手正在偷偷用AI》\n3.《实测：用AI后，我把团队从10人减到6人》'
    },
    relatedAgent: 'AI情报官',
    tags: ['公众号', '文章', '写作']
  },
  {
    id: 9,
    title: '产品卖点提炼',
    description: '把产品特点变成客户能听懂的卖点',
    category: 'content',
    scenario: '产品介绍写得很专业但客户看不懂',
    expectedResult: '提炼出打动客户的卖点话术',
    prompt: `你是卖点提炼专家，帮我把产品特点变成卖点。

产品名称：[填写]
产品特点：[列出3-5个产品特点/功能]
目标客户：[谁会买]
客户痛点：[客户有什么问题需要解决]
竞争对手：[主要对手是谁，他们怎么说]

请输出：
1. 一句话卖点（10字以内，一听就懂）
2. 三大核心卖点（特点→好处→证明）
3. 客户证言模板（让客户帮你说）
4. 对比竞品的差异化话术
5. FAQ预设（客户可能的疑问和回答）`,
    example: {
      input: '产品：AI客服系统，特点：24小时自动回复、学习历史对话、多平台接入',
      output: '一句话卖点：\n"让AI帮你24小时接客，一个顶三个"\n\n三大核心卖点：\n1. 全天候响应 → 不漏掉任何一个客户 → 某客户夜间成交提升40%'
    },
    relatedAgent: '销冠智能体',
    tags: ['卖点', '文案', '产品']
  },

  // ===== 团队管理 =====
  {
    id: 10,
    title: '招聘JD生成',
    description: '快速生成吸引人的招聘信息',
    category: 'team',
    scenario: '写的招聘信息没人投递，不吸引人',
    expectedResult: '生成有吸引力的JD，提高简历投递量',
    prompt: `你是招聘文案专家，帮我写招聘信息。

岗位名称：[填写]
工作内容：[主要做什么]
任职要求：[需要什么条件]
薪资范围：[可以写范围]
公司亮点：[公司有什么吸引人的地方]
发布平台：[BOSS直聘/拉勾/脉脉/朋友圈]

请输出：
1. 吸引眼球的岗位标题
2. 公司介绍（简短有亮点）
3. 岗位职责（清晰具体）
4. 任职要求（分必须和加分项）
5. 薪资福利（要有吸引力）
6. 投递引导语`,
    example: {
      input: '岗位：销售经理，薪资：15-25K，公司：AI培训公司',
      output: '标题：\n【底薪8K+高提成】AI行业销售经理，风口行业不容错过\n\n公司介绍：\n我们是一家专注企业AI培训的公司，客户包括XX、XX等知名企业...'
    },
    relatedAgent: 'AI情报官',
    tags: ['招聘', 'JD', '团队']
  },

  // ===== 商业分析 =====
  {
    id: 11,
    title: '竞品分析框架',
    description: '快速分析竞争对手的优劣势',
    category: 'analysis',
    scenario: '不了解竞争对手，不知道自己的差异化',
    expectedResult: '全面了解竞品，找到自己的竞争优势',
    prompt: `你是商业分析专家，帮我做竞品分析。

我的产品/公司：[填写]
竞争对手：[列出1-3个主要竞品]
分析目的：[定价参考/功能对比/营销策略/找差异化]

请从以下维度分析：
1. 产品对比（功能、价格、服务）
2. 目标客户对比
3. 营销方式对比（获客渠道、内容策略）
4. 优劣势分析
5. 我的机会点和建议

输出要求：用表格对比，结论明确`,
    example: {
      input: '我的产品：AI培训课程，竞品：某知名AI培训机构',
      output: '【产品对比表】\n| 维度 | 我们 | 竞品A | 分析 |\n|------|------|-------|------|\n| 价格 | 3980 | 9800 | 价格优势明显 |\n| 课程时长 | 20小时 | 40小时 | 需突出效率 |'
    },
    relatedAgent: 'AI情报官',
    tags: ['竞品', '分析', '商业']
  },
  {
    id: 12,
    title: '复盘总结模板',
    description: '项目/活动/季度复盘框架',
    category: 'analysis',
    scenario: '做完项目不知道怎么总结经验',
    expectedResult: '结构化复盘，提炼可复用的经验',
    prompt: `你是复盘教练，帮我做一次复盘总结。

复盘对象：[项目名称/活动/某季度业绩]
时间周期：[什么时候到什么时候]
原定目标：[当初设定的目标是什么]
实际结果：[实际达成了什么]

请按以下框架输出：
1. 【目标回顾】当初为什么定这个目标
2. 【结果评估】完成度多少，差距在哪
3. 【亮点分析】做得好的地方，为什么好
4. 【问题分析】做得不好的地方，根本原因
5. 【经验提炼】可复用的经验（具体可执行）
6. 【改进计划】下次怎么做得更好`,
    example: {
      input: '复盘对象：双11营销活动，目标：销售额50万，结果：实际35万',
      output: '【目标回顾】\n基于去年30万+市场增长预期设定50万目标\n\n【结果评估】\n完成度70%，差距15万\n主要差距：新客转化率低于预期'
    },
    relatedAgent: 'AI情报官',
    tags: ['复盘', '总结', '管理']
  }
]

const categories = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'acquisition', label: '获客引流', icon: '🎯' },
  { key: 'sales', label: '销售转化', icon: '💰' },
  { key: 'service', label: '客户服务', icon: '💬' },
  { key: 'content', label: '内容生产', icon: '✍️' },
  { key: 'team', label: '团队管理', icon: '👥' },
  { key: 'analysis', label: '商业分析', icon: '📊' }
]

const categoryLabels = {
  acquisition: '获客引流',
  sales: '销售转化',
  service: '客户服务',
  content: '内容生产',
  team: '团队管理',
  analysis: '商业分析'
}

export default function Prompts() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('promptFavorites')
    return saved ? JSON.parse(saved) : []
  })
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    localStorage.setItem('promptFavorites', JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const filteredPrompts = promptsData
    .filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory
      const matchesSearch = searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 0 : 1
      const bFav = favorites.includes(b.id) ? 0 : 1
      return aFav - bFav
    })

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F]">提示词工具箱</h1>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded">老板专用</span>
          </div>
          <p className="text-[#86868B] mb-6">直接能用的AI提示词，帮你获客、成交、提效</p>

          {/* Search */}
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索提示词..."
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.key
                    ? 'bg-[#0066CC] text-white'
                    : 'bg-white text-[#86868B] hover:bg-[#E5E5E7]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredPrompts.map(prompt => (
            <div
              key={prompt.id}
              className={`bg-white rounded-xl border transition-all duration-200 ${
                expandedId === prompt.id
                  ? 'border-[#0066CC]/30 shadow-lg col-span-1 md:col-span-2 xl:col-span-3'
                  : 'border-[#E5E5E7] hover:shadow-md hover:border-[#0066CC]/20'
              }`}
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#1D1D1F] truncate">{prompt.title}</h3>
                      {favorites.includes(prompt.id) && (
                        <span className="text-amber-500 flex-shrink-0">★</span>
                      )}
                    </div>
                    <span className="inline-block px-2 py-0.5 bg-[#F5F5F7] text-[#86868B] text-xs rounded">
                      {categoryLabels[prompt.category]}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFavorite(prompt.id)}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                      favorites.includes(prompt.id)
                        ? 'text-amber-500 bg-amber-50'
                        : 'text-[#AEAEB2] hover:bg-[#F5F5F7]'
                    }`}
                    title={favorites.includes(prompt.id) ? '取消收藏' : '收藏'}
                  >
                    <svg className="w-5 h-5" fill={favorites.includes(prompt.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-[#86868B] mb-4">{prompt.description}</p>

                {/* Scenario & Expected Result */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 flex-shrink-0">🎯</span>
                    <div>
                      <span className="text-xs text-blue-600 font-medium">使用场景</span>
                      <p className="text-sm text-blue-800">{prompt.scenario}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-green-50 rounded-lg">
                    <span className="text-green-600 flex-shrink-0">✅</span>
                    <div>
                      <span className="text-xs text-green-600 font-medium">预期效果</span>
                      <p className="text-sm text-green-800">{prompt.expectedResult}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {prompt.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-[#F5F5F7] text-[#86868B] text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedId(expandedId === prompt.id ? null : prompt.id)}
                  className="w-full py-2 text-sm text-[#0066CC] hover:bg-[#F5F5F7] rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  {expandedId === prompt.id ? '收起详情' : '查看完整提示词'}
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedId === prompt.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Expanded Content */}
              {expandedId === prompt.id && (
                <div className="border-t border-[#E5E5E7] p-5 space-y-5">
                  {/* Full Prompt */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-[#1D1D1F]">完整提示词</h4>
                      <button
                        onClick={() => copyToClipboard(prompt.prompt, prompt.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          copied === prompt.id
                            ? 'bg-green-50 text-green-700'
                            : 'bg-[#0066CC] text-white hover:bg-[#0055AA]'
                        }`}
                      >
                        {copied === prompt.id ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            已复制
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            一键复制
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 bg-[#1D1D1F] text-[#F5F5F7] rounded-xl text-sm whitespace-pre-wrap overflow-x-auto font-mono">
                      {prompt.prompt}
                    </pre>
                  </div>

                  {/* Example */}
                  <div>
                    <h4 className="font-medium text-[#1D1D1F] mb-2">使用示例</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <span className="text-xs text-blue-600 font-medium">输入</span>
                        <p className="text-sm text-blue-800 mt-1">{prompt.example.input}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <span className="text-xs text-green-600 font-medium">输出预览</span>
                        <p className="text-sm text-green-800 mt-1 whitespace-pre-wrap">{prompt.example.output}</p>
                      </div>
                    </div>
                  </div>

                  {/* Related Agent */}
                  <div className="flex items-center justify-between p-3 bg-[#F5F5F7] rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>🤖</span>
                      <span className="text-sm text-[#86868B]">推荐搭配</span>
                      <span className="text-sm font-medium text-[#1D1D1F]">{prompt.relatedAgent}</span>
                    </div>
                    <a
                      href="/"
                      className="text-sm text-[#0066CC] hover:underline"
                    >
                      去使用 →
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPrompts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-[#86868B]">没有找到匹配的提示词</p>
          </div>
        )}
      </main>
    </div>
  )
}
