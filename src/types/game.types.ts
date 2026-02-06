// 对局相关类型定义

import type {
  ChessMove,
  PositionEvaluation,
  TimeControl,
  AIPlayerConfig,
  GameResult,
  PGNMetadata,
  TacticalOpportunity
} from './chess.types';

// Re-export commonly used types
export type { ChessMove, PositionEvaluation, TimeControl, AIPlayerConfig, GameResult, PGNMetadata, TacticalOpportunity };

// 对局配置
export interface GameConfig {
  whitePlayer: PlayerConfig;
  blackPlayer: PlayerConfig;
  timeControl: TimeControl;
  variant?: GameVariant;
  rated: boolean; // 是否等级分对局
  allowTakeback: boolean; // 是否允许悔棋
  allowDrawOffer: boolean; // 是否允许提和
  autoQueen: boolean; // 是否自动升后
  analysisDepth?: number; // 实时分析深度
}

// 玩家配置
export interface PlayerConfig {
  type: 'human' | 'ai' | 'remote';
  name: string;
  elo?: number; // 当前等级分
  aiConfig?: AIPlayerConfig; // AI配置
  userId?: string; // 用户ID（如果是人类玩家）
}

// 对局变体
export type GameVariant =
  | 'standard'      // 标准国际象棋
  | 'chess960'      // 菲舍尔任意制
  | 'kingOfTheHill' // 占山为王
  | 'threeCheck'    // 三次将军
  | 'atomic'        // 原子象棋
  | 'horde'         // 兵群象棋
  | 'racingKings';  // 竞王象棋

// 对局状态
export interface ChessGame {
  id: string;
  config: GameConfig;
  metadata: PGNMetadata;

  // 局面信息
  fen: string; // 当前局面FEN
  pgn: string; // 完整PGN记录
  moves: ChessMove[]; // 走法历史
  positionEvaluations: PositionEvaluation[]; // 每步评估

  // 状态信息
  result?: GameResult;
  resultReason?: string;
  winner?: 'white' | 'black';
  status: GameStatus;
  currentTurn: 'white' | 'black';
  moveNumber: number;

  // 时间信息
  startTime: Date;
  endTime?: Date;
  timeUsed: {
    white: number; // 白方已用时间(毫秒)
    black: number; // 黑方已用时间(毫秒)
  };

  // 游戏状态
  inCheck: boolean;
  checkmate: boolean;
  stalemate: boolean;
  repetition: boolean;
  insufficientMaterial: boolean;

  // 操作记录
  drawOffered?: 'white' | 'black' | 'both';
  resignations?: ('white' | 'black')[];
  takebacks: TakebackRecord[];

  // 分析数据
  analysis?: GameAnalysis;
  tags: string[]; // 标签分类
  notes?: string; // 用户注释
}

// 对局状态
export type GameStatus =
  | 'created'      // 已创建
  | 'starting'     // 开始中
  | 'in_progress'  // 进行中
  | 'paused'       // 暂停
  | 'finished'     // 已完成
  | 'aborted'      // 中止
  | 'analyzing';   // 分析中

// 悔棋记录
export interface TakebackRecord {
  moveNumber: number;
  player: 'white' | 'black';
  timestamp: Date;
  reason?: string;
}

// 对局分析
export interface GameAnalysis {
  overallAccuracy: number; // 整体准确率 (0-1)
  whiteAccuracy: number;   // 白方准确率
  blackAccuracy: number;   // 黑方准确率

  // 关键决策
  criticalMoves: CriticalMove[];
  missedOpportunities: MissedOpportunity[];
  blunders: Blunder[];

  // 阶段分析
  openingAnalysis: PhaseAnalysis;
  middlegameAnalysis: PhaseAnalysis;
  endgameAnalysis: PhaseAnalysis;

  // 统计信息
  statistics: GameStatistics;

  // 改进建议
  recommendations: ImprovementRecommendation[];
}

// 关键走法
export interface CriticalMove {
  moveNumber: number;
  player: 'white' | 'black';
  move: ChessMove;
  evaluation: PositionEvaluation;
  alternatives: Array<{
    move: ChessMove;
    evaluation: PositionEvaluation;
    advantage: number; // 优势差异
  }>;
  impact: number; // 影响力 (0-1)
  category: 'tactical' | 'strategic' | 'psychological' | 'technical';
}

// 错过机会
export interface MissedOpportunity {
  moveNumber: number;
  player: 'white' | 'black';
  position: string; // FEN
  opportunity: TacticalOpportunity;
  bestMove: ChessMove;
  advantageLoss: number; // 错过的优势
}

// 严重错误
export interface Blunder {
  moveNumber: number;
  player: 'white' | 'black';
  move: ChessMove;
  bestMove: ChessMove;
  scoreLoss: number; // 分数损失
  severity: 'minor' | 'major' | 'catastrophic';
  reason: string; // 错误原因
}

// 阶段分析
export interface PhaseAnalysis {
  moves: number; // 步数
  accuracy: number; // 准确率
  timeUsed: number; // 用时(毫秒)
  timePercentage: number; // 用时百分比
  planExecution: number; // 计划执行度 (0-1)
  initiative: number; // 主动权得分 (0-1)
  keyMoments: CriticalMove[];
}

// 对局统计
export interface GameStatistics {
  totalMoves: number;
  averageMoveTime: number; // 平均每步用时(秒)
  timeDistribution: {
    opening: number; // 开局用时百分比
    middlegame: number; // 中局用时百分比
    endgame: number; // 残局用时百分比
  };
  tacticalOps: {
    total: number;
    captured: number;
    missed: number;
    created: number;
  };
  pieceActivity: {
    white: PieceActivity;
    black: PieceActivity;
  };
  pawnStructure: PawnStructureStats;
}

// 子力活跃度
export interface PieceActivity {
  averageMobility: number; // 平均可动格数
  developedPieces: number; // 已出动子力数
  centralizedPieces: number; // 中心化子力数
  attackingPieces: number; // 攻击子力数
  defendingPieces: number; // 防御子力数
}

// 兵型统计
export interface PawnStructureStats {
  isolatedPawns: number; // 孤兵数
  doubledPawns: number; // 叠兵数
  backwardPawns: number; // 落后兵数
  passedPawns: number; // 通路兵数
  pawnChains: number; // 兵链数
  holes: number; // 弱点格数
}

// 改进建议
export interface ImprovementRecommendation {
  area: ImprovementArea;
  priority: 'low' | 'medium' | 'high';
  description: string;
  specificExample?: {
    moveNumber: number;
    position: string;
    issue: string;
    solution: string;
  };
  trainingSuggestions: string[];
  expectedImprovement: number; // 预期提升百分比
}

export type ImprovementArea =
  | 'opening'      // 开局
  | 'middlegame'   // 中局
  | 'endgame'      // 残局
  | 'tactics'      // 战术
  | 'strategy'     // 战略
  | 'calculation'  // 计算
  | 'time_management' // 时间管理
  | 'psychological';  // 心理素质

// 对局过滤器
export interface GameFilter {
  player?: string;
  opponent?: string;
  result?: GameResult;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minElo?: number;
  maxElo?: number;
  opening?: string;
  hasAnalysis?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'rating' | 'accuracy' | 'moves';
  sortOrder?: 'asc' | 'desc';
}

// 对局搜索结果
export interface GameSearchResult {
  games: ChessGame[];
  total: number;
  page: number;
  pageSize: number;
  filters: GameFilter;
}

// 对局导出选项
export interface ExportOptions {
  format: 'pgn' | 'json' | 'pdf';
  includeAnalysis: boolean;
  includeComments: boolean;
  includeEvaluation: boolean;
  includeStatistics: boolean;
  compression?: boolean;
}