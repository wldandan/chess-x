// AI风格训练主页面
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
  useGameStore,
  useCurrentGame,
  useAITrainingState,
  useGameStatus,
  useAIState,
} from '../stores/game.store';
import AIThinkingIndicator from '../components/ai/AIThinkingIndicator';
import { StyleBehaviorIndicator } from '../components/ai/StyleBehaviorIndicator';
import { TrainingProgressDashboard } from '../components/ai/TrainingProgressDashboard';
import type { GamePhase, ThinkingState } from '../types/chess.types';
import '../styles/pages.css';

interface TrainingStats {
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  currentElo: number;
  eloHistory: Array<{ elo: number; date: string }>;
  styleAdaptation: Record<string, number>;
  weaknesses: Array<{ area: string; count: number; improvement: number }>;
}

const AITrainingPage: React.FC = () => {
  const navigate = useNavigate();

  // Store state
  const currentGame = useCurrentGame();
  const { currentPlayerProfile, trainingSession, trainingProgress, adaptiveDifficulty } =
    useAITrainingState();
  const gameStatus = useGameStatus();
  const { thinking: aiThinking } = useAIState();
  const {
    startGame,
    makeMove,
    resign,
    endTrainingSession,
    loading,
    error,
  } = useGameStore();

  // Local state
  const [game, setGame] = useState<Chess>(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState<GamePhase>('opening');
  const [lastMove, setLastMove] = useState<string>('-');

  // Calculate training stats for dashboard
  const trainingStats: TrainingStats = useMemo(() => {
    return {
      gamesPlayed: trainingProgress?.gamesPlayed || 0,
      wins: trainingProgress?.gamesWon || 0,
      draws: trainingProgress?.gamesDrawn || 0,
      losses: trainingProgress?.gamesLost || 0,
      currentElo: adaptiveDifficulty.baseElo,
      eloHistory: [
        {
          elo: adaptiveDifficulty.baseElo,
          date: new Date().toISOString(),
        },
      ],
      styleAdaptation: trainingProgress?.styleAdaptation || {},
      weaknesses: (trainingProgress?.weaknesses || []).map(w => ({
        area: w.type,
        count: w.count,
        improvement: 0,
      })),
    };
  }, [trainingProgress, adaptiveDifficulty]);

  // Update game phase based on move count
  useEffect(() => {
    if (moveHistory.length < 10) {
      setGamePhase('opening');
    } else if (moveHistory.length < 30) {
      setGamePhase('middlegame');
    } else {
      setGamePhase('endgame');
    }
  }, [moveHistory.length]);

  // Sync game with currentGame from store
  useEffect(() => {
    if (currentGame) {
      const newGame = new Chess(currentGame.fen);
      setGame(newGame);
      setMoveHistory(currentGame.moves.map(m => m.san));
      if (currentGame.moves.length > 0) {
        setLastMove(currentGame.moves[currentGame.moves.length - 1].san);
      }
    }
  }, [currentGame]);

  // Handle piece drop
  const onPieceDrop = async (fromSquare: string, toSquare: string): Promise<boolean> => {
    if (gameStatus !== 'playing') {
      return false;
    }

    try {
      const move = game.move({
        from: fromSquare,
        to: toSquare,
        promotion: 'q',
      });

      if (move) {
        setLastMove(move.san);
        await makeMove(move.san);
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }

    return false;
  };

  // Handle start game
  const handleStartGame = async () => {
    if (!currentPlayerProfile) {
      return;
    }

    await startGame({
      whitePlayer: {
        name: 'You',
        type: 'human',
        rating: adaptiveDifficulty.baseElo,
      },
      blackPlayer: {
        name: currentPlayerProfile.displayName,
        type: 'ai',
        rating: currentPlayerProfile.elo,
        style: currentPlayerProfile.style,
      },
      timeControl: {
        baseMinutes: 10,
        incrementSeconds: 0,
        type: 'suddenDeath',
        totalTime: 600000,
      },
    });
  };

  // Handle resign
  const handleResign = async () => {
    await resign();
  };

  // Handle end training session
  const handleEndTraining = async () => {
    endTrainingSession();
    navigate('/ai-training/report');
  };

  // Handle navigate to setup
  const handleNavigateToSetup = () => {
    navigate('/training-setup');
  };

  // Get game status message
  const getGameStatusMessage = () => {
    if (!currentGame) return '';

    switch (currentGame.status) {
      case 'finished':
        if (currentGame.result === 'white_wins') return '白方获胜';
        if (currentGame.result === 'black_wins') return '黑方获胜';
        if (currentGame.resultReason === 'checkmate') return '将杀';
        if (currentGame.resultReason === 'stalemate') return '逼和';
        return '和棋';
      case 'in_progress':
        if (currentGame.inCheck) return '将军';
        return game.turn() === 'w' ? '白方走棋' : '黑方走棋';
      default:
        return '';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="page-container" role="main" aria-label="AI训练页面">
        <div className="loading-container">
          <div className="spinner" aria-hidden="true"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container" role="main" aria-label="AI训练页面">
        <div className="error-container">
          <h2>错误</h2>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
            aria-label="重新加载页面"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // No player profile selected
  if (!currentPlayerProfile) {
    return (
      <div className="page-container" role="main" aria-label="AI训练页面">
        <div className="page-header">
          <button
            className="btn btn-outline"
            onClick={handleNavigateToSetup}
            aria-label="返回设置页面"
          >
            返回
          </button>
          <h1 className="page-title">AI风格训练</h1>
        </div>

        <div className="training-placeholder">
          <h2>请先选择AI对手</h2>
          <p>前往训练设置页面选择AI棋手配置</p>
          <button
            className="btn btn-primary"
            onClick={handleNavigateToSetup}
            aria-label="前往设置页面"
          >
            前往设置
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container ai-training-page" role="main" aria-label="AI训练页面">
      <div className="page-header">
        <button
          className="btn btn-outline"
          onClick={handleNavigateToSetup}
          aria-label="返回设置页面"
        >
          返回
        </button>
        <h1 className="page-title">AI风格训练</h1>
        <div className="header-actions">
          {gameStatus === 'playing' && (
            <button
              className="btn btn-secondary"
              onClick={handleResign}
              aria-label="认输"
            >
              认输
            </button>
          )}
          {gameStatus === 'finished' && (
            <button
              className="btn btn-primary"
              onClick={handleEndTraining}
              aria-label="结束训练并查看报告"
            >
              结束训练
            </button>
          )}
        </div>
      </div>

      <div className="ai-training-content">
        {/* Sidebar - Training Progress */}
        <aside className="training-sidebar" role="complementary" aria-label="训练进度">
          <div className="sidebar-section">
            <h2>AI对手信息</h2>
            <div className="opponent-info">
              <div className="opponent-icon" aria-hidden="true">
                {currentPlayerProfile.icon}
              </div>
              <div className="opponent-details">
                <h3 className="opponent-name">{currentPlayerProfile.displayName}</h3>
                <p className="opponent-description">{currentPlayerProfile.description}</p>
                <div className="opponent-stats">
                  <span className="opponent-elo">ELO: {currentPlayerProfile.elo}</span>
                  <span className="opponent-style">
                    风格: {currentPlayerProfile.style}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <TrainingProgressDashboard stats={trainingStats} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="training-main">
          {/* Game Status Bar */}
          <div className="game-status-bar" role="status" aria-live="polite">
            <div className="status-info">
              <span className="status-label">状态:</span>
              <span className="status-value">{getGameStatusMessage()}</span>
            </div>
            {gameStatus === 'playing' && (
              <div className="turn-indicator">
                <span className="turn-label">轮到:</span>
                <span className="turn-value">
                  {game.turn() === 'w' ? '白方' : '黑方'}
                </span>
              </div>
            )}
          </div>

          {/* AI Thinking Indicator */}
          {aiThinking && aiThinking.isThinking && (
            <AIThinkingIndicator thinking={aiThinking as ThinkingState} />
          )}

          {/* Chess Board */}
          <div className="training-board-container">
            <Chessboard
              id="ai-training-board"
              position={game.fen()}
              onPieceDrop={onPieceDrop}
              boardWidth={560}
              customBoardStyle={{
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
              customDarkSquareStyle={{ backgroundColor: '#b58863' }}
              customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
              arePiecesDraggable={gameStatus === 'playing'}
            />
          </div>

          {/* Style Behavior Indicator */}
          {currentPlayerProfile && gameStatus === 'playing' && (
            <div className="style-behavior-section">
              <StyleBehaviorIndicator
                style={currentPlayerProfile.style}
                phase={gamePhase}
                lastMove={lastMove}
              />
            </div>
          )}

          {/* Game Controls */}
          <div className="game-controls">
            {gameStatus === 'idle' && !currentGame && (
              <button
                className="btn btn-primary btn-large"
                onClick={handleStartGame}
                aria-label="开始训练游戏"
              >
                开始训练
              </button>
            )}

            {gameStatus === 'finished' && currentGame && (
              <div className="game-result">
                <h3>游戏结束</h3>
                <p>{getGameStatusMessage()}</p>
                <div className="result-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleStartGame}
                    aria-label="再来一局"
                  >
                    再来一局
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleEndTraining}
                    aria-label="结束训练"
                  >
                    结束训练
                  </button>
                </div>
              </div>
            )}

            {/* Move History */}
            {moveHistory.length > 0 && (
              <div className="move-history-section">
                <h3>走棋记录</h3>
                <div className="move-list">
                  {moveHistory.map((move, index) => (
                    <span key={index} className="move-item">
                      {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'} {move}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AITrainingPage;
