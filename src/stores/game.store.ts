// 对局状态管理Store
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Chess } from 'chess.js';
import type {
  GameStoreState,
  GameStoreActions,
} from '../types/store.types';
import type { GameConfig, ChessGame, GameFilter } from '../types/game.types';
import type { ChessMove } from '../types/chess.types';

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

        // 对局操作
        startGame: async (config: GameConfig) => {
          set({ loading: true, error: null });

          try {
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
                result: '*', // 进行中
              },
              fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              pgn: '',
              moves: [],
              positionEvaluations: [],
              status: 'starting',
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

            // 如果是AI对局，开始AI思考
            if (config.blackPlayer.type === 'ai') {
              // 延迟执行AI思考
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
            } else if (updatedGame.currentTurn === 'black' &&
                      currentGame.config.blackPlayer.type === 'ai') {
              // AI回合
              setTimeout(() => {
                get().processAIMove();
              }, 500);
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
            // 这里应该集成Stockfish分析
            console.log(`Analyzing game: ${gameId}`);

            // 模拟分析过程
            await new Promise(resolve => setTimeout(resolve, 1000));

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

        // 辅助方法
        processAIMove: () => {
          const { currentGame } = get();
          if (!currentGame || currentGame.config.blackPlayer.type !== 'ai') {
            return;
          }

          // 简单AI：随机走子
          const chess = new Chess(currentGame.fen);
          const moves = chess.moves();

          if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            get().makeMove(randomMove);
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
      }),
      {
        name: 'chess-game-store',
        version: 1,
        // 只持久化部分状态
        partialize: (state) => ({
          gameHistory: state.gameHistory,
          gameFilter: state.gameFilter,
          totalGames: state.totalGames,
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