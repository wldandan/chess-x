// 战术组合训练页面 - 自适应学习模式
import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import {
  useTacticsStore,
  useCurrentSession,
  useCurrentPuzzle,
  useUserStats,
  useTacticsProgress,
} from '../stores/tactics.store';
import PuzzleBoard from '../components/tactics/PuzzleBoard';
import TacticPanel from '../components/tactics/TacticPanel';
import type { TacticType, TacticDifficulty, TacticMove } from '../types/tactics.types';
import '../styles/pages.css';

const TrainingPage: React.FC = () => {
  // State
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'wrong' | 'complete' | 'hint' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showSolution, setShowSolution] = useState(false);

  // Store
  const currentSession = useCurrentSession();
  const currentPuzzle = useCurrentPuzzle();
  const userStats = useUserStats();
  const progress = useTacticsProgress();

  // Store actions
  const { startSession, endSession, abandonSession, makeMove, resetPuzzle, getHint, skipPuzzle } = useTacticsStore();

  // 开始训练
  const handleStartSession = async () => {
    await startSession({
      difficulty: 2,
      adaptiveMode: true,
      puzzleCount: 10,
    });
    setFeedback({ type: null, message: '' });
    setShowSolution(false);
  };

  // 结束训练
  const handleEndSession = () => {
    const result = endSession();
    if (result) {
      setFeedback({
        type: 'complete',
        message: `训练完成！解决了 ${result.puzzlesSolved} 道题，获得 ${result.experienceGained} 经验值${result.levelUp ? '，升级！' : ''}`,
      });
    }
  };

  // 放弃训练
  const handleAbandonSession = () => {
    abandonSession();
    setFeedback({ type: null, message: '' });
    setShowSolution(false);
  };

  // 处理走棋
  const handleMove = async (move: TacticMove) => {
    if (!currentSession || !currentPuzzle) return;

    const isCorrect = await makeMove(move);

    if (isCorrect) {
      const isComplete = currentSession.currentMoveIndex + 1 >= currentPuzzle.solution.length;

      if (isComplete) {
        setFeedback({
          type: 'complete',
          message: '正确！完成题目！',
        });
      } else {
        setFeedback({
          type: 'correct',
          message: '正确！继续...',
        });
      }

      // 清除反馈
      setTimeout(() => {
        setFeedback({ type: null, message: '' });
      }, 1500);
    } else {
      setFeedback({
        type: 'wrong',
        message: '不正确，再试试！',
      });

      setTimeout(() => {
        setFeedback({ type: null, message: '' });
      }, 2000);
    }
  };

  // 获取提示
  const handleGetHint = () => {
    const hint = getHint();
    if (hint) {
      setFeedback({
        type: 'hint',
        message: hint,
      });
    }
  };

  // 跳过题目
  const handleSkip = () => {
    skipPuzzle();
    setFeedback({ type: null, message: '' });
    setShowSolution(false);
  };

  // 重置题目
  const handleReset = () => {
    resetPuzzle();
    setFeedback({ type: null, message: '' });
    setShowSolution(false);
  };

  // 显示解答
  const handleShowSolution = () => {
    setShowSolution(true);
  };

  // 如果没有活动会话，显示训练中心
  if (!currentSession) {
    return <TrainingHub onStartTraining={handleStartSession} userStats={userStats} />;
  }

  return (
    <div className="tactics-training-page">
      <div className="page-header">
        <h2 className="page-title">战术组合训练</h2>
        <p className="page-subtitle">
          自适应难度 • 16种战术类型 • 实时反馈
        </p>
      </div>

      {/* 进度概览 */}
      <div className="training-progress-overview">
        <div className="progress-item">
          <span className="progress-label">进度</span>
          <span className="progress-value">{progress.current} / {progress.total}</span>
        </div>
        <div className="progress-item">
          <span className="progress-label">等级</span>
          <span className="progress-value">Lv.{userStats.currentLevel}</span>
        </div>
        <div className="progress-item">
          <span className="progress-label">经验</span>
          <span className="progress-value">{userStats.experiencePoints} XP</span>
        </div>
        <button className="btn btn-sm btn-outline" onClick={handleAbandonSession}>
          退出训练
        </button>
      </div>

      {/* 主内容区 */}
      <div className="tactics-content">
        {/* 棋盘 */}
        <div className="tactics-board-section">
          <PuzzleBoard
            puzzle={currentPuzzle}
            userMoves={currentSession.userMoves}
            onMove={handleMove}
            boardOrientation={currentPuzzle?.turn || 'white'}
          />
        </div>

        {/* 控制面板 */}
        <div className="tactics-panel-section">
          <TacticPanel
            session={currentSession}
            puzzle={currentPuzzle}
            feedback={feedback}
            onGetHint={handleGetHint}
            onSkip={handleSkip}
            onReset={handleReset}
            onShowSolution={handleShowSolution}
            onStartNew={handleStartSession}
            onEndSession={handleEndSession}
          />
        </div>
      </div>

      {/* 解答显示 */}
      {showSolution && currentPuzzle && (
        <div className="solution-overlay">
          <div className="solution-content">
            <h3>正确解答</h3>
            <div className="solution-moves">
              {currentPuzzle.solution.map((move, index) => (
                <span key={index} className="solution-move">
                  {index + 1}. {move.san || `${move.from}-${move.to}`}
                </span>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => setShowSolution(false)}>
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 训练中心组件（未开始训练时显示）
const TrainingHub: React.FC<{
  onStartTraining: () => void;
  userStats: any;
}> = ({ onStartTraining, userStats }) => {
  // 所有可用的战术类型
  const tacticTypes: { type: TacticType; name: string; icon: string }[] = [
    { type: 'fork', name: '捉双', icon: '⚔️' },
    { type: 'pin', name: '牵制', icon: '📌' },
    { type: 'skewer', name: '串击', icon: '🔱' },
    { type: 'discovered', name: '闪击', icon: '⚡' },
    { type: 'double_attack', name: '双重攻击', icon: '🎯' },
    { type: 'deflection', name: '诱离', icon: '↪️' },
    { type: 'decoy', name: '引入', icon: '🎣' },
    { type: 'zwischenzug', name: '过渡', icon: '⏭️' },
    { type: 'overload', name: '过载', icon: '⚖️' },
    { type: 'xray', name: '穿刺', icon: '🔭' },
    { type: 'clearance', name: '清空', icon: '🧹' },
    { type: 'interference', name: '干扰', icon: '🚫' },
    { type: 'trapped_piece', name: '陷阱', icon: '🪤' },
    { type: 'hanging_piece', name: '悬兵', icon: '💀' },
    { type: 'weak_backrank', name: '弱底线', icon: '🏰' },
    { type: 'mate_threat', name: '杀棋威胁', icon: '⚠️' },
  ];

  return (
    <div className="training-page">
      <div className="page-header">
        <h2 className="page-title">训练中心</h2>
        <p className="page-subtitle">
          系统化训练模块，全面提升国际象棋水平
        </p>
      </div>

      {/* 用户统计 */}
      <div className="training-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{userStats.totalPuzzles || 0}</div>
            <div className="stat-label">完成题目</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">
              {userStats.solveRate ? Math.round(userStats.solveRate * 100) : 0}%
            </div>
            <div className="stat-label">正确率</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-number">{userStats.currentStreak || 0}</div>
            <div className="stat-label">当前连击</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-number">{userStats.bestStreak || 0}</div>
            <div className="stat-label">最佳连击</div>
          </div>
        </div>
      </div>

      {/* 战术训练入口 */}
      <div className="tactics-entry">
        <div className="entry-card featured">
          <div className="entry-header">
            <div className="entry-icon">🎯</div>
            <div className="entry-info">
              <h3>战术组合训练</h3>
              <p>自适应难度 • 16种战术类型 • 实时反馈</p>
            </div>
          </div>
          <div className="entry-features">
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span className="feature-text">根据表现自动调整难度</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎓</span>
              <span className="feature-text">针对性弱点训练</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">即时反馈和详细解析</span>
            </div>
          </div>
          <button className="btn btn-primary btn-large" onClick={onStartTraining}>
            开始战术训练
          </button>
        </div>
      </div>

      {/* 战术类型展示 */}
      <div className="tactics-showcase">
        <h3 className="section-title">战术类型</h3>
        <div className="tactics-grid">
          {tacticTypes.map((tactic) => {
            const stats = userStats.statsByType?.[tactic.type];
            return (
              <div key={tactic.type} className="tactic-type-card">
                <div className="tactic-type-icon">{tactic.icon}</div>
                <div className="tactic-type-name">{tactic.name}</div>
                {stats && (
                  <div className="tactic-type-stats">
                    <span className="stat">{stats.total}题</span>
                    <span className="stat">{Math.round(stats.solveRate * 100)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrainingPage;
