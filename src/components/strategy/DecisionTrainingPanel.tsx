// 决策训练面板
import React, { useState } from 'react';
import type { StrategyExercise } from '../../types/training.types';

interface DecisionTrainingPanelProps {
  exercise: StrategyExercise;
  userDecision: string;
  onSubmit: (decision: string) => void;
  feedback: {
    type: 'correct' | 'partial' | 'incorrect' | 'hint' | null;
    message: string;
    details?: string[];
  };
}

const DecisionTrainingPanel: React.FC<DecisionTrainingPanelProps> = ({
  exercise,
  userDecision,
  onSubmit,
  feedback,
}) => {
  const [decision, setDecision] = useState(userDecision || '');
  const [reasoning, setReasoning] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);

  // 决策选项
  const decisionOptions = [
    {
      id: 'aggressive',
      label: '进攻性',
      icon: '⚔️',
      description: '积极寻求战术组合机会',
      bestFor: '优势局面，时间充足',
      risks: '可能过度进攻导致弱点',
    },
    {
      id: 'positional',
      label: '局面性',
      icon: '🧩',
      description: '积累微小优势，稳步推进',
      bestFor: '均势局面，需要耐心',
      risks: '可能错过战术机会',
    },
    {
      id: 'defensive',
      label: '防守性',
      icon: '🛡️',
      description: '巩固局面，消除弱点',
      bestFor: '劣势局面，需要稳住',
      risks: '可能过于被动',
    },
    {
      id: 'waiting',
      label: '等待性',
      icon: '⏳',
      description: '保持局面，等待对手错误',
      bestFor: '复杂局面，时间压力',
      risks: '可能错失主动权',
    },
  ];

  // 局面特征评估
  const positionFeatures = [
    { feature: '子力平衡', value: '均势', weight: 0.3 },
    { feature: '主动权', value: '白方略优', weight: 0.4 },
    { feature: '王的安全', value: '双方安全', weight: 0.2 },
    { feature: '时间剩余', value: '充足', weight: 0.1 },
  ];

  // 模拟计时器
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 处理决策提交
  const handleSubmit = () => {
    if (decision.trim()) {
      onSubmit(decision);
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算推荐决策
  const calculateRecommendedDecision = () => {
    // 简单推荐逻辑：基于局面特征权重
    const scores = {
      aggressive: positionFeatures[1].weight * 0.8, // 主动权重
      positional: positionFeatures[0].weight * 0.9, // 平衡权重
      defensive: 0, // 防守不推荐
      waiting: positionFeatures[3].weight * 0.7, // 时间权重
    };

    // 根据练习主题调整
    if (exercise.strategicThemes.includes('center_control')) {
      scores.positional += 0.2;
    }
    if (exercise.strategicThemes.includes('initiative')) {
      scores.aggressive += 0.2;
    }

    let maxScore = -1;
    let recommended = '';
    for (const [id, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        recommended = id;
      }
    }

    return decisionOptions.find((opt) => opt.id === recommended)?.label || '局面性';
  };

  const recommendedDecision = calculateRecommendedDecision();

  return (
    <div className="decision-training-panel">
      <div className="panel-header">
        <h3 className="panel-title">
          <span className="panel-icon">🤔</span>
          战略决策训练
        </h3>
        <p className="panel-description">
          在关键决策点选择最佳战略方向，培养临场决策能力
        </p>
      </div>

      {/* 决策场景信息 */}
      <div className="decision-scenario">
        <div className="scenario-header">
          <h4 className="scenario-title">决策场景</h4>
          <div className="scenario-timer">
            <span className="timer-icon">⏱️</span>
            <span className="timer-value">{formatTime(timeSpent)}</span>
          </div>
        </div>

        <div className="scenario-description">
          <p>
            <strong>当前局面:</strong> {exercise.title}
          </p>
          <p>
            <strong>决策点:</strong> 第{Math.floor(Math.random() * 20) + 10}步，{exercise.difficulty}难度
          </p>
          <p>
            <strong>可用时间:</strong> 5分钟
          </p>
        </div>

        {/* 局面特征评估 */}
        <div className="position-features">
          <h5 className="features-title">局面特征分析</h5>
          <div className="features-grid">
            {positionFeatures.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-name">{feature.feature}</div>
                <div className="feature-value">{feature.value}</div>
                <div className="feature-weight">权重: {feature.weight}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 决策选项 */}
      <div className="decision-options">
        <h4 className="options-title">选择你的战略方向</h4>
        <div className="options-grid">
          {decisionOptions.map((option) => (
            <div
              key={option.id}
              className={`decision-option ${decision === option.label ? 'selected' : ''}`}
              onClick={() => setDecision(option.label)}
            >
              <div className="option-header">
                <span className="option-icon">{option.icon}</span>
                <span className="option-label">{option.label}</span>
                {decision === option.label && (
                  <span className="option-check">✓</span>
                )}
              </div>
              <p className="option-description">{option.description}</p>
              <div className="option-details">
                <div className="detail-item">
                  <span className="detail-label">最佳时机:</span>
                  <span className="detail-value">{option.bestFor}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">潜在风险:</span>
                  <span className="detail-value">{option.risks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 决策理由输入 */}
      <div className="decision-reasoning">
        <h5 className="reasoning-title">决策理由</h5>
        <p className="reasoning-instruction">
          简要说明你为什么选择这个战略方向：
        </p>
        <textarea
          className="reasoning-input"
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          placeholder="基于以下考虑：1. 局面特征... 2. 时间因素... 3. 对手风格..."
          rows={4}
        />
      </div>

      {/* AI推荐和提示 */}
      <div className="ai-assistance">
        <div className="ai-recommendation">
          <div className="ai-header">
            <span className="ai-icon">🤖</span>
            <span className="ai-title">AI推荐</span>
          </div>
          <div className="ai-content">
            <p className="ai-decision">
              <strong>推荐决策:</strong> {recommendedDecision}
            </p>
            <p className="ai-explanation">
              基于当前局面特征分析，{recommendedDecision}策略可能最为合适。
            </p>
          </div>
        </div>

        <div className="decision-hints">
          <div className="hints-header">
            <span className="hints-icon">💡</span>
            <span className="hints-title">决策提示</span>
          </div>
          <ul className="hints-list">
            <li>考虑子力平衡和主动权</li>
            <li>评估王的安全和兵型结构</li>
            <li>注意可用时间和比赛节奏</li>
            <li>分析对手可能的应对</li>
          </ul>
        </div>
      </div>

      {/* 反馈显示 */}
      {feedback.type && (
        <div className={`decision-feedback feedback-${feedback.type}`}>
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
            <div className="feedback-analysis">
              <p>
                <strong>决策分析:</strong> 你的选择是"{decision}"，AI推荐是"{recommendedDecision}"。
              </p>
              <p>
                <strong>时间管理:</strong> 用时{formatTime(timeSpent)}，在合理范围内。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="decision-controls">
        <button
          className="btn btn-secondary"
          onClick={() => {
            setDecision('');
            setReasoning('');
            setTimeSpent(0);
          }}
        >
          重置
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!decision.trim() || !reasoning.trim()}
        >
          提交决策
        </button>
      </div>

      <style jsx>{`
        .decision-training-panel {
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

        /* 决策场景 */
        .decision-scenario {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .scenario-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .scenario-title {
          margin: 0;
          font-size: 18px;
          color: var(--text-primary);
        }

        .scenario-timer {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: bold;
          color: var(--text-primary);
        }

        .timer-icon {
          font-size: 20px;
        }

        .scenario-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .scenario-description strong {
          color: var(--text-primary);
        }

        /* 局面特征 */
        .position-features {
          margin-top: 20px;
        }

        .features-title {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: var(--text-primary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .feature-item {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 12px;
          text-align: center;
          border: 1px solid var(--border-color);
        }

        .feature-name {
          font-weight: bold;
          color: var(--text-primary);
          font-size: 14px;
          margin-bottom: 4px;
        }

        .feature-value {
          font-size: 16px;
          color: var(--secondary-color);
          margin-bottom: 4px;
        }

        .feature-weight {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        /* 决策选项 */
        .decision-options {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .options-title {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: var(--text-primary);
          text-align: center;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .decision-option {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 16px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .decision-option:hover {
          border-color: var(--border-light);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .decision-option.selected {
          border-color: var(--secondary-color);
          background: rgba(129, 182, 76, 0.05);
          box-shadow: var(--shadow-glow);
        }

        .option-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .option-icon {
          font-size: 24px;
        }

        .option-label {
          font-size: 18px;
          font-weight: bold;
          color: var(--text-primary);
          flex: 1;
        }

        .option-check {
          color: var(--success-color);
          font-size: 20px;
          font-weight: bold;
        }

        .option-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .option-details {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .detail-item {
          margin-bottom: 4px;
        }

        .detail-label {
          font-weight: bold;
        }

        .detail-value {
          margin-left: 4px;
        }

        /* 决策理由 */
        .decision-reasoning {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .reasoning-title {
          margin: 0 0 12px 0;
          font-size: 18px;
          color: var(--text-primary);
        }

        .reasoning-instruction {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .reasoning-input {
          width: 100%;
          padding: 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
          resize: vertical;
          min-height: 100px;
        }

        .reasoning-input:focus {
          outline: none;
          border-color: var(--secondary-color);
          box-shadow: 0 0 0 2px rgba(129, 182, 76, 0.2);
        }

        /* AI辅助 */
        .ai-assistance {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .ai-assistance {
            grid-template-columns: 1fr;
          }
        }

        .ai-recommendation,
        .decision-hints {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 16px;
        }

        .ai-header,
        .hints-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .ai-icon,
        .hints-icon {
          font-size: 20px;
        }

        .ai-title,
        .hints-title {
          font-size: 16px;
          font-weight: bold;
          color: var(--text-primary);
        }

        .ai-content {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .ai-decision {
          margin: 0 0 8px 0;
        }

        .ai-explanation {
          margin: 0;
        }

        .hints-list {
          margin: 0;
          padding-left: 20px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .hints-list li {
          margin-bottom: 4px;
        }

        /* 反馈样式 */
        .decision-feedback {
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

        .feedback-analysis {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
          font-size: 14px;
          color: var(--text-secondary);
        }

        .feedback-analysis strong {
          color: var(--text-primary);
        }

        /* 控制按钮 */
        .decision-controls {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .decision-training-panel {
            padding: 16px;
          }

          .options-grid {
            grid-template-columns: 1fr;
          }

          .decision-controls {
            flex-direction: column;
          }

          .decision-controls button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default DecisionTrainingPanel;