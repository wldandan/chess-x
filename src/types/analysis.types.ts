// 分析功能相关类型定义
import type { ChessMove, Square } from './chess.types';

// 棋步质量等级
export type MoveQuality =
  | 'best'       // 最佳走法 (!!)
  | 'great'      // 优秀走法 (!)
  | 'good'       // 较好走法
  | 'book'       // 开局库走法
  | 'inaccuracy' // 不准确 (?)
  | 'mistake'    // 失误 (?)
  | 'blunder';   // 大失误 (??)

// 棋步评分 (-5 到 +5)
export type MoveScore = -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;

// 棋步分析数据
export interface AnalyzedMove {
  move: ChessMove;
  moveNumber: number; // 回合数
  player: 'white' | 'black';

  // 评分信息
  scoreBefore: MoveScore;      // 走棋前局面评分
  scoreAfter: MoveScore;       // 走棋后局面评分
  scoreDiff: number;           // 评分变化

  bestMove: ChessMove | null;  // 最佳走法
  bestMoveScore: MoveScore;    // 最佳走法的评分
  quality: MoveQuality;        // 走法质量等级

  // 替代走法
  alternatives: MoveAlternative[];

  // 战术信息
  tacticalOpportunities: TacticalOpportunity[];
  missedTactics: TacticalOpportunity[];

  // 时间信息
  timeUsed: number;            // 思考时间(秒)
  timeRemaining: number;       // 剩余时间(秒)

  // 是否关键决策点
  isCritical: boolean;
  criticalReason?: string;
}

// 替代走法
export interface MoveAlternative {
  move: ChessMove;
  score: MoveScore;
  scoreDiff: number;           // 与实际走法的评分差
  quality: MoveQuality;
  explanation: string;
  isBest: boolean;
}

// 战术机会
export interface TacticalOpportunity {
  type: TacticalType;
  name: string;                // 中文名称
  squares: Square[];           // 涉及的格子
  description: string;         // 描述
  strength: number;            // 强度 (0-1)
  winning: boolean;            // 是否为制胜战术
  evaluation: MoveScore;       // 评估分数
}

// 战术类型
export type TacticalType =
  | 'pin'           // 牵制
  | 'fork'          // 捉双
  | 'skewer'        // 串击
  | 'discovered'    // 闪击
  | 'double_attack' // 双重攻击
  | 'deflection'    // 诱离
  | 'decoy'         // 引入
  | 'zwischenzug'   // 过渡
  | 'overload'      // 过载
  | 'xray'          // 穿刺
  | 'clearance'     // 清空
  | 'interference'  // 干扰
  | 'trapped_piece' // 陷阱
  | 'hanging_piece' // 悬兵
  | 'weak_backrank' // 弱底线
  | 'mate_threat';  // 杀棋威胁;

// 开局信息
export interface OpeningInfo {
  eco: string;                 // ECO代码 (A00-E99)
  name: string;                // 开局名称
  variation?: string;          // 变例
  moves: string[];             // 开局标准走法
  isBook: boolean;             // 是否在开局库中
}

// 对局分析报告
export interface GameAnalysisReport {
  gameId: string;
  analyzedAt: Date;

  // 总体评分
  overallAccuracy: number;     // 总体准确率 (0-100)
  whiteAccuracy: number;       // 白方准确率
  blackAccuracy: number;       // 黑方准确率

  // 走法统计
  totalMoves: number;
  bestMoves: number;           // 最佳走法数
  greatMoves: number;          // 优秀走法数
  goodMoves: number;           // 较好走法数
  inaccuracies: number;        // 不准确数
  mistakes: number;            // 失误数
  blunders: number;            // 大失误数

  // 质量百分比
  bestMovePercent: number;     // 最佳走法百分比
  goodMovePercent: number;     // 较好走法百分比
  errorPercent: number;        // 错误百分比

  // 关键时刻
  criticalMoments: CriticalMoment[];

  // 开局分析
  opening: OpeningInfo;
  openingAccuracy: number;     // 开局准确率
  deviation?: {
    move: ChessMove;
    expected: ChessMove;
    explanation: string;
  };

  // 战术统计
  tacticsFound: number;        // 找到的战术数
  tacticsMissed: number;       // 错过的战术数
  tacticsUsed: TacticalOpportunity[];

  // 时间管理
  timeManagement: TimeManagementAnalysis;

  // 建议
  strengths: string[];         // 优点
  weaknesses: string[];        // 弱点
  recommendations: string[];   // 改进建议

  // 分析状态
  analysisDepth: number;       // 分析深度
  engineName: string;          // 引擎名称
}

// 关键时刻
export interface CriticalMoment {
  moveNumber: number;
  move: ChessMove;
  type: 'turning_point' | 'critical_error' | 'brilliant_move' | 'missed_win';
  description: string;
  scoreBefore: MoveScore;
  scoreAfter: MoveScore;
  impact: 'high' | 'medium' | 'low';
}

// 时间管理分析
export interface TimeManagementAnalysis {
  averageTimePerMove: number;      // 平均每步用时(秒)
  fastestMove: { move: ChessMove; time: number };
  slowestMove: { move: ChessMove; time: number };
  timeTroubleMoves: number;        // 时间紧张时的走法数
  goodTimeManagement: number;      // 时间管理良好评分
  timeUsedInCritical: number;      // 关键时刻用时
}

// 分析配置
export interface AnalysisConfig {
  depth?: number;                  // 分析深度 (默认: 15)
  engine?: 'stockfish' | 'mock';   // 引擎类型
  includeAlternatives?: boolean;   // 是否包含替代走法
  alternativesCount?: number;      // 替代走法数量 (默认: 3)
  detectTactics?: boolean;         // 是否检测战术
  includeOpening?: boolean;        // 是否包含开局分析
  timeAnalysis?: boolean;          // 是否分析时间管理
}

// 分析进度状态
export interface AnalysisProgress {
  isAnalyzing: boolean;
  currentMove: number;
  totalMoves: number;
  percentComplete: number;
  stage: 'initializing' | 'analyzing' | 'generating_report' | 'complete';
}

// 复盘视图模式
export type ReviewMode =
  | 'move_by_move'   // 逐步查看
  | 'summary'        // 摘要视图
  | 'mistakes_only'  // 只看错误
  | 'critical_only'; // 只看关键时刻

// 复盘状态
export interface ReviewState {
  gameId: string | null;
  isAnalyzing: boolean;
  isReady: boolean;
  currentMoveIndex: number;
  reviewMode: ReviewMode;
  filter: {
    showWhite: boolean;
    showBlack: boolean;
    showBest: boolean;
    showGood: boolean;
    showInaccuracies: boolean;
    showMistakes: boolean;
    showBlunders: boolean;
    showCritical: boolean;
  };
}
