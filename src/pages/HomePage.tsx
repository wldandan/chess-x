import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import '../styles/pages.css'

// 棋子图标组件
const ChessPieceIcon = ({ piece, size = 24 }: { piece: string; size?: number }) => (
  <span style={{ fontSize: `${size}px` }}>{piece}</span>
)

const HomePage: React.FC = () => {
  const [animated, setAnimated] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 徽章数据
  const badgeCategories = [
    {
      id: 1,
      title: '战术技能',
      description: '掌握16种战术',
      icon: '⚔️',
      badges: [
        { id: 1, icon: '♞', unlocked: true, tooltip: '双车杀王' },
        { id: 2, icon: '♜', unlocked: true, tooltip: '闪击战术' },
        { id: 3, icon: '♝', unlocked: true, tooltip: '牵制技巧' },
        { id: 4, icon: '♛', unlocked: false, tooltip: '消除防御' },
        { id: 5, icon: '♚', unlocked: false, tooltip: '战术组合' }
      ]
    },
    {
      id: 2,
      title: '开局知识',
      description: '精通经典开局',
      icon: '📚',
      badges: [
        { id: 1, icon: '🇮🇹', unlocked: true, tooltip: '意大利开局' },
        { id: 2, icon: '🇪🇸', unlocked: true, tooltip: '西班牙开局' },
        { id: 3, icon: '🇫🇷', unlocked: false, tooltip: '法兰西防御' },
        { id: 4, icon: '🏴‍☠️', unlocked: false, tooltip: '西西里防御' }
      ]
    },
    {
      id: 3,
      title: '对局表现',
      description: '赢得比赛胜利',
      icon: '🏆',
      badges: [
        { id: 1, icon: '🥇', unlocked: true, tooltip: '连胜3局' },
        { id: 2, icon: '📈', unlocked: false, tooltip: '击败大师' },
        { id: 3, icon: '👑', unlocked: false, tooltip: '完美对局' }
      ]
    },
    {
      id: 4,
      title: '学习习惯',
      description: '坚持每日学习',
      icon: '📅',
      badges: [
        { id: 1, icon: '⏰', unlocked: true, tooltip: '连续登录7天' },
        { id: 2, icon: '📚', unlocked: true, tooltip: '完成10个训练' },
        { id: 3, icon: '💡', unlocked: true, tooltip: '掌握5个技能' },
        { id: 4, icon: '🎯', unlocked: false, tooltip: '每日挑战完成' }
      ]
    }
  ]

  // 学习功能数据
  const learningFeatures = [
    {
      id: 1,
      title: '智能分析引擎',
      description: 'AI深度分析每一步棋，提供精确评分和替代建议，98%准确率',
      icon: '🧠'
    },
    {
      id: 2,
      title: '战术训练系统',
      description: '16种战术类型，1000+题目，自适应难度，持续提升战术识别能力',
      icon: '⚔️'
    },
    {
      id: 3,
      title: '进度追踪统计',
      description: '详细的学习统计和可视化进步曲线，实时更新你的成长轨迹',
      icon: '📊'
    },
    {
      id: 4,
      title: '个性化学习路径',
      description: '根据你的水平和学习习惯，智能推荐最适合的学习内容',
      icon: '🎓'
    }
  ]

  // 行动卡片数据
  const actionCards = [
    {
      id: 1,
      title: '开始对弈练习',
      description: '与AI进行实战对局，应用所学技巧，提升实战能力',
      icon: '♟️',
      path: '/demo',
      meta: { level: '所有级别', duration: '15-30分钟' }
    },
    {
      id: 2,
      title: '战术训练挑战',
      description: '完成每日战术挑战，赢取徽章奖励，提升战术敏锐度',
      icon: '🎯',
      path: '/training',
      meta: { level: '中级玩家', duration: '10-20分钟' }
    },
    {
      id: 3,
      title: '棋局分析复盘',
      description: '深度分析你的对局，发现改进空间，避免重复错误',
      icon: '📊',
      path: '/analysis',
      meta: { level: '进阶玩家', duration: '20-40分钟' }
    }
  ]

  // 平台统计数据
  const platformStats = [
    { id: 1, value: '10K+', label: '注册学习者' },
    { id: 2, value: '50K+', label: '完成训练' },
    { id: 3, value: '98%', label: '满意率' },
    { id: 4, value: '4.8★', label: '平均评分' }
  ]

  // 状态栏数据
  const statusItems = [
    { id: 1, label: '等级分', value: '1560', icon: '📊' },
    { id: 2, label: '连胜', value: '3', icon: '🔥' },
    { id: 3, label: '今日对局', value: '2/5', icon: '♟️' },
    { id: 4, label: '学习天数', value: '28', icon: '📅' }
  ]

  // 实时内容数据
  const liveContent = [
    {
      id: 1,
      title: '今日挑战',
      icon: '🎯',
      items: [
        { id: 1, text: '完成3场对局', completed: true },
        { id: 2, text: '解决5个战术题', completed: true },
        { id: 3, text: '分析1局棋', completed: false }
      ]
    },
    {
      id: 2,
      title: '热门训练',
      icon: '⚔️',
      items: [
        { id: 1, text: '双车杀王技巧' },
        { id: 2, text: '意大利开局精讲' },
        { id: 3, text: '残局基础训练' }
      ]
    },
    {
      id: 3,
      title: '最近活动',
      icon: '📈',
      items: [
        { id: 1, text: '击败了AI中级难度' },
        { id: 2, text: '解锁了"战术大师"徽章' },
        { id: 3, text: '等级分提升了20分' }
      ]
    }
  ]

  // 初始化Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement
          const delay = target.style.animationDelay || '0s'
          target.style.animationDelay = delay
          target.style.opacity = '1'
        }
      })
    }, observerOptions)

    // 观察所有动画元素
    document.querySelectorAll('.balanced-animate-left, .balanced-animate-right, .balanced-animate-up').forEach(el => {
      if (observerRef.current) {
        observerRef.current.observe(el)
      }
    })

    // 初始化进度条动画
    setTimeout(() => {
      document.querySelectorAll('.balanced-progress-fill').forEach(progress => {
        const el = progress as HTMLElement
        const width = el.style.width
        el.style.width = '0%'
        setTimeout(() => {
          el.style.width = width
        }, 300)
      })
    }, 500)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // 徽章悬停效果处理函数
  const handleBadgeHover = (categoryId: number, hover: boolean) => {
    const categoryElement = document.querySelector(`.balanced-badge-category[data-category-id="${categoryId}"]`)
    if (categoryElement) {
      const badges = categoryElement.querySelectorAll('.balanced-badge-item.unlocked')
      badges.forEach((badge, index) => {
        const el = badge as HTMLElement
        if (hover) {
          setTimeout(() => {
            el.style.transform = 'scale(1.2)'
          }, index * 50)
        } else {
          el.style.transform = 'scale(1)'
        }
      })
    }
  }

  return (
    <div className="home-page">
      {/* 顶部状态栏 - chess.com风格 */}
      <div className="chess-status-bar">
        <div className="status-items">
          {statusItems.map((item) => (
            <div key={item.id} className="status-item">
              <span>{item.icon}</span>
              <span className="status-value">{item.value}</span>
              <span className="status-label">{item.label}</span>
            </div>
          ))}
        </div>
        <button className="quick-play-btn">
          <ChessPieceIcon piece="♟️" size={18} />
          快速开始
        </button>
      </div>

      {/* 改进的英雄区域 */}
      <section className="enhanced-hero-section">
        <div className="enhanced-hero-content">
          <span className="enhanced-hero-badge">🎯 专为13-16岁青少年设计</span>
          <h1 className="enhanced-hero-title">像大师一样<br />思考每一步棋</h1>
          <p className="enhanced-hero-subtitle">
            结合AI智能分析和游戏化学习，让你的国际象棋水平快速提升
          </p>

          <div className="enhanced-hero-actions">
            <Link to="/demo" className="enhanced-play-btn">
              <ChessPieceIcon piece="♟️" size={24} />
              开始对弈
            </Link>
            <Link to="/training" className="enhanced-play-btn secondary">
              <ChessPieceIcon piece="🎯" size={24} />
              战术训练
            </Link>
            <Link to="/analysis" className="enhanced-play-btn secondary">
              <ChessPieceIcon piece="📊" size={24} />
              棋局分析
            </Link>
          </div>

          <div className="balanced-hero-stats" style={{ marginTop: 'var(--space-10)' }}>
            <div className="balanced-learning-path">
              <div className="balanced-path-title">
                <span>📊</span>
                <span>你的学习进度</span>
              </div>
              <div className="balanced-path-progress">
                <div className="balanced-progress-bar">
                  <div className="balanced-progress-fill" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="balanced-path-stats">
                <span>已掌握: 8/12 个技能</span>
                <span>65%</span>
              </div>
            </div>

            <div className="balanced-learning-path">
              <div className="balanced-path-title">
                <span>⭐</span>
                <span>成就水平</span>
              </div>
              <div className="balanced-path-progress">
                <div className="balanced-progress-bar">
                  <div className="balanced-progress-fill" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div className="balanced-path-stats">
                <span>等级: 中级棋手</span>
                <span>40%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-board">
          {/* Chess.com 官方动图 */}
          <img
            src="https://assets-configurator.chess.com/image/configurator/chessboard_1768166350728.gif"
            alt="Chess.com Animated Board"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </section>

      {/* 平衡内容区域 */}
      <div className="balanced-content">
        {/* 左侧：徽章成就 */}
        <section
          className="balanced-badges-section balanced-animate-left"
          style={{ opacity: 0 }}
        >
          <h2 className="balanced-section-title">🏅 学习成就</h2>

          <div className="balanced-badges-grid">
            {badgeCategories.map((category) => (
              <div
                key={category.id}
                className="balanced-badge-category"
                data-category-id={category.id}
                onMouseEnter={() => handleBadgeHover(category.id, true)}
                onMouseLeave={() => handleBadgeHover(category.id, false)}
              >
                <div className="balanced-category-header">
                  <div className="balanced-category-icon">{category.icon}</div>
                  <div className="balanced-category-info">
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                  </div>
                </div>
                <div className="balanced-category-badges">
                  {category.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`balanced-badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}
                      title={badge.tooltip}
                    >
                      {badge.icon}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 右侧：学习功能 */}
        <section
          className="balanced-learning-section balanced-animate-right"
          style={{ opacity: 0 }}
        >
          <h2 className="balanced-section-title">🎯 学习工具</h2>

          <div className="balanced-learning-features">
            {learningFeatures.map((feature) => (
              <div key={feature.id} className="balanced-feature-item">
                <div className="balanced-feature-icon">{feature.icon}</div>
                <div className="balanced-feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 行动号召区域 */}
      <section className="balanced-action-cards">
        {actionCards.map((card, index) => (
          <Link
            key={card.id}
            to={card.path}
            className="balanced-action-card balanced-animate-up"
            style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
          >
            <div className="balanced-action-icon">{card.icon}</div>
            <h3 className="balanced-action-title">{card.title}</h3>
            <p className="balanced-action-description">{card.description}</p>
            <div className="balanced-action-meta">
              <span>推荐给: {card.meta.level}</span>
              <span>时长: {card.meta.duration}</span>
            </div>
          </Link>
        ))}
      </section>

      {/* 平台统计区域 */}
      <section className="balanced-platform-section">
        <h2 className="balanced-platform-title">加入我们的学习社区</h2>
        <p className="balanced-platform-description">
          与成千上万的青少年棋手一起进步，享受科学、有趣、高效的国际象棋学习体验
        </p>

        <div className="balanced-stats-container">
          {platformStats.map((stat) => (
            <div key={stat.id} className="balanced-stat-item">
              <div className="balanced-stat-value">{stat.value}</div>
              <div className="balanced-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
