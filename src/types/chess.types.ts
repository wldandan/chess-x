// 国际象棋基础类型定义

// 棋子类型
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type Piece = `${PieceColor}${PieceType}`;

// 棋盘位置 (a1-h8)
export type Square =
  | 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1'
  | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2'
  | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3'
  | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4'
  | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5'
  | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6'
  | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7'
  | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8';

// 走法表示
export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: Exclude<PieceType, 'p' | 'k'>; // 升变选择
  san: string; // 标准代数记谱 (e4, Nf3等)
  lan?: string; // 长代数记谱
}

// 局面评估
export interface PositionEvaluation {
  score: number; // 分数 (正数白优，负数黑优)
  depth: number; // 分析深度
  bestLine?: string[]; // 最佳变化
  isMate?: boolean; // 是否将死
  mateIn?: number; // 将死步数 (正数白胜，负数黑胜)
}

// 棋步分析
export interface MoveAnalysis {
  move: ChessMove;
  evaluation: PositionEvaluation;
  alternatives: Array<{
    move: ChessMove;
    evaluation: PositionEvaluation;
    explanation: string;
  }>;
  tacticalOps?: TacticalOpportunity[];
  strategicEval?: StrategicEvaluation;
  timeUsed: number; // 思考时间(秒)
  isCritical: boolean; // 是否关键决策点
}

// 战术机会
export interface TacticalOpportunity {
  type: TacticalType;
  squares: Square[];
  pieces: Piece[];
  strength: number; // 0-1强度
  description: string;
}

export type TacticalType =
  | 'pin'           // 牵制
  | 'fork'          // 捉双
  | 'skewer'        // 串击
  | 'discovered'    // 闪击
  | 'double_attack' // 双重攻击
  | 'deflection'    // 诱离
  | 'decoy'         // 引入
  | 'zwischenzug';  // 过渡

// 战略评估
export interface StrategicEvaluation {
  centerControl: number; // 中心控制 (0-1)
  pieceActivity: number; // 子力活跃度 (0-1)
  pawnStructure: number; // 兵型结构 (0-1)
  kingSafety: number;   // 王的安全 (0-1)
  spaceAdvantage: number; // 空间优势 (0-1)
  initiative: number;   // 主动权 (0-1)
}

// 时间控制
export interface TimeControl {
  baseMinutes: number; // 基础分钟
  incrementSeconds: number; // 加秒
  type: 'suddenDeath' | 'increment' | 'delay' | 'bronstein';
  totalTime: number; // 总时间(毫秒)
}

// AI玩家配置
export interface AIPlayerConfig {
  name: string;
  elo: number; // ELO等级分
  style: PlayerStyle;
  skillLevel: number; // 0-20 (Stockfish skill level)
  depth?: number; // 搜索深度
  timePerMove?: number; // 每步时间(毫秒)
}

export type PlayerStyle =
  | 'positional'    // 局面型 (卡尔森)
  | 'tactical'      // 战术型 (卡斯帕罗夫)
  | 'solid'         // 稳健型 (卡鲁阿纳)
  | 'aggressive'    // 攻击型
  | 'defensive'     // 防守型
  | 'technical';    // 技术型 (丁立人)

// 风格参数
export interface StyleParameters {
  positionalWeight: number; // 局面权重 (0-1)
  tacticalWeight: number;   // 战术权重 (0-1)
  riskTolerance: number;    // 风险容忍度 (0-1)
  attackFocus: number;      // 攻击倾向 (0-1)
  endgameFocus: number;     // 残局侧重 (0-1)
}

// 对局结果
export type GameResult =
  | 'white_wins'
  | 'black_wins'
  | 'draw'
  | 'stalemate'
  | 'repetition'
  | 'insufficient_material'
  | 'timeout'
  | 'resignation'
  | 'agreement';

// PGN元数据
export interface PGNMetadata {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  whiteElo?: number;
  blackElo?: number;
  eco?: string; // 开局ECO代码
  opening?: string; // 开局名称
  variation?: string; // 变例
}

// 工具类型
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// 棋盘方向
export type BoardOrientation = 'white' | 'black';

// 记谱法
export type Notation = 'san' | 'lan' | 'uci';

// AI 难度级别
export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master';

// ======================
// AI风格训练相关类型定义
// ======================

// 棋手完整配置
export interface AIPlayerProfile {
  id: string;
  name: string;
  displayName: string;
  description: string;
  elo: number;
  style: PlayerStyle;
  styleParams: StyleParameters;
  icon?: string; // 棋手头像或图标
  difficultyRange: [number, number]; // ELO范围 [min, max]
  characteristics: string[]; // 风格特点描述
}

// 训练会话配置
export interface TrainingSessionConfig {
  playerProfileId: string;
  targetElo: number;
  adaptiveMode: boolean;
  sessionLength: number; // 对局数
  focusAreas: string[]; // 重点训练领域
  startedAt?: Date;
  completedAt?: Date;
}

// 弱点分析
export interface WeaknessAnalysis {
  id: string;
  area: string; // 弱点领域
  severity: number; // 严重程度 (0-1)
  impact: number; // 对棋力影响 (0-1)
  frequency: number; // 出现频率 (0-1)
  examples: string[]; // 具体例子
  improvementPriority: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'worsening';
}

// 强项分析
export interface StrengthAnalysis {
  id: string;
  area: string; // 强项领域
  level: number; // 水平 (0-100)
  consistency: number; // 稳定性 (0-1)
  evidence: string[]; // 证据描述
  trend: 'improving' | 'stable' | 'declining';
}

// 训练进度追踪
export interface TrainingProgress {
  sessionId: string;
  playerProfileId: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesDrawn: number;
  gamesLost: number;
  averageMoves: number;
  averageTime: number; // 平均对局时间(秒)
  styleAdaptationScore: number; // 0-100
  eloChange: number;
  weaknesses: WeaknessAnalysis[];
  strengths: StrengthAnalysis[];
  createdAt: Date;
  updatedAt: Date;
}

// 自适应难度配置
export interface AdaptiveDifficultyConfig {
  baseElo: number;
  adjustmentRate: number; // 0-1，调整速度
  minElo: number;
  maxElo: number;
  performanceThresholds: {
    win: number; // 胜率阈值
    draw: number; // 和棋率阈值
    loss: number; // 负率阈值
  };
  consistencyThreshold: number; // 表现一致性阈值
}

// 训练结果
export interface TrainingResult {
  sessionId: string;
  gameId: string;
  result: GameResult;
  moves: number;
  timeUsed: number; // 用时(秒)
  qualityScore: number; // 对局质量评分 (0-100)
  criticalMistakes: number;
  tacticalOpportunities: number;
  styleMatchScore: number; // 风格匹配度 (0-100)
  createdAt: Date;
}

// 训练模式
export type TrainingMode =
  | 'style-focused'      // 风格专项训练
  | 'mixed-challenge'    // 混合风格挑战
  | 'weakness-targeted'; // 弱点针对性训练

// 训练报告
export interface TrainingReport {
  sessionId: string;
  playerProfileId: string;
  startDate: Date;
  endDate: Date;
  overallProgress: number; // 整体进度 (0-100)
  skillImprovements: Array<{
    skill: string;
    improvement: number;
    evidence: string[];
  }>;
  weaknessReductions: Array<{
    weakness: string;
    reduction: number;
    evidence: string[];
  }>;
  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    rationale: string;
  }>;
  predictedEloGain: number;
  confidence: number; // 报告置信度 (0-1)
}