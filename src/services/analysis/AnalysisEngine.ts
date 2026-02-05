// 分析引擎 - 负责生成棋步分析和报告
import type { Chess } from 'chess.js';
import type {
  AnalyzedMove,
  AnalysisConfig,
  GameAnalysisReport,
  MoveAlternative,
  MoveQuality,
  MoveScore,
  TacticalOpportunity,
  CriticalMoment,
  TimeManagementAnalysis,
  OpeningInfo,
} from '../../types/analysis.types';
import type { ChessGame, ChessMove as GameMove } from '../../types/game.types';
import type { Square } from '../../types/chess.types';

// 分析引擎类
export class AnalysisEngine {
  private config: Required<AnalysisConfig>;
  private randomSeed: number;

  // 战术类型配置
  private readonly tacticalTypes: Array<{
    type: TacticalOpportunity['type'];
    name: string;
    baseStrength: number;
  }> = [
    { type: 'fork', name: '捉双', baseStrength: 0.8 },
    { type: 'pin', name: '牵制', baseStrength: 0.6 },
    { type: 'skewer', name: '串击', baseStrength: 0.7 },
    { type: 'discovered', name: '闪击', baseStrength: 0.75 },
    { type: 'double_attack', name: '双重攻击', baseStrength: 0.7 },
    { type: 'deflection', name: '诱离', baseStrength: 0.65 },
    { type: 'decoy', name: '引入', baseStrength: 0.6 },
    { type: 'zwischenzug', name: '过渡', baseStrength: 0.55 },
    { type: 'overload', name: '过载', baseStrength: 0.6 },
    { type: 'xray', name: '穿刺', baseStrength: 0.5 },
    { type: 'clearance', name: '清空', baseStrength: 0.5 },
    { type: 'interference', name: '干扰', baseStrength: 0.55 },
    { type: 'trapped_piece', name: '陷阱', baseStrength: 0.65 },
    { type: 'hanging_piece', name: '悬兵', baseStrength: 0.7 },
    { type: 'weak_backrank', name: '弱底线', baseStrength: 0.75 },
    { type: 'mate_threat', name: '杀棋威胁', baseStrength: 0.95 },
  ];

  // 开局数据库 (简化版)
  private readonly openingDB = new Map<string, OpeningInfo>([
    ['e2e4', { eco: 'B20', name: '王兵开局', variation: undefined, moves: ['e4'], isBook: true }],
    ['e2e4c7c5', { eco: 'B20', name: '西西里防御', variation: undefined, moves: ['e4', 'c5'], isBook: true }],
    ['e2e4e7e5', { eco: 'C20', name: '开放开局', variation: undefined, moves: ['e4', 'e5'], isBook: true }],
    ['e2e4e7e6', { eco: 'C00', name: '法兰西防御', variation: undefined, moves: ['e4', 'e6'], isBook: true }],
    ['e2e4c7c6', { eco: 'B10', name: '卡罗-康防御', variation: undefined, moves: ['e4', 'c6'], isBook: true }],
    ['d2d4d7d5', { eco: 'D00', name: '后兵开局', variation: undefined, moves: ['d4', 'd5'], isBook: true }],
    ['d2d4g8f6', { eco: 'A40', name: '印度防御', variation: undefined, moves: ['d4', 'Nf6'], isBook: true }],
    ['d2d4d7d5c2c4', { eco: 'D06', name: '后翼弃兵', variation: '接受', moves: ['d4', 'd5', 'c4'], isBook: true }],
    ['g1f3d7d5', { eco: 'A04', name: '雷蒂开局', variation: undefined, moves: ['Nf3', 'd5'], isBook: true }],
    ['c2c4', { eco: 'A00', name: '英国式开局', variation: undefined, moves: ['c4'], isBook: true }],
  ]);

  constructor(config: AnalysisConfig = {}) {
    this.config = {
      depth: config.depth ?? 15,
      engine: config.engine ?? 'mock',
      includeAlternatives: config.includeAlternatives ?? true,
      alternativesCount: config.alternativesCount ?? 3,
      detectTactics: config.detectTactics ?? true,
      includeOpening: config.includeOpening ?? true,
      timeAnalysis: config.timeAnalysis ?? true,
    };
    this.randomSeed = Date.now();
  }

  // 分析单步棋
  async analyzeMove(
    game: ChessGame,
    moveIndex: number,
    player: 'white' | 'black'
  ): Promise<AnalyzedMove> {
    const move = game.moves[moveIndex];

    // 生成评估分数
    const scoreBefore = this.generateScore(game, moveIndex - 1, player);
    const scoreAfter = this.generateScore(game, moveIndex, player === 'white' ? 'black' : 'white');
    const scoreDiff = player === 'white' ? scoreAfter - scoreBefore : scoreBefore - scoreAfter;

    // 确定走法质量
    const quality = this.determineQuality(scoreDiff, moveIndex);
    const { bestMove, bestMoveScore } = this.generateBestMove(game, moveIndex, player);

    // 生成替代走法
    const alternatives = this.config.includeAlternatives
      ? this.generateAlternatives(game, moveIndex, player, quality)
      : [];

    // 检测战术机会
    const tacticalOpportunities = this.config.detectTactics
      ? this.detectTactics(game, moveIndex, player)
      : [];

    const missedTactics = this.config.detectTactics
      ? this.detectMissedTactics(game, moveIndex, player, tacticalOpportunities)
      : [];

    // 判断是否关键决策点
    const isCritical = this.isCriticalMoment(scoreDiff, tacticalOpportunities, moveIndex);

    return {
      move: {
        from: move.from as any,
        to: move.to as any,
        promotion: move.promotion as any,
        san: move.san,
      },
      moveNumber: Math.floor(moveIndex / 2) + 1,
      player,
      scoreBefore,
      scoreAfter,
      scoreDiff,
      bestMove,
      bestMoveScore,
      quality,
      alternatives,
      tacticalOpportunities,
      missedTactics,
      timeUsed: this.generateTimeUsed(moveIndex, game.moves.length, quality),
      timeRemaining: 600 - this.generateTimeUsed(moveIndex, game.moves.length, quality),
      isCritical,
      criticalReason: isCritical ? this.getCriticalReason(scoreDiff, tacticalOpportunities) : undefined,
    };
  }

  // 生成完整分析报告
  async generateReport(
    game: ChessGame,
    analyzedMoves: AnalyzedMove[]
  ): Promise<GameAnalysisReport> {
    // 统计白方走法
    const whiteMoves = analyzedMoves.filter(m => m.player === 'white');
    const blackMoves = analyzedMoves.filter(m => m.player === 'black');

    // 计算准确率
    const whiteAccuracy = this.calculateAccuracy(whiteMoves);
    const blackAccuracy = this.calculateAccuracy(blackMoves);

    // 统计各质量等级
    const stats = this.calculateMoveStats(analyzedMoves);

    // 找出关键时刻
    const criticalMoments = this.findCriticalMoments(analyzedMoves);

    // 开局分析
    const opening = this.analyzeOpening(game, analyzedMoves);
    const openingAccuracy = this.calculateOpeningAccuracy(game, analyzedMoves);

    // 战术统计
    const tacticsUsed = this.collectAllTactics(analyzedMoves);
    const tacticsFound = tacticsUsed.length;
    const tacticsMissed = analyzedMoves.reduce((sum, m) => sum + m.missedTactics.length, 0);

    // 时间管理分析
    const timeManagement = this.analyzeTimeManagement(game, analyzedMoves);

    // 生成建议
    const { strengths, weaknesses, recommendations } = this.generateRecommendations(
      analyzedMoves,
      stats,
      opening
    );

    return {
      gameId: game.id,
      analyzedAt: new Date(),
      overallAccuracy: (whiteAccuracy + blackAccuracy) / 2,
      whiteAccuracy,
      blackAccuracy,
      totalMoves: game.moves.length,
      bestMoves: stats.bestMoves,
      greatMoves: stats.greatMoves,
      goodMoves: stats.goodMoves,
      inaccuracies: stats.inaccuracies,
      mistakes: stats.mistakes,
      blunders: stats.blunders,
      bestMovePercent: (stats.bestMoves / game.moves.length) * 100,
      goodMovePercent: ((stats.bestMoves + stats.greatMoves + stats.goodMoves) / game.moves.length) * 100,
      errorPercent: ((stats.inaccuracies + stats.mistakes + stats.blunders) / game.moves.length) * 100,
      criticalMoments,
      opening,
      openingAccuracy,
      deviation: this.findOpeningDeviation(game, analyzedMoves),
      tacticsFound,
      tacticsMissed,
      tacticsUsed,
      timeManagement,
      strengths,
      weaknesses,
      recommendations,
      analysisDepth: this.config.depth,
      engineName: this.config.engine === 'mock' ? 'Mock Analysis Engine v1.0' : 'Stockfish',
    };
  }

  // ========== 辅助方法 ==========

  // 生成评估分数 (-5 到 +5)
  private generateScore(game: ChessGame, moveIndex: number, player: 'white' | 'black'): MoveScore {
    // 模拟评估：基于回合数和随机因素
    const baseScore = this.seededRandom(-1, 1);
    const moveInfluence = (moveIndex / 100) * this.seededRandom(-0.5, 0.5);
    const score = baseScore + moveInfluence;

    return Math.max(-5, Math.min(5, Math.round(score * 10) / 10)) as MoveScore;
  }

  // 确定走法质量
  private determineQuality(scoreDiff: number, moveIndex: number): MoveQuality {
    // 前10步可能是开局库
    if (moveIndex < 10 && Math.random() > 0.3) {
      return 'book';
    }

    const absDiff = Math.abs(scoreDiff);

    if (scoreDiff >= 1.5) return 'best';
    if (scoreDiff >= 0.8) return 'great';
    if (scoreDiff >= 0) return 'good';
    if (scoreDiff >= -0.5) return 'inaccuracy';
    if (scoreDiff >= -1.5) return 'mistake';
    return 'blunder';
  }

  // 生成最佳走法
  private generateBestMove(
    game: ChessGame,
    moveIndex: number,
    player: 'white' | 'black'
  ): { bestMove: GameMove | null; bestMoveScore: MoveScore } {
    // 简化实现：随机选择是否当前走法就是最佳
    const isCurrentBest = Math.random() > 0.4;

    if (isCurrentBest) {
      const move = game.moves[moveIndex];
      return {
        bestMove: move,
        bestMoveScore: this.generateScore(game, moveIndex, player),
      };
    }

    // 生成一个不同的"最佳"走法
    return {
      bestMove: null,
      bestMoveScore: this.generateScore(game, moveIndex, player) + 0.5 as MoveScore,
    };
  }

  // 生成替代走法
  private generateAlternatives(
    game: ChessGame,
    moveIndex: number,
    player: 'white' | 'black',
    currentQuality: MoveQuality
  ): MoveAlternative[] {
    const alternatives: MoveAlternative[] = [];
    const count = Math.min(this.config.alternativesCount, 3);

    for (let i = 0; i < count; i++) {
      const score = this.generateScore(game, moveIndex, player);
      const scoreDiff = score - (currentQuality === 'best' ? 0 : -1);

      alternatives.push({
        move: {
          from: 'e2' as any,
          to: 'e4' as any,
          san: this.generateAlternativeSAN(),
        },
        score,
        scoreDiff,
        quality: this.determineQuality(scoreDiff, moveIndex),
        explanation: this.generateExplanation(scoreDiff),
        isBest: i === 0 && Math.random() > 0.5,
      });
    }

    return alternatives;
  }

  // 检测战术机会
  private detectTactics(
    game: ChessGame,
    moveIndex: number,
    player: 'white' | 'black'
  ): TacticalOpportunity[] {
    if (!this.config.detectTactics) return [];

    // 模拟战术检测：基于概率
    const tactics: TacticalOpportunity[] = [];
    const tacticCount = Math.floor(this.seededRandom(0, 2));

    for (let i = 0; i < tacticCount; i++) {
      const typeIndex = Math.floor(this.seededRandom(0, this.tacticalTypes.length));
      const type = this.tacticalTypes[typeIndex];

      tactics.push({
        type: type.type,
        name: type.name,
        squares: this.generateTacticalSquares(),
        description: this.generateTacticalDescription(type.name),
        strength: type.baseStrength + this.seededRandom(-0.1, 0.1),
        winning: type.baseStrength > 0.7 && Math.random() > 0.5,
        evaluation: (type.baseStrength * 3) as MoveScore,
      });
    }

    return tactics;
  }

  // 检测错过的战术
  private detectMissedTactics(
    game: ChessGame,
    moveIndex: number,
    player: 'white' | 'black',
    foundTactics: TacticalOpportunity[]
  ): TacticalOpportunity[] {
    // 偶尔返回错过的战术
    if (Math.random() > 0.8) {
      return [this.detectTactics(game, moveIndex, player)[0]].filter(Boolean);
    }
    return [];
  }

  // 判断是否关键决策点
  private isCriticalMoment(
    scoreDiff: number,
    tactics: TacticalOpportunity[],
    moveIndex: number
  ): boolean {
    if (Math.abs(scoreDiff) > 1) return true;
    if (tactics.some(t => t.strength > 0.7)) return true;
    if (moveIndex > 20 && moveIndex < 30 && Math.random() > 0.7) return true; // 中局关键点
    return false;
  }

  // 获取关键决策点原因
  private getCriticalReason(scoreDiff: number, tactics: TacticalOpportunity[]): string {
    if (tactics.some(t => t.strength > 0.7)) {
      return `存在${tactics.find(t => t.strength > 0.7)?.name}战术机会`;
    }
    if (scoreDiff > 1) return '局面获得显著改善';
    if (scoreDiff < -1) return '局面明显恶化';
    return '关键决策点';
  }

  // 计算准确率
  private calculateAccuracy(moves: AnalyzedMove[]): number {
    if (moves.length === 0) return 100;

    let accuracy = 100;
    for (const move of moves) {
      switch (move.quality) {
        case 'best': accuracy += 0; break;
        case 'great': accuracy -= 2; break;
        case 'good': accuracy -= 5; break;
        case 'book': accuracy -= 0; break;
        case 'inaccuracy': accuracy -= 10; break;
        case 'mistake': accuracy -= 20; break;
        case 'blunder': accuracy -= 40; break;
      }
    }

    return Math.max(0, Math.min(100, accuracy / moves.length));
  }

  // 计算走法统计
  private calculateMoveStats(moves: AnalyzedMove[]) {
    return {
      bestMoves: moves.filter(m => m.quality === 'best').length,
      greatMoves: moves.filter(m => m.quality === 'great').length,
      goodMoves: moves.filter(m => m.quality === 'good').length,
      inaccuracies: moves.filter(m => m.quality === 'inaccuracy').length,
      mistakes: moves.filter(m => m.quality === 'mistake').length,
      blunders: moves.filter(m => m.quality === 'blunder').length,
    };
  }

  // 找出关键时刻
  private findCriticalMoments(moves: AnalyzedMove[]): CriticalMoment[] {
    return moves
      .filter(m => m.isCritical)
      .map(m => ({
        moveNumber: m.moveNumber,
        move: m.move,
        type: m.scoreDiff > 1 ? 'brilliant_move' :
              m.scoreDiff < -1 ? 'critical_error' :
              m.tacticalOpportunities.length > 0 ? 'turning_point' : 'turning_point',
        description: m.criticalReason || '关键决策点',
        scoreBefore: m.scoreBefore,
        scoreAfter: m.scoreAfter,
        impact: Math.abs(m.scoreDiff) > 2 ? 'high' : 'medium',
      }));
  }

  // 分析开局
  private analyzeOpening(game: ChessGame, moves: AnalyzedMove[]): OpeningInfo {
    // 尝试匹配开局库
    const moveSequence = game.moves.slice(0, Math.min(10, game.moves.length))
      .map(m => m.from + m.to)
      .join('');

    for (const [key, opening] of this.openingDB.entries()) {
      if (moveSequence.startsWith(key)) {
        return opening;
      }
    }

    // 默认开局
    return {
      eco: 'A00',
      name: '未知开局',
      moves: [],
      isBook: false,
    };
  }

  // 计算开局准确率
  private calculateOpeningAccuracy(game: ChessGame, moves: AnalyzedMove[]): number {
    const openingMoves = moves.slice(0, Math.min(10, moves.length));
    return this.calculateAccuracy(openingMoves);
  }

  // 找出开局偏差
  private findOpeningDeviation(game: ChessGame, moves: AnalyzedMove[]) {
    const firstNonBook = moves.find(m => m.quality !== 'book');
    if (firstNonBook && firstNonBook.alternatives[0]) {
      return {
        move: firstNonBook.move,
        expected: firstNonBook.alternatives[0].move,
        explanation: `开局建议走 ${firstNonBook.alternatives[0].move.san}`,
      };
    }
    return undefined;
  }

  // 收集所有战术
  private collectAllTactics(moves: AnalyzedMove[]): TacticalOpportunity[] {
    return moves.flatMap(m => m.tacticalOpportunities);
  }

  // 分析时间管理
  private analyzeTimeManagement(game: ChessGame, moves: AnalyzedMove[]): TimeManagementAnalysis {
    const times = moves.map(m => m.timeUsed);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return {
      averageTimePerMove: avgTime,
      fastestMove: { move: moves[times.indexOf(minTime)].move, time: minTime },
      slowestMove: { move: moves[times.indexOf(maxTime)].move, time: maxTime },
      timeTroubleMoves: moves.filter(m => m.timeRemaining < 60).length,
      goodTimeManagement: Math.max(0, 100 - (maxTime - minTime) / 10),
      timeUsedInCritical: moves.filter(m => m.isCritical).reduce((sum, m) => sum + m.timeUsed, 0),
    };
  }

  // 生成建议
  private generateRecommendations(
    moves: AnalyzedMove[],
    stats: ReturnType<typeof this.calculateMoveStats>,
    opening: OpeningInfo
  ): { strengths: string[]; weaknesses: string[]; recommendations: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // 分析优点
    if (stats.bestMoves / moves.length > 0.3) {
      strengths.push('走法准确，很多时候找到了最佳走法');
    }
    if (stats.blunders === 0) {
      strengths.push('没有重大失误，走法稳健');
    }
    if (opening.isBook) {
      strengths.push('开局准备充分，熟练掌握开局理论');
    }

    // 分析弱点
    if (stats.blunders > 0) {
      weaknesses.push(`存在${stats.blunders}个大失误，需要提高专注力`);
    }
    if (stats.mistakes > 2) {
      weaknesses.push('战术识别能力需要加强');
    }
    if (!opening.isBook) {
      weaknesses.push('开局知识储备不足');
    }

    // 生成建议
    if (stats.blunders > 0 || stats.mistakes > 2) {
      recommendations.push('建议进行战术训练，提高战术识别能力');
      recommendations.push('对局时注意检查对手的威胁再走棋');
    }
    if (!opening.isBook) {
      recommendations.push(`学习${opening.name}开局体系，扩展开局武器库`);
    }
    if (stats.inaccuracies > 3) {
      recommendations.push('加强残局学习，提高局面评估能力');
    }

    // 默认建议
    if (recommendations.length === 0) {
      recommendations.push('保持良好状态，继续在实战中积累经验');
    }

    return { strengths, weaknesses, recommendations };
  }

  // 生成思考时间
  private generateTimeUsed(moveIndex: number, totalMoves: number, quality: MoveQuality): number {
    const baseTime = 30;
    const qualityBonus = {
      best: 15,
      great: 10,
      good: 5,
      book: 0,
      inaccuracy: -5,
      mistake: -10,
      blunder: -20,
    }[quality];

    return Math.max(1, baseTime + qualityBonus + this.seededRandom(-10, 10));
  }

  // 生成替代走法SAN
  private generateAlternativeSAN(): string {
    const pieces = ['N', 'B', 'R', 'Q', 'K'];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

    if (Math.random() > 0.5) {
      // 兵的走法
      return `${files[Math.floor(Math.random() * 8)]}${4 + Math.floor(Math.random() * 3)}`;
    } else {
      // 子的走法
      return `${pieces[Math.floor(Math.random() * 5)]}${files[Math.floor(Math.random() * 8)]}${files[Math.floor(Math.random() * 8)]}`;
    }
  }

  // 生成走法解释
  private generateExplanation(scoreDiff: number): string {
    if (scoreDiff > 1) return '显著改善局面，获得更大优势';
    if (scoreDiff > 0.5) return '较好的走法，增强局面';
    if (scoreDiff > 0) return '合理的走法';
    if (scoreDiff > -0.5) return '稍有问题，但可以接受';
    if (scoreDiff > -1) return '错失更好的机会';
    return '严重的失误，导致局面恶化';
  }

  // 生成战术格子
  private generateTacticalSquares(): Square[] {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as Square[];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'] as Square[];

    const count = Math.floor(this.seededRandom(2, 4));
    const squares: Square[] = [];

    for (let i = 0; i < count; i++) {
      const f = Math.floor(this.seededRandom(0, 8));
      const r = Math.floor(this.seededRandom(0, 8));
      squares.push((files[f] + ranks[r]) as Square);
    }

    return squares;
  }

  // 生成战术描述
  private generateTacticalDescription(name: string): string {
    const descriptions: Record<string, string> = {
      '捉双': '同时攻击两个目标，获得子力优势',
      '牵制': '限制对方棋子行动，创造进攻机会',
      '串击': '迫使对方被牵制的更有价值棋子移动',
      '闪击': '移动遮挡棋子同时发起攻击',
      '双重攻击': '同时攻击两个重要目标',
      '诱离': '迫使对方防守棋子离开关键位置',
      '引入': '诱骗对方棋子到不利位置',
      '过渡': '插入性着法，改善局面',
      '过载': '利用对方棋子防守负担过重',
      '穿刺': '通过直线远程攻击',
      '清空': '清除棋子占据的关键格子',
      '干扰': '打断对方防守协调',
      '陷阱': '困住对方重要棋子',
      '悬兵': '攻击无保护的棋子',
      '弱底线': '利用对方底线薄弱进行攻击',
      '杀棋威胁': '创造杀棋机会',
    };

    return descriptions[name] || '战术机会';
  }

  // 随机数生成器（带种子）
  private seededRandom(min: number, max: number): number {
    this.randomSeed = (this.randomSeed * 9301 + 49297) % 233280;
    const random = this.randomSeed / 233280;
    return min + random * (max - min);
  }
}
