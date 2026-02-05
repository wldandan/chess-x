// 对局分析报告卡片组件
import React from 'react';
import type { GameAnalysisReport } from '../../types/analysis.types';

interface GameReportCardProps {
  report: GameAnalysisReport;
  onExport?: (format: 'json' | 'pdf') => void;
}

// 质量等级对应的颜色
const getQualityColor = (quality: 'best' | 'good' | 'error'): string => {
  switch (quality) {
    case 'best': return '#22c55e';
    case 'good': return '#3b82f6';
    case 'error': return '#ef4444';
  }
};

// 准确率条颜色
const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 90) return '#22c55e';
  if (accuracy >= 75) return '#3b82f6';
  if (accuracy >= 60) return '#f59e0b';
  return '#ef4444';
};

export const GameReportCard: React.FC<GameReportCardProps> = ({
  report,
  onExport,
}) => {
  // 计算质量分布
  const totalMoves = report.totalMoves || 1;
  const bestPercent = (report.bestMoves / totalMoves) * 100;
  const goodPercent = ((report.bestMoves + report.greatMoves + report.goodMoves) / totalMoves) * 100;
  const errorPercent = ((report.inaccuracies + report.mistakes + report.blunders) / totalMoves) * 100;

  return (
    <div className="game-report-card">
      {/* 报告头部 */}
      <div className="report-header">
        <div className="report-title">
          <h3>对局分析报告</h3>
          <span className="report-date">
            {new Date(report.analyzedAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
        {onExport && (
          <div className="report-actions">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => onExport('json')}
            >
              导出JSON
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => onExport('pdf')}
            >
              导出PDF
            </button>
          </div>
        )}
      </div>

      {/* 总体准确率 */}
      <div className="report-section">
        <h4 className="report-section-title">总体表现</h4>
        <div className="accuracy-overview">
          <div className="accuracy-main">
            <div
              className="accuracy-circle"
              style={{
                background: `conic-gradient(${getAccuracyColor(report.overallAccuracy)} ${report.overallAccuracy}%, #e5e7eb ${report.overallAccuracy}%)`,
              }}
            >
              <div className="accuracy-inner">
                <div className="accuracy-value">{report.overallAccuracy.toFixed(1)}%</div>
                <div className="accuracy-label">准确率</div>
              </div>
            </div>
          </div>

          <div className="accuracy-details">
            <div className="accuracy-item">
              <span className="accuracy-label-white">白方</span>
              <div className="accuracy-bar">
                <div
                  className="accuracy-fill"
                  style={{
                    width: `${report.whiteAccuracy}%`,
                    backgroundColor: getAccuracyColor(report.whiteAccuracy),
                  }}
                />
              </div>
              <span className="accuracy-percent">{report.whiteAccuracy.toFixed(1)}%</span>
            </div>

            <div className="accuracy-item">
              <span className="accuracy-label-black">黑方</span>
              <div className="accuracy-bar">
                <div
                  className="accuracy-fill"
                  style={{
                    width: `${report.blackAccuracy}%`,
                    backgroundColor: getAccuracyColor(report.blackAccuracy),
                  }}
                />
              </div>
              <span className="accuracy-percent">{report.blackAccuracy.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 走法质量分布 */}
      <div className="report-section">
        <h4 className="report-section-title">走法质量分布</h4>
        <div className="quality-distribution">
          <div className="quality-bar-container">
            <div className="quality-bar">
              <div
                className="quality-fill quality-best"
                style={{ width: `${bestPercent}%` }}
                title={`最佳走法: ${report.bestMoves}`}
              />
              <div
                className="quality-fill quality-good"
                style={{ width: `${goodPercent - bestPercent}%` }}
                title={`较好走法: ${report.greatMoves + report.goodMoves}`}
              />
              <div
                className="quality-fill quality-error"
                style={{ width: `${errorPercent}%` }}
                title={`失误: ${report.inaccuracies + report.mistakes + report.blunders}`}
              />
            </div>
          </div>

          <div className="quality-legend">
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: getQualityColor('best') }} />
              <span className="legend-text">
                最佳 ({report.bestMoves})
              </span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: getQualityColor('good') }} />
              <span className="legend-text">
                优秀/较好 ({report.greatMoves + report.goodMoves})
              </span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: getQualityColor('error') }} />
              <span className="legend-text">
                失误 ({report.inaccuracies + report.mistakes + report.blunders})
              </span>
            </div>
          </div>

          <div className="quality-stats">
            <div className="stat-badge best">
              <span className="stat-icon">!!</span>
              <span className="stat-label">最佳走法</span>
              <span className="stat-value">{report.bestMovePercent.toFixed(1)}%</span>
            </div>
            <div className="stat-badge good">
              <span className="stat-icon">!</span>
              <span className="stat-label">较好走法</span>
              <span className="stat-value">{report.goodMovePercent.toFixed(1)}%</span>
            </div>
            <div className="stat-badge error">
              <span className="stat-icon">??</span>
              <span className="stat-label">错误率</span>
              <span className="stat-value">{report.errorPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 开局分析 */}
      <div className="report-section">
        <h4 className="report-section-title">开局分析</h4>
        <div className="opening-analysis">
          <div className="opening-info">
            <span className="opening-eco">{report.opening.eco}</span>
            <span className="opening-name">{report.opening.name}</span>
            {report.opening.variation && (
              <span className="opening-variation">{report.opening.variation}</span>
            )}
          </div>
          <div className="opening-accuracy">
            <span className="opening-accuracy-label">开局准确率</span>
            <span className="opening-accuracy-value">{report.openingAccuracy.toFixed(1)}%</span>
          </div>
          {report.deviation && (
            <div className="opening-deviation">
              <span className="deviation-icon">⚠️</span>
              <span className="deviation-text">{report.deviation.explanation}</span>
            </div>
          )}
        </div>
      </div>

      {/* 战术统计 */}
      <div className="report-section">
        <h4 className="report-section-title">战术识别</h4>
        <div className="tactics-summary">
          <div className="tactic-stat found">
            <span className="tactic-icon">🎯</span>
            <span className="tactic-label">找到战术</span>
            <span className="tactic-value">{report.tacticsFound}</span>
          </div>
          <div className="tactic-stat missed">
            <span className="tactic-icon">❌</span>
            <span className="tactic-label">错过战术</span>
            <span className="tactic-value">{report.tacticsMissed}</span>
          </div>
          <div className="tactic-rate">
            <span className="rate-label">识别率</span>
            <span className="rate-value">
              {report.tacticsFound + report.tacticsMissed > 0
                ? ((report.tacticsFound / (report.tacticsFound + report.tacticsMissed)) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 时间管理 */}
      <div className="report-section">
        <h4 className="report-section-title">时间管理</h4>
        <div className="time-management">
          <div className="time-stat">
            <span className="time-label">平均每步</span>
            <span className="time-value">
              {Math.round(report.timeManagement.averageTimePerMove)}秒
            </span>
          </div>
          <div className="time-stat">
            <span className="time-label">最慢一步</span>
            <span className="time-value">
              {Math.round(report.timeManagement.slowestMove.time)}秒
            </span>
          </div>
          <div className="time-stat">
            <span className="time-label">时间紧张</span>
            <span className="time-value">{report.timeManagement.timeTroubleMoves}步</span>
          </div>
          <div className="time-stat">
            <span className="time-label">时间管理评分</span>
            <span
              className="time-value"
              style={{
                color: getAccuracyColor(report.timeManagement.goodTimeManagement),
              }}
            >
              {report.timeManagement.goodTimeManagement.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* 优点与弱点 */}
      {(report.strengths.length > 0 || report.weaknesses.length > 0) && (
        <div className="report-section">
          <h4 className="report-section-title">分析总结</h4>
          <div className="analysis-summary">
            {report.strengths.length > 0 && (
              <div className="summary-block strengths">
                <div className="summary-header">
                  <span className="summary-icon">✅</span>
                  <span className="summary-title">优点</span>
                </div>
                <ul className="summary-list">
                  {report.strengths.map((strength, index) => (
                    <li key={index} className="summary-item">{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.weaknesses.length > 0 && (
              <div className="summary-block weaknesses">
                <div className="summary-header">
                  <span className="summary-icon">⚠️</span>
                  <span className="summary-title">需要改进</span>
                </div>
                <ul className="summary-list">
                  {report.weaknesses.map((weakness, index) => (
                    <li key={index} className="summary-item">{weakness}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 改进建议 */}
      {report.recommendations.length > 0 && (
        <div className="report-section">
          <h4 className="report-section-title">改进建议</h4>
          <div className="recommendations">
            {report.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-number">{index + 1}</span>
                <span className="recommendation-text">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 关键时刻 */}
      {report.criticalMoments.length > 0 && (
        <div className="report-section">
          <h4 className="report-section-title">关键时刻</h4>
          <div className="critical-moments">
            {report.criticalMoments.map((moment, index) => (
              <div key={index} className={`critical-moment impact-${moment.impact}`}>
                <div className="moment-header">
                  <span className="moment-move">{moment.moveNumber}. {moment.move.san}</span>
                  <span className={`moment-type type-${moment.type}`}>
                    {moment.type === 'brilliant_move' && '精彩着法'}
                    {moment.type === 'critical_error' && '严重失误'}
                    {moment.type === 'turning_point' && '转折点'}
                    {moment.type === 'missed_win' && '错失胜机'}
                  </span>
                </div>
                <div className="moment-description">{moment.description}</div>
                <div className="moment-impact">
                  <span className="impact-label">影响:</span>
                  <span className="impact-score">
                    {moment.scoreBefore > 0 ? '+' : ''}{moment.scoreBefore.toFixed(1)} →
                    {moment.scoreAfter > 0 ? '+' : ''}{moment.scoreAfter.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 分析元数据 */}
      <div className="report-footer">
        <div className="report-meta">
          <span className="meta-label">分析引擎:</span>
          <span className="meta-value">{report.engineName}</span>
        </div>
        <div className="report-meta">
          <span className="meta-label">分析深度:</span>
          <span className="meta-value">深度 {report.analysisDepth}</span>
        </div>
        <div className="report-meta">
          <span className="meta-label">总步数:</span>
          <span className="meta-value">{report.totalMoves}步</span>
        </div>
      </div>
    </div>
  );
};

export default GameReportCard;
