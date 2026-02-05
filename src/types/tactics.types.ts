// 战术训练相关类型定义
import type { Square } from './chess.types';

// 战术类型
export type TacticType =
  | 'fork'              // 捉双
  | 'pin'               // 牵制
  | 'skewer'            // 串击
  | 'discovered'        // 闪击
  | 'double_attack'     // 双重攻击
  | 'deflection'        // 诱离
  | 'decoy'             // 引入
  | 'zwischenzug'       // 过渡
  | 'overload'          // 过载
  | 'xray'              // 穿刺
  | 'clearance'         // 清空
  | 'interference'      // 干扰
  | 'trapped_piece'     // 陷阱
  | 'hanging_piece'     // 悬兵
  | 'weak_backrank'     // 弱底线
  | 'mate_threat'       // 杀棋威胁
  | 'promotion'         // 升变战术
  | 'en_passant';       // 吃过路兵

// 战术难度
export type TacticDifficulty = 1 | 2 | 3 | 4 | 5;

// 战术题目状态
export type TacticStatus =
  | 'not_started'       // 未开始
  | 'in_progress'       // 进行中
  | 'solved'            // 已解决
  | 'failed'            // 失败
  | 'skipped';          // 跳过

// 战术题目
export interface TacticPuzzle {
  id: string;

  // 题目信息
  type: TacticType;
  difficulty: TacticDifficulty;
  fen: string;                 // 局面FEN
  turn: 'white' | 'black';     // 轮到谁走

  // 解决方案
  solution: TacticMove[];      // 正确走法序列
  alternativeSolutions?: TacticMove[][]; // 其他可能的解法

  // 提示
  hint?: string;               // 提示文本
  explanation?: string;        // 解题解释

  // 关键信息
  keySquares: Square[];        // 关键格子
  keyPieces: Square[];         // 关键棋子位置

  // 元数据
  theme?: string;              // 主题标签
  source?: string;             // 来源（实战、排局等）
  rating?: number;             // 难度评分

  // 统计
  attempts: number;            // 尝试次数
  solveRate: number;           // 解决率
  avgTime: number;             // 平均用时
}

// 战术走法
export interface TacticMove {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
  san?: string;
}

// 训练会话
export interface TrainingSession {
  id: string;
  startTime: Date;

  // 当前状态
  currentPuzzle: TacticPuzzle | null;
  currentMoveIndex: number;
  userMoves: TacticMove[];
  status: TacticStatus;

  // 设置
  tacticTypes: TacticType[];   // 选择的战术类型
  difficulty: TacticDifficulty; // 当前难度

  // 进度
  puzzlesCompleted: number;
  puzzlesSolved: number;
  puzzlesFailed: number;

  // 统计
  correctMoves: number;
  wrongMoves: number;
  hintsUsed: number;
  totalTime: number;

  // 历史记录
  history: PuzzleAttempt[];
}

// 题目尝试记录
export interface PuzzleAttempt {
  puzzleId: string;
  solved: boolean;
  attempts: number;
  timeTaken: number;
  hintsUsed: number;
  moves: TacticMove[];
  timestamp: Date;
}

// 用户战术统计
export interface UserTacticStats {
  // 总体统计
  totalPuzzles: number;
  puzzlesSolved: number;
  solveRate: number;

  // 按类型统计
  statsByType: Record<TacticType, TypeStats>;

  // 按难度统计
  statsByDifficulty: Record<TacticDifficulty, DifficultyStats>;

  // 进度
  currentLevel: number;
  experiencePoints: number;

  // 弱点分析
  weakTypes: TacticType[];
  strongTypes: TacticType[];

  // 连续记录
  currentStreak: number;
  bestStreak: number;

  // 最近表现
  recentAttempts: PuzzleAttempt[];
}

// 按类型统计
export interface TypeStats {
  type: TacticType;
  total: number;
  solved: number;
  solveRate: number;
  avgTime: number;
  avgAttempts: number;
}

// 按难度统计
export interface DifficultyStats {
  difficulty: TacticDifficulty;
  total: number;
  solved: number;
  solveRate: number;
  avgTime: number;
}

// 自适应学习参数
export interface AdaptiveLearningParams {
  // 难度调整
  baseDifficulty: TacticDifficulty;
  currentDifficulty: TacticDifficulty;
  minDifficulty: TacticDifficulty;
  maxDifficulty: TacticDifficulty;

  // 调整阈值
  correctThreshold: number;     // 连续答对多少题提升难度
  wrongThreshold: number;       // 连续答错多少题降低难度

  // 当前计数
  consecutiveCorrect: number;
  consecutiveWrong: number;

  // 弱点权重
  weakTypeMultiplier: number;   // 对弱点类型的出现频率权重
}

// 反馈信息
export interface TacticFeedback {
  type: 'correct' | 'wrong' | 'hint' | 'complete';
  message: string;
  showSolution?: boolean;
  nextPuzzleDelay?: number;
}

// 训练配置
export interface TrainingConfig {
  tacticTypes: TacticType[];
  difficulty: TacticDifficulty;
  adaptiveMode: boolean;
  showHints: boolean;
  timeLimit?: number;           // 每题时间限制（秒）
  puzzleCount?: number;          // 目标题目数量
}

// 战术训练结果
export interface TrainingResult {
  sessionId: string;
  duration: number;
  puzzlesCompleted: number;
  puzzlesSolved: number;
  solveRate: number;
  correctMoves: number;
  wrongMoves: number;
  hintsUsed: number;
  experienceGained: number;
  levelUp: boolean;
  newLevel?: number;
  improvements: {
    improvedTypes: TacticType[];
    weakenedTypes: TacticType[];
  };
}

// 战术类型中文显示
export const TacticTypeNames: Record<TacticType, string> = {
  fork: '捉双',
  pin: '牵制',
  skewer: '串击',
  discovered: '闪击',
  double_attack: '双重攻击',
  deflection: '诱离',
  decoy: '引入',
  zwischenzug: '过渡',
  overload: '过载',
  xray: '穿刺',
  clearance: '清空',
  interference: '干扰',
  trapped_piece: '陷阱',
  hanging_piece: '悬兵',
  weak_backrank: '弱底线',
  mate_threat: '杀棋威胁',
  promotion: '升变战术',
  en_passant: '吃过路兵',
};

// 战术类型图标
export const TacticTypeIcons: Record<TacticType, string> = {
  fork: '⚔️',
  pin: '📌',
  skewer: '🔱',
  discovered: '⚡',
  double_attack: '🎯',
  deflection: '↪️',
  decoy: '🎣',
  zwischenzug: '⏭️',
  overload: '⚖️',
  xray: '🔭',
  clearance: '🧹',
  interference: '🚫',
  trapped_piece: '🪤',
  hanging_piece: '💀',
  weak_backrank: '🏰',
  mate_threat: '⚠️',
  promotion: '👑',
  en_passant: '⏩',
};

// 难度显示
export const DifficultyLabels: Record<TacticDifficulty, string> = {
  1: '入门',
  2: '初级',
  3: '中级',
  4: '高级',
  5: '专家',
};

// 难度颜色
export const DifficultyColors: Record<TacticDifficulty, string> = {
  1: '#22c55e',
  2: '#3b82f6',
  3: '#f59e0b',
  4: '#f97316',
  5: '#ef4444',
};
