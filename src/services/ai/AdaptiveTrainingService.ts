// 自适应训练服务
// 负责根据用户表现动态调整AI难度

import type { AdaptiveDifficultyConfig } from '../../types/chess.types';

// 训练表现评估
export interface TrainingPerformance {
  gamesPlayed: number;
  gamesWon: number;
  gamesDrawn: number;
  gamesLost: number;
  averageQuality: number; // 对局质量 (0-1)
  consistency: number; // 表现一致性 (0-1)
  recentTrend: 'improving' | 'stable' | 'declining';
}

// 游戏质量评估
export interface GameQuality {
  moveAccuracy: number; // 着法准确度 (0-1)
  tacticalOpportunities: number; // 战术机会数量
  criticalMistakes: number; // 关键错误数量
  timeUsage: number; // 时间使用效率 (0-1)
  positionComplexity: number; // 局面复杂度 (0-1)
}

// 自适应训练服务
export class AdaptiveTrainingService {
  /**
   * 基于对局表现调整难度
   * @param currentConfig 当前自适应配置
   * @param performance 对局表现 ('win', 'draw', 'loss')
   * @param quality 对局质量 (0-1)
   * @param consistency 表现一致性 (0-1)
   * @returns 更新后的自适应配置
   */
  static adjustDifficulty(
    currentConfig: AdaptiveDifficultyConfig,
    performance: 'win' | 'draw' | 'loss',
    quality: number = 0.5,
    consistency: number = 0.5
  ): AdaptiveDifficultyConfig {
    // 基础调整值
    const baseAdjustments = {
      win: -50,   // 赢了降低难度
      draw: 0,    // 平局保持
      loss: 50    // 输了提高难度
    };

    // 对局质量调整：高质量对局的影响更大
    const qualityMultiplier = 1 + (quality - 0.5) * 0.5; // 0.75-1.25

    // 表现一致性调整：一致性高时调整幅度更大
    const consistencyMultiplier = 0.5 + consistency * 0.5; // 0.5-1.0

    // 计算总调整值
    const rawAdjustment = baseAdjustments[performance] * qualityMultiplier;
    const finalAdjustment = Math.round(rawAdjustment * currentConfig.adjustmentRate * consistencyMultiplier);

    // 计算新的ELO，确保在范围内
    const newElo = this.clamp(
      currentConfig.baseElo + finalAdjustment,
      currentConfig.minElo,
      currentConfig.maxElo
    );

    // 基于表现更新调整率
    const newAdjustmentRate = this.adjustRateBasedOnConsistency(
      currentConfig.adjustmentRate,
      consistency,
      performance
    );

    return {
      ...currentConfig,
      baseElo: newElo,
      adjustmentRate: newAdjustmentRate,
    };
  }

  /**
   * 计算对局表现分数
   * @param performance 对局表现 ('win', 'draw', 'loss')
   * @param quality 对局质量 (0-1)
   * @param complexity 局面复杂度 (0-1)
   * @returns 表现分数 (0-100)
   */
  static calculatePerformanceScore(
    performance: 'win' | 'draw' | 'loss',
    quality: number,
    complexity: number
  ): number {
    const performanceScores = {
      win: 70,
      draw: 50,
      loss: 30
    };

    // 基础分数
    let score = performanceScores[performance];

    // 质量调整：高质量对局加分
    score += (quality - 0.5) * 20; // ±10分

    // 复杂度调整：高复杂度对局加分
    score += (complexity - 0.5) * 10; // ±5分

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 基于表现一致性更新调整率
   * @param currentRate 当前调整率
   * @param consistency 表现一致性 (0-1)
   * @param performance 最近表现
   * @returns 更新后的调整率
   */
  static adjustRateBasedOnConsistency(
    currentRate: number,
    consistency: number,
    performance: 'win' | 'draw' | 'loss'
  ): number {
    // 高一致性时降低调整率（避免过度调整）
    // 低一致性时提高调整率（需要更多调整）
    const targetRate = 0.5 - (consistency * 0.2); // 0.3-0.5

    // 基于表现微调：连败时提高调整率
    const performanceBonus = {
      win: -0.05, // 连胜时略微降低调整率
      draw: 0,    // 平局保持不变
      loss: 0.05  // 连败时提高调整率
    }[performance];

    const newRate = currentRate + (targetRate - currentRate) * 0.1 + performanceBonus;

    return this.clamp(newRate, 0.1, 0.7);
  }

  /**
   * 计算表现一致性
   * @param recentResults 最近对局结果数组
   * @returns 一致性分数 (0-1)
   */
  static calculateConsistency(recentResults: Array<'win' | 'draw' | 'loss'>): number {
    if (recentResults.length < 3) {
      return 0.5; // 数据不足时返回中等一致性
    }

    // 计算结果的标准差
    const scoreMap = { win: 2, draw: 1, loss: 0 };
    const scores = recentResults.map(r => scoreMap[r]);

    const mean = scores.reduce((a, b) => a + b) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // 标准差越小，一致性越高
    // 最大可能标准差约为1.0，归一化到0-1
    const maxStdDev = 1.0;
    const consistency = 1 - Math.min(stdDev / maxStdDev, 1);

    return Math.round(consistency * 100) / 100;
  }

  /**
   * 计算对局质量
   * @param gameQuality 游戏质量数据
   * @returns 质量分数 (0-1)
   */
  static calculateGameQuality(gameQuality: GameQuality): number {
    const weights = {
      moveAccuracy: 0.4,      // 着法准确度最重要
      tacticalOpportunities: 0.2, // 战术机会数量
      criticalMistakes: -0.3,  // 关键错误扣分
      timeUsage: 0.2,          // 时间使用效率
      positionComplexity: 0.1   // 局面复杂度（奖励）
    };

    let quality = 0;

    // 着法准确度 (0-1)
    quality += gameQuality.moveAccuracy * weights.moveAccuracy;

    // 战术机会 (归一化到0-1，假设最多10个机会)
    const normalizedOpportunities = Math.min(gameQuality.tacticalOpportunities / 10, 1);
    quality += normalizedOpportunities * weights.tacticalOpportunities;

    // 关键错误 (归一化到0-1，假设最多5个错误)
    const normalizedMistakes = Math.min(gameQuality.criticalMistakes / 5, 1);
    quality -= normalizedMistakes * Math.abs(weights.criticalMistakes);

    // 时间使用效率 (0-1)
    quality += gameQuality.timeUsage * weights.timeUsage;

    // 局面复杂度 (0-1)
    quality += gameQuality.positionComplexity * weights.positionComplexity;

    return Math.max(0, Math.min(1, quality));
  }

  /**
   * 计算最佳ELO范围
   * @param userElo 用户当前ELO
   * @param performance 历史表现
   * @returns 推荐的ELO范围 [min, max]
   */
  static calculateOptimalEloRange(
    userElo: number,
    performance: TrainingPerformance
  ): [number, number] {
    // 计算胜率
    const winRate = performance.gamesPlayed > 0
      ? performance.gamesWon / performance.gamesPlayed
      : 0.5;

    // 目标胜率：40%-60%为理想范围
    const targetWinRate = 0.5;

    // 根据胜率偏差调整ELO范围
    const winRateDeviation = winRate - targetWinRate;
    const eloAdjustment = winRateDeviation * 200; // 每10%胜率偏差对应20ELO调整

    // 计算基准范围 (±200 ELO)
    const baseMin = Math.max(800, userElo - 200);
    const baseMax = Math.min(2800, userElo + 200);

    // 根据胜率调整
    const adjustedMin = Math.max(800, Math.round(baseMin - eloAdjustment));
    const adjustedMax = Math.min(2800, Math.round(baseMax - eloAdjustment));

    return [adjustedMin, adjustedMax];
  }

  /**
   * 计算训练强度
   * @param currentElo 当前ELO
   * @param targetElo 目标ELO
   * @param timeAvailable 可用时间(分钟)
   * @returns 推荐训练强度
   */
  static calculateTrainingIntensity(
    currentElo: number,
    targetElo: number,
    timeAvailable: number
  ): {
    sessionsPerWeek: number;
    minutesPerSession: number;
    difficultyStep: number;
  } {
    const eloGap = Math.abs(targetElo - currentElo);

    // 基于ELO差距的训练强度
    let sessionsPerWeek: number;
    let minutesPerSession: number;
    let difficultyStep: number;

    if (eloGap <= 100) {
      // 小差距：轻松训练
      sessionsPerWeek = 3;
      minutesPerSession = Math.min(30, timeAvailable / 3);
      difficultyStep = 25; // 小步前进
    } else if (eloGap <= 300) {
      // 中等差距：标准训练
      sessionsPerWeek = 4;
      minutesPerSession = Math.min(45, timeAvailable / 2);
      difficultyStep = 50; // 标准步进
    } else {
      // 大差距：强化训练
      sessionsPerWeek = 5;
      minutesPerSession = Math.min(60, timeAvailable);
      difficultyStep = 75; // 快速提升
    }

    // 基于可用时间调整
    const totalAvailableMinutes = timeAvailable * 7; // 周总分钟数
    const totalRequiredMinutes = sessionsPerWeek * minutesPerSession;

    if (totalRequiredMinutes > totalAvailableMinutes) {
      // 如果需求超过可用时间，减少每次时长
      minutesPerSession = Math.floor(totalAvailableMinutes / sessionsPerWeek);
    }

    return {
      sessionsPerWeek,
      minutesPerSession,
      difficultyStep,
    };
  }

  /**
   * 计算训练进度预测
   * @param currentElo 当前ELO
   * @param trainingHistory 历史训练数据
   * @param weeklyHours 每周训练小时数
   * @returns 进度预测
   */
  static predictProgress(
    currentElo: number,
    trainingHistory: Array<{ eloChange: number; hours: number }>,
    weeklyHours: number
  ): {
    predictedElo: number;
    weeksToTarget: number;
    confidence: number;
  } {
    if (trainingHistory.length === 0) {
      // 无历史数据时使用默认预测
      const defaultEloGainPerHour = 0.5; // 默认每小时0.5ELO
      const weeklyGain = defaultEloGainPerHour * weeklyHours;

      return {
        predictedElo: currentElo + weeklyGain * 4, // 4周预测
        weeksToTarget: 999, // 无法预测
        confidence: 0.3,
      };
    }

    // 计算历史平均进步率
    const totalHours = trainingHistory.reduce((sum, record) => sum + record.hours, 0);
    const totalEloGain = trainingHistory.reduce((sum, record) => sum + record.eloChange, 0);
    const gainPerHour = totalEloGain / totalHours;

    // 计算预测
    const weeklyGain = gainPerHour * weeklyHours;
    const predictedElo = currentElo + weeklyGain * 4; // 预测4周后

    // 计算置信度（基于数据量和一致性）
    const dataPoints = trainingHistory.length;
    const consistency = this.calculateProgressConsistency(trainingHistory);
    const confidence = Math.min(0.95, 0.3 + (dataPoints / 20) * 0.5 + consistency * 0.2);

    // 计算达到目标所需周数（假设目标为currentElo + 200）
    const targetElo = currentElo + 200;
    const weeksToTarget = weeklyGain > 0
      ? Math.ceil((targetElo - currentElo) / weeklyGain)
      : 999;

    return {
      predictedElo: Math.round(predictedElo),
      weeksToTarget,
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  /**
   * 计算进步一致性
   * @param trainingHistory 历史训练数据
   * @returns 一致性分数 (0-1)
   */
  private static calculateProgressConsistency(
    trainingHistory: Array<{ eloChange: number; hours: number }>
  ): number {
    if (trainingHistory.length < 2) {
      return 0.5;
    }

    // 计算每小时ELO增长的标准差
    const hourlyRates = trainingHistory.map(record => record.eloChange / record.hours);
    const mean = hourlyRates.reduce((a, b) => a + b) / hourlyRates.length;
    const variance = hourlyRates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / hourlyRates.length;
    const stdDev = Math.sqrt(variance);

    // 标准差越小，一致性越高
    const maxStdDev = 2.0; // 假设最大标准差为2.0
    const consistency = 1 - Math.min(stdDev / maxStdDev, 1);

    return Math.round(consistency * 100) / 100;
  }

  /**
   * 限制数值在指定范围内
   * @param value 原始值
   * @param min 最小值
   * @param max 最大值
   * @returns 限制后的值
   */
  private static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}

// 导出工具函数
export const adaptiveTrainingService = AdaptiveTrainingService;