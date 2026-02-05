import React from 'react'
import '../styles/pages.css'

const TrainingPage: React.FC = () => {
  const trainingModules = [
    {
      title: 'AI对弈训练',
      description: '与世界冠军风格的AI对弈，提升实战能力',
      icon: '🤖',
      progress: 65,
      status: '进行中',
      color: '#3498db'
    },
    {
      title: '战术组合训练',
      description: '系统化训练经典战术组合识别和执行能力',
      icon: '🎯',
      progress: 40,
      status: '进行中',
      color: '#e74c3c'
    },
    {
      title: '开局库学习',
      description: '掌握常用开局百科全书和变例分支',
      icon: '📚',
      progress: 20,
      status: '未开始',
      color: '#2ecc71'
    },
    {
      title: '残局专项训练',
      description: '基本残局技巧和高级残局策略',
      icon: '🏁',
      progress: 10,
      status: '未开始',
      color: '#9b59b6'
    },
    {
      title: '策略思维训练',
      description: '培养局面评估能力和长期战略规划思维',
      icon: '🧠',
      progress: 30,
      status: '进行中',
      color: '#f39c12'
    },
    {
      title: '时间控制模拟',
      description: '比赛标准计时和超时判负模拟训练',
      icon: '⏱️',
      progress: 0,
      status: '未开始',
      color: '#1abc9c'
    }
  ]

  return (
    <div className="training-page">
      <div className="page-header">
        <h2 className="page-title">训练中心</h2>
        <p className="page-subtitle">
          系统化训练模块，全面提升国际象棋水平
        </p>
      </div>

      <div className="training-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">35</div>
            <div className="stat-label">已完成训练</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-number">12.5</div>
            <div className="stat-label">训练时长(小时)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-number">+150</div>
            <div className="stat-label">ELO提升</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-number">8</div>
            <div className="stat-label">获得成就</div>
          </div>
        </div>
      </div>

      <div className="training-modules">
        <h3 className="section-title">训练模块</h3>
        <div className="modules-grid">
          {trainingModules.map((module, index) => (
            <div
              key={index}
              className="module-card"
              style={{ borderLeftColor: module.color }}
            >
              <div className="module-header">
                <div className="module-icon" style={{ color: module.color }}>
                  {module.icon}
                </div>
                <div className="module-title-section">
                  <h4 className="module-title">{module.title}</h4>
                  <span className={`module-status status-${module.status === '进行中' ? 'active' : 'inactive'}`}>
                    {module.status}
                  </span>
                </div>
              </div>
              <p className="module-description">{module.description}</p>

              <div className="module-progress">
                <div className="progress-info">
                  <span className="progress-label">进度</span>
                  <span className="progress-percent">{module.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${module.progress}%`,
                      backgroundColor: module.color
                    }}
                  />
                </div>
              </div>

              <div className="module-actions">
                <button className="btn btn-primary" style={{ backgroundColor: module.color }}>
                  {module.status === '进行中' ? '继续训练' : '开始训练'}
                </button>
                <button className="btn btn-outline">
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recommended-training">
        <h3 className="section-title">推荐训练</h3>
        <div className="recommendation-card">
          <div className="recommendation-content">
            <div className="recommendation-icon">🎯</div>
            <div>
              <h4 className="recommendation-title">根据你的表现推荐：牵制攻击训练</h4>
              <p className="recommendation-description">
                你在最近的对局中错过了3次牵制攻击机会，建议进行专项训练提升战术识别能力。
              </p>
            </div>
          </div>
          <button className="btn btn-primary">
            开始专项训练
          </button>
        </div>
      </div>

      <div className="training-schedule">
        <h3 className="section-title">训练计划</h3>
        <div className="schedule-card">
          <div className="schedule-header">
            <h4>本周训练计划</h4>
            <span className="schedule-duration">建议时长：5小时</span>
          </div>
          <div className="schedule-items">
            <div className="schedule-item">
              <div className="schedule-day">周一</div>
              <div className="schedule-task">AI对弈训练 (1小时)</div>
              <div className="schedule-status completed">已完成</div>
            </div>
            <div className="schedule-item">
              <div className="schedule-day">周二</div>
              <div className="schedule-task">战术组合训练 (1小时)</div>
              <div className="schedule-status pending">待完成</div>
            </div>
            <div className="schedule-item">
              <div className="schedule-day">周三</div>
              <div className="schedule-task">开局学习 (1小时)</div>
              <div className="schedule-status pending">待完成</div>
            </div>
            <div className="schedule-item">
              <div className="schedule-day">周四</div>
              <div className="schedule-task">策略思维训练 (1小时)</div>
              <div className="schedule-status pending">待完成</div>
            </div>
            <div className="schedule-item">
              <div className="schedule-day">周五</div>
              <div className="schedule-task">自由对弈 (1小时)</div>
              <div className="schedule-status pending">待完成</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainingPage