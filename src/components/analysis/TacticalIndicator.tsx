// 战术指示器组件 - 在棋盘上显示战术机会
import React from 'react';
import type { TacticalOpportunity, Square } from '../../types/analysis.types';

interface TacticalIndicatorProps {
  tactics: TacticalOpportunity[];
  boardSize?: number;
  onSquareClick?: (square: Square) => void;
}

// 战术类型对应的颜色
const getTacticColor = (type: TacticalOpportunity['type'], winning: boolean): string => {
  if (winning) return '#ef4444'; // 制胜战术用红色

  const colors: Record<TacticalOpportunity['type'], string> = {
    fork: '#f59e0b',
    pin: '#8b5cf6',
    skewer: '#ec4899',
    discovered: '#06b6d4',
    double_attack: '#f59e0b',
    deflection: '#84cc16',
    decoy: '#84cc16',
    zwischenzug: '#a855f7',
    overload: '#fb923c',
    xray: '#38bdf8',
    clearance: '#2dd4bf',
    interference: '#a3e635',
    trapped_piece: '#fb7185',
    hanging_piece: '#f87171',
    weak_backrank: '#f43f5e',
    mate_threat: '#dc2626',
  };

  return colors[type] || '#f59e0b';
};

// 战术类型对应的中文名称
const tacticNames: Record<TacticalOpportunity['type'], string> = {
  fork: '捉双',
  pin: '牵制',
  skewer: '串击',
  discovered: '闪击',
  double_attack: '双重攻击',
  deflection: '诱离',
  decoy: '引入',
  zwischenzug: '过渡',
  overload: '过载',
  xray: '穿刺',
  clearance: '清空',
  interference: '干扰',
  trapped_piece: '陷阱',
  hanging_piece: '悬兵',
  weak_backrank: '弱底线',
  mate_threat: '杀棋威胁',
};

export const TacticalIndicator: React.FC<TacticalIndicatorProps> = ({
  tactics,
  boardSize = 600,
  onSquareClick,
}) => {
  const squareSize = boardSize / 8;
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  // 将格子名称转换为坐标
  const getSquarePosition = (square: Square): { x: number; y: number } => {
    const file = square.charAt(0);
    const rank = parseInt(square.charAt(1));
    const fileIndex = files.indexOf(file);
    const rankIndex = rank - 1;

    return {
      x: fileIndex * squareSize,
      y: (7 - rankIndex) * squareSize, // 棋盘从底部开始
    };
  };

  if (tactics.length === 0) {
    return null;
  }

  return (
    <svg
      className="tactical-indicator-overlay"
      width={boardSize}
      height={boardSize}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {tactics.map((tactic, tacticIndex) => {
        const color = getTacticColor(tactic.type, tactic.winning);

        return (
          <g key={tacticIndex} className="tactic-group">
            {/* 绘制涉及的格子高亮 */}
            {tactic.squares.map((square, squareIndex) => {
              const pos = getSquarePosition(square);
              const isPrimary = squareIndex === 0;

              return (
                <g key={squareIndex} className="tactic-square">
                  {/* 背景高亮 */}
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={squareSize}
                    height={squareSize}
                    fill={isPrimary ? color : `${color}40`}
                    opacity={isPrimary ? 0.4 : 0.2}
                    style={{
                      pointerEvents: onSquareClick ? 'auto' : 'none',
                      cursor: onSquareClick ? 'pointer' : 'default',
                    }}
                    onClick={() => onSquareClick?.(square)}
                  />

                  {/* 边框 */}
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={squareSize}
                    height={squareSize}
                    fill="none"
                    stroke={color}
                    strokeWidth={isPrimary ? 3 : 2}
                    strokeDasharray={isPrimary ? 'none' : '5,5'}
                    opacity={0.8}
                  />

                  {/* 主要格子添加标记 */}
                  {isPrimary && (
                    <>
                      {/* 中心圆点 */}
                      <circle
                        cx={pos.x + squareSize / 2}
                        cy={pos.y + squareSize / 2}
                        r={squareSize / 6}
                        fill={color}
                        opacity={0.9}
                      />

                      {/* 战术类型图标 */}
                      <text
                        x={pos.x + squareSize / 2}
                        y={pos.y + squareSize / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={squareSize / 4}
                        fontWeight="bold"
                        fill="white"
                      >
                        {tactic.type === 'fork' && '⚔'}
                        {tactic.type === 'pin' && '📌'}
                        {tactic.type === 'skewer' && '🔱'}
                        {tactic.type === 'discovered' && '⚡'}
                        {tactic.type === 'double_attack' && '⚔'}
                        {tactic.type === 'mate_threat' && '⚠'}
                      </text>
                    </>
                  )}

                  {/* 连接线（从第一个格子到其他格子） */}
                  {!isPrimary && tactic.squares.length > 1 && {
                    const firstPos = getSquarePosition(tactic.squares[0]);
                    const currentPos = pos;

                    return (
                      <line
                        x1={firstPos.x + squareSize / 2}
                        y1={firstPos.y + squareSize / 2}
                        x2={currentPos.x + squareSize / 2}
                        y2={currentPos.y + squareSize / 2}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="5,5"
                        opacity={0.6}
                      />
                    );
                  }}
                </g>
              );
            })}

            {/* 战术信息标签 */}
            {tactic.squares.length > 0 && (() => {
              const firstSquare = tactic.squares[0];
              const pos = getSquarePosition(firstSquare);

              return (
                <g
                  className="tactic-label"
                  style={{
                    pointerEvents: 'none',
                  }}
                >
                  {/* 标签背景 */}
                  <rect
                    x={pos.x}
                    y={pos.y - 24}
                    width={squareSize * 1.2}
                    height={20}
                    rx={4}
                    fill={color}
                    opacity={0.95}
                  />

                  {/* 标签文字 */}
                  <text
                    x={pos.x + squareSize * 0.6}
                    y={pos.y - 14}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight="bold"
                    fill="white"
                  >
                    {tacticNames[tactic.type]}
                  </text>

                  {/* 强度指示器 */}
                  <rect
                    x={pos.x + squareSize * 1.2 + 2}
                    y={pos.y - 20}
                    width={4}
                    height={12}
                    fill={color}
                    opacity={0.5}
                  />

                  {/* 强度填充 */}
                  <rect
                    x={pos.x + squareSize * 1.2 + 2}
                    y={pos.y - 20 + (1 - tactic.strength) * 12}
                    width={4}
                    height={tactic.strength * 12}
                    fill={color}
                  />
                </g>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
};

// 战术图例组件
interface TacticalLegendProps {
  tactics: TacticalOpportunity[];
}

export const TacticalLegend: React.FC<TacticalLegendProps> = ({ tactics }) => {
  if (tactics.length === 0) {
    return null;
  }

  // 按类型分组
  const tacticGroups = tactics.reduce((acc, tactic) => {
    if (!acc[tactic.type]) {
      acc[tactic.type] = [];
    }
    acc[tactic.type].push(tactic);
    return acc;
  }, {} as Record<TacticalOpportunity['type'], TacticalOpportunity[]>);

  return (
    <div className="tactical-legend">
      <h5 className="legend-title">战术机会</h5>
      <div className="legend-items">
        {Object.entries(tacticGroups).map(([type, typeTactics]) => {
          const tactic = typeTactics[0];
          const color = getTacticColor(type, tactic.winning);

          return (
            <div key={type} className="legend-tactic-item">
              <span
                className="legend-tactic-color"
                style={{ backgroundColor: color }}
              />
              <span className="legend-tactic-name">{tacticNames[type]}</span>
              <span className="legend-tactic-count">{typeTactics.length}</span>
              {tactic.winning && (
                <span className="legend-tactic-winning">制胜</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TacticalIndicator;
