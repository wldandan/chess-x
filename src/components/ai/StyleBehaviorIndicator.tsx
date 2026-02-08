import React from 'react';
import type { GamePhase, PlayerStyle } from '@/types/chess.types';

interface StyleBehaviorIndicatorProps {
  style: PlayerStyle;
  phase: GamePhase;
  lastMove: string;
}

const STYLE_TRAITS: Record<PlayerStyle, { name: string; traits: string[] }> = {
  positional: {
    name: '稳健局面型',
    traits: ['注重长远规划', '结构优势', '缓慢积累'],
  },
  tactical: {
    name: '战术攻击型',
    traits: ['主动寻求复杂化', '战术敏锐', '攻王欲望'],
  },
  solid: {
    name: '防守反击型',
    traits: ['稳健为先', '反击机会', '安全第一'],
  },
  aggressive: {
    name: '进攻主导型',
    traits: ['弃子求攻', '主导进攻', '制造混乱'],
  },
  defensive: {
    name: '坚固防守型',
    traits: ['被动防守', '化解压力', '求稳求和'],
  },
  technical: {
    name: '技术执行型',
    traits: ['精确计算', '局面评估', '执行到位'],
  },
};

const PHASE_MESSAGES: Record<GamePhase, string> = {
  opening: '开局阶段，注重出子与控制',
  middlegame: '中局阶段，寻找战术机会',
  endgame: '残局阶段，精确计算为王',
};

const PHASE_LABELS: Record<GamePhase, string> = {
  opening: '开局',
  middlegame: '中局',
  endgame: '残局',
};

export const StyleBehaviorIndicator: React.FC<StyleBehaviorIndicatorProps> = ({
  style,
  phase,
  lastMove,
}) => {
  const styleInfo = STYLE_TRAITS[style];
  const phaseMessage = PHASE_MESSAGES[phase];
  const phaseLabel = PHASE_LABELS[phase];

  return (
    <div
      className="style-behavior-indicator"
      role="status"
      aria-live="polite"
      aria-label={`风格行为指示器：${styleInfo.name}`}
      tabIndex={0}
    >
      <div className="style-header">
        <h3 className="style-name">{styleInfo.name}</h3>
        <span className="phase-badge" aria-label={`当前阶段：${phaseLabel}`}>
          {phaseLabel}
        </span>
      </div>

      <p className="behavior-message" aria-label="行为提示">
        {phaseMessage}
      </p>

      <div className="traits-section" aria-label="风格特征">
        <h4 className="traits-label">特征</h4>
        <ul className="traits-list">
          {styleInfo.traits.map((trait, index) => (
            <li key={index} className="trait-item">
              {trait}
            </li>
          ))}
        </ul>
      </div>

      <div className="last-move-section">
        <span className="last-move-label">最后一步：</span>
        <span className="last-move-value" aria-label={`最后一步：${lastMove}`}>
          {lastMove}
        </span>
      </div>
    </div>
  );
};
