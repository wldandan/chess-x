// 战术训练面板组件
import React from 'react';
import type { TacticPuzzle, TrainingSession, TacticStatus, TacticType } from '../../types/tactics.types';
import { TacticTypeIcons, TacticTypeNames, DifficultyLabels, DifficultyColors } from '../../types/tactics.types';

interface TacticPanelProps {
  session: TrainingSession | null;
  puzzle: TacticPuzzle | null;
  feedback: {
    type: 'correct' | 'wrong' | 'complete' | 'hint' | null;
    message: string;
  };
  onGetHint: () => void;
  onSkip: () => void;
  onReset: () => void;
  onShowSolution: () => void;
  onStartNew: () => void;
  onEndSession: () => void;
}

export const TacticPanel: React.FC<TacticPanelProps> = ({
  session,
  puzzle,
  feedback,
  onGetHint,
  onSkip,
  onReset,
  onShowSolution,
  onStartNew,
  onEndSession,
}) => {
  const progress = session ? {
    current: session.puzzlesCompleted,
    total: session.puzzlesCompleted + (session.status !== 'not_started' ? 1 : 0),
    solved: session.puzzlesSolved,
    failed: session.puzzlesFailed,
  } : null;

  const accuracy = progress && progress.total > 0
    ? Math.round((progress.solved / progress.total) * 100)
    : 0;

  if (!session || !puzzle) {
    return (
      <div className="tactic-panel">
        <div className="panel-placeholder">
          <div className="placeholder-icon">🎯</div>
          <h3>战术训练</h3>
          <p>开始您的战术训练之旅</p>
          <button className="btn btn-primary btn-large" onClick={onStartNew}>
            开始训练
          </button>
        </div>
      </div>
    );
  }

  const isComplete = session.status === 'solved';
  const isFailed = session.status === 'failed';

  return (
    <div className="tactic-panel">
      {/* 题目信息 */}
      <div className="tactic-info">
        <div className="tactic-header">
          <span className="tactic-icon">{TacticTypeIcons[puzzle.type]}</span>
          <div className="tactic-title-group">
            <h3 className="tactic-title">{TacticTypeNames[puzzle.type]}</h3>
            <span
              className="tactic-difficulty"
              style={{ color: DifficultyColors[puzzle.difficulty] }}
            >
              {DifficultyLabels[puzzle.difficulty]}
            </span>
          </div>
        </div>

        {puzzle.theme && (
          <div className="tactic-theme">{puzzle.theme}</div>
        )}
      </div>

      {/* 反馈消息 */}
      {feedback.type && (
        <div className={`feedback-message feedback-${feedback.type}`}>
          <span className="feedback-icon">
            {feedback.type === 'correct' && '✅'}
            {feedback.type === 'wrong' && '❌'}
            {feedback.type === 'complete' && '🎉'}
            {feedback.type === 'hint' && '💡'}
          </span>
          <span className="feedback-text">{feedback.message}</span>
        </div>
      )}

      {/* 进度统计 */}
      {progress && (
        <div className="tactic-progress">
          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-label">完成</span>
              <span className="stat-value">{progress.current}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">正确</span>
              <span className="stat-value correct">{progress.solved}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">错误</span>
              <span className="stat-value wrong">{progress.failed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">准确率</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${accuracy}%`,
                backgroundColor: accuracy >= 70 ? '#22c55e' : accuracy >= 50 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="tactic-controls">
        {!isComplete && !isFailed && (
          <>
            <button className="control-btn hint-btn" onClick={onGetHint}>
              <span className="btn-icon">💡</span>
              <span className="btn-label">提示</span>
            </button>
            <button className="control-btn reset-btn" onClick={onReset}>
              <span className="btn-icon">🔄</span>
              <span className="btn-label">重置</span>
            </button>
          </>
        )}

        {isComplete && (
          <div className="completion-message success">
            <span className="completion-icon">🎉</span>
            <span className="completion-text">完成！</span>
          </div>
        )}

        {isFailed && (
          <div className="completion-message failed">
            <span className="completion-icon">😔</span>
            <span className="completion-text">再试试</span>
          </div>
        )}

        <button className="control-btn skip-btn" onClick={onSkip}>
          <span className="btn-icon">⏭️</span>
          <span className="btn-label">跳过</span>
        </button>

        <button className="control-btn solution-btn" onClick={onShowSolution}>
          <span className="btn-icon">👁️</span>
          <span className="btn-label">查看解答</span>
        </button>
      </div>

      {/* 解答显示 */}
      {isComplete || isFailed ? (
        <div className="solution-section">
          <h4 className="solution-title">正确解答</h4>
          <div className="solution-moves">
            {puzzle.solution.map((move, index) => (
              <span key={index} className="solution-move">
                {index + 1}. {move.san || `${move.from}${move.to}`}
              </span>
            ))}
          </div>
          {puzzle.explanation && (
            <div className="solution-explanation">
              <strong>解释：</strong>{puzzle.explanation}
            </div>
          )}
        </div>
      ) : null}

      {/* 会话控制 */}
      <div className="session-controls">
        <button className="btn btn-outline" onClick={onEndSession}>
          结束训练
        </button>
      </div>

      {/* 用户表现统计 */}
      {session && (
        <div className="session-stats">
          <h4 className="stats-title">本次训练</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">最佳连击</span>
              <span className="stat-value">{session.puzzlesSolved}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">用时</span>
              <span className="stat-value">
                {Math.round(session.totalTime / 60)}分钟
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TacticPanel;
