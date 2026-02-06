import { Link } from 'react-router-dom'
import '../styles/pages.css'

const HomePage: React.FC = () => {
  const quickActions = [
    { title: '开始对弈', description: '与AI进行精彩对局', icon: '♟️', path: '/demo', gradient: 'from-emerald-500 to-teal-600' },
    { title: '战术训练', description: '提升战术识别能力', icon: '🎯', path: '/training', gradient: 'from-violet-500 to-purple-600' },
    { title: '棋局分析', description: '深度复盘你的对局', icon: '📊', path: '/analysis', gradient: 'from-blue-500 to-cyan-600' },
  ]

  const features = [
    {
      title: '智能分析',
      description: 'AI 深度分析每一步棋，提供精准评分和替代建议',
      icon: '🧠',
      stats: '98% 准确率'
    },
    {
      title: '战术训练',
      description: '16种战术类型，自适应难度，持续进步',
      icon: '⚔️',
      stats: '1000+ 题目'
    },
    {
      title: '专业棋盘',
      description: '流畅拖放走棋，优雅动画，完美体验',
      icon: '♟️',
      stats: '国际标准'
    },
    {
      title: '进度追踪',
      description: '等级分系统，详细统计，可视化进步曲线',
      icon: '📈',
      stats: '实时更新'
    },
  ]

  const stats = [
    { number: '10K+', label: '注册用户' },
    { number: '50K+', label: '完成训练' },
    { number: '100K+', label: '对局分析' },
    { number: '4.8★', label: '用户评分' },
  ]

  return (
    <div className="home-page">
      {/* Hero Section - 优化版 */}
      <section className="hero-section animate-fadeIn">
        <div className="hero-content">
          <div className="hero-badge">🎯 专为青少年设计</div>
          <h1 className="hero-title">提升你的国际象棋水平</h1>
          <p className="hero-subtitle">
            AI 对弈 • 智能分析 • 战术训练 • 进度追踪
          </p>
          <p className="hero-description">
            结合最新 AI 技术，为你提供专业的国际象棋训练体验
          </p>
          <div className="hero-actions">
            <Link to="/demo" className="btn btn-lg btn-primary">
              <span>♟️</span>
              <span>开始对弈</span>
            </Link>
            <Link to="/training" className="btn btn-lg btn-secondary">
              <span>🎯</span>
              <span>战术训练</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions - 快捷入口 */}
      <section className="quick-actions-section">
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="action-card animate-slideIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`action-icon bg-gradient-to-br ${action.gradient}`}>
                {action.icon}
              </div>
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features - 功能特性 */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">核心功能</h2>
          <p className="section-subtitle">专业的训练工具，全面提升棋力</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-stats">
                <span className="feature-stat-badge">{feature.stats}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Preview - 棋盘预览 */}
      <section className="preview-section">
        <div className="preview-container">
          <div className="preview-content">
            <h2 className="section-title">专业棋盘体验</h2>
            <p className="section-subtitle">流畅的拖放操作，优雅的动画效果</p>
            <div className="preview-board">
              <div className="preview-board-inner">
                <div className="preview-piece large">♔</div>
                <div className="preview-piece">♕</div>
                <div className="preview-piece">♖</div>
                <div className="preview-piece">♗</div>
              </div>
              <div className="preview-overlay">
                <p className="preview-text">拖动棋子即可走棋</p>
                <Link to="/demo" className="btn btn-primary btn-large">
                  体验完整棋盘
                </Link>
              </div>
            </div>
          </div>
          <div className="preview-features">
            <h3 className="preview-title">为什么选择我们？</h3>
            <ul className="preview-list">
              <li className="preview-item">
                <span className="preview-item-icon">✓</span>
                <span className="preview-item-text">AI 驱动的智能分析引擎</span>
              </li>
              <li className="preview-item">
                <span className="preview-item-icon">✓</span>
                <span className="preview-item-text">16种战术类型训练</span>
              </li>
              <li className="preview-item">
                <span className="preview-item-icon">✓</span>
                <span className="preview-item-text">专业的棋步记谱和导出</span>
              </li>
              <li className="preview-item">
                <span className="preview-item-icon">✓</span>
                <span className="preview-item-text">详细的进度追踪和统计</span>
              </li>
              <li className="preview-item">
                <span className="preview-item-icon">✓</span>
                <span className="preview-item-text">完全免费，无需注册</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Stats - 数据统计 */}
      <section className="stats-section">
        <div className="stats-container">
          <h2 className="section-title text-center" style={{ justifyContent: 'center' }}>
            平台数据
          </h2>
          <p className="section-subtitle text-center">
            来自真实用户的使用反馈
          </p>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - 行动召唤 */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-icon">🏆</div>
          <h2 className="cta-title">准备好提升棋力了吗？</h2>
          <p className="cta-description">
            加入我们，开始你的国际象棋专业训练之旅
          </p>
          <div className="cta-actions">
            <Link to="/demo" className="btn btn-xl btn-primary">
              立即开始
            </Link>
            <Link to="/training" className="btn btn-xl btn-secondary">
              查看功能
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
