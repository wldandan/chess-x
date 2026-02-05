import React from 'react'
import '../styles/pages.css'

const AnalysisPage: React.FC = () => {
  const recentGames = [
    {
      id: 1,
      opponent: 'AI-卡尔森',
      result: '胜',
      date: '2025-03-15',
      duration: '25:30',
      accuracy: 78,
      bestMoves: 65,
      mistakes: 2
    },
    {
      id: 2,
      opponent: 'AI-卡斯帕罗夫',
      result: '负',
      date: '2025-03-14',
      duration: '18:45',
      accuracy: 62,
      bestMoves: 45,
      mistakes: 5
    },
    {
      id: 3,
      opponent: 'AI-卡鲁阿纳',
      result: '和',
      date: '2025-03-13',
      duration: '32:10',
      accuracy: 71,
      bestMoves: 58,
      mistakes: 3
    },
    {
      id: 4,
      opponent: 'AI-丁立人',
      result: '胜',
      date: '2025-03-12',
      duration: '28:20',
      accuracy: 82,
      bestMoves: 70,
      mistakes: 1
    }
  ]

  const analysisStats = [
    { label: '平均准确率', value: '73.2%', trend: '+5.4%', color: '#2ecc71' },
    { label: '最佳走法率', value: '59.5%', trend: '+8.2%', color: '#3498db' },
    { label: '平均错误数', value: '2.8', trend: '-1.2', color: '#e74c3c' },
    { label: '战术识别率', value: '68.7%', trend: '+12.1%', color: '#9b59b6' }
  ]

  const weaknessAreas = [
    { area: '中局计划制定', severity: '高', progress: 30 },
    { area: '残局技术', severity: '中', progress: 45 },
    { area: '时间管理', severity: '低', progress: 70 },
    { area: '心理稳定性', severity: '中', progress: 55 }
  ]

  return (
    <div className="analysis-page">
      <div className="page-header">
        <h2 className="page-title">棋局分析</h2>
        <p className="page-subtitle">
          深度分析对局表现，识别弱点，制定改进计划
        </p>
      </div>

      <div className="analysis-overview">
        <div className="overview-card">
          <h3 className="overview-title">总体表现</h3>
          <div className="overview-stats">
            {analysisStats.map((stat, index) => (
              <div key={index} className="overview-stat">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className={`stat-trend ${stat.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-games">
        <div className="section-header">
          <h3 className="section-title">最近对局</h3>
          <button className="btn btn-outline">查看全部</button>
        </div>

        <div className="games-table">
          <table>
            <thead>
              <tr>
                <th>对手</th>
                <th>结果</th>
                <th>日期</th>
                <th>时长</th>
                <th>准确率</th>
                <th>最佳走法</th>
                <th>错误</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {recentGames.map((game) => (
                <tr key={game.id}>
                  <td className="game-opponent">{game.opponent}</td>
                  <td>
                    <span className={`game-result result-${game.result}`}>
                      {game.result}
                    </span>
                  </td>
                  <td className="game-date">{game.date}</td>
                  <td className="game-duration">{game.duration}</td>
                  <td>
                    <div className="accuracy-bar">
                      <div
                        className="accuracy-fill"
                        style={{ width: `${game.accuracy}%` }}
                      />
                      <span className="accuracy-text">{game.accuracy}%</span>
                    </div>
                  </td>
                  <td className="game-best-moves">{game.bestMoves}%</td>
                  <td className="game-mistakes">{game.mistakes}</td>
                  <td>
                    <button className="btn btn-sm btn-primary">分析</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="weakness-analysis">
        <h3 className="section-title">弱点分析</h3>
        <div className="weakness-grid">
          {weaknessAreas.map((weakness, index) => (
            <div key={index} className="weakness-card">
              <div className="weakness-header">
                <h4 className="weakness-area">{weakness.area}</h4>
                <span className={`weakness-severity severity-${weakness.severity}`}>
                  {weakness.severity}
                </span>
              </div>
              <p className="weakness-description">
                需要加强{weakness.area.toLowerCase()}能力，建议进行专项训练
              </p>
              <div className="weakness-progress">
                <div className="progress-info">
                  <span className="progress-label">改进进度</span>
                  <span className="progress-percent">{weakness.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${weakness.progress}%` }}
                  />
                </div>
              </div>
              <div className="weakness-actions">
                <button className="btn btn-sm btn-primary">专项训练</button>
                <button className="btn btn-sm btn-outline">查看详情</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="improvement-plan">
        <div className="plan-card">
          <div className="plan-header">
            <h3 className="plan-title">改进计划建议</h3>
            <span className="plan-period">2周计划</span>
          </div>
          <div className="plan-content">
            <div className="plan-item">
              <div className="plan-icon">🎯</div>
              <div className="plan-details">
                <h4 className="plan-item-title">每日战术训练</h4>
                <p className="plan-item-description">
                  每天30分钟战术组合训练，重点提升牵制和捉双识别能力
                </p>
              </div>
              <div className="plan-duration">30分钟/天</div>
            </div>
            <div className="plan-item">
              <div className="plan-icon">🤖</div>
              <div className="plan-details">
                <h4 className="plan-item-title">AI对弈分析</h4>
                <p className="plan-item-description">
                  每周2次与AI对弈，重点分析中局计划制定错误
                </p>
              </div>
              <div className="plan-duration">1小时/次</div>
            </div>
            <div className="plan-item">
              <div className="plan-icon">📚</div>
              <div className="plan-details">
                <h4 className="plan-item-title">残局学习</h4>
                <p className="plan-item-description">
                  学习基本残局技巧，重点掌握王兵残局和车兵残局
                </p>
              </div>
              <div className="plan-duration">45分钟/天</div>
            </div>
          </div>
          <div className="plan-actions">
            <button className="btn btn-primary">接受计划</button>
            <button className="btn btn-outline">自定义计划</button>
          </div>
        </div>
      </div>

      <div className="analysis-tools">
        <h3 className="section-title">分析工具</h3>
        <div className="tools-grid">
          <div className="tool-card">
            <div className="tool-icon">🔍</div>
            <h4 className="tool-title">深度复盘</h4>
            <p className="tool-description">
              逐步分析对局，查看AI评分和替代走法
            </p>
            <button className="btn btn-outline">开始分析</button>
          </div>
          <div className="tool-card">
            <div className="tool-icon">📊</div>
            <h4 className="tool-title">统计报告</h4>
            <p className="tool-description">
              生成详细对局统计和进步趋势报告
            </p>
            <button className="btn btn-outline">生成报告</button>
          </div>
          <div className="tool-card">
            <div className="tool-icon">🎯</div>
            <h4 className="tool-title">弱点检测</h4>
            <p className="tool-description">
              自动识别技术弱点和改进建议
            </p>
            <button className="btn btn-outline">检测弱点</button>
          </div>
          <div className="tool-card">
            <div className="tool-icon">📈</div>
            <h4 className="tool-title">进步追踪</h4>
            <p className="tool-description">
              追踪ELO变化和各维度能力提升
            </p>
            <button className="btn btn-outline">查看进步</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage