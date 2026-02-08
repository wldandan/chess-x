import React from 'react';

interface Weakness {
  area: string;
  count: number;
  improvement: number;
}

interface EloHistoryEntry {
  elo: number;
  date: string;
}

interface StyleAdaptation {
  positional: number;
  tactical: number;
  solid: number;
  aggressive: number;
  defensive: number;
  technical: number;
}

interface TrainingStats {
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  currentElo: number;
  eloHistory: EloHistoryEntry[];
  styleAdaptation: StyleAdaptation;
  weaknesses: Weakness[];
}

interface TrainingProgressDashboardProps {
  stats: TrainingStats;
}

const STYLE_LABELS: Record<keyof StyleAdaptation, string> = {
  positional: '局面风格',
  tactical: '战术风格',
  solid: '稳健风格',
  aggressive: '激进风格',
  defensive: '防守风格',
  technical: '技术风格',
};

export const TrainingProgressDashboard: React.FC<TrainingProgressDashboardProps> = ({
  stats,
}) => {
  const winRate =
    stats.gamesPlayed > 0
      ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(1)
      : '0.0';

  const eloChange =
    stats.eloHistory.length > 1
      ? stats.currentElo - stats.eloHistory[0].elo
      : 0;

  const formatEloChange = (change: number): string => {
    return change >= 0 ? `+${change}` : `${change}`;
  };

  return (
    <div
      className="training-progress-dashboard"
      role="region"
      aria-label="训练进度仪表板"
      tabIndex={0}
    >
      <h2 className="dashboard-title">训练进度</h2>

      {/* Statistics Cards */}
      <div className="stats-grid" role="group" aria-label="统计数据">
        <div className="stat-card">
          <div className="stat-label">对局总数</div>
          <div className="stat-value" aria-label={`${stats.gamesPlayed}局`}>
            {stats.gamesPlayed}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">战绩</div>
          <div
            className="stat-value"
            aria-label={`${stats.wins}胜${stats.draws}平${stats.losses}负`}
          >
            {stats.wins}-{stats.draws}-{stats.losses}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">胜率</div>
          <div className="stat-value" aria-label={`胜率${winRate}%`}>
            {winRate}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">当前等级分</div>
          <div className="stat-value" aria-label={`等级分${stats.currentElo}`}>
            {stats.currentElo}
          </div>
        </div>
      </div>

      {/* ELO Progress */}
      <div className="elo-section">
        <h3 className="section-title">等级分走势</h3>
        <div className="elo-progress-container">
          <div className="elo-current">{stats.currentElo}</div>
          <div
            className={`elo-change ${
              eloChange >= 0 ? 'positive-change' : 'negative-change'
            }`}
            aria-label={`等级分变化：${formatEloChange(eloChange)}`}
          >
            {formatEloChange(eloChange)}
          </div>
        </div>
      </div>

      {/* Style Adaptation */}
      <div className="style-adaptation-section">
        <h3 className="section-title">风格适应度</h3>
        <div className="style-bars" role="group" aria-label="风格适应度评分">
          {Object.entries(stats.styleAdaptation).map(([style, score]) => (
            <div key={style} className="style-bar-row">
              <span className="style-label">{STYLE_LABELS[style as keyof StyleAdaptation]}</span>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  role="progressbar"
                  aria-valuenow={score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${STYLE_LABELS[style as keyof StyleAdaptation]}：${score}%`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="style-score" aria-label={`${score}分`}>
                {score}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weakness Analysis */}
      <div className="weakness-section">
        <h3 className="section-title">弱点分析</h3>
        {stats.weaknesses.length > 0 ? (
          <ul className="weakness-list">
            {stats.weaknesses.map((weakness, index) => (
              <li key={index} className="weakness-item">
                <div className="weakness-header">
                  <span className="weakness-area">{weakness.area}</span>
                  <span className="weakness-count">{weakness.count}次</span>
                </div>
                <div className="weakness-improvement">
                  已改善{weakness.improvement}次
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-weaknesses">无明显弱点</p>
        )}
      </div>
    </div>
  );
};
