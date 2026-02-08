// 计划制定训练面板
import React, { useState } from 'react';
import type {
  StrategyExercise,
  StrategicPlan,
  StrategicStep,
} from '../../types/training.types';

interface PlanGenerationPanelProps {
  exercise: StrategyExercise;
  userPlan: StrategicPlan | null;
  onSubmit: (plan: StrategicPlan) => void;
  onSelectPlan: (plan: StrategicPlan) => void;
  feedback: {
    type: 'correct' | 'partial' | 'incorrect' | 'hint' | null;
    message: string;
    details?: string[];
  };
}

const PlanGenerationPanel: React.FC<PlanGenerationPanelProps> = ({
  exercise,
  userPlan,
  onSubmit,
  onSelectPlan,
  feedback,
}) => {
  const [plan, setPlan] = useState<StrategicPlan>(
    userPlan || {
      name: '',
      description: '',
      steps: [],
      advantages: [],
      risks: [],
      suitability: 0.5,
    }
  );

  const [newStep, setNewStep] = useState<StrategicStep>({
    moveRange: '',
    objectives: [],
    keyPositions: [],
  });

  const [newObjective, setNewObjective] = useState('');
  const [newAdvantage, setNewAdvantage] = useState('');
  const [newRisk, setNewRisk] = useState('');

  // 添加步骤
  const addStep = () => {
    if (newStep.moveRange.trim() && newStep.objectives.length > 0) {
      setPlan((prev) => ({
        ...prev,
        steps: [...prev.steps, { ...newStep }],
      }));
      setNewStep({
        moveRange: '',
        objectives: [],
        keyPositions: [],
      });
    }
  };

  // 添加目标到当前步骤
  const addObjective = () => {
    if (newObjective.trim()) {
      setNewStep((prev) => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()],
      }));
      setNewObjective('');
    }
  };

  // 添加优势
  const addAdvantage = () => {
    if (newAdvantage.trim()) {
      setPlan((prev) => ({
        ...prev,
        advantages: [...prev.advantages, newAdvantage.trim()],
      }));
      setNewAdvantage('');
    }
  };

  // 添加风险
  const addRisk = () => {
    if (newRisk.trim()) {
      setPlan((prev) => ({
        ...prev,
        risks: [...prev.risks, newRisk.trim()],
      }));
      setNewRisk('');
    }
  };

  // 删除步骤
  const removeStep = (index: number) => {
    setPlan((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  // 删除优势
  const removeAdvantage = (index: number) => {
    setPlan((prev) => ({
      ...prev,
      advantages: prev.advantages.filter((_, i) => i !== index),
    }));
  };

  // 删除风险
  const removeRisk = (index: number) => {
    setPlan((prev) => ({
      ...prev,
      risks: prev.risks.filter((_, i) => i !== index),
    }));
  };

  // 处理提交
  const handleSubmit = () => {
    if (plan.name.trim() && plan.steps.length > 0) {
      onSubmit(plan);
    }
  };

  // AI计划选项
  const aiPlans = exercise.planOptions;

  return (
    <div className="plan-generation-panel">
      <div className="panel-header">
        <h3 className="panel-title">
          <span className="panel-icon">🗺️</span>
          计划制定训练
        </h3>
        <p className="panel-description">
          为当前局面制定作战计划，培养长远规划能力
        </p>
      </div>

      {/* AI计划参考 */}
      {aiPlans && aiPlans.length > 0 && (
        <div className="ai-plans-section">
          <h4 className="section-title">AI推荐计划</h4>
          <div className="ai-plans-grid">
            {aiPlans.map((aiPlan, index) => (
              <div
                key={index}
                className="ai-plan-card"
                onClick={() => onSelectPlan(aiPlan)}
              >
                <div className="plan-card-header">
                  <span className="plan-rank">#{index + 1}</span>
                  <span className="plan-suitability">
                    适合度: {(aiPlan.suitability * 100).toFixed(0)}%
                  </span>
                </div>
                <h5 className="plan-name">{aiPlan.name}</h5>
                <p className="plan-description">{aiPlan.description}</p>
                <div className="plan-stats">
                  <span className="stat">
                    <span className="stat-label">步骤:</span>
                    <span className="stat-value">{aiPlan.steps.length}</span>
                  </span>
                  <span className="stat">
                    <span className="stat-label">优势:</span>
                    <span className="stat-value">{aiPlan.advantages.length}</span>
                  </span>
                  <span className="stat">
                    <span className="stat-label">风险:</span>
                    <span className="stat-value">{aiPlan.risks.length}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 计划创建表单 */}
      <div className="plan-creation-section">
        <h4 className="section-title">制定你的计划</h4>

        {/* 计划基本信息 */}
        <div className="plan-basic-info">
          <div className="form-group">
            <label className="form-label">计划名称</label>
            <input
              type="text"
              className="form-input"
              value={plan.name}
              onChange={(e) => setPlan((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="例如：中心突破计划"
            />
          </div>

          <div className="form-group">
            <label className="form-label">计划描述</label>
            <textarea
              className="form-input"
              value={plan.description}
              onChange={(e) => setPlan((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="描述计划的总体思路和目标..."
              rows={2}
            />
          </div>
        </div>

        {/* 步骤创建 */}
        <div className="steps-creation">
          <h5 className="section-subtitle">计划步骤</h5>

          <div className="step-form">
            <div className="form-group">
              <label className="form-label">走法范围</label>
              <input
                type="text"
                className="form-input"
                value={newStep.moveRange}
                onChange={(e) =>
                  setNewStep((prev) => ({ ...prev, moveRange: e.target.value }))
                }
                placeholder="例如：接下来3-5步"
              />
            </div>

            <div className="form-group">
              <label className="form-label">目标</label>
              <div className="objectives-input">
                <input
                  type="text"
                  className="form-input"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="例如：控制中心d4格"
                  onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                />
                <button
                  className="btn btn-sm btn-outline"
                  onClick={addObjective}
                  disabled={!newObjective.trim()}
                >
                  添加
                </button>
              </div>
              {newStep.objectives.length > 0 && (
                <div className="objectives-list">
                  {newStep.objectives.map((objective, index) => (
                    <span key={index} className="objective-tag">
                      {objective}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn btn-secondary"
              onClick={addStep}
              disabled={!newStep.moveRange.trim() || newStep.objectives.length === 0}
            >
              添加步骤
            </button>
          </div>

          {/* 已添加的步骤 */}
          {plan.steps.length > 0 && (
            <div className="added-steps">
              <h6 className="steps-title">已添加步骤 ({plan.steps.length})</h6>
              <div className="steps-list">
                {plan.steps.map((step, index) => (
                  <div key={index} className="step-item">
                    <div className="step-header">
                      <span className="step-number">步骤 {index + 1}</span>
                      <button
                        className="btn btn-sm btn-text"
                        onClick={() => removeStep(index)}
                      >
                        删除
                      </button>
                    </div>
                    <div className="step-details">
                      <div className="step-move-range">
                        <strong>走法范围:</strong> {step.moveRange}
                      </div>
                      <div className="step-objectives">
                        <strong>目标:</strong> {step.objectives.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 优势和风险 */}
        <div className="plan-analysis">
          <div className="analysis-column">
            <h5 className="section-subtitle">计划优势</h5>
            <div className="advantages-input">
              <input
                type="text"
                className="form-input"
                value={newAdvantage}
                onChange={(e) => setNewAdvantage(e.target.value)}
                placeholder="例如：获得空间优势"
                onKeyPress={(e) => e.key === 'Enter' && addAdvantage()}
              />
              <button
                className="btn btn-sm btn-outline"
                onClick={addAdvantage}
                disabled={!newAdvantage.trim()}
              >
                添加
              </button>
            </div>
            {plan.advantages.length > 0 && (
              <div className="advantages-list">
                {plan.advantages.map((advantage, index) => (
                  <div key={index} className="advantage-item">
                    <span className="advantage-text">✓ {advantage}</span>
                    <button
                      className="btn btn-sm btn-text"
                      onClick={() => removeAdvantage(index)}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="analysis-column">
            <h5 className="section-subtitle">潜在风险</h5>
            <div className="risks-input">
              <input
                type="text"
                className="form-input"
                value={newRisk}
                onChange={(e) => setNewRisk(e.target.value)}
                placeholder="例如：可能形成孤兵"
                onKeyPress={(e) => e.key === 'Enter' && addRisk()}
              />
              <button
                className="btn btn-sm btn-outline"
                onClick={addRisk}
                disabled={!newRisk.trim()}
              >
                添加
              </button>
            </div>
            {plan.risks.length > 0 && (
              <div className="risks-list">
                {plan.risks.map((risk, index) => (
                  <div key={index} className="risk-item">
                    <span className="risk-text">⚠ {risk}</span>
                    <button
                      className="btn btn-sm btn-text"
                      onClick={() => removeRisk(index)}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 适合度评分 */}
        <div className="suitability-section">
          <label className="form-label">
            计划适合度: {(plan.suitability * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={plan.suitability}
            onChange={(e) =>
              setPlan((prev) => ({ ...prev, suitability: parseFloat(e.target.value) }))
            }
            className="suitability-slider"
          />
          <div className="suitability-labels">
            <span className="label-min">较低</span>
            <span className="label-max">较高</span>
          </div>
        </div>
      </div>

      {/* 反馈显示 */}
      {feedback.type && (
        <div className={`plan-feedback feedback-${feedback.type}`}>
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
      <div className="plan-controls">
        <button
          className="btn btn-secondary"
          onClick={() => {
            // 重置表单
            setPlan({
              name: '',
              description: '',
              steps: [],
              advantages: [],
              risks: [],
              suitability: 0.5,
            });
          }}
        >
          重置
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!plan.name.trim() || plan.steps.length === 0}
        >
          提交计划
        </button>
      </div>

      <style jsx>{`
        .plan-generation-panel {
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

        .section-title {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: var(--text-primary);
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 8px;
        }

        .section-subtitle {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: var(--text-primary);
        }

        /* AI计划部分 */
        .ai-plans-section {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .ai-plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .ai-plan-card {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 16px;
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ai-plan-card:hover {
          border-color: var(--secondary-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .plan-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .plan-rank {
          font-weight: bold;
          color: var(--secondary-color);
          background: rgba(129, 182, 76, 0.1);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 14px;
        }

        .plan-suitability {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .plan-name {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: var(--text-primary);
        }

        .plan-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .plan-stats {
          display: flex;
          gap: 12px;
          font-size: 13px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stat-label {
          color: var(--text-tertiary);
        }

        .stat-value {
          color: var(--text-primary);
          font-weight: bold;
        }

        /* 表单样式 */
        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: var(--text-primary);
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--secondary-color);
          box-shadow: 0 0 0 2px rgba(129, 182, 76, 0.2);
        }

        /* 步骤创建 */
        .steps-creation {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .step-form {
          margin-bottom: 20px;
        }

        .objectives-input {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .objectives-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .objective-tag {
          background: rgba(129, 182, 76, 0.1);
          color: var(--secondary-color);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          border: 1px solid rgba(129, 182, 76, 0.3);
        }

        .added-steps {
          margin-top: 24px;
        }

        .steps-title {
          margin: 0 0 12px 0;
          font-size: 15px;
          color: var(--text-primary);
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .step-item {
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          padding: 12px;
          border-left: 3px solid var(--secondary-color);
        }

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .step-number {
          font-weight: bold;
          color: var(--secondary-color);
          font-size: 14px;
        }

        .step-details {
          font-size: 13px;
          color: var(--text-secondary);
        }

        /* 优势和风险 */
        .plan-analysis {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 24px;
        }

        @media (max-width: 768px) {
          .plan-analysis {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        .analysis-column {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 16px;
        }

        .advantages-input,
        .risks-input {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .advantages-list,
        .risks-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .advantage-item,
        .risk-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          font-size: 14px;
        }

        .advantage-text {
          color: var(--success-color);
        }

        .risk-text {
          color: var(--warning-color);
        }

        /* 适合度滑块 */
        .suitability-section {
          margin-top: 20px;
        }

        .suitability-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: var(--bg-primary);
          outline: none;
          -webkit-appearance: none;
          margin: 8px 0;
        }

        .suitability-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--secondary-color);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .suitability-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        /* 反馈样式 */
        .plan-feedback {
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

        /* 控制按钮 */
        .plan-controls {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .plan-generation-panel {
            padding: 16px;
          }

          .ai-plans-grid {
            grid-template-columns: 1fr;
          }

          .plan-controls {
            flex-direction: column;
          }

          .plan-controls button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PlanGenerationPanel;