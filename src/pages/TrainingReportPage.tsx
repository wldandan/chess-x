// 训练报告页面
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrainingReportGenerator } from '../services/ai/TrainingReportGenerator';
import type { TrainingProgress } from '../types/chess.types';
import '../styles/pages.css';

interface TrainingReportPageProps {
  trainingProgress: TrainingProgress | null;
}

const TrainingReportPage: React.FC<TrainingReportPageProps> = ({ trainingProgress }) => {
  const navigate = useNavigate();

  // Generate report from training progress
  const report = trainingProgress ? TrainingReportGenerator.generateReport(trainingProgress) : null;

  // Handle navigation
  const handleBackToTraining = () => {
    navigate('/ai-training');
  };

  const handleNewTraining = () => {
    navigate('/training-setup');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleExportReport = () => {
    if (!report) return;

    const reportData = JSON.stringify(report, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // No training data
  if (!trainingProgress || !report) {
    return (
      <div className="page-container" role="main" aria-label="训练报告页面">
        <div className="page-header">
          <h1 className="page-title">训练报告</h1>
        </div>

        <div className="report-placeholder">
          <h2>暂无训练数据</h2>
          <p>完成训练后可查看详细报告</p>
          <div className="report-actions">
            <button
              className="btn btn-primary"
              onClick={handleNewTraining}
              aria-label="开始新训练"
            >
              开始新训练
            </button>
            <button
              className="btn btn-outline"
              onClick={handleGoHome}
              aria-label="返回首页"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get priority class
  const getPriorityClass = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '中';
    }
  };

  return (
    <div className="page-container training-report-page" role="main" aria-label="训练报告页面">
      <div className="page-header">
        <h1 className="page-title">训练报告</h1>
        <div className="header-actions">
          <button
            className="btn btn-outline"
            onClick={handleExportReport}
            aria-label="导出报告"
          >
            导出报告
          </button>
        </div>
      </div>

      <div className="report-content">
        {/* Summary Section */}
        <section className="report-section summary-section" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="section-title">
            训练总结
          </h2>

          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-label">对局总数</div>
              <div className="card-value" aria-label={`${report.summary.totalGames}局`}>
                {report.summary.totalGames}
              </div>
            </div>

            <div className="summary-card">
              <div className="card-label">战绩</div>
              <div
                className="card-value"
                aria-label={`${report.summary.record}胜平负`}
              >
                {report.summary.record}
              </div>
            </div>

            <div className="summary-card">
              <div className="card-label">胜率</div>
              <div
                className="card-value"
                aria-label={`胜率${report.summary.winRate}%`}
              >
                {report.summary.winRate.toFixed(1)}%
              </div>
            </div>

            <div className="summary-card">
              <div className="card-label">ELO变化</div>
              <div
                className={`card-value ${report.summary.eloChange >= 0 ? 'positive' : 'negative'}`}
                aria-label={`ELO变化${report.summary.eloChange >= 0 ? '+' : ''}${report.summary.eloChange}`}
              >
                {report.summary.eloChange >= 0 ? '+' : ''}
                {report.summary.eloChange}
              </div>
            </div>

            <div className="summary-card">
              <div className="card-label">当前ELO</div>
              <div className="card-value" aria-label={`当前ELO ${report.summary.currentElo}`}>
                {report.summary.currentElo}
              </div>
            </div>

            <div className="summary-card">
              <div className="card-label">起始ELO</div>
              <div className="card-value" aria-label={`起始ELO ${report.summary.startingElo}`}>
                {report.summary.startingElo}
              </div>
            </div>
          </div>
        </section>

        {/* Style Analysis Section */}
        {report.styleAnalysis && (
          <section
            className="report-section style-analysis-section"
            aria-labelledby="style-heading"
          >
            <h2 id="style-heading" className="section-title">
              风格分析
            </h2>

            <div className="style-analysis-content">
              <div className="style-item">
                <div className="style-label">最佳风格</div>
                <div className="style-value">
                  <span className="style-name">{report.styleAnalysis.bestStyle.name}</span>
                  <span className="style-score" aria-label={`${report.styleAnalysis.bestStyle.score}分`}>
                    {report.styleAnalysis.bestStyle.score}%
                  </span>
                </div>
              </div>

              <div className="style-item">
                <div className="style-label">最差风格</div>
                <div className="style-value">
                  <span className="style-name">{report.styleAnalysis.worstStyle.name}</span>
                  <span className="style-score" aria-label={`${report.styleAnalysis.worstStyle.score}分`}>
                    {report.styleAnalysis.worstStyle.score}%
                  </span>
                </div>
              </div>

              <div className="style-item">
                <div className="style-label">平均适应度</div>
                <div className="style-value">
                  <span className="style-score" aria-label={`${report.styleAnalysis.averageAdaptation}分`}>
                    {report.styleAnalysis.averageAdaptation}%
                  </span>
                </div>
              </div>

              <div className="style-item">
                <div className="style-label">整体评估</div>
                <div className="style-value">
                  <span className="overall-assessment">
                    {report.styleAnalysis.overallAssessment === 'excellent' && '优秀'}
                    {report.styleAnalysis.overallAssessment === 'good' && '良好'}
                    {report.styleAnalysis.overallAssessment === 'needs-improvement' && '需要改进'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {!report.styleAnalysis && (
          <section className="report-section" aria-labelledby="style-heading">
            <h2 id="style-heading" className="section-title">
              风格分析
            </h2>
            <p>暂无风格分析数据</p>
          </section>
        )}

        {/* Weaknesses Section */}
        <section
          className="report-section weaknesses-section"
          aria-labelledby="weaknesses-heading"
        >
          <h2 id="weaknesses-heading" className="section-title">
            弱点分析
          </h2>

          {report.weaknesses.length > 0 ? (
            <ul className="weaknesses-list">
              {report.weaknesses.map((weakness, index) => (
                <li key={index} className="weakness-item">
                  <div className="weakness-header">
                    <span className="weakness-description">{weakness.description}</span>
                    <span
                      className={`weakness-priority ${getPriorityClass(weakness.priority)}`}
                      aria-label={`优先级：${getPriorityLabel(weakness.priority)}`}
                    >
                      {getPriorityLabel(weakness.priority)}
                    </span>
                  </div>
                  {weakness.count !== undefined && weakness.count > 0 && (
                    <div className="weakness-count">出现次数: {weakness.count}</div>
                  )}
                  {weakness.affectedStyles && weakness.affectedStyles.length > 0 && (
                    <div className="weakness-styles">
                      受影响风格: {weakness.affectedStyles.join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">无明显弱点</p>
          )}
        </section>

        {/* Strengths Section */}
        <section
          className="report-section strengths-section"
          aria-labelledby="strengths-heading"
        >
          <h2 id="strengths-heading" className="section-title">
            优势分析
          </h2>

          {report.strengths.length > 0 ? (
            <ul className="strengths-list">
              {report.strengths.map((strength, index) => (
                <li key={index} className="strength-item">
                  <div className="strength-description">{strength.description}</div>
                  {strength.score !== undefined && (
                    <div className="strength-score" aria-label={`${strength.score}分`}>
                      {strength.score}%
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">暂无明显优势</p>
          )}
        </section>

        {/* Recommendations Section */}
        <section
          className="report-section recommendations-section"
          aria-labelledby="recommendations-heading"
        >
          <h2 id="recommendations-heading" className="section-title">
            训练建议
          </h2>

          {report.recommendations.length > 0 ? (
            <ul className="recommendations-list">
              {report.recommendations.map((recommendation, index) => (
                <li key={index} className="recommendation-item">
                  <div className="recommendation-header">
                    <span className="recommendation-title">{recommendation.title}</span>
                    <span
                      className={`recommendation-priority ${getPriorityClass(
                        recommendation.priority
                      )}`}
                      aria-label={`优先级：${getPriorityLabel(recommendation.priority)}`}
                    >
                      {getPriorityLabel(recommendation.priority)}
                    </span>
                  </div>
                  <div className="recommendation-description">
                    {recommendation.description}
                  </div>
                  <div className="recommendation-details">
                    <span className="recommendation-type">
                      类型: {recommendation.type}
                    </span>
                    <span className="recommendation-sessions">
                      建议训练: {recommendation.estimatedSessions}局
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">暂无特别建议</p>
          )}
        </section>

        {/* Navigation Buttons */}
        <section className="report-section navigation-section">
          <div className="navigation-buttons">
            <button
              className="btn btn-primary"
              onClick={handleBackToTraining}
              aria-label="返回训练页面"
            >
              返回训练
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleNewTraining}
              aria-label="开始新训练"
            >
              新训练
            </button>
            <button
              className="btn btn-outline"
              onClick={handleGoHome}
              aria-label="返回首页"
            >
              返回首页
            </button>
          </div>
        </section>
      </div>

      <footer className="report-footer">
        <p>报告生成时间: {report.timestamp.toLocaleString('zh-CN')}</p>
      </footer>
    </div>
  );
};

export default TrainingReportPage;
