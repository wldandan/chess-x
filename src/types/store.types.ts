// 状态管理相关类型定义

import type { ChessGame, GameConfig, GameFilter } from './game.types';
import type { TrainingSession, TrainingExercise, TrainingProgress as BaseTrainingProgress } from './training.types';
import type { User, UserSettings } from './user.types';
import type { DifficultyLevel, AIPlayerProfile, TrainingSessionConfig, TrainingProgress, AdaptiveDifficultyConfig } from './chess.types';

// Store状态基类
export interface BaseStoreState {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// 对局Store状态
export interface GameStoreState extends BaseStoreState {
  // 当前对局
  currentGame: ChessGame | null;
  isPlaying: boolean;
  gameStatus: 'idle' | 'playing' | 'paused' | 'finished';

  // 对局历史
  gameHistory: ChessGame[];
  selectedGame: ChessGame | null;

  // 过滤和分页
  gameFilter: GameFilter;
  totalGames: number;

  // AI 对战状态
  aiDifficulty: DifficultyLevel;
  aiThinking: {
    isThinking: boolean;
    depth: number;
    evaluation: number;
    currentMove: string;
  } | null;
  aiEngineReady: boolean;

  // AI风格训练状态
  currentPlayerProfile: AIPlayerProfile | null;
  trainingSession: TrainingSessionConfig | null;
  trainingProgress: TrainingProgress | null;
  playerProfiles: AIPlayerProfile[];
  adaptiveDifficulty: AdaptiveDifficultyConfig;

  // 操作状态
  isAnalyzing: boolean;
  isExporting: boolean;
}

// 训练Store状态
export interface TrainingStoreState extends BaseStoreState {
  // 当前训练
  currentSession: TrainingSession | null;
  isTraining: boolean;
  trainingStatus: 'idle' | 'in_progress' | 'paused' | 'completed';

  // 训练库
  availableExercises: TrainingExercise[];
  recommendedExercises: TrainingExercise[];

  // 进度追踪
  trainingProgress: TrainingProgress | null;
  dailyGoal: number;
  dailyProgress: number;

  // 设置
  trainingSettings: {
    difficulty: string;
    adaptive: boolean;
    showHints: boolean;
    timePressure: boolean;
  };
}

// 用户Store状态
export interface UserStoreState extends BaseStoreState {
  // 用户信息
  currentUser: User | null;
  isAuthenticated: boolean;

  // 用户设置
  settings: UserSettings;

  // 活动状态
  isOnline: boolean;
  lastActivity: Date;

  // 加载状态
  isLoadingProfile: boolean;
  isLoadingStats: boolean;
}

// UI Store状态
export interface UIStoreState extends BaseStoreState {
  // 主题和外观
  theme: 'light' | 'dark';
  boardTheme: string;
  pieceSet: string;

  // 布局状态
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  currentView: string;

  // 通知和消息
  notifications: Notification[];
  unreadCount: number;

  // 加载状态
  isLoading: boolean;
  loadingMessage: string | null;

  // 模态框状态
  activeModal: string | null;
  modalProps: Record<string, any>;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

// Store Actions
export interface GameStoreActions {
  // 对局操作
  startGame: (config: GameConfig) => Promise<void>;
  makeMove: (move: string) => Promise<boolean>;
  resign: () => Promise<void>;
  offerDraw: () => Promise<void>;
  requestTakeback: () => Promise<void>;

  // AI 操作
  initializeAI: () => Promise<void>;
  setAIDifficulty: (difficulty: DifficultyLevel) => void;
  processAIMove: () => Promise<void>;
  cleanupAI: () => void;
  endGame: (game: ChessGame) => void;

  // 对局管理
  loadGame: (gameId: string) => Promise<void>;
  saveGame: (game: ChessGame) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;

  // 分析操作
  analyzeGame: (gameId: string) => Promise<void>;
  exportGame: (gameId: string, format: string) => Promise<void>;

  // 过滤和搜索
  setGameFilter: (filter: GameFilter) => void;
  loadMoreGames: () => Promise<void>;

  // AI风格训练操作
  selectPlayerProfile: (profileId: string) => void;
  startTrainingSession: (config: TrainingSessionConfig) => void;
  endTrainingSession: () => void;
  updateAdaptiveDifficulty: (performance: 'win' | 'draw' | 'loss', gameQuality?: number) => void;
  switchToNextStyle: () => void;
  saveTrainingProgress: () => Promise<void>;
  loadPlayerProfiles: () => Promise<void>;
}

export interface TrainingStoreActions {
  // 训练操作
  startTraining: (type: string, difficulty: string) => Promise<void>;
  submitExercise: (solution: any) => Promise<boolean>;
  requestHint: () => Promise<string | null>;
  endTraining: () => Promise<void>;

  // 训练管理
  loadExercises: (type?: string) => Promise<void>;
  saveProgress: () => Promise<void>;

  // 设置操作
  updateTrainingSettings: (settings: Partial<UserSettings['training']>) => void;
  setDailyGoal: (minutes: number) => void;
}

export interface UserStoreActions {
  // 用户操作
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<User>) => Promise<void>;

  // 设置操作
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // 数据操作
  syncData: () => Promise<void>;
  exportData: () => Promise<void>;
  clearData: () => Promise<void>;
}

export interface UIStoreActions {
  // 主题操作
  toggleTheme: () => void;
  setBoardTheme: (theme: string) => void;
  setPieceSet: (pieceSet: string) => void;

  // 布局操作
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setCurrentView: (view: string) => void;

  // 通知操作
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;

  // 模态框操作
  openModal: (modal: string, props?: Record<string, any>) => void;
  closeModal: () => void;

  // 加载状态
  setLoading: (loading: boolean, message?: string) => void;
}

// 完整Store类型
export interface AppStore
  extends GameStoreState,
    GameStoreActions,
    TrainingStoreState,
    TrainingStoreActions,
    UserStoreState,
    UserStoreActions,
    UIStoreState,
    UIStoreActions {}

// Store配置
export interface StoreConfig {
  persist: boolean; // 是否持久化
  version: number; // Store版本
  migrate?: (oldState: any) => any; // 数据迁移函数
}

// Store中间件配置
export interface MiddlewareConfig {
  logger?: boolean; // 是否启用日志
  devTools?: boolean; // 是否启用DevTools
  persistence?: {
    key: string;
    storage: 'local' | 'session';
  };
}