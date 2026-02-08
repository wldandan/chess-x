// 对局状态管理Store
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Chess } from 'chess.js';
import type {
  GameStoreState,
  GameStoreActions,
} from '../types/store.types';
import type { GameConfig, ChessGame, GameFilter } from '../types/game.types';
import type {
  AIPlayerProfile,
  TrainingSessionConfig,
  TrainingProgress,
  AdaptiveDifficultyConfig
} from '../types/chess.types';
import { getAIEngine, disposeAIEngine, type DifficultyLevel, type ThinkingState } from '../services/ai/ChessAIEngine';
import { playerProfiles as defaultPlayerProfiles } from '../data/playerProfiles';

// 初始状态
const initialState: GameStoreState = {
  // 基础状态
  loading: false,
  error: null,
  lastUpdated: null,

  // 当前对局
  currentGame: null,
  isPlaying: false,
  gameStatus: 'idle',

  // 对局历史
  gameHistory: [],
  selectedGame: null,

  // 过滤和分页
  gameFilter: {
    limit: 20,
    offset: 0,
    sortBy: 'date',
    sortOrder: 'desc',
  },
  totalGames: 0,

  // AI 对战状态
  aiDifficulty: 'medium' as DifficultyLevel,
  aiThinking: null as ThinkingState | null,
  aiEngineReady: false,

  // AI风格训练状态
  currentPlayerProfile: null as AIPlayerProfile | null,
  trainingSession: null as TrainingSessionConfig | null,
  trainingProgress: null as TrainingProgress | null,
  playerProfiles: [] as AIPlayerProfile[],
  adaptiveDifficulty: {
    baseElo: 1200,
    adjustmentRate: 0.3,
    minElo: 800,
    maxElo: 2800,
    performanceThresholds: {
      win: 0.4,
      draw: 0.3,
      loss: 0.6
    },
    consistencyThreshold: 0.7
  } as AdaptiveDifficultyConfig,

  // 操作状态
  isAnalyzing: false,
  isExporting: false,
};

// 创建Game Store
export const useGameStore = create<GameStoreState & GameStoreActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // 初始化AI引擎
        initializeAI: async () => {
          try {
            const engine = getAIEngine();
            await engine.initialize();
            set({ aiEngineReady: true });
          } catch (error) {
            console.error('Failed to initialize AI engine:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to initialize AI engine'
            });
          }
        },

        // 设置AI难度
        setAIDifficulty: (difficulty: DifficultyLevel) => {
          const engine = getAIEngine();
          engine.setDifficulty(difficulty);
          set({ aiDifficulty: difficulty });
        },

        // 对局操作
        startGame: async (config: GameConfig) => {
          set({ loading: true, error: null });

          try {
            // 确保AI引擎已初始化
            if ((config.whitePlayer.type === 'ai' || config.blackPlayer.type === 'ai') && !get().aiEngineReady) {
              await get().initializeAI();
            }

            // 创建新对局
            const newGame: ChessGame = {
              id: `game_${Date.now()}`,
              config,
              metadata: {
                event: 'Training Game',
                site: 'Aaron Chess',
                date: new Date().toISOString().split('T')[0],
                white: config.whitePlayer.name,
                black: config.blackPlayer.name,
                result: '*',
              },
              fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              pgn: '',
              moves: [],
              positionEvaluations: [],
              status: 'in_progress',
              currentTurn: 'white',
              moveNumber: 1,
              startTime: new Date(),
              timeUsed: { white: 0, black: 0 },
              inCheck: false,
              checkmate: false,
              stalemate: false,
              repetition: false,
              insufficientMaterial: false,
              takebacks: [],
              tags: ['training'],
            };

            set({
              currentGame: newGame,
              isPlaying: true,
              gameStatus: 'playing',
              loading: false,
              lastUpdated: new Date(),
            });

            // 如果是AI先行，开始AI思考
            if (config.whitePlayer.type === 'ai') {
              setTimeout(() => {
                get().processAIMove();
              }, 500);
            }
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to start game',
            });
          }
        },

        makeMove: async (move: string): Promise<boolean> => {
          const { currentGame } = get();
          if (!currentGame || currentGame.status !== 'in_progress') {
            return false;
          }

          set({ loading: true });

          try {
            // 验证并执行走子
            const chess = new Chess(currentGame.fen);
            const result = chess.move(move);

            if (!result) {
              throw new Error('Invalid move');
            }

            // 更新对局状态
            const updatedGame: ChessGame = {
              ...currentGame,
              fen: chess.fen(),
              pgn: chess.pgn(),
              moves: [
                ...currentGame.moves,
                {
                  from: result.from as any,
                  to: result.to as any,
                  promotion: result.promotion as any,
                  san: result.san,
                },
              ],
              moveNumber: currentGame.moveNumber + 1,
              currentTurn: currentGame.currentTurn === 'white' ? 'black' : 'white',
              inCheck: chess.inCheck(),
              checkmate: chess.isCheckmate(),
              stalemate: chess.isStalemate(),
            };

            set({
              currentGame: updatedGame,
              loading: false,
              lastUpdated: new Date(),
            });

            // 检查游戏是否结束
            if (chess.isGameOver()) {
              get().endGame(updatedGame);
            } else {
              // 检查是否需要AI走子
              const nextPlayer = updatedGame.currentTurn === 'white' ? updatedGame.config.whitePlayer : updatedGame.config.blackPlayer;
              if (nextPlayer.type === 'ai') {
                setTimeout(() => {
                  get().processAIMove();
                }, 500);
              }
            }

            return true;
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Invalid move',
            });
            return false;
          }
        },

        // 处理AI走子
        processAIMove: async () => {
          const { currentGame, aiDifficulty } = get();
          if (!currentGame || currentGame.status !== 'in_progress') {
            return;
          }

          // 确定当前是哪方AI
          const currentTurn = currentGame.currentTurn;
          const playerConfig = currentTurn === 'white' ? currentGame.config.whitePlayer : currentGame.config.blackPlayer;

          if (playerConfig.type !== 'ai') {
            return;
          }

          try {
            set({ aiThinking: { isThinking: true, depth: 0, evaluation: 0, currentMove: '' } });

            const engine = getAIEngine();
            engine.setDifficulty(aiDifficulty);

            // 获取AI最佳走法
            const analysis = await engine.getBestMove(currentGame.fen, { difficulty: aiDifficulty });

            // 设置思考回调（可选，用于实时更新）
            engine.setThinkingCallback((state: ThinkingState) => {
              set({ aiThinking: state });
            });

            // 执行AI走子
            const success = await get().makeMove(analysis.bestMove);

            set({ aiThinking: null });

            if (!success) {
              throw new Error('AI failed to make move');
            }
          } catch (error) {
            console.error('AI move error:', error);
            set({
              error: error instanceof Error ? error.message : 'AI failed to make move',
              aiThinking: null,
            });
          }
        },

        resign: async () => {
          const { currentGame } = get();
          if (!currentGame) return;

          const winner = currentGame.currentTurn === 'white' ? 'black' : 'white';
          const updatedGame: ChessGame = {
            ...currentGame,
            status: 'finished',
            result: winner === 'white' ? 'white_wins' : 'black_wins',
            resultReason: 'resignation',
            winner,
            endTime: new Date(),
          };

          set({
            currentGame: updatedGame,
            isPlaying: false,
            gameStatus: 'finished',
          });

          get().saveGame(updatedGame);
        },

        offerDraw: async () => {
          const { currentGame } = get();
          if (!currentGame) return;

          set({
            currentGame: {
              ...currentGame,
              drawOffered: currentGame.currentTurn,
            },
          });
        },

        requestTakeback: async () => {
          const { currentGame } = get();
          if (!currentGame || currentGame.moves.length === 0) return;

          // 简单实现：退回一步
          const chess = new Chess();
          const moves = currentGame.moves.slice(0, -1);

          moves.forEach(move => {
            chess.move(move.san);
          });

          const updatedGame: ChessGame = {
            ...currentGame,
            fen: chess.fen(),
            pgn: chess.pgn(),
            moves,
            moveNumber: currentGame.moveNumber - 1,
            currentTurn: currentGame.currentTurn === 'white' ? 'black' : 'white',
            takebacks: [
              ...currentGame.takebacks,
              {
                moveNumber: currentGame.moveNumber,
                player: currentGame.currentTurn === 'white' ? 'black' : 'white',
                timestamp: new Date(),
                reason: 'player_request',
              },
            ],
          };

          set({ currentGame: updatedGame });
        },

        // 对局管理
        loadGame: async (gameId: string) => {
          set({ loading: true, error: null });

          try {
            // 从本地存储加载对局
            const games = get().gameHistory;
            const game = games.find(g => g.id === gameId);

            if (game) {
              set({
                selectedGame: game,
                loading: false,
                lastUpdated: new Date(),
              });
            } else {
              throw new Error('Game not found');
            }
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load game',
            });
          }
        },

        saveGame: async (game: ChessGame) => {
          set({ loading: true });

          try {
            const { gameHistory } = get();
            const existingIndex = gameHistory.findIndex(g => g.id === game.id);

            let updatedHistory: ChessGame[];
            if (existingIndex >= 0) {
              updatedHistory = [...gameHistory];
              updatedHistory[existingIndex] = game;
            } else {
              updatedHistory = [game, ...gameHistory];
            }

            set({
              gameHistory: updatedHistory,
              totalGames: updatedHistory.length,
              loading: false,
              lastUpdated: new Date(),
            });
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to save game',
            });
          }
        },

        deleteGame: async (gameId: string) => {
          set({ loading: true });

          try {
            const { gameHistory, selectedGame } = get();
            const updatedHistory = gameHistory.filter(g => g.id !== gameId);

            set({
              gameHistory: updatedHistory,
              totalGames: updatedHistory.length,
              selectedGame: selectedGame?.id === gameId ? null : selectedGame,
              loading: false,
              lastUpdated: new Date(),
            });
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to delete game',
            });
          }
        },

        // 分析操作
        analyzeGame: async (gameId: string) => {
          set({ isAnalyzing: true, error: null });

          try {
            // 使用Stockfish分析对局
            const { gameHistory } = get();
            const game = gameHistory.find(g => g.id === gameId);

            if (!game) {
              throw new Error('Game not found');
            }

            const engine = getAIEngine();

            // 分析每个关键局面
            const chess = new Chess();
            const analyses: any[] = [];

            for (const move of game.moves) {
              chess.move(move.san);
              const analysis = await engine.getBestMove(chess.fen(), { depth: 10 });
              analyses.push({
                moveNumber: analyses.length + 1,
                move: move.san,
                fen: chess.fen(),
                evaluation: analysis.evaluation,
                bestMove: analysis.bestMove,
                pv: analysis.pv,
              });
            }

            // 更新游戏的分析结果
            const updatedGame = {
              ...game,
              positionEvaluations: analyses,
            };

            // 保存更新后的游戏
            await get().saveGame(updatedGame);

            set({ isAnalyzing: false, lastUpdated: new Date() });
          } catch (error) {
            set({
              isAnalyzing: false,
              error: error instanceof Error ? error.message : 'Failed to analyze game',
            });
          }
        },

        exportGame: async (gameId: string, format: string) => {
          set({ isExporting: true, error: null });

          try {
            const { gameHistory } = get();
            const game = gameHistory.find(g => g.id === gameId);

            if (!game) {
              throw new Error('Game not found');
            }

            let exportData: string;
            if (format === 'pgn') {
              exportData = game.pgn;
            } else if (format === 'json') {
              exportData = JSON.stringify(game, null, 2);
            } else {
              throw new Error(`Unsupported format: ${format}`);
            }

            // 创建下载链接
            const blob = new Blob([exportData], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chess_game_${gameId}.${format}`;
            a.click();
            URL.revokeObjectURL(url);

            set({ isExporting: false, lastUpdated: new Date() });
          } catch (error) {
            set({
              isExporting: false,
              error: error instanceof Error ? error.message : 'Failed to export game',
            });
          }
        },

        // 过滤和搜索
        setGameFilter: (filter: GameFilter) => {
          set({
            gameFilter: { ...get().gameFilter, ...filter },
          });
        },

        loadMoreGames: async () => {
          const { gameFilter } = get();
          set({ loading: true });

          try {
            // 这里应该从API或本地存储加载更多对局
            const newFilter = {
              ...gameFilter,
              offset: gameFilter.offset! + gameFilter.limit!,
            };

            set({
              gameFilter: newFilter,
              loading: false,
              lastUpdated: new Date(),
            });
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load more games',
            });
          }
        },

        endGame: (game: ChessGame) => {
          const chess = new Chess(game.fen);
          let result: ChessGame['result'];
          let resultReason: string;

          if (chess.isCheckmate()) {
            result = game.currentTurn === 'white' ? 'black_wins' : 'white_wins';
            resultReason = 'checkmate';
          } else if (chess.isStalemate()) {
            result = 'draw';
            resultReason = 'stalemate';
          } else if (chess.isDraw()) {
            result = 'draw';
            resultReason = 'draw';
          } else {
            result = 'draw';
            resultReason = 'unknown';
          }

          const finishedGame: ChessGame = {
            ...game,
            status: 'finished',
            result,
            resultReason,
            winner: result === 'white_wins' ? 'white' : result === 'black_wins' ? 'black' : undefined,
            endTime: new Date(),
          };

          set({
            currentGame: finishedGame,
            isPlaying: false,
            gameStatus: 'finished',
          });

          get().saveGame(finishedGame);
        },

        // ======================
        // AI风格训练操作
        // ======================

        // 选择棋手配置
        selectPlayerProfile: (profileId: string) => {
          const profile = defaultPlayerProfiles.find(p => p.id === profileId);
          if (profile) {
            set({
              currentPlayerProfile: profile,
              adaptiveDifficulty: {
                ...get().adaptiveDifficulty,
                baseElo: Math.min(Math.max(profile.difficultyRange[0], 1200), profile.difficultyRange[1])
              }
            });
          }
        },

        // 开始训练会话
        startTrainingSession: (config: TrainingSessionConfig) => {
          const { currentPlayerProfile, adaptiveDifficulty } = get();

          if (!currentPlayerProfile) {
            throw new Error('请先选择棋手配置');
          }

          const sessionConfig: TrainingSessionConfig = {
            ...config,
            startedAt: new Date()
          };

          const initialProgress: TrainingProgress = {
            sessionId: `session_${Date.now()}`,
            playerProfileId: currentPlayerProfile.id,
            gamesPlayed: 0,
            gamesWon: 0,
            gamesDrawn: 0,
            gamesLost: 0,
            averageMoves: 0,
            averageTime: 0,
            styleAdaptationScore: 50, // 初始50分
            eloChange: 0,
            weaknesses: [],
            strengths: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };

          set({
            trainingSession: sessionConfig,
            trainingProgress: initialProgress,
            adaptiveDifficulty: {
              ...adaptiveDifficulty,
              baseElo: config.targetElo || adaptiveDifficulty.baseElo
            }
          });
        },

        // 结束训练会话
        endTrainingSession: () => {
          const { trainingSession, trainingProgress } = get();

          if (trainingSession && trainingProgress) {
            const completedSession = {
              ...trainingSession,
              completedAt: new Date()
            };

            // 保存训练进度
            get().saveTrainingProgress();

            set({
              trainingSession: completedSession,
              trainingProgress: null
            });
          }
        },

        // 更新自适应难度
        updateAdaptiveDifficulty: (performance: 'win' | 'draw' | 'loss', gameQuality: number = 0.5) => {
          const { adaptiveDifficulty, trainingProgress } = get();

          // 基础调整值
          const baseAdjustments = {
            win: -50,   // 赢了降低难度
            draw: 0,    // 平局保持
            loss: 50    // 输了提高难度
          };

          // 根据对局质量调整
          const qualityMultiplier = 1 + (gameQuality - 0.5) * 0.5; // 0.75-1.25
          const adjustment = Math.round(baseAdjustments[performance] * qualityMultiplier * adaptiveDifficulty.adjustmentRate);

          const newElo = Math.max(
            adaptiveDifficulty.minElo,
            Math.min(
              adaptiveDifficulty.maxElo,
              adaptiveDifficulty.baseElo + adjustment
            )
          );

          // 更新训练进度
          if (trainingProgress) {
            const updatedProgress: TrainingProgress = {
              ...trainingProgress,
              eloChange: newElo - adaptiveDifficulty.baseElo,
              updatedAt: new Date()
            };

            set({
              adaptiveDifficulty: {
                ...adaptiveDifficulty,
                baseElo: newElo
              },
              trainingProgress: updatedProgress
            });
          } else {
            set({
              adaptiveDifficulty: {
                ...adaptiveDifficulty,
                baseElo: newElo
              }
            });
          }
        },

        // 保存训练进度
        saveTrainingProgress: async () => {
          const { trainingProgress } = get();

          if (!trainingProgress) {
            return;
          }

          set({ loading: true });

          try {
            // TODO: 这里应该保存到后端API
            // 目前先保存到localStorage
            const savedProgress = localStorage.getItem('chess_training_progress');
            const progressList = savedProgress ? JSON.parse(savedProgress) : [];

            progressList.push({
              ...trainingProgress,
              savedAt: new Date()
            });

            localStorage.setItem('chess_training_progress', JSON.stringify(progressList));

            set({
              loading: false,
              lastUpdated: new Date()
            });
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to save training progress'
            });
          }
        },

        // 加载棋手配置
        loadPlayerProfiles: async () => {
          set({ loading: true });

          try {
            // 使用默认配置，未来可以从API加载
            set({
              playerProfiles: defaultPlayerProfiles,
              loading: false,
              lastUpdated: new Date()
            });
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load player profiles'
            });
          }
        },

        // 切换到下一个风格（混合模式）
        switchToNextStyle: () => {
          const { currentPlayerProfile, playerProfiles } = get();

          if (playerProfiles.length === 0) {
            return;
          }

          // 过滤出与当前不同的配置
          const availableProfiles = playerProfiles.filter(
            p => p.id !== currentPlayerProfile?.id
          );

          if (availableProfiles.length === 0) {
            // 如果只有一个配置，保持当前配置
            return;
          }

          // 随机选择一个不同的配置
          const nextProfile = availableProfiles[Math.floor(Math.random() * availableProfiles.length)];

          set({
            currentPlayerProfile: nextProfile
          });
        },

        // 清理AI引擎
        cleanupAI: () => {
          disposeAIEngine();
          set({ aiEngineReady: false, aiThinking: null });
        },
      }),
      {
        name: 'chess-game-store',
        version: 1,
        // 只持久化部分状态
        partialize: (state) => ({
          gameHistory: state.gameHistory,
          gameFilter: state.gameFilter,
          totalGames: state.totalGames,
          aiDifficulty: state.aiDifficulty,
          currentPlayerProfile: state.currentPlayerProfile,
          trainingSession: state.trainingSession,
          trainingProgress: state.trainingProgress,
          playerProfiles: state.playerProfiles,
          adaptiveDifficulty: state.adaptiveDifficulty,
        }),
      }
    ),
    {
      name: 'GameStore',
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
);

// 选择器Hooks
export const useCurrentGame = () => useGameStore((state) => state.currentGame);
export const useGameHistory = () => useGameStore((state) => state.gameHistory);
export const useGameStatus = () => useGameStore((state) => state.gameStatus);
export const useIsPlaying = () => useGameStore((state) => state.isPlaying);
export const useGameLoading = () => useGameStore((state) => state.loading);
export const useGameError = () => useGameStore((state) => state.error);
export const useAIState = () => useGameStore((state) => ({
  difficulty: state.aiDifficulty,
  thinking: state.aiThinking,
  isReady: state.aiEngineReady,
}));

// AI风格训练选择器Hooks
export const useAITrainingState = () => useGameStore((state) => ({
  currentPlayerProfile: state.currentPlayerProfile,
  trainingSession: state.trainingSession,
  trainingProgress: state.trainingProgress,
  playerProfiles: state.playerProfiles,
  adaptiveDifficulty: state.adaptiveDifficulty,
}));

export const useCurrentPlayerProfile = () => useGameStore((state) => state.currentPlayerProfile);
export const useTrainingSession = () => useGameStore((state) => state.trainingSession);
export const useTrainingProgress = () => useGameStore((state) => state.trainingProgress);
export const usePlayerProfiles = () => useGameStore((state) => state.playerProfiles);
export const useAdaptiveDifficulty = () => useGameStore((state) => state.adaptiveDifficulty);
