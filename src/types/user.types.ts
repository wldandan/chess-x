// 用户相关类型定义

import type { TrainingProgress, TrainingWeakness, TrainingStrength } from './training.types';
import type { GameStatistics, ImprovementArea } from './game.types';

// 用户基本信息
export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatar?: string;

  // 棋手信息
  playerInfo: PlayerInfo;

  // 统计信息
  statistics: UserStatistics;

  // 进度追踪
  progress: UserProgress;

  // 设置
  settings: UserSettings;

  // 元数据
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}

// 棋手信息
export interface PlayerInfo {
  elo: number; // 当前等级分
  provisional: boolean; // 是否临时等级分
  peakElo: number; // 历史最高等级分
  eloHistory: EloHistoryEntry[];

  playingStyle: PlayingStyle;
  preferredOpenings: PreferredOpening[];
  strengths: PlayerStrength[];
  weaknesses: PlayerWeakness[];

  title?: PlayerTitle;
  federation?: string; // 棋协
  birthYear?: number;
  experienceYears?: number;
}

// 等级分历史
export interface EloHistoryEntry {
  date: Date;
  elo: number;
  change: number;
  gameId?: string;
  reason: EloChangeReason;
  confidence: number; // 置信度 (0-1)
}

export type EloChangeReason =
  | 'game_result'      // 对局结果
  | 'training_effect'  // 训练效果
  | 'system_adjustment' // 系统调整
  | 'manual_adjustment'; // 手动调整

// 棋风分析
export interface PlayingStyle {
  primary: PrimaryStyle;
  secondary?: PrimaryStyle;
  characteristics: StyleCharacteristic[];
  confidence: number; // 分析置信度 (0-1)
}

export type PrimaryStyle =
  | 'positional'    // 局面型
  | 'tactical'      // 战术型
  | 'aggressive'    // 攻击型
  | 'defensive'     // 防守型
  | 'solid'         // 稳健型
  | 'technical'     // 技术型
  | 'creative';     // 创意型

export interface StyleCharacteristic {
  trait: StyleTrait;
  strength: number; // 强度 (0-1)
  description: string;
}

export type StyleTrait =
  | 'center_control'      // 中心控制倾向
  | 'pawn_structure_focus' // 兵型结构关注度
  | 'piece_activity'      // 子力活跃度偏好
  | 'risk_taking'         // 冒险倾向
  | 'time_management'     // 时间管理风格
  | 'endgame_skill'       // 残局技术
  | 'psychological_resilience' // 心理韧性
  | 'opening_preparation' // 开局准备程度
  | 'calculation_depth';  // 计算深度

// 偏好开局
export interface PreferredOpening {
  opening: string;
  eco?: string;
  asWhite: OpeningPerformance;
  asBlack: OpeningPerformance;
  totalGames: number;
  confidence: number; // 统计置信度
  lastPlayed: Date;
}

export interface OpeningPerformance {
  winRate: number;
  drawRate: number;
  averageEloGain: number;
  typicalMistakes: string[];
  recommendedVariations: string[];
}

// 棋手强项
export interface PlayerStrength {
  area: StrengthArea;
  level: number; // 水平 (0-100)
  consistency: number; // 稳定性 (0-1)
  evidence: StrengthEvidence[];
  development: StrengthDevelopment;
}

export type StrengthArea =
  | 'tactical_vision'        // 战术视野
  | 'calculation'            // 计算能力
  | 'positional_play'        // 局面性弈法
  | 'endgame_technique'      // 残局技术
  | 'opening_knowledge'      // 开局知识
  | 'time_management'        // 时间管理
  | 'psychological_strength' // 心理素质
  | 'adaptability';          // 适应能力

export interface StrengthEvidence {
  type: 'game' | 'training' | 'test';
  reference: string; // 对局ID或练习ID
  description: string;
  performance: number;
}

export interface StrengthDevelopment {
  trend: 'improving' | 'stable' | 'declining';
  rate: number; // 变化速率
  lastAssessed: Date;
}

// 棋手弱点
export interface PlayerWeakness {
  area: WeaknessArea;
  severity: number; // 严重程度 (0-1)
  impact: number; // 对棋力影响 (0-1)
  pattern: WeaknessPattern;
  frequency: number; // 出现频率
  examples: WeaknessExample[];
  improvementPriority: 'low' | 'medium' | 'high';
}

export type WeaknessArea = ImprovementArea;

export interface WeaknessPattern {
  type: string;
  description: string;
  triggers: string[]; // 触发条件
  typicalConsequences: string[]; // 典型后果
}

export interface WeaknessExample {
  gameId?: string;
  exerciseId?: string;
  situation: string;
  mistake: string;
  correctApproach: string;
  impact: number; // 影响程度
}

// 棋手头衔
export type PlayerTitle =
  | 'gm'  // 特级大师
  | 'im'  // 国际大师
  | 'fm'  // 棋联大师
  | 'cm'  // 候补大师
  | 'nm'  // 国家大师
  | 'wgm' // 女子特级大师
  | 'wim' // 女子国际大师
  | 'wfm' // 女子棋联大师
  | 'wcm'; // 女子候补大师

// 用户统计
export interface UserStatistics {
  // 对局统计
  games: GameStats;

  // 训练统计
  training: TrainingStats;

  // 时间统计
  time: TimeStats;

  // 进步统计
  improvement: ImprovementStats;
}

export interface GameStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;

  asWhite: ColorStats;
  asBlack: ColorStats;

  vsAI: OpponentStats;
  vsHuman: OpponentStats;

  byTimeControl: TimeControlStats[];
  byOpening: OpeningStats[];
}

export interface ColorStats {
  games: number;
  wins: number;
  winRate: number;
  averageEloChange: number;
}

export interface OpponentStats {
  games: number;
  wins: number;
  winRate: number;
  strongestWin: number; // 战胜的最高等级分
  weakestLoss: number; // 输给的最低等级分
}

export interface TimeControlStats {
  timeControl: string;
  games: number;
  winRate: number;
  performanceRating: number;
}

export interface OpeningStats {
  opening: string;
  games: number;
  winRate: number;
  performance: number; // 表现评分
}

export interface TrainingStats {
  totalSessions: number;
  totalTime: number; // 总训练时间(分钟)
  exercisesCompleted: number;
  averageAccuracy: number;

  byType: TrainingTypeStats[];
  recentActivity: DailyTrainingActivity[];
}

export interface TrainingTypeStats {
  type: string;
  sessions: number;
  time: number;
  exercises: number;
  accuracy: number;
  improvement: number; // 进步百分比
}

export interface DailyTrainingActivity {
  date: Date;
  time: number;
  sessions: number;
  exercises: number;
  focusArea: string;
}

export interface TimeStats {
  totalPlayTime: number; // 总对局时间(小时)
  totalTrainingTime: number; // 总训练时间(小时)
  averageSessionLength: number; // 平均会话时长(分钟)
  peakHours: string[]; // 活跃高峰时段
  consistency: number; // 训练一致性 (0-1)
}

export interface ImprovementStats {
  eloGain: number; // 等级分增长
  eloGainPerHour: number; // 每小时等级分增长

  skillImprovements: SkillImprovement[];
  weaknessReductions: WeaknessReduction[];

  fastestImprovement: RapidImprovement;
  currentRate: number; // 当前进步速率
}

export interface SkillImprovement {
  skill: string;
  startLevel: number;
  currentLevel: number;
  improvement: number;
  timeframe: number; // 时间跨度(天)
}

export interface WeaknessReduction {
  weakness: string;
  startSeverity: number;
  currentSeverity: number;
  reduction: number;
  timeframe: number;
}

export interface RapidImprovement {
  period: {
    start: Date;
    end: Date;
  };
  eloGain: number;
  skillsImproved: string[];
  trainingHours: number;
}

// 用户进度
export interface UserProgress {
  overall: OverallProgress;
  dimensions: DimensionProgress[];
  goals: UserGoal[];
  milestones: Milestone[];
  predictions: ProgressPrediction[];
}

export interface OverallProgress {
  currentLevel: number; // 当前整体水平 (0-100)
  trend: ProgressTrend;
  confidence: number; // 评估置信度
  lastAssessed: Date;
}

export interface ProgressTrend {
  direction: 'up' | 'down' | 'stable';
  magnitude: number; // 变化幅度
  consistency: number; // 趋势一致性 (0-1)
  volatility: number; // 波动性 (0-1)
}

export interface DimensionProgress {
  dimension: string;
  current: number;
  trend: ProgressTrend;
  subdimensions: SubdimensionProgress[];
  assessmentDate: Date;
}

export interface SubdimensionProgress {
  name: string;
  current: number;
  trend: ProgressTrend;
  importance: number; // 重要性权重 (0-1)
}

export interface UserGoal {
  id: string;
  name: string;
  description: string;
  type: GoalType;
  target: GoalTarget;
  current: GoalCurrent;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  status: GoalStatus;
  progress: number; // 进度百分比 (0-1)
}

export type GoalType =
  | 'elo'            // 等级分目标
  | 'skill'          // 技能目标
  | 'training'       // 训练目标
  | 'consistency'    // 坚持目标
  | 'achievement';   // 成就目标

export interface GoalTarget {
  value: number;
  unit: string;
  conditions?: string[];
}

export interface GoalCurrent {
  value: number;
  lastUpdated: Date;
  trend: ProgressTrend;
}

export type GoalStatus =
  | 'not_started'    // 未开始
  | 'in_progress'    // 进行中
  | 'at_risk'        // 有风险
  | 'completed'      // 已完成
  | 'abandoned';     // 放弃

export interface Milestone {
  id: string;
  name: string;
  description: string;
  type: MilestoneType;
  achievedAt: Date;
  significance: number; // 重要性 (0-1)
  evidence?: string[]; // 证据 (对局ID、练习ID等)
}

export type MilestoneType =
  | 'rating'         // 等级分里程碑
  | 'skill'          // 技能里程碑
  | 'achievement'    // 成就里程碑
  | 'consistency'    // 坚持里程碑
  | 'performance';   // 表现里程碑

export interface ProgressPrediction {
  timeframe: number; // 时间范围(天)
  predictedLevel: number;
  confidence: number; // 预测置信度 (0-1)
  assumptions: PredictionAssumption[];
  recommendedActions: RecommendedAction[];
}

export interface PredictionAssumption {
  condition: string;
  probability: number;
  impact: number;
}

export interface RecommendedAction {
  action: string;
  priority: 'low' | 'medium' | 'high';
  expectedImpact: number;
  timeRequired: number; // 所需时间(分钟)
}

// 用户设置
export interface UserSettings {
  // 界面设置
  interface: InterfaceSettings;

  // 游戏设置
  game: GameSettings;

  // 训练设置
  training: TrainingSettings;

  // 分析设置
  analysis: AnalysisSettings;

  // 隐私设置
  privacy: PrivacySettings;

  // 通知设置
  notifications: NotificationSettings;
}

export interface InterfaceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  boardTheme: string;
  pieceSet: string;
  animationSpeed: number;
  showCoordinates: boolean;
  highlightLegalMoves: boolean;
  highlightLastMove: boolean;
  showMoveHints: boolean;
}

export interface GameSettings {
  defaultTimeControl: string;
  premoveEnabled: boolean;
  confirmMove: boolean;
  autoQueen: boolean;
  soundEffects: boolean;
  moveConfirmation: boolean;
  takebackAllowed: boolean;
  drawOfferAllowed: boolean;
}

export interface TrainingSettings {
  defaultDifficulty: string;
  adaptiveDifficulty: boolean;
  showHints: boolean;
  timePressureTraining: boolean;
  reviewMistakes: boolean;
  dailyGoal: number; // 每日训练目标(分钟)
  focusAreas: string[];
}

export interface AnalysisSettings {
  engineDepth: number;
  multiPV: number;
  showEvaluation: boolean;
  showBestMoves: boolean;
  showThreats: boolean;
  autoAnalyze: boolean;
  saveAnalysis: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  gameHistoryVisibility: 'public' | 'friends' | 'private';
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
  dataCollection: boolean;
  deleteDataAfter: number; // 数据保留天数
}

export interface NotificationSettings {
  gameInvites: boolean;
  friendRequests: boolean;
  trainingReminders: boolean;
  progressUpdates: boolean;
  weeklyReport: boolean;
  sound: boolean;
  emailNotifications: boolean;
}

// 用户活动
export interface UserActivity {
  userId: string;
  date: Date;
  activities: ActivityEntry[];
  summary: ActivitySummary;
}

export interface ActivityEntry {
  timestamp: Date;
  type: ActivityType;
  details: ActivityDetails;
  duration?: number; // 活动时长(秒)
}

export type ActivityType =
  | 'game_started'     // 开始对局
  | 'game_finished'    // 完成对局
  | 'training_started' // 开始训练
  | 'training_finished' // 完成训练
  | 'analysis_started' // 开始分析
  | 'analysis_finished' // 完成分析
  | 'settings_changed' // 更改设置
  | 'achievement_unlocked' // 解锁成就
  | 'goal_progress'    // 目标进度
  | 'login'            // 登录
  | 'logout';          // 登出

export interface ActivityDetails {
  [key: string]: any; // 灵活的活动详情
}

export interface ActivitySummary {
  totalTime: number;
  gamesPlayed: number;
  trainingSessions: number;
  exercisesCompleted: number;
  achievementsUnlocked: number;
  focusHours: string[]; // 专注时段
  productivity: number; // 生产力评分 (0-1)
}