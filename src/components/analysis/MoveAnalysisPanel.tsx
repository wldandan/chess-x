// 走法分析面板组件
import React from 'react';
import type { AnalyzedMove, MoveQuality } from '../../types/analysis.types';

interface MoveAnalysisPanelProps {
  analyzedMove: AnalyzedMove | null;
  moveIndex: number;
  totalMoves: number;
}

// 走法质量对应的显示配置
const qualityConfig: Record<MoveQuality, { label: string; symbol: string; color: string; bgColor: string }> = {
  best: { label: '最佳走法', symbol: '!!', color: '#00d26a', bgColor: '#e6fff4' },
  great: { label: '优秀', symbol: '!', color: '#00b8d9', bgColor: '#e6fcff' },
  good: { label: '较好', symbol: '', color: '#6c757d', bgColor: '#f8f9fa' },
  book: { label: '开局库', symbol: '□', color: '#8b5cf6', bgColor: '#f3f0ff' },
  inaccuracy: { label: '不准确', symbol: '?', color: '#ffc107', bgColor: '#fff9e6' },
  mistake: { label: '失误', symbol: '?', color: '#ff9800', bgColor: '#fff3e0' },
  blunder: { label: '大失误', symbol: '??', color: '#f44336', bgColor: '#ffebee' },
};

// 评分条颜色
const getScoreColor = (score: number): string => {
  if (score > 1) return '#00d26a';
  if (score > 0.5) return '#00b8d9';
  if (score > -0.5) return '#6c757d';
  if (score > -1.5) return '#ff9800';
  return '#f44336';
};

// 评分条宽度
const getScoreWidth = (score: number): number => {
  // -5 到 +5 映射到 0% 到 100%
  return ((score + 5) / 10) * 100;
};

export const MoveAnalysisPanel: React.FC<MoveAnalysisPanelProps> = ({
  analyzedMove,
  moveIndex,
  totalMoves,
}) => {
  if (!analyzedMove) {
    return (
      <div className="move-analysis-panel">
        <div className="analysis-placeholder">
          <div className="placeholder-icon">📊</div>
          <h3>棋步分析</h3>
          <p>选择一个棋步查看详细分析</p>
        </div>
      </div>
    );
  }

  const quality = qualityConfig[analyzedMove.quality];

  return (
    <div className="move-analysis-panel">
      {/* 走法信息头部 */}
      <div className="analysis-header">
        <div className="move-number-badge">
          {analyzedMove.moveNumber}.
          {analyzedMove.player === 'white' ? '' : '..'}
        </div>
        <div className="move-san">{analyzedMove.move.san}</div>
        <div
          className="quality-badge"
          style={{ color: quality.color, backgroundColor: quality.bgColor }}
        >
          {quality.symbol && <span className="quality-symbol">{quality.symbol}</span>}
          <span className="quality-label">{quality.label}</span>
        </div>
      </div>

      {/* 评估分数 */}
      <div className="score-section">
        <h4 className="section-title">局面评估</h4>
        <div className="score-bars">
          <div className="score-bar-item">
            <div className="score-label">走棋前</div>
            <div className="score-bar-track">
              <div
                className="score-bar-fill"
                style={{
                  width: `${getScoreWidth(analyzedMove.scoreBefore)}%`,
                  backgroundColor: getScoreColor(analyzedMove.scoreBefore),
                }}
              />
              <div className="score-marker" style={{ left: '50%' }} />
            </div>
            <div className="score-value" style={{ color: getScoreColor(analyzedMove.scoreBefore) }}>
              {analyzedMove.scoreBefore > 0 ? '+' : ''}{analyzedMove.scoreBefore.toFixed(1)}
            </div>
          </div>

          <div className="score-bar-item">
            <div className="score-label">走棋后</div>
            <div className="score-bar-track">
              <div
                className="score-bar-fill"
                style={{
                  width: `${getScoreWidth(analyzedMove.scoreAfter)}%`,
                  backgroundColor: getScoreColor(analyzedMove.scoreAfter),
                }}
              />
              <div className="score-marker" style={{ left: '50%' }} />
            </div>
            <div className="score-value" style={{ color: getScoreColor(analyzedMove.scoreAfter) }}>
              {analyzedMove.scoreAfter > 0 ? '+' : ''}{analyzedMove.scoreAfter.toFixed(1)}
            </div>
          </div>

          {/* 评分变化 */}
          <div className="score-change">
            <span className="change-label">变化:</span>
            <span
              className="change-value"
              style={{
                color: analyzedMove.scoreDiff >= 0 ? '#00d26a' : '#f44336',
              }}
            >
              {analyzedMove.scoreDiff > 0 ? '+' : ''}{analyzedMove.scoreDiff.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 最佳走法 */}
      {analyzedMove.bestMove && (
        <div className="best-move-section">
          <h4 className="section-title">最佳走法</h4>
          <div className="best-move-card">
            <div className="best-move-san">{analyzedMove.bestMove.san}</div>
            <div className="best-move-score">
              评分: <span style={{ color: getScoreColor(analyzedMove.bestMoveScore) }}>
                {analyzedMove.bestMoveScore > 0 ? '+' : ''}{analyzedMove.bestMoveScore.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 替代走法 */}
      {analyzedMove.alternatives.length > 0 && (
        <div className="alternatives-section">
          <h4 className="section-title">替代走法</h4>
          <div className="alternatives-list">
            {analyzedMove.alternatives.map((alt, index) => {
              const altQuality = qualityConfig[alt.quality];
              return (
                <div key={index} className="alternative-card">
                  <div className="alternative-move">
                    {alt.isBest && <span className="best-badge">★</span>}
                    <span className="alternative-san">{alt.move.san}</span>
                  </div>
                  <div className="alternative-info">
                    <div
                      className="alternative-quality"
                      style={{ color: altQuality.color }}
                    >
                      {altQuality.symbol} {altQuality.label}
                    </div>
                    <div
                      className="alternative-score"
                      style={{ color: getScoreColor(alt.score) }}
                    >
                      {alt.score > 0 ? '+' : ''}{alt.score.toFixed(1)}
                    </div>
                  </div>
                  <div className="alternative-explanation">{alt.explanation}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 战术机会 */}
      {analyzedMove.tacticalOpportunities.length > 0 && (
        <div className="tactics-section">
          <h4 className="section-title">战术机会</h4>
          <div className="tactics-list">
            {analyzedMove.tacticalOpportunities.map((tactic, index) => (
              <div
                key={index}
                className="tactic-card"
                style={{
                  borderLeftColor: tactic.winning ? '#f44336' : '#6c757d',
                  borderLeftWidth: tactic.winning ? '3px' : '1px',
                }}
              >
                <div className="tactic-header">
                  <span className="tactic-name">{tactic.name}</span>
                  {tactic.winning && <span className="tactic-winning">制胜</span>}
                  <span className="tactic-strength">
                    强度: {Math.round(tactic.strength * 100)}%
                  </span>
                </div>
                <div className="tactic-description">{tactic.description}</div>
                <div className="tactic-squares">
                  涉及格子: {tactic.squares.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 错过的战术 */}
      {analyzedMove.missedTactics.length > 0 && (
        <div className="missed-tactics-section">
          <h4 className="section-title" style={{ color: '#ff9800' }}>
            错过的战术
          </h4>
          <div className="missed-tactics-list">
            {analyzedMove.missedTactics.map((tactic, index) => (
              <div key={index} className="missed-tactic-card">
                <span className="missed-icon">⚠️</span>
                <div className="missed-tactic-content">
                  <div className="missed-tactic-name">{tactic.name}</div>
                  <div className="missed-tactic-desc">{tactic.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 关键决策点标识 */}
      {analyzedMove.isCritical && (
        <div className="critical-badge">
          <span className="critical-icon">⚡</span>
          <span className="critical-label">关键时刻</span>
        </div>
      )}

      {/* 时间信息 */}
      <div className="time-info">
        <span className="time-label">思考时间:</span>
        <span className="time-value">{Math.round(analyzedMove.timeUsed)}秒</span>
        <span className="time-label">剩余:</span>
        <span className="time-value">{Math.round(analyzedMove.timeRemaining)}秒</span>
      </div>
    </div>
  );
};

export default MoveAnalysisPanel;
