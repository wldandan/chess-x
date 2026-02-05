// 分析状态管理Store
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type {
  AnalyzedMove,
  GameAnalysisReport,
  AnalysisConfig,
  AnalysisProgress,
  ReviewState,
  ReviewMode,
} from '../types/analysis.types';
import type { ChessGame } from '../types/game.types';

// 分析状态接口
interface AnalysisState {
  // 当前分析报告
  currentReport: GameAnalysisReport | null;
  analyzedMoves: AnalyzedMove[];

  // 分析进度
  progress: AnalysisProgress;

  // 复盘状态
  review: ReviewState;

  // 错误状态
  error: string | null;
  loading: boolean;
  lastUpdated: Date | null;
}

// 分析操作接口
interface AnalysisActions {
  // 分析操作
  startAnalysis: (game: ChessGame, config?: AnalysisConfig) => Promise<void>;
  cancelAnalysis: () => void;
  clearAnalysis: () => void;

  // 导航操作
  goToMove: (moveIndex: number) => void;
  nextMove: () => void;
  previousMove: () => void;
  goToStart: () => void;
  goToEnd: () => void;

  // 复盘模式
  setReviewMode: (mode: ReviewMode) => void;
  toggleFilter: (filterKey: keyof ReviewState['filter']) => void;

  // 导出操作
  exportReport: (format: 'json' | 'pdf') => Promise<void>;

  // 内部方法
  updateProgress: (progress: Partial<AnalysisProgress>) => void;
}

// 初始状态
const initialState: AnalysisState = {
  currentReport: null,
  analyzedMoves: [],

  progress: {
    isAnalyzing: false,
    currentMove: 0,
    totalMoves: 0,
    percentComplete: 0,
    stage: 'initializing',
  },

  review: {
    gameId: null,
    isAnalyzing: false,
    isReady: false,
    currentMoveIndex: -1,
    reviewMode: 'move_by_move',
    filter: {
      showWhite: true,
      showBlack: true,
      showBest: true,
      showGood: true,
      showInaccuracies: true,
      showMistakes: true,
      showBlunders: true,
      showCritical: true,
    },
  },

  error: null,
  loading: false,
  lastUpdated: null,
};

// 创建Analysis Store
export const useAnalysisStore = create<AnalysisState & AnalysisActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 开始分析
      startAnalysis: async (game: ChessGame, config: AnalysisConfig = {}) => {
        set({
          loading: true,
          error: null,
          progress: {
            isAnalyzing: true,
            currentMove: 0,
            totalMoves: game.moves.length,
            percentComplete: 0,
            stage: 'initializing',
          },
          review: {
            ...get().review,
            gameId: game.id,
            isAnalyzing: true,
            isReady: false,
          },
        });

        try {
          // 导入分析引擎
          const { AnalysisEngine } = await import('../services/analysis/AnalysisEngine');
          const engine = new AnalysisEngine(config);

          // 逐步分析每一步棋
          const analyzedMoves: AnalyzedMove[] = [];
          const totalMoves = game.moves.length;

          set({
            progress: {
              ...get().progress,
              stage: 'analyzing',
            },
          });

          for (let i = 0; i < totalMoves; i++) {
            const move = game.moves[i];
            const player = i % 2 === 0 ? 'white' : 'black';

            // 分析这一步棋
            const analyzedMove = await engine.analyzeMove(
              game,
              i,
              player,
            );

            analyzedMoves.push(analyzedMove);

            // 更新进度
            set({
              analyzedMoves,
              progress: {
                ...get().progress,
                currentMove: i + 1,
                percentComplete: Math.round(((i + 1) / totalMoves) * 100),
              },
            });

            // 给UI一点时间更新
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // 生成报告
          set({
            progress: {
              ...get().progress,
              stage: 'generating_report',
            },
          });

          const report = await engine.generateReport(game, analyzedMoves);

          set({
            currentReport: report,
            analyzedMoves,
            loading: false,
            progress: {
              isAnalyzing: false,
              currentMove: totalMoves,
              totalMoves,
              percentComplete: 100,
              stage: 'complete',
            },
            review: {
              ...get().review,
              isAnalyzing: false,
              isReady: true,
              currentMoveIndex: -1,
            },
            lastUpdated: new Date(),
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Analysis failed',
            progress: {
              ...get().progress,
              isAnalyzing: false,
              stage: 'complete',
            },
            review: {
              ...get().review,
              isAnalyzing: false,
            },
          });
        }
      },

      // 取消分析
      cancelAnalysis: () => {
        set({
          loading: false,
          progress: {
            ...get().progress,
            isAnalyzing: false,
            stage: 'complete',
          },
          review: {
            ...get().review,
            isAnalyzing: false,
          },
        });
      },

      // 清除分析
      clearAnalysis: () => {
        set({
          currentReport: null,
          analyzedMoves: [],
          review: {
            ...get().review,
            gameId: null,
            isReady: false,
            currentMoveIndex: -1,
          },
          progress: {
            isAnalyzing: false,
            currentMove: 0,
            totalMoves: 0,
            percentComplete: 0,
            stage: 'initializing',
          },
          lastUpdated: new Date(),
        });
      },

      // 跳转到指定步数
      goToMove: (moveIndex: number) => {
        const { analyzedMoves } = get();
        if (moveIndex >= -1 && moveIndex < analyzedMoves.length) {
          set({
            review: {
              ...get().review,
              currentMoveIndex: moveIndex,
            },
          });
        }
      },

      // 下一步
      nextMove: () => {
        const { review, analyzedMoves } = get();
        const nextIndex = Math.min(review.currentMoveIndex + 1, analyzedMoves.length - 1);
        set({
          review: {
            ...review,
            currentMoveIndex: nextIndex,
          },
        });
      },

      // 上一步
      previousMove: () => {
        const { review } = get();
        const prevIndex = Math.max(review.currentMoveIndex - 1, -1);
        set({
          review: {
            ...review,
            currentMoveIndex: prevIndex,
          },
        });
      },

      // 跳到开始
      goToStart: () => {
        set({
          review: {
            ...get().review,
            currentMoveIndex: -1,
          },
        });
      },

      // 跳到结束
      goToEnd: () => {
        const { analyzedMoves } = get();
        set({
          review: {
            ...get().review,
            currentMoveIndex: analyzedMoves.length - 1,
          },
        });
      },

      // 设置复盘模式
      setReviewMode: (mode: ReviewMode) => {
        set({
          review: {
            ...get().review,
            reviewMode: mode,
          },
        });
      },

      // 切换过滤器
      toggleFilter: (filterKey: keyof ReviewState['filter']) => {
        set({
          review: {
            ...get().review,
            filter: {
              ...get().review.filter,
              [filterKey]: !get().review.filter[filterKey],
            },
          },
        });
      },

      // 导出报告
      exportReport: async (format: 'json' | 'pdf') => {
        const { currentReport } = get();
        if (!currentReport) {
          throw new Error('No report to export');
        }

        if (format === 'json') {
          const exportData = JSON.stringify(currentReport, null, 2);
          const blob = new Blob([exportData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analysis_${currentReport.gameId}_${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        } else if (format === 'pdf') {
          // PDF导出需要额外库，暂时提示用户
          alert('PDF export will be available soon. Please use JSON export for now.');
        }
      },

      // 更新进度
      updateProgress: (progressUpdate: Partial<AnalysisProgress>) => {
        set({
          progress: {
            ...get().progress,
            ...progressUpdate,
          },
        });
      },
    }),
    {
      name: 'AnalysisStore',
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
);

// 选择器Hooks
export const useCurrentReport = () => useAnalysisStore((state) => state.currentReport);
export const useAnalyzedMoves = () => useAnalysisStore((state) => state.analyzedMoves);
export const useCurrentAnalyzedMove = () =>
  useAnalysisStore((state) => {
    if (state.review.currentMoveIndex < 0) return null;
    return state.analyzedMoves[state.review.currentMoveIndex] || null;
  });
export const useAnalysisProgress = () => useAnalysisStore((state) => state.progress);
export const useReviewState = () => useAnalysisStore((state) => state.review);
export const useAnalysisLoading = () => useAnalysisStore((state) => state.loading);
export const useAnalysisError = () => useAnalysisStore((state) => state.error);

// 计算属性
export const useFilteredMoves = () =>
  useAnalysisStore((state) => {
    const { analyzedMoves, review } = state;

    if (review.reviewMode === 'mistakes_only') {
      return analyzedMoves.filter(m =>
        ['inaccuracy', 'mistake', 'blunder'].includes(m.quality)
      );
    }

    if (review.reviewMode === 'critical_only') {
      return analyzedMoves.filter(m => m.isCritical);
    }

    return analyzedMoves;
  });
