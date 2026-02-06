import React from 'react'

export interface ThinkingState {
  isThinking: boolean
  depth: number
  evaluation: number
  currentMove: string
}

interface AIThinkingIndicatorProps {
  thinking: ThinkingState | null
  orientation?: 'white' | 'black'
}

const AIThinkingIndicator: React.FC<AIThinkingIndicatorProps> = ({
  thinking,
  orientation = 'white'
}) => {
  if (!thinking || !thinking.isThinking) {
    return null
  }

  const { evaluation, depth, currentMove } = thinking

  // Convert evaluation to display format
  const formatEvaluation = (evaluationValue: number): string => {
    if (Math.abs(evaluationValue) >= 100) {
      return evaluationValue > 0 ? '白方将杀' : '黑方将杀'
    }
    if (evaluationValue > 0) {
      return `+${evaluationValue.toFixed(1)}`
    } else {
      return evaluationValue.toFixed(1)
    }
  }

  // Get evaluation bar percentage
  const getEvaluationPercent = (evaluationValue: number): number => {
    // Clamp between -5 and +5
    const clamped = Math.max(-5, Math.min(5, evaluationValue))
    // Convert to 0-100 percentage
    return ((clamped + 5) / 10) * 100
  }

  // Get evaluation color
  const getEvaluationColor = (evaluationValue: number): string => {
    if (Math.abs(evaluationValue) >= 10) {
      return evaluationValue > 0 ? '#27ae60' : '#e74c3c'
    }
    if (Math.abs(evaluationValue) >= 3) {
      return evaluationValue > 0 ? '#2ecc71' : '#e67e22'
    }
    if (Math.abs(evaluationValue) >= 1) {
      return evaluationValue > 0 ? '#3498db' : '#f39c12'
    }
    return '#95a5a6'
  }

  // Get bar position (from current perspective)
  const percent = getEvaluationPercent(evaluation)
  const adjustedPercent = orientation === 'black' ? 100 - percent : percent
  const evalColor = getEvaluationColor(evaluation)

  return (
    <div className="ai-thinking-indicator">
      <div className="thinking-header">
        <div className="thinking-status">
          <div className="spinner"></div>
          <span>AI 思考中...</span>
        </div>
        <div className="thinking-depth">
          深度: {depth} 层
        </div>
      </div>

      {currentMove && (
        <div className="current-move">
          当前考虑: <strong>{currentMove}</strong>
        </div>
      )}

      <div className="evaluation-display">
        <div className="eval-label">评估:</div>
        <div className="eval-value" style={{ color: evalColor }}>
          {formatEvaluation(evaluation)}
        </div>
      </div>

      <div className="evaluation-bar-container">
        <div className="eval-scale">
          <span className="scale-label scale-black">黑优</span>
          <span className="scale-label scale-equal">均势</span>
          <span className="scale-label scale-white">白优</span>
        </div>
        <div className="evaluation-track">
          <div
            className="evaluation-fill"
            style={{
              width: `${adjustedPercent}%`,
              backgroundColor: evalColor
            }}
          />
          <div
            className="evaluation-marker"
            style={{
              left: `${adjustedPercent}%`,
              backgroundColor: evalColor
            }}
          >
            {Math.abs(evaluation) >= 10 ? '♔' : Math.abs(evaluation) >= 3 ? '↑' : '='}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIThinkingIndicator
