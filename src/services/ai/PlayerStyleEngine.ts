// AI风格模拟引擎
// 负责将棋手风格参数映射到Stockfish配置，处理ELO等级分转换

import type { StyleParameters, AIPlayerProfile } from '../../types/chess.types';

// Stockfish配置接口
export interface StockfishConfig {
  skillLevel: number; // 0-20
  depth?: number; // 搜索深度
  nodes?: number; // 搜索节点数
  contempt?: number; // 和棋倾向
  threads?: number; // 线程数
  hashSize?: number; // 哈希表大小(MB)
}

// 局面类型
export type PositionType = 'opening' | 'middlegame' | 'endgame';

// 风格模拟引擎
export class PlayerStyleEngine {
  /**
   * 将ELO等级分映射到Stockfish技能等级 (0-20)
   * @param elo ELO等级分 (800-2800)
   * @returns Stockfish技能等级 (0-20)
   */
  static eloToSkillLevel(elo: number): number {
    // 分段映射:
    // 800-1200: 0-4 (初学者)
    // 1200-1800: 5-10 (中级)
    // 1800-2200: 11-16 (高级)
    // 2200-2800: 17-20 (大师级)

    if (elo < 1200) {
      // 800-1200 映射到 0-4
      const normalized = (elo - 800) / (1200 - 800); // 0-1
      return Math.floor(normalized * 4);
    } else if (elo < 1800) {
      // 1200-1800 映射到 5-10
      const normalized = (elo - 1200) / (1800 - 1200); // 0-1
      return 5 + Math.floor(normalized * 5);
    } else if (elo < 2200) {
      // 1800-2200 映射到 11-16
      const normalized = (elo - 1800) / (2200 - 1800); // 0-1
      return 11 + Math.floor(normalized * 5);
    } else {
      // 2200-2800 映射到 17-20
      const normalized = Math.min(1, (elo - 2200) / (2800 - 2200)); // 0-1
      return 17 + Math.floor(normalized * 3);
    }
  }

  /**
   * 根据风格参数和ELO计算搜索深度
   * @param elo ELO等级分
   * @param styleParams 风格参数
   * @param positionType 局面类型
   * @returns 推荐搜索深度
   */
  static calculateSearchDepth(
    elo: number,
    styleParams: StyleParameters,
    positionType: PositionType = 'middlegame'
  ): number {
    // 基础深度基于ELO
    const baseDepth = Math.floor(elo / 150); // 800->5, 2000->13

    // 风格调整
    const tacticalBonus = styleParams.tacticalWeight * 3; // 战术型增加深度
    const positionalBonus = styleParams.positionalWeight * 2; // 局面型增加深度
    const riskBonus = styleParams.riskTolerance * 2; // 高风险容忍度增加深度

    // 局面类型调整
    const positionBonus = {
      opening: 1, // 开局减少深度（更多理论）
      middlegame: 0, // 中局标准
      endgame: 2, // 残局增加深度（需要精确计算）
    }[positionType];

    const totalDepth = Math.max(1, Math.min(25,
      baseDepth + tacticalBonus + positionalBonus + riskBonus + positionBonus
    ));

    return Math.round(totalDepth);
  }

  /**
   * 计算和棋倾向（contempt）
   * @param riskTolerance 风险容忍度
   * @param positionType 局面类型
   * @returns 和棋倾向值
   */
  static calculateContempt(riskTolerance: number, positionType: PositionType = 'middlegame'): number {
    // 基础值：高风险容忍度意味着更少和棋倾向
    const baseContempt = 50 * (1 - riskTolerance); // 0-50

    // 局面调整：残局更倾向和棋，开局更倾向战斗
    const positionAdjustment = {
      opening: 10, // 开局更倾向战斗
      middlegame: 0, // 中局标准
      endgame: -20, // 残局更倾向和棋
    }[positionType];

    return Math.max(-100, Math.min(100, baseContempt + positionAdjustment));
  }

  /**
   * 将风格参数映射到完整的Stockfish配置
   * @param styleParams 风格参数
   * @param elo ELO等级分
   * @param positionType 局面类型
   * @returns Stockfish配置
   */
  static mapStyleToStockfishConfig(
    styleParams: StyleParameters,
    elo: number,
    positionType: PositionType = 'middlegame'
  ): StockfishConfig {
    const skillLevel = this.eloToSkillLevel(elo);
    const depth = this.calculateSearchDepth(elo, styleParams, positionType);
    const contempt = this.calculateContempt(styleParams.riskTolerance, positionType);

    // 根据ELO和风格调整其他参数
    const nodes = Math.floor(Math.pow(10, 4 + (elo / 1000))); // 指数增长
    const threads = elo > 2000 ? 4 : 2; // 高ELO使用更多线程
    const hashSize = elo > 1800 ? 256 : 128; // 高ELO使用更大哈希表

    return {
      skillLevel,
      depth,
      nodes,
      contempt,
      threads,
      hashSize,
    };
  }

  /**
   * 根据棋手配置生成Stockfish配置
   * @param profile 棋手配置
   * @param currentElo 当前ELO（用于自适应难度）
   * @param positionType 局面类型
   * @returns Stockfish配置
   */
  static getConfigForPlayer(
    profile: AIPlayerProfile,
    currentElo?: number,
    positionType: PositionType = 'middlegame'
  ): StockfishConfig {
    const targetElo = currentElo || profile.elo;
    return this.mapStyleToStockfishConfig(profile.styleParams, targetElo, positionType);
  }

  /**
   * 识别局面类型
   * @param fen FEN字符串
   * @returns 局面类型
   */
  static detectPositionType(fen: string): PositionType {
    // 简单识别：根据棋子数量和位置判断局面类型
    const parts = fen.split(' ');
    const piecePlacement = parts[0];

    // 计算剩余棋子数量
    const pieceCount = piecePlacement.replace(/[1-8]/g, '').replace(/\//g, '').length;

    // 检查是否在后翼（a-d列）有兵
    const hasQueensidePawns = /[a-d][2-7]/.test(piecePlacement);

    // 检查是否在中心（d/e列）有兵
    const hasCenterPawns = /[de][2-7]/.test(piecePlacement);

    // 简单规则：
    if (pieceCount <= 10) {
      return 'endgame'; // 残局
    } else if (!hasCenterPawns && hasQueensidePawns) {
      return 'opening'; // 开局
    } else {
      return 'middlegame'; // 中局
    }
  }

  /**
   * 获取风格描述
   * @param styleParams 风格参数
   * @returns 风格描述文本
   */
  static getStyleDescription(styleParams: StyleParameters): string {
    const descriptors: string[] = [];

    if (styleParams.positionalWeight > 0.7) {
      descriptors.push('高度局面型');
    } else if (styleParams.positionalWeight > 0.5) {
      descriptors.push('偏局面型');
    }

    if (styleParams.tacticalWeight > 0.7) {
      descriptors.push('高度战术型');
    } else if (styleParams.tacticalWeight > 0.5) {
      descriptors.push('偏战术型');
    }

    if (styleParams.riskTolerance > 0.7) {
      descriptors.push('高风险偏好');
    } else if (styleParams.riskTolerance < 0.3) {
      descriptors.push('低风险偏好');
    }

    if (styleParams.attackFocus > 0.7) {
      descriptors.push('攻击性强');
    }

    if (styleParams.endgameFocus > 0.7) {
      descriptors.push('残局专家');
    }

    return descriptors.length > 0 ? descriptors.join('，') : '均衡型';
  }

  /**
   * 计算风格匹配度
   * @param playerStyle 玩家风格参数
   * @param aiStyle AI风格参数
   * @returns 匹配度分数 (0-100)
   */
  static calculateStyleMatch(
    playerStyle: StyleParameters,
    aiStyle: StyleParameters
  ): number {
    // 计算每个维度的相似度
    const dimensions = [
      'positionalWeight',
      'tacticalWeight',
      'riskTolerance',
      'attackFocus',
      'endgameFocus'
    ] as const;

    let totalSimilarity = 0;

    for (const dimension of dimensions) {
      const playerValue = playerStyle[dimension];
      const aiValue = aiStyle[dimension];
      const similarity = 1 - Math.abs(playerValue - aiValue);
      totalSimilarity += similarity;
    }

    const averageSimilarity = totalSimilarity / dimensions.length;
    return Math.round(averageSimilarity * 100);
  }

  /**
   * 将StockfishConfig转换为UCI命令数组
   * @param config Stockfish配置
   * @returns UCI命令数组
   */
  static toUCICommands(config: StockfishConfig): string[] {
    const commands: string[] = [];

    // 设置技能等级 (0-20)
    commands.push(`setoption name Skill Level value ${config.skillLevel}`);

    // 设置和棋倾向 (contempt)
    if (config.contempt !== undefined) {
      commands.push(`setoption name Contempt value ${config.contempt}`);
    }

    // 设置搜索深度
    if (config.depth !== undefined) {
      // Depth is handled in 'go' command, not as a UCI option
      // But we can set minimum thinking time
    }

    // 设置线程数
    if (config.threads !== undefined) {
      commands.push(`setoption name Threads value ${config.threads}`);
    }

    // 设置哈希表大小
    if (config.hashSize !== undefined) {
      commands.push(`setoption name Hash value ${config.hashSize}`);
    }

    // 设置思考时间 (基于节点数)
    if (config.nodes !== undefined) {
      // Nodes is handled in 'go' command
    }

    return commands;
  }

  /**
   * 获取和棋倾向值（contempt）
   * @param riskTolerance 风险容忍度
   * @param positionType 局面类型
   * @returns 和棋倾向值 (-100 to 100)
   */
  static getContemptValue(
    riskTolerance: number,
    positionType: PositionType = 'middlegame'
  ): number {
    return this.calculateContempt(riskTolerance, positionType);
  }

  /**
   * 获取思考时间（毫秒）
   * @param elo ELO等级分
   * @param styleParams 风格参数（可选）
   * @param positionType 局面类型
   * @returns 思考时间（毫秒）
   */
  static getThinkingTime(
    elo: number,
    styleParams?: StyleParameters,
    positionType: PositionType = 'middlegame'
  ): number {
    // 基础时间基于ELO (对数增长)
    const baseTime = 100 + Math.log10(elo / 100) * 2000; // 800->~460ms, 2800->~2600ms

    // 局面类型调整
    const positionMultiplier = {
      opening: 0.8,   // 开局较快（理论多）
      middlegame: 1.0, // 中局标准
      endgame: 1.2    // 残局需要精确计算
    }[positionType];

    // 风格调整
    let styleMultiplier = 1.0;
    if (styleParams) {
      // 战术型需要更多时间计算复杂变化
      const tacticalBonus = styleParams.tacticalWeight * 0.3;
      // 局面型可能需要更多时间评估长远计划
      const positionalBonus = styleParams.positionalWeight * 0.2;
      styleMultiplier = 1 + tacticalBonus + positionalBonus;
    }

    // 计算最终时间并限制范围
    const finalTime = baseTime * positionMultiplier * styleMultiplier;
    return Math.max(100, Math.min(10000, Math.round(finalTime)));
  }

  /**
   * 获取搜索深度（考虑局面类型修正）
   * @param config Stockfish配置
   * @param positionType 局面类型
   * @returns 搜索深度
   */
  static getSearchDepth(
    config: StockfishConfig,
    positionType: PositionType = 'middlegame'
  ): number {
    const modifier = this.getPositionModifier(positionType);
    const baseDepth = config.depth || 10;

    // 应用局面修正并限制范围
    const adjustedDepth = baseDepth + modifier;
    return Math.max(1, Math.min(25, Math.round(adjustedDepth)));
  }

  /**
   * 获取局面类型修正值
   * @param positionType 局面类型
   * @returns 深度修正值
   */
  static getPositionModifier(positionType: PositionType): number {
    return {
      opening: -1,   // 开局减少深度（更多理论）
      middlegame: 0, // 中局标准
      endgame: 2     // 残局增加深度（需要精确计算）
    }[positionType];
  }
}

// 导出工具函数
export const playerStyleEngine = PlayerStyleEngine;