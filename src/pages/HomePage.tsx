import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/pages.css'

const HomePage: React.FC = () => {
  const features = [
    {
      title: 'AI棋手风格模拟训练',
      description: '模仿世界冠军棋风，自适应难度调整，风格分析报告',
      icon: '🤖',
      path: '/training',
      color: '#3498db'
    },
    {
      title: '智能棋步分析复盘',
      description: '每步棋的AI评分，替代走法建议，关键决策点标记',
      icon: '📊',
      path: '/analysis',
      color: '#2ecc71'
    },
    {
      title: '战术组合训练系统',
      description: '经典战术库，渐进式难度设置，实时提示和解答',
      icon: '🎯',
      path: '/training',
      color: '#e74c3c'
    },
    {
      title: '策略思维指导模块',
      description: '局面评估训练，计划制定指导，长期战略思维培养',
      icon: '🧠',
      path: '/training',
      color: '#9b59b6'
    },
    {
      title: '专业比赛界面',
      description: '类似Chess.com的专业棋盘，国际棋联标准记谱法',
      icon: '♟️',
      path: '/training',
      color: '#f39c12'
    },
    {
      title: '个人成长追踪',
      description: '棋力等级分追踪，弱项分析报告，进步趋势图表',
      icon: '📈',
      path: '/analysis',
      color: '#1abc9c'
    }
  ]

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">欢迎来到 Aaron Chess</h2>
          <p className="hero-subtitle">
            专为13-16岁青少年设计的国际象棋比赛准备Web应用
          </p>
          <p className="hero-description">
            结合AI对弈、智能复盘和专业训练功能，帮助提升比赛竞争力
          </p>
          <div className="hero-actions">
            <Link to="/training" className="btn btn-primary">
              开始训练
            </Link>
            <Link to="/analysis" className="btn btn-secondary">
              棋局分析
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h3 className="section-title">核心功能</h3>
        <p className="section-subtitle">10大核心特性，全面提升国际象棋水平</p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              style={{ borderTopColor: feature.color }}
            >
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h4 className="feature-title">{feature.title}</h4>
              <p className="feature-description">{feature.description}</p>
              <Link to={feature.path} className="feature-link">
                了解更多 →
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">95%</div>
            <div className="stat-label">AI对弈准确率</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">&lt;2秒</div>
            <div className="stat-label">复盘分析响应时间</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">4.5/5</div>
            <div className="stat-label">用户训练满意度</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">30%</div>
            <div className="stat-label">棋力提升效率</div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h3 className="cta-title">准备好提升你的国际象棋水平了吗？</h3>
        <p className="cta-description">
          加入数千名青少年棋手的行列，开始你的专业训练之旅
        </p>
        <Link to="/training" className="btn btn-large btn-primary">
          立即开始免费训练
        </Link>
      </div>
    </div>
  )
}

export default HomePage