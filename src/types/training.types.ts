// 训练相关类型定义

import type { ChessMove, PositionEvaluation, TacticalType, Square } from './chess.types';

// 训练类型
export type TrainingType =
  | 'tactics'           // 战术训练
  | 'openings'          // 开局训练
  | 'endgames'          // 残局训练
  | 'strategy'          // 战略训练
  | 'calculation'       // 计算训练
  | 'time_management'   // 时间管理训练
  | 'psychological'     // 心理训练
  | 'mixed';            // 混合训练

// 训练难度
export type DifficultyLevel =
  | 'beginner'      // 初学者 (ELO < 1200)
  | 'intermediate'  // 中级 (ELO 1200-1800)
  | 'advanced'      // 高级 (ELO 1800-2200)
  | 'expert'        // 专家 (ELO 2200+)
  | 'adaptive';     // 自适应

// 训练模式
export type TrainingMode =
  | 'practice'      // 练习模式 (无时间压力)
  | 'timed'         // 计时模式
  | 'challenge'     // 挑战模式
  | 'exam'          // 考试模式
  | 'adaptive';     // 自适应模式

// 训练题目
export interface TrainingExercise {
  id: string;
  type: TrainingType;
  difficulty: DifficultyLevel;
  title: string;
  description: string;

  // 局面信息
  fen: string;
  orientation: 'white' | 'black'; // 用户执哪方
  objective: ExerciseObjective;

  // 解决方案
  solution: ChessMove[];
  alternativeSolutions?: ChessMove[][]; // 替代解法
  hints: ExerciseHint[];
  explanation: string;

  // 元数据
  source?: string; // 来源 (职业对局、经典棋局等)
  theme?: string; // 主题 (如"牵制攻击")
  tags: string[];
  estimatedTime: number; // 预计完成时间(秒)
  rating: number; // 题目难度评分

  // 统计信息
  attempts: number;
  successRate: number;
  averageTime: number;
}

// 训练目标
export type ExerciseObjective =
  | 'find_best_move'      // 找到最佳走法
  | 'find_winning_move'   // 找到致胜走法
  | 'defend_position'     // 防守局面
  | 'calculate_variation' // 计算变例
  | 'evaluate_position'   // 评估局面
  | 'create_plan'         // 制定计划
  | 'convert_advantage'   // 转化优势
  | 'save_draw';          // 挽救和棋

// 训练提示
export interface ExerciseHint {
  level: number; // 提示级别 (1=轻微提示, 5=完整解答)
  content: string;
  focusArea?: string; // 关注区域 (如"观察e5马")
}

// 战术训练题目
export interface TacticsExercise extends TrainingExercise {
  type: 'tactics';
  tacticalThemes: TacticalType[];
  keyPiece?: Square; // 关键棋子位置
  forcingSequence?: boolean; // 是否强制序列
  materialGain?: number; // 子力获得
}

// 开局训练题目
export interface OpeningExercise extends TrainingExercise {
  type: 'openings';
  opening: string; // 开局名称
  variation: string; // 变例名称
  eco?: string; // ECO代码
  theoryDepth: number; // 理论深度
  commonMistakes: CommonMistake[];
  typicalPlans: TypicalPlan[];
}

// 常见错误
export interface CommonMistake {
  move: ChessMove;
  punishment: ChessMove[];
  explanation: string;
  severity: 'minor' | 'major' | 'catastrophic';
}

// 典型计划
export interface TypicalPlan {
  name: string;
  description: string;
  keyMoves: ChessMove[];
  strategicGoals: string[];
}

// 残局训练题目
export interface EndgameExercise extends TrainingExercise {
  type: 'endgames';
  endgameType: EndgameType;
  theoretical: boolean; // 是否理论和局
  technique: EndgameTechnique[];
  winConditions?: string[];
  drawConditions?: string[];
}

export type EndgameType =
  | 'king_pawn'           // 王兵残局
  | 'king_pawns'          // 王多兵残局
  | 'rook_pawn'           // 车兵残局
  | 'queen_pawn'          // 后兵残局
  | 'minor_piece_pawn'    // 轻子兵残局
  | 'rook_endgame'        // 车残局
  | 'queen_endgame'       // 后残局
  | 'bishop_endgame'      // 象残局
  | 'knight_endgame'      // 马残局
  | 'bishop_knight'       // 象马残局
  | 'same_color_bishops'  // 同色象残局
  | 'opposite_color_bishops'; // 异色象残局

export type EndgameTechnique =
  | 'opposition'          // 对王
  | 'key_squares'         // 关键格
  | 'zugzwang'            // 过渡
  | 'pawn_break'          // 兵突破
  | 'pawn_promotion'      // 兵升变
  | 'king_activity'       // 王活跃度
  | 'piece_coordination'  // 子力协调
  | 'defensive_resources'; // 防守资源

// 战略训练题目
export interface StrategyExercise extends TrainingExercise {
  type: 'strategy';
  strategicThemes: StrategicTheme[];
  positionEvaluation: PositionEvaluation;
  planOptions: StrategicPlan[];
  timeForPlanning: number; // 计划制定时间(秒)
}

export type StrategicTheme =
  | 'center_control'      // 中心控制
  | 'pawn_structure'      // 兵型结构
  | 'piece_activity'      // 子力活跃度
  | 'king_safety'         // 王的安全
  | 'space_advantage'     // 空间优势
  | 'initiative'          // 主动权
  | 'prophylaxis'         // 预防性着法
  | 'weaknesses';         // 弱点攻击

export interface StrategicPlan {
  name: string;
  description: string;
  steps: StrategicStep[];
  advantages: string[];
  risks: string[];
  suitability: number; // 适合度评分 (0-1)
}

export interface StrategicStep {
  moveRange: string; // 走法范围 (如"接下来3-5步")
  objectives: string[];
  keyPositions: string[]; // 关键局面FEN
}

// 训练会话
export interface TrainingSession {
  id: string;
  userId: string;
  type: TrainingType;
  mode: TrainingMode;
  difficulty: DifficultyLevel;

  // 配置
  exercises: TrainingExercise[];
  timeLimit?: number; // 时间限制(秒)
  targetScore?: number; // 目标分数
  adaptiveSettings?: AdaptiveTrainingSettings;

  // 状态
  status: TrainingStatus;
  currentExerciseIndex: number;
  startTime: Date;
  endTime?: Date;

  // 进度
  completedExercises: CompletedExercise[];
  score: number;
  accuracy: number;
  averageTime: number;

  // 分析
  strengths: TrainingStrength[];
  weaknesses: TrainingWeakness[];
  recommendations: TrainingRecommendation[];
}

export type TrainingStatus =
  | 'created'      // 已创建
  | 'in_progress'  // 进行中
  | 'paused'       // 暂停
  | 'completed'    // 完成
  | 'abandoned';   // 放弃

// 完成的练习
export interface CompletedExercise {
  exerciseId: string;
  startTime: Date;
  endTime: Date;
  timeSpent: number; // 用时(秒)

  // 用户解答
  userMoves: ChessMove[];
  hintsUsed: number;
  solutionViewed: boolean;

  // 评估
  correct: boolean;
  accuracy: number; // 准确率 (0-1)
  score: number; // 得分

  // 分析
  mistakes: ExerciseMistake[];
  strengths: string[];
  timeManagement?: number; // 时间管理评分 (0-1)
}

// 练习错误
export interface ExerciseMistake {
  moveNumber: number;
  userMove: ChessMove;
  correctMove: ChessMove;
  errorType: ExerciseErrorType;
  explanation: string;
  severity: 'minor' | 'major' | 'catastrophic';
}

export type ExerciseErrorType =
  | 'tactical_miss'      // 战术错过
  | 'strategic_error'    // 战略错误
  | 'calculation_error'  // 计算错误
  | 'time_pressure'      // 时间压力错误
  | 'psychological'      // 心理错误
  | 'technical_error';   // 技术错误

// 自适应训练设置
export interface AdaptiveTrainingSettings {
  initialDifficulty: DifficultyLevel;
  adjustmentRate: number; // 调整速率 (0-1)
  targetSuccessRate: number; // 目标成功率 (0-1)
  maxDifficultyChange: number; // 最大难度变化
  reviewWeaknesses: boolean; // 是否复习弱点
}

// 训练强项
export interface TrainingStrength {
  area: TrainingArea;
  score: number;
  consistency: number; // 一致性 (0-1)
  examples: StrengthExample[];
}

export type TrainingArea =
  | 'tactical_vision'    // 战术视野
  | 'calculation_depth'  // 计算深度
  | 'positional_understanding' // 局面理解
  | 'endgame_technique'  // 残局技术
  | 'opening_knowledge'  // 开局知识
  | 'time_management'    // 时间管理
  | 'psychological_strength'; // 心理素质

export interface StrengthExample {
  exerciseId: string;
  description: string;
  performance: number;
}

// 训练弱点
export interface TrainingWeakness {
  area: TrainingArea;
  severity: number; // 严重程度 (0-1)
  frequency: number; // 出现频率
  pattern?: WeaknessPattern;
  examples: WeaknessExample[];
  improvementPriority: 'low' | 'medium' | 'high';
}

export interface WeaknessPattern {
  type: string;
  conditions: string[];
  typicalMistakes: string[];
}

export interface WeaknessExample {
  exerciseId: string;
  mistake: ExerciseMistake;
  correctApproach: string;
}

// 训练建议
export interface TrainingRecommendation {
  area: TrainingArea;
  priority: 'low' | 'medium' | 'high';
  description: string;
  suggestedExercises: string[]; // 建议的练习ID
  estimatedTime: number; // 预计训练时间(分钟)
  expectedImprovement: number; // 预期提升 (0-1)
}

// 训练进度
export interface TrainingProgress {
  userId: string;
  overallLevel: number; // 整体水平 (0-100)

  // 各维度水平
  dimensions: {
    tactics: DimensionProgress;
    openings: DimensionProgress;
    endgames: DimensionProgress;
    strategy: DimensionProgress;
    calculation: DimensionProgress;
    timeManagement: DimensionProgress;
    psychological: DimensionProgress;
  };

  // 趋势
  trend: ProgressTrend;
  weeklyActivity: WeeklyActivity[];
  achievements: TrainingAchievement[];
}

export interface DimensionProgress {
  current: number; // 当前水平 (0-100)
  trend: 'improving' | 'stable' | 'declining';
  lastAssessed: Date;
  confidence: number; // 评估置信度 (0-1)
}

export interface ProgressTrend {
  direction: 'up' | 'down' | 'stable';
  rate: number; // 变化速率
  consistency: number; // 趋势一致性 (0-1)
  prediction?: number; // 30天预测水平
}

export interface WeeklyActivity {
  weekStart: Date;
  totalTime: number; // 总训练时间(分钟)
  sessions: number;
  exercisesCompleted: number;
  averageAccuracy: number;
  focusAreas: TrainingArea[];
}

// 训练成就
export interface TrainingAchievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  unlockedAt: Date;
  progress?: number; // 进度 (0-1)
  requirements: AchievementRequirement[];
}

export type AchievementCategory =
  | 'consistency'    // 坚持成就
  | 'skill'          // 技能成就
  | 'mastery'        // 精通成就
  | 'challenge'      // 挑战成就
  | 'social';        // 社交成就

export interface AchievementRequirement {
  type: string;
  target: number;
  current: number;
}