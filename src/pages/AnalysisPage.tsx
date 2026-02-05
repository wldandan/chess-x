// 对局分析页面 - 支持完整对局分析和复盘
import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
  useAnalysisStore,
  useCurrentReport,
  useAnalyzedMoves,
  useCurrentAnalyzedMove,
  useAnalysisProgress,
  useReviewState,
} from '../stores/analysis.store';
import { useGameStore, useGameHistory } from '../stores/game.store';
import MoveAnalysisPanel from '../components/analysis/MoveAnalysisPanel';
import GameReportCard from '../components/analysis/GameReportCard';
import { TacticalIndicator, TacticalLegend } from '../components/analysis/TacticalIndicator';
import type { ReviewMode } from '../types/analysis.types';
import '../styles/pages.css';

const AnalysisPage: React.FC = () => {
  // 状态
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Stores
  const gameHistory = useGameHistory();
  const currentReport = useCurrentReport();
  const analyzedMoves = useAnalyzedMoves();
  const currentAnalyzedMove = useCurrentAnalyzedMove();
  const progress = useAnalysisProgress();
  const review = useReviewState();

  // Store actions
  const { loadGame, startAnalysis, cancelAnalysis, clearAnalysis, exportReport } = useAnalysisStore();
  const { goToMove, nextMove, previousMove, goToStart, goToEnd, setReviewMode } = useAnalysisStore();

  // 棋盘状态
  const [chess] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');

  // 初始化：如果有游戏历史，自动选择第一个进行分析
  useEffect(() => {
    if (gameHistory.length > 0 && !selectedGameId) {
      handleSelectGame(gameHistory[0].id);
    }
  }, [gameHistory]);

  // 选择游戏
  const handleSelectGame = async (gameId: string) => {
    setSelectedGameId(gameId);
    clearAnalysis();
    setShowReport(false);

    // 加载游戏
    const game = gameHistory.find(g => g.id === gameId);
    if (game) {
      await loadGame(game);

      // 重置棋盘到初始位置
      chess.reset();
    }
  };

  // 开始分析
  const handleStartAnalysis = async () => {
    const game = gameHistory.find(g => g.id === selectedGameId);
    if (game) {
      await startAnalysis(game, {
        engine: 'mock',
        depth: 15,
        includeAlternatives: true,
        alternativesCount: 3,
        detectTactics: true,
        includeOpening: true,
        timeAnalysis: true,
      });
    }
  };

  // 取消分析
  const handleCancelAnalysis = () => {
    cancelAnalysis();
  };

  // 导航到指定步数
  const handleGoToMove = (moveIndex: number) => {
    goToMove(moveIndex);

    const game = gameHistory.find(g => g.id === selectedGameId);
    if (game && moveIndex >= 0) {
      const move = game.moves[moveIndex];
      if (move) {
        chess.move(move.san);
      }
    } else if (moveIndex === -1) {
      chess.reset();
    }
  };

  // 棋盘走子（复盘模式下只查看，不允许走棋）
  const onDrop = () => {
    return false; // 不允许在分析模式下走棋
  };

  // 获取当前战术机会
  const currentTactics = currentAnalyzedMove?.tacticalOpportunities || [];

  return (
    <div className="analysis-page">
      <div className="page-header">
        <h2 className="page-title">棋局分析</h2>
        <p className="page-subtitle">
          深度分析对局表现，识别弱点，制定改进计划
        </p>
      </div>

      {/* 游戏选择 */}
      <div className="game-selection">
        <label className="selection-label">选择对局:</label>
        <select
          className="game-select"
          value={selectedGameId || ''}
          onChange={(e) => handleSelectGame(e.target.value)}
          disabled={progress.isAnalyzing}
        >
          <option value="">-- 请选择 --</option>
          {gameHistory.map((game) => (
            <option key={game.id} value={game.id}>
              {game.metadata?.white || 'White'} vs {game.metadata?.black || 'Black'}
              {' '}({game.metadata?.date || game.metadata?.result || '*'})
            </option>
          ))}
        </select>

        {selectedGameId && !review.isReady && !progress.isAnalyzing && (
          <button className="btn btn-primary" onClick={handleStartAnalysis}>
            开始分析
          </button>
        )}

        {progress.isAnalyzing && (
          <button className="btn btn-outline" onClick={handleCancelAnalysis}>
            取消分析
          </button>
        )}

        {review.isReady && (
          <div className="analysis-actions">
            <button
              className={`btn ${showReport ? 'btn-outline' : 'btn-primary'}`}
              onClick={() => setShowReport(false)}
            >
              逐步复盘
            </button>
            <button
              className={`btn ${showReport ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowReport(true)}
            >
              查看报告
            </button>
            <button
              className="btn btn-outline"
              onClick={() => exportReport('json')}
            >
              导出
            </button>
          </div>
        )}
      </div>

      {/* 分析进度 */}
      {progress.isAnalyzing && (
        <div className="analysis-progress">
          <div className="progress-header">
            <h3>正在分析...</h3>
            <span className="progress-percent">{progress.percentComplete}%</span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
          <div className="progress-status">
            {progress.stage === 'initializing' && '初始化分析引擎...'}
            {progress.stage === 'analyzing' &&
              `分析棋步: ${progress.currentMove}/${progress.totalMoves}`}
            {progress.stage === 'generating_report' && '生成分析报告...'}
          </div>
        </div>
      )}

      {/* 主内容区 */}
      {selectedGameId && review.isReady && (
        <div className="analysis-content">
          {!showReport ? (
            <>
              {/* 棋盘 + 分析面板 */}
              <div className="analysis-board-section">
                {/* 棋盘 */}
                <div className="chessboard-container">
                  <Chessboard
                    position={chess.fen()}
                    boardOrientation={boardOrientation}
                    onPieceDrop={onDrop}
                    customBoardStyle={{
                      borderRadius: '4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />

                  {/* 战术指示器覆盖层 */}
                  {currentTactics.length > 0 && (
                    <TacticalIndicator
                      tactics={currentTactics}
                      boardSize={600}
                    />
                  )}

                  {/* 战术图例 */}
                  {currentTactics.length > 0 && (
                    <TacticalLegend tactics={currentTactics} />
                  )}
                </div>

                {/* 导航控制 */}
                <div className="analysis-navigation">
                  <div className="nav-controls">
                    <button
                      className="nav-btn"
                      onClick={goToStart}
                      title="跳到开始"
                    >
                      ⏮
                    </button>
                    <button
                      className="nav-btn"
                      onClick={previousMove}
                      disabled={review.currentMoveIndex < 0}
                      title="上一步"
                    >
                      ◀
                    </button>
                    <button
                      className="nav-btn"
                      onClick={nextMove}
                      disabled={review.currentMoveIndex >= analyzedMoves.length - 1}
                      title="下一步"
                    >
                      ▶
                    </button>
                    <button
                      className="nav-btn"
                      onClick={goToEnd}
                      title="跳到结束"
                    >
                      ⏭
                    </button>
                  </div>

                  {/* 模式选择 */}
                  <div className="review-modes">
                    <button
                      className={`mode-btn ${review.reviewMode === 'move_by_move' ? 'active' : ''}`}
                      onClick={() => setReviewMode('move_by_move')}
                    >
                      逐步
                    </button>
                    <button
                      className={`mode-btn ${review.reviewMode === 'mistakes_only' ? 'active' : ''}`}
                      onClick={() => setReviewMode('mistakes_only')}
                    >
                      错误
                    </button>
                    <button
                      className={`mode-btn ${review.reviewMode === 'critical_only' ? 'active' : ''}`}
                      onClick={() => setReviewMode('critical_only')}
                    >
                      关键
                    </button>
                  </div>

                  {/* 方向切换 */}
                  <button
                    className="orientation-btn"
                    onClick={() => setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white')}
                  >
                    {boardOrientation === 'white' ? '⚪' : '⚫'}
                  </button>
                </div>
              </div>

              {/* 走法分析面板 */}
              <div className="analysis-panel-section">
                <MoveAnalysisPanel
                  analyzedMove={currentAnalyzedMove}
                  moveIndex={review.currentMoveIndex}
                  totalMoves={analyzedMoves.length}
                />

                {/* 走法列表 */}
                <div className="moves-list-in-analysis">
                  <h4 className="list-title">走法列表</h4>
                  <div className="moves-grid">
                    {analyzedMoves.map((move, index) => {
                      const isSelected = index === review.currentMoveIndex;
                      const qualityColors: Record<string, string> = {
                        best: '#22c55e',
                        great: '#3b82f6',
                        good: '#6c757d',
                        book: '#8b5cf6',
                        inaccuracy: '#f59e0b',
                        mistake: '#f97316',
                        blunder: '#ef4444',
                      };

                      return (
                        <button
                          key={index}
                          className={`move-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleGoToMove(index)}
                          style={{
                            borderLeftColor: qualityColors[move.quality],
                          }}
                        >
                          <span className="move-number-text">{Math.floor(index / 2) + 1}.</span>
                          <span className="move-san-text">{move.move.san}</span>
                          {move.isCritical && <span className="critical-star">⚡</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* 分析报告 */
            <div className="analysis-report-section">
              {currentReport && (
                <GameReportCard
                  report={currentReport}
                  onExport={exportReport}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* 空状态 */}
      {!selectedGameId && (
        <div className="empty-analysis-state">
          <div className="empty-icon">📊</div>
          <h3>选择一个对局开始分析</h3>
          <p>从您的对局历史中选择一个对局，AI将为您生成详细的分析报告</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;
