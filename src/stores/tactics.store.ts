// 战术训练状态管理Store
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Chess } from 'chess.js';
import type {
  TrainingSession,
  TacticPuzzle,
  TacticMove,
  UserTacticStats,
  AdaptiveLearningParams,
  TrainingResult,
  TacticType,
  TacticDifficulty,
  TacticStatus,
} from '../types/tactics.types';
import type { Square } from '../types/chess.types';

// 战术训练状态接口
interface TacticsState {
  // 当前会话
  currentSession: TrainingSession | null;

  // 用户统计
  userStats: UserTacticStats;

  // 自适应学习参数
  adaptiveParams: AdaptiveLearningParams;

  // 题目库
  puzzleDatabase: TacticPuzzle[];

  // 状态
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// 战术训练操作接口
interface TacticsActions {
  // 会话管理
  startSession: (config: {
    tacticTypes?: TacticType[];
    difficulty?: TacticDifficulty;
    adaptiveMode?: boolean;
    puzzleCount?: number;
  }) => Promise<void>;

  endSession: () => TrainingResult | null;
  abandonSession: () => void;

  // 题目操作
  loadPuzzle: (puzzleId: string) => Promise<void>;
  makeMove: (move: TacticMove) => Promise<boolean>;
  undoMove: () => void;
  resetPuzzle: () => void;

  // 提示
  getHint: () => string | null;
  skipPuzzle: () => void;
  showSolution: () => TacticMove[];

  // 自适应调整
  adjustDifficulty: () => void;
  updateStats: (solved: boolean, timeTaken: number, hintsUsed: number) => void;

  // 辅助方法
  getProgress: () => { current: number; total: number };
  getSessionSummary: () => TrainingResult | null;
}

// 初始化用户统计
const initialUserStats: UserTacticStats = {
  totalPuzzles: 0,
  puzzlesSolved: 0,
  solveRate: 0,
  statsByType: {} as Record<TacticType, any>,
  statsByDifficulty: {} as Record<TacticDifficulty, any>,
  currentLevel: 1,
  experiencePoints: 0,
  weakTypes: [],
  strongTypes: [],
  currentStreak: 0,
  bestStreak: 0,
  recentAttempts: [],
};

// 初始化自适应参数
const initialAdaptiveParams: AdaptiveLearningParams = {
  baseDifficulty: 2,
  currentDifficulty: 2,
  minDifficulty: 1,
  maxDifficulty: 5,
  correctThreshold: 3,
  wrongThreshold: 2,
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  weakTypeMultiplier: 2,
};

// 创建Tactics Store
export const useTacticsStore = create<TacticsState & TacticsActions>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        currentSession: null,
        userStats: initialUserStats,
        adaptiveParams: initialAdaptiveParams,
        puzzleDatabase: [],
        loading: false,
        error: null,
        lastUpdated: null,

        // 开始训练会话
        startSession: async (config) => {
          set({ loading: true, error: null });

          try {
            // 导入战术引擎
            const { TacticsEngine } = await import('../services/tactics/TacticsEngine');
            const engine = new TacticsEngine();

            // 获取题目库
            const puzzles = engine.getPuzzles({
              types: config.tacticTypes,
              difficulty: config.difficulty,
              count: config.puzzleCount || 10,
            });

            // 获取第一个题目
            const firstPuzzle = puzzles.length > 0 ? puzzles[0] : null;

            const newSession: TrainingSession = {
              id: `session_${Date.now()}`,
              startTime: new Date(),
              currentPuzzle: firstPuzzle,
              currentMoveIndex: 0,
              userMoves: [],
              status: firstPuzzle ? 'in_progress' : 'not_started',
              tacticTypes: config.tacticTypes || Object.keys(engine.getAllPuzzles()),
              difficulty: config.difficulty || 2,
              puzzlesCompleted: 0,
              puzzlesSolved: 0,
              puzzlesFailed: 0,
              correctMoves: 0,
              wrongMoves: 0,
              hintsUsed: 0,
              totalTime: 0,
              history: [],
            };

            set({
              currentSession: newSession,
              puzzleDatabase: puzzles,
              loading: false,
              lastUpdated: new Date(),
            });
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to start session',
            });
          }
        },

        // 结束会话
        endSession: () => {
          const { currentSession } = get();
          if (!currentSession) return null;

          const endTime = new Date();
          const duration = endTime.getTime() - currentSession.startTime.getTime();

          const result: TrainingResult = {
            sessionId: currentSession.id,
            duration,
            puzzlesCompleted: currentSession.puzzlesCompleted,
            puzzlesSolved: currentSession.puzzlesSolved,
            solveRate: currentSession.puzzlesCompleted > 0
              ? currentSession.puzzlesSolved / currentSession.puzzlesCompleted
              : 0,
            correctMoves: currentSession.correctMoves,
            wrongMoves: currentSession.wrongMoves,
            hintsUsed: currentSession.hintsUsed,
            experienceGained: currentSession.puzzlesSolved * 10,
            levelUp: false,
            improvements: {
              improvedTypes: [],
              weakenedTypes: [],
            },
          };

          // 检查是否升级
          const newXP = get().userStats.experiencePoints + result.experienceGained;
          const xpForNextLevel = get().userStats.currentLevel * 100;
          if (newXP >= xpForNextLevel) {
            result.levelUp = true;
            result.newLevel = get().userStats.currentLevel + 1;
          }

          // 更新用户统计
          set({
            userStats: {
              ...get().userStats,
              totalPuzzles: get().userStats.totalPuzzles + currentSession.puzzlesCompleted,
              puzzlesSolved: get().userStats.puzzlesSolved + currentSession.puzzlesSolved,
              solveRate: (get().userStats.puzzlesSolved + currentSession.puzzlesSolved) /
                       (get().userStats.totalPuzzles + currentSession.puzzlesCompleted),
              experiencePoints: newXP,
              currentLevel: result.levelUp ? result.newLevel! : get().userStats.currentLevel,
              recentAttempts: [
                ...currentSession.history,
                ...get().userStats.recentAttempts,
              ].slice(0, 50),
            },
            currentSession: null,
            lastUpdated: new Date(),
          });

          return result;
        },

        // 放弃会话
        abandonSession: () => {
          set({
            currentSession: null,
            puzzleDatabase: [],
            lastUpdated: new Date(),
          });
        },

        // 加载指定题目
        loadPuzzle: async (puzzleId: string) => {
          const { puzzleDatabase } = get();
          const puzzle = puzzleDatabase.find(p => p.id === puzzleId);

          if (puzzle && get().currentSession) {
            set({
              currentSession: {
                ...get().currentSession!,
                currentPuzzle: puzzle,
                currentMoveIndex: 0,
                userMoves: [],
                status: 'in_progress',
              },
              lastUpdated: new Date(),
            });
          }
        },

        // 走棋
        makeMove: async (move: TacticMove): Promise<boolean> => {
          const { currentSession } = get();
          if (!currentSession || !currentSession.currentPuzzle) {
            return false;
          }

          const puzzle = currentSession.currentPuzzle;
          const solution = puzzle.solution[currentSession.currentMoveIndex];

          // 验证走法
          const isCorrect =
            move.from === solution.from &&
            move.to === solution.to &&
            (!solution.promotion || move.promotion === solution.promotion);

          if (isCorrect) {
            // 正确走法
            const newMoveIndex = currentSession.currentMoveIndex + 1;
            const newUserMoves = [...currentSession.userMoves, move];

            // 检查是否完成题目
            if (newMoveIndex >= puzzle.solution.length) {
              // 题目完成
              const updatedSession: TrainingSession = {
                ...currentSession,
                currentMoveIndex: newMoveIndex,
                userMoves: newUserMoves,
                status: 'solved',
                puzzlesCompleted: currentSession.puzzlesCompleted + 1,
                puzzlesSolved: currentSession.puzzlesSolved + 1,
                correctMoves: currentSession.correctMoves + puzzle.solution.length,
              };

              set({
                currentSession: updatedSession,
                lastUpdated: new Date(),
              });

              // 更新自适应参数
              get().adjustDifficulty();

              // 自动加载下一题
              setTimeout(() => {
                get().loadNextPuzzle();
              }, 1500);
            } else {
              set({
                currentSession: {
                  ...currentSession,
                  currentMoveIndex: newMoveIndex,
                  userMoves: newUserMoves,
                },
                lastUpdated: new Date(),
              });
            }

            return true;
          } else {
            // 错误走法
            set({
              currentSession: {
                ...currentSession,
                wrongMoves: currentSession.wrongMoves + 1,
              },
              lastUpdated: new Date(),
            });

            // 更新自适应参数
            const { adaptiveParams } = get();
            set({
              adaptiveParams: {
                ...adaptiveParams,
                consecutiveWrong: adaptiveParams.consecutiveWrong + 1,
                consecutiveCorrect: 0,
              },
            });

            return false;
          }
        },

        // 悔棋
        undoMove: () => {
          const { currentSession } = get();
          if (!currentSession || currentSession.userMoves.length === 0) return;

          set({
            currentSession: {
              ...currentSession,
              userMoves: currentSession.userMoves.slice(0, -1),
              currentMoveIndex: Math.max(0, currentSession.currentMoveIndex - 1),
            },
            lastUpdated: new Date(),
          });
        },

        // 重置题目
        resetPuzzle: () => {
          const { currentSession } = get();
          if (!currentSession) return;

          set({
            currentSession: {
              ...currentSession,
              currentMoveIndex: 0,
              userMoves: [],
              status: 'in_progress',
            },
            lastUpdated: new Date(),
          });
        },

        // 获取提示
        getHint: () => {
          const { currentSession } = get();
          if (!currentSession || !currentSession.currentPuzzle) {
            return null;
          }

          const puzzle = currentSession.currentPuzzle;
          const nextMove = puzzle.solution[currentSession.currentMoveIndex];

          set({
            currentSession: {
              ...currentSession,
              hintsUsed: currentSession.hintsUsed + 1,
            },
            lastUpdated: new Date(),
          });

          return `提示：尝试从 ${nextMove.from} 走到 ${nextMove.to}`;
        },

        // 跳过题目
        skipPuzzle: () => {
          const { currentSession } = get();
          if (!currentSession) return;

          const updatedSession: TrainingSession = {
            ...currentSession,
            status: 'skipped',
            puzzlesCompleted: currentSession.puzzlesCompleted + 1,
            puzzlesFailed: currentSession.puzzlesFailed + 1,
          };

          set({
            currentSession: updatedSession,
            lastUpdated: new Date(),
          });

          // 加载下一题
          setTimeout(() => {
            get().loadNextPuzzle();
          }, 500);
        },

        // 显示解答
        showSolution: () => {
          const { currentSession } = get();
          if (!currentSession || !currentSession.currentPuzzle) {
            return [];
          }

          return currentSession.currentPuzzle.solution;
        },

        // 调整难度
        adjustDifficulty: () => {
          const { adaptiveParams } = get();

          if (adaptiveParams.consecutiveCorrect >= adaptiveParams.correctThreshold) {
            // 提升难度
            const newDifficulty = Math.min(
              adaptiveParams.maxDifficulty,
              adaptiveParams.currentDifficulty + 1
            ) as TacticDifficulty;

            set({
              adaptiveParams: {
                ...adaptiveParams,
                currentDifficulty: newDifficulty,
                consecutiveCorrect: 0,
                consecutiveWrong: 0,
              },
            });
          } else if (adaptiveParams.consecutiveWrong >= adaptiveParams.wrongThreshold) {
            // 降低难度
            const newDifficulty = Math.max(
              adaptiveParams.minDifficulty,
              adaptiveParams.currentDifficulty - 1
            ) as TacticDifficulty;

            set({
              adaptiveParams: {
                ...adaptiveParams,
                currentDifficulty: newDifficulty,
                consecutiveCorrect: 0,
                consecutiveWrong: 0,
              },
            });
          }
        },

        // 更新统计
        updateStats: (solved: boolean, timeTaken: number, hintsUsed: number) => {
          const { currentSession, userStats } = get();
          if (!currentSession || !currentSession.currentPuzzle) return;

          const puzzleType = currentSession.currentPuzzle.type;
          const puzzleDifficulty = currentSession.currentPuzzle.difficulty;

          // 更新类型统计
          const typeStats = userStats.statsByType[puzzleType] || {
            type: puzzleType,
            total: 0,
            solved: 0,
            solveRate: 0,
            avgTime: 0,
            avgAttempts: 0,
          };

          typeStats.total += 1;
          if (solved) {
            typeStats.solved += 1;
          }
          typeStats.solveRate = typeStats.solved / typeStats.total;
          typeStats.avgTime = (typeStats.avgTime * (typeStats.total - 1) + timeTaken) / typeStats.total;

          // 更新难度统计
          const diffStats = userStats.statsByDifficulty[puzzleDifficulty] || {
            difficulty: puzzleDifficulty,
            total: 0,
            solved: 0,
            solveRate: 0,
            avgTime: 0,
          };

          diffStats.total += 1;
          if (solved) {
            diffStats.solved += 1;
          }
          diffStats.solveRate = diffStats.solved / diffStats.total;
          diffStats.avgTime = (diffStats.avgTime * (diffStats.total - 1) + timeTaken) / diffStats.total;

          set({
            userStats: {
              ...userStats,
              statsByType: {
                ...userStats.statsByType,
                [puzzleType]: typeStats,
              },
              statsByDifficulty: {
                ...userStats.statsByDifficulty,
                [puzzleDifficulty]: diffStats,
              },
            },
            lastUpdated: new Date(),
          });
        },

        // 获取进度
        getProgress: () => {
          const { currentSession, puzzleDatabase } = get();
          return {
            current: currentSession?.puzzlesCompleted || 0,
            total: puzzleDatabase.length,
          };
        },

        // 获取会话摘要
        getSessionSummary: () => {
          const { currentSession } = get();
          if (!currentSession) return null;

          return get().endSession();
        },
      }),
      {
        name: 'tactics-store',
        version: 1,
        partialize: (state) => ({
          userStats: state.userStats,
          adaptiveParams: state.adaptiveParams,
        }),
      }
    ),
    {
      name: 'TacticsStore',
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
);

// 内部方法：加载下一题
useTacticsStore.getState().loadNextPuzzle = () => {
  const { currentSession, puzzleDatabase } = useTacticsStore.getState();
  if (!currentSession) return;

  const nextIndex = currentSession.puzzlesCompleted;
  if (nextIndex < puzzleDatabase.length) {
    const nextPuzzle = puzzleDatabase[nextIndex];

    useTacticsStore.setState({
      currentSession: {
        ...currentSession,
        currentPuzzle: nextPuzzle,
        currentMoveIndex: 0,
        userMoves: [],
        status: 'in_progress',
      },
      lastUpdated: new Date(),
    });
  } else {
    // 没有更多题目
    useTacticsStore.setState({
      currentSession: {
        ...currentSession,
        currentPuzzle: null,
        status: 'not_started',
      },
      lastUpdated: new Date(),
    });
  }
};

// 选择器Hooks
export const useCurrentSession = () => useTacticsStore((state) => state.currentSession);
export const useCurrentPuzzle = () => useTacticsStore((state) => state.currentSession?.currentPuzzle || null);
export const useUserStats = () => useTacticsStore((state) => state.userStats);
export const useAdaptiveParams = () => useTacticsStore((state) => state.adaptiveParams);
export const useTacticsLoading = () => useTacticsStore((state) => state.loading);
export const useTacticsError = () => useTacticsStore((state) => state.error);
export const useTacticsProgress = () => useTacticsStore((state) => state.getProgress());
