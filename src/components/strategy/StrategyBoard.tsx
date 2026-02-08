// 策略训练专用棋盘组件
import React from 'react';
import ChessBoard from '../chess/ChessBoard';
import type { StrategicPlan } from '../../types/training.types';

interface StrategyBoardProps {
  fen: string;
  orientation: 'white' | 'black';
  currentPlan?: StrategicPlan | null;
  showEvaluation?: boolean;
  onMove?: (move: { from: string; to: string; promotion?: string }) => void;
}

const StrategyBoard: React.FC<StrategyBoardProps> = ({
  fen,
  orientation,
  currentPlan,
  showEvaluation = false,
  onMove,
}) => {
  // 生成战略标记：高亮关键格子
  const getStrategicHighlights = () => {
    if (!currentPlan) return [];

    const highlights: Array<{
      square: string;
      type: 'key-square' | 'weakness' | 'target' | 'defense';
      description?: string;
    }> = [];

    // 简化：根据计划名称添加一些示例高亮
    if (currentPlan.name.includes('中心')) {
      highlights.push(
        { square: 'd4', type: 'key-square', description: '中心突破关键格' },
        { square: 'e5', type: 'key-square', description: '中心控制格' },
      );
    } else if (currentPlan.name.includes('侧翼')) {
      highlights.push(
        { square: 'h4', type: 'target', description: '侧翼进攻目标' },
        { square: 'g7', type: 'weakness', description: '王城弱点' },
      );
    }

    return highlights;
  };

  const highlights = getStrategicHighlights();

  return (
    <div className="strategy-board-container">
      <div className="board-wrapper">
        <ChessBoard
          fen={fen}
          orientation={orientation}
          onMove={onMove}
          interactive={!!onMove}
          showCoordinates={true}
        />

        {/* 战略标记叠加层 */}
        {highlights.length > 0 && (
          <div className="strategy-highlights-overlay">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className={`strategy-highlight ${highlight.type}`}
                data-square={highlight.square}
                title={highlight.description}
              >
                <div className="highlight-marker"></div>
                {highlight.description && (
                  <div className="highlight-label">{highlight.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 评估指示器 */}
        {showEvaluation && (
          <div className="evaluation-overlay">
            <div className="evaluation-hint">
              评估提示：关注中心控制、子力活跃度和兵型结构
            </div>
          </div>
        )}
      </div>

      {/* 计划步骤显示 */}
      {currentPlan && currentPlan.steps.length > 0 && (
        <div className="plan-steps-display">
          <h4 className="plan-steps-title">计划步骤: {currentPlan.name}</h4>
          <ul className="plan-steps-list">
            {currentPlan.steps.map((step, stepIndex) => (
              <li key={stepIndex} className="plan-step-item">
                <div className="step-header">
                  <span className="step-number">步骤 {stepIndex + 1}</span>
                  <span className="step-move-range">{step.moveRange}</span>
                </div>
                <div className="step-objectives">
                  <strong>目标:</strong> {step.objectives.join(', ')}
                </div>
                {step.keyPositions && step.keyPositions.length > 0 && (
                  <div className="step-key-positions">
                    <strong>关键局面:</strong> {step.keyPositions.length}个
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .strategy-board-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .board-wrapper {
          position: relative;
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
        }

        .strategy-highlights-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .strategy-highlight {
          position: absolute;
          width: 12.5%;
          height: 12.5%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          cursor: help;
        }

        .strategy-highlight.key-square {
          background: rgba(59, 130, 246, 0.2);
          border: 2px solid rgba(59, 130, 246, 0.6);
        }

        .strategy-highlight.weakness {
          background: rgba(239, 68, 68, 0.2);
          border: 2px dashed rgba(239, 68, 68, 0.6);
        }

        .strategy-highlight.target {
          background: rgba(245, 158, 11, 0.2);
          border: 2px dotted rgba(245, 158, 11, 0.6);
        }

        .strategy-highlight.defense {
          background: rgba(34, 197, 94, 0.2);
          border: 2px solid rgba(34, 197, 94, 0.6);
        }

        .highlight-marker {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          opacity: 0.8;
        }

        .highlight-label {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 10;
          display: none;
        }

        .strategy-highlight:hover .highlight-label {
          display: block;
        }

        .evaluation-overlay {
          position: absolute;
          top: -40px;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
        }

        .plan-steps-display {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 16px;
          border: 1px solid var(--border-color);
        }

        .plan-steps-title {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: var(--text-primary);
        }

        .plan-steps-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .plan-step-item {
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          padding: 12px;
          border-left: 4px solid var(--secondary-color);
        }

        .step-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .step-number {
          font-weight: bold;
          color: var(--secondary-color);
        }

        .step-move-range {
          color: var(--text-tertiary);
          font-size: 13px;
        }

        .step-objectives,
        .step-key-positions {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .board-wrapper {
            max-width: 400px;
          }

          .evaluation-overlay {
            top: -50px;
            font-size: 12px;
            padding: 6px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default StrategyBoard;