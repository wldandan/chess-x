import React from 'react'

interface EvaluationBarProps {
  evaluation: number
  isAnalyzing: boolean
}

const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evaluation,
  isAnalyzing
}) => {
  // 将评估值转换为百分比（-5到+5转换为0到100）
  const getEvaluationPercentage = (evalValue: number) => {
    // 限制评估值在-5到+5之间
    const clampedEval = Math.max(-5, Math.min(5, evalValue))
    // 转换为0-100的百分比
    return ((clampedEval + 5) / 10) * 100
  }

  // 获取评估文本
  const getEvaluationText = (evalValue: number) => {
    if (evalValue > 3) return '白方巨大优势'
    if (evalValue > 1.5) return '白方明显优势'
    if (evalValue > 0.5) return '白方稍优'
    if (evalValue > -0.5) return '均势'
    if (evalValue > -1.5) return '黑方稍优'
    if (evalValue > -3) return '黑方明显优势'
    return '黑方巨大优势'
  }

  // 获取评估颜色
  const getEvaluationColor = (evalValue: number) => {
    if (evalValue > 1.5) return '#27ae60' // 绿色：白方优势
    if (evalValue > 0.5) return '#2ecc71' // 浅绿：白方稍优
    if (evalValue > -0.5) return '#3498db' // 蓝色：均势
    if (evalValue > -1.5) return '#e67e22' // 橙色：黑方稍优
    return '#e74c3c' // 红色：黑方优势
  }

  // 获取评估符号
  const getEvaluationSymbol = (evalValue: number) => {
    if (evalValue > 1.5) return '♔'
    if (evalValue > 0.5) return '↑'
    if (evalValue > -0.5) return '='
    if (evalValue > -1.5) return '↓'
    return '♚'
  }

  const percentage = getEvaluationPercentage(evaluation)
  const evaluationText = getEvaluationText(evaluation)
  const evaluationColor = getEvaluationColor(evaluation)
  const evaluationSymbol = getEvaluationSymbol(evaluation)

  return (
    <div className="evaluation-bar">
      <div className="evaluation-header">
        <h4>局面评估</h4>
        <div className="evaluation-status">
          {isAnalyzing ? (
            <span className="analyzing-status">分析中...</span>
          ) : (
            <span className="static-status">静态评估</span>
          )}
        </div>
      </div>

      <div className="evaluation-display">
        <div className="evaluation-bar-container">
          <div className="evaluation-scale">
            <span className="scale-label scale-white">白优</span>
            <span className="scale-label scale-equal">均势</span>
            <span className="scale-label scale-black">黑优</span>
          </div>

          <div className="evaluation-track">
            <div
              className="evaluation-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: evaluationColor
              }}
            />
            <div
              className="evaluation-marker"
              style={{
                left: `${percentage}%`,
                backgroundColor: evaluationColor
              }}
            >
              <div className="marker-symbol">{evaluationSymbol}</div>
              <div className="marker-value">{evaluation.toFixed(1)}</div>
            </div>
          </div>
        </div>

        <div className="evaluation-info">
          <div className="info-row">
            <span className="info-label">评估值:</span>
            <span className="info-value" style={{ color: evaluationColor }}>
              {evaluation.toFixed(2)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">局面:</span>
            <span className="info-value">{evaluationText}</span>
          </div>
          <div className="info-row">
            <span className="info-label">深度:</span>
            <span className="info-value">{isAnalyzing ? '18层' : 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="evaluation-breakdown">
        <h5>评估维度</h5>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-label">子力</div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{ width: '65%', backgroundColor: '#2ecc71' }}
              />
            </div>
            <div className="breakdown-value">+1.2</div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-label">位置</div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{ width: '45%', backgroundColor: '#3498db' }}
              />
            </div>
            <div className="breakdown-value">+0.5</div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-label">兵型</div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{ width: '30%', backgroundColor: '#9b59b6' }}
              />
            </div>
            <div className="breakdown-value">+0.3</div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-label">王安全</div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{ width: '20%', backgroundColor: '#e74c3c' }}
              />
            </div>
            <div className="breakdown-value">-0.2</div>
          </div>
        </div>
      </div>

      <div className="evaluation-suggestions">
        <h5>建议走法</h5>
        {isAnalyzing ? (
          <div className="suggestions-list">
            <div className="suggestion-item best">
              <span className="suggestion-move">Nf6</span>
              <span className="suggestion-eval">+1.8</span>
              <span className="suggestion-desc">攻击中心，获得主动权</span>
            </div>
            <div className="suggestion-item good">
              <span className="suggestion-move">Bc4</span>
              <span className="suggestion-eval">+1.2</span>
              <span className="suggestion-desc">发展子力，控制斜线</span>
            </div>
            <div className="suggestion-item ok">
              <span className="suggestion-move">d3</span>
              <span className="suggestion-eval">+0.8</span>
              <span className="suggestion-desc">巩固中心，稳健发展</span>
            </div>
          </div>
        ) : (
          <div className="no-suggestions">
            <p>启用分析模式以获取走法建议</p>
            <button className="btn btn-sm">启用分析</button>
          </div>
        )}
      </div>

      <div className="evaluation-controls">
        <button className="btn btn-sm btn-outline" disabled={!isAnalyzing}>
          深度分析
        </button>
        <button className="btn btn-sm btn-outline">
          局面报告
        </button>
        <button className="btn btn-sm btn-outline">
          威胁检测
        </button>
      </div>
    </div>
  )
}

export default EvaluationBar