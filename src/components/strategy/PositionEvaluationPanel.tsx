// 局面评估训练面板
import React, { useState } from 'react';
import type {
  StrategyExercise,
  PositionEvaluation,
} from '../../types/training.types';

interface PositionEvaluationPanelProps {
  exercise: StrategyExercise;
  userEvaluation: PositionEvaluation | null;
  onSubmit: (evaluation: PositionEvaluation) => void;
  feedback: {
    type: 'correct' | 'partial' | 'incorrect' | 'hint' | null;
    message: string;
    details?: string[];
  };
}

const PositionEvaluationPanel: React.FC<PositionEvaluationPanelProps> = ({
  exercise,
  userEvaluation,
  onSubmit,
  feedback,
}) => {
  const [evaluation, setEvaluation] = useState<PositionEvaluation>(
    userEvaluation || {
      score: 0,
      breakdown: {
        material: 0,
        activity: 0,
        pawnStructure: 0,
        kingSafety: 0,
        space: 0,
        tempo: 0,
      },
      verbal: '',
    }
  );

  // 评估维度配置
  const evaluationDimensions = [
    { key: 'material', label: '子力优势', description: '棋子价值和数量对比', min: -5, max: 5 },
    { key: 'activity', label: '子力活跃度', description: '棋子控制范围和威胁', min: -3, max: 3 },
    { key: 'pawnStructure', label: '兵型结构', description: '兵链、弱兵、通路兵', min: -3, max: 3 },
    { key: 'kingSafety', label: '王的安全', description: '王城防御和弱点', min: -3, max: 3 },
    { key: 'space', label: '空间控制', description: '棋盘控制范围和活动空间', min: -3, max: 3 },
    { key: 'tempo', label: '先手优势', description: '主动权和发展速度', min: -2, max: 2 },
  ] as const;

  // 处理维度评分变化
  const handleDimensionChange = (
    dimension: keyof typeof evaluation.breakdown,
    value: number
  ) => {
    setEvaluation((prev) => ({
      ...prev,
      breakdown: {
        ...prev.breakdown,
        [dimension]: value,
      },
    }));
  };

  // 计算总分
  const calculateTotalScore = () => {
    const weights = {
      material: 0.4,
      activity: 0.15,
      pawnStructure: 0.15,
      kingSafety: 0.1,
      space: 0.1,
      tempo: 0.1,
    };

    let total = 0;
    for (const [dimension, weight] of Object.entries(weights)) {
      total += (evaluation.breakdown[dimension as keyof typeof evaluation.breakdown] || 0) * weight;
    }
    return total;
  };

  // 处理提交
  const handleSubmit = () => {
    const totalScore = calculateTotalScore();
    const finalEvaluation: PositionEvaluation = {
      ...evaluation,
      score: parseFloat(totalScore.toFixed(1)),
    };
    onSubmit(finalEvaluation);
  };

  // 获取AI评估用于比较
  const aiEvaluation = exercise.positionEvaluation;

  return (
    <div className="position-evaluation-panel">
      <div className="panel-header">
        <h3 className="panel-title">
          <span className="panel-icon">📊</span>
          局面评估训练
        </h3>
        <p className="panel-description">
          全面评估当前局面，培养准确判断能力
        </p>
      </div>

      {/* 评估维度输入 */}
      <div className="evaluation-dimensions">
        {evaluationDimensions.map((dimension) => (
          <div key={dimension.key} className="dimension-item">
            <div className="dimension-header">
              <label className="dimension-label">{dimension.label}</label>
              <span className="dimension-value">
                {evaluation.breakdown[dimension.key].toFixed(1)}
              </span>
            </div>
            <p className="dimension-description">{dimension.description}</p>

            <div className="dimension-slider-container">
              <input
                type="range"
                min={dimension.min}
                max={dimension.max}
                step="0.1"
                value={evaluation.breakdown[dimension.key]}
                onChange={(e) =>
                  handleDimensionChange(dimension.key, parseFloat(e.target.value))
                }
                className="dimension-slider"
              />
              <div className="slider-labels">
                <span className="slider-min">{dimension.min}</span>
                <span className="slider-max">{dimension.max}</span>
              </div>
            </div>

            {/* 与AI评估对比 */}
            {aiEvaluation && (
              <div className="ai-comparison">
                <span className="ai-label">AI评估:</span>
                <span className="ai-value">
                  {aiEvaluation.breakdown[dimension.key].toFixed(1)}
                </span>
                <div className="comparison-bar">
                  <div
                    className="user-bar"
                    style={{
                      width: `${((evaluation.breakdown[dimension.key] - dimension.min) / (dimension.max - dimension.min)) * 100}%`,
                      backgroundColor: 'var(--secondary-color)',
                    }}
                  />
                  <div
                    className="ai-bar"
                    style={{
                      width: `${((aiEvaluation.breakdown[dimension.key] - dimension.min) / (dimension.max - dimension.min)) * 100}%`,
                      backgroundColor: 'var(--info-color)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 总分显示 */}
      <div className="total-score-section">
        <div className="total-score-header">
          <h4 className="total-score-title">综合评分</h4>
          <div className="total-score-value">
            {calculateTotalScore().toFixed(1)}
            {aiEvaluation && (
              <span className="ai-total-score">
                (AI评分: {aiEvaluation.score.toFixed(1)})
              </span>
            )}
          </div>
        </div>
        <div className="score-bars">
          <div
            className="user-total-bar"
            style={{
              width: `${((calculateTotalScore() + 5) / 10) * 100}%`,
            }}
          />
          {aiEvaluation && (
            <div
              className="ai-total-bar"
              style={{
                width: `${((aiEvaluation.score + 5) / 10) * 100}%`,
              }}
            />
          )}
        </div>
      </div>

      {/* 文字评估输入 */}
      <div className="verbal-assessment-section">
        <label className="verbal-label">文字评估描述</label>
        <textarea
          className="verbal-input"
          value={evaluation.verbal}
          onChange={(e) =>
            setEvaluation((prev) => ({ ...prev, verbal: e.target.value }))
          }
          placeholder="描述局面特点、优势和劣势..."
          rows={3}
        />
        {aiEvaluation?.verbal && (
          <div className="ai-verbal-hint">
            <strong>AI评估参考:</strong> {aiEvaluation.verbal}
          </div>
        )}
      </div>

      {/* 反馈显示 */}
      {feedback.type && (
        <div className={`evaluation-feedback feedback-${feedback.type}`}>
          <div className="feedback-icon">
            {feedback.type === 'correct' ? '✓' :
             feedback.type === 'partial' ? '⚠' : '✗'}
          </div>
          <div className="feedback-content">
            <p className="feedback-message">{feedback.message}</p>
            {feedback.details && feedback.details.length > 0 && (
              <ul className="feedback-details">
                {feedback.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="evaluation-controls">
        <button
          className="btn btn-secondary"
          onClick={() => {
            // 重置为AI评估
            if (aiEvaluation) {
              setEvaluation(aiEvaluation);
            }
          }}
        >
          查看AI评估
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!evaluation.verbal.trim()}
        >
          提交评估
        </button>
      </div>

      <style jsx>{`
        .position-evaluation-panel {
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          padding: 24px;
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .panel-header {
          text-align: center;
          margin-bottom: 8px;
        }

        .panel-title {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .panel-icon {
          font-size: 24px;
        }

        .panel-description {
          margin: 0;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .evaluation-dimensions {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dimension-item {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 16px;
        }

        .dimension-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .dimension-label {
          font-weight: bold;
          color: var(--text-primary);
          font-size: 16px;
        }

        .dimension-value {
          font-size: 18px;
          font-weight: bold;
          color: var(--secondary-color);
          background: rgba(129, 182, 76, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .dimension-description {
          margin: 0 0 12px 0;
          color: var(--text-tertiary);
          font-size: 14px;
        }

        .dimension-slider-container {
          margin: 12px 0;
        }

        .dimension-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: var(--bg-primary);
          outline: none;
          -webkit-appearance: none;
        }

        .dimension-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--secondary-color);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .dimension-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--secondary-color);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .ai-comparison {
          margin-top: 12px;
          font-size: 14px;
        }

        .ai-label {
          color: var(--text-secondary);
          margin-right: 8px;
        }

        .ai-value {
          color: var(--info-color);
          font-weight: bold;
          margin-right: 12px;
        }

        .comparison-bar {
          position: relative;
          height: 4px;
          background: var(--bg-primary);
          border-radius: 2px;
          margin-top: 4px;
          overflow: hidden;
        }

        .user-bar,
        .ai-bar {
          position: absolute;
          height: 100%;
          border-radius: 2px;
          opacity: 0.7;
        }

        .ai-bar {
          opacity: 0.5;
        }

        .total-score-section {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 20px;
          text-align: center;
        }

        .total-score-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .total-score-title {
          margin: 0;
          font-size: 18px;
          color: var(--text-primary);
        }

        .total-score-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--secondary-color);
        }

        .ai-total-score {
          font-size: 14px;
          color: var(--text-tertiary);
          margin-left: 8px;
          font-weight: normal;
        }

        .score-bars {
          position: relative;
          height: 12px;
          background: var(--bg-primary);
          border-radius: 6px;
          overflow: hidden;
        }

        .user-total-bar,
        .ai-total-bar {
          position: absolute;
          height: 100%;
          border-radius: 6px;
          background: var(--secondary-color);
        }

        .ai-total-bar {
          background: var(--info-color);
          opacity: 0.6;
        }

        .verbal-assessment-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .verbal-label {
          font-weight: bold;
          color: var(--text-primary);
          font-size: 16px;
        }

        .verbal-input {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 12px;
          color: var(--text-primary);
          font-size: 14px;
          resize: vertical;
          min-height: 80px;
        }

        .verbal-input:focus {
          outline: none;
          border-color: var(--secondary-color);
          box-shadow: 0 0 0 2px rgba(129, 182, 76, 0.2);
        }

        .ai-verbal-hint {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid var(--info-color);
          border-radius: var(--radius-md);
          padding: 12px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .ai-verbal-hint strong {
          color: var(--info-color);
        }

        .evaluation-feedback {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-radius: var(--radius-md);
          border-left: 4px solid;
        }

        .feedback-correct {
          background: rgba(34, 197, 94, 0.1);
          border-left-color: var(--success-color);
        }

        .feedback-partial {
          background: rgba(245, 158, 11, 0.1);
          border-left-color: var(--warning-color);
        }

        .feedback-incorrect {
          background: rgba(239, 68, 68, 0.1);
          border-left-color: var(--danger-color);
        }

        .feedback-icon {
          font-size: 24px;
          line-height: 1;
        }

        .feedback-correct .feedback-icon {
          color: var(--success-color);
        }

        .feedback-partial .feedback-icon {
          color: var(--warning-color);
        }

        .feedback-incorrect .feedback-icon {
          color: var(--danger-color);
        }

        .feedback-content {
          flex: 1;
        }

        .feedback-message {
          margin: 0 0 8px 0;
          font-weight: bold;
          color: var(--text-primary);
        }

        .feedback-details {
          margin: 0;
          padding-left: 20px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .evaluation-controls {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .position-evaluation-panel {
            padding: 16px;
          }

          .dimension-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .total-score-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .evaluation-controls {
            flex-direction: column;
          }

          .evaluation-controls button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PositionEvaluationPanel;