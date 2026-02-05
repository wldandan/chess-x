// 国际象棋相关类型定义

export type PlayerColor = 'white' | 'black'
export type PieceColor = 'w' | 'b'
export type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'timeout' | 'resigned'

// 棋手风格类型
export type PlayerStyle = 'carlsen' | 'kasparov' | 'caruana' | 'ding' | 'random' | 'aggressive' | 'positional' | 'tactical'

// 难度级别
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'master'

// 棋手风格配置
export interface PlayerStyleConfig {
  id: PlayerStyle
  name: string
  description: string
  icon: string
  color: string
  // AI参数
  positionalWeight: number  // 局面型权重 (0-1)
  tacticalWeight: number   // 战术型权重 (0-1)
  riskTolerance: number    // 风险容忍度 (0-1)
  attackFocus: number      // 攻击倾向 (0-1)
  endgameFocus: number     // 残局专注度 (0-1)
  // 风格特点
  characteristics: string[]
}

// 难度配置
export interface DifficultyConfig {
  level: DifficultyLevel
  name: string
  eloRange: [number, number]  // ELO范围
  skillLevel: number          // Stockfish技能等级 (0-20)
  depth: number               // 搜索深度
  moveTime: number            // 思考时间(ms)
}

// AI移动结果
export interface AIMoveResult {
  move: string                // SAN格式走法
  from: string               // 起始位置 (e2)
  to: string                 // 目标位置 (e4)
  promotion?: string         // 升变棋子
  score: number              // 评估分数
  depth: number              // 搜索深度
  nodes: number              // 搜索节点数
  time: number               // 计算时间(ms)
  pv?: string[]              // 主要变例
}

// 训练统计
export interface TrainingStats {
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
  totalMoves: number
  averageAccuracy: number
  bestStyle: PlayerStyle
  worstStyle: PlayerStyle
  eloRating: number
  eloChange: number
  trainingHours: number
}

// 对局记录
export interface GameRecord {
  id: string
  date: Date
  opponentStyle: PlayerStyle
  difficulty: DifficultyLevel
  result: 'win' | 'loss' | 'draw'
  moves: string[]
  finalFen: string
  accuracy: number
  duration: number
  analysis?: {
    bestMoves: number
    mistakes: number
    blunders: number
    averageCentipawnLoss: number
  }
}

// 自适应训练配置
export interface AdaptiveTrainingConfig {
  enabled: boolean
  initialDifficulty: DifficultyLevel
  targetWinRate: number  // 目标胜率 (0-1)
  adjustmentSensitivity: number  // 调整灵敏度
  minGamesForAdjustment: number // 调整所需最少对局数
}

// 棋手风格统计
export interface StyleStats {
  style: PlayerStyle
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
  winRate: number
  averageAccuracy: number
  averageMoveTime: number
  weaknessAreas: string[]
}