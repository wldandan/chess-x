// 战术训练引擎 - 生成和管理战术题目
import type {
  TacticPuzzle,
  TacticType,
  TacticDifficulty,
  TacticMove,
} from '../../types/tactics.types';
import type { Square } from '../../types/chess.types';

// 战术引擎类
export class TacticsEngine {
  private puzzleDatabase: TacticPuzzle[];

  constructor() {
    this.puzzleDatabase = this.generateMockPuzzles();
  }

  // 获取所有题目
  getAllPuzzles(): TacticPuzzle[] {
    return this.puzzleDatabase;
  }

  // 根据条件获取题目
  getPuzzles(options: {
    types?: TacticType[];
    difficulty?: TacticDifficulty;
    count?: number;
  }): TacticPuzzle[] {
    let filtered = [...this.puzzleDatabase];

    // 按类型过滤
    if (options.types && options.types.length > 0) {
      filtered = filtered.filter(p => options.types!.includes(p.type));
    }

    // 按难度过滤
    if (options.difficulty) {
      filtered = filtered.filter(p => p.difficulty === options.difficulty);
    }

    // 随机打乱
    filtered = this.shuffleArray(filtered);

    // 限制数量
    if (options.count) {
      filtered = filtered.slice(0, options.count);
    }

    return filtered;
  }

  // 根据ID获取题目
  getPuzzleById(id: string): TacticPuzzle | undefined {
    return this.puzzleDatabase.find(p => p.id === id);
  }

  // 验证解答
  validateSolution(puzzle: TacticPuzzle, userMoves: TacticMove[]): boolean {
    if (userMoves.length !== puzzle.solution.length) {
      return false;
    }

    for (let i = 0; i < puzzle.solution.length; i++) {
      const solutionMove = puzzle.solution[i];
      const userMove = userMoves[i];

      if (
        userMove.from !== solutionMove.from ||
        userMove.to !== solutionMove.to ||
        userMove.promotion !== solutionMove.promotion
      ) {
        return false;
      }
    }

    return true;
  }

  // 获取下一步提示
  getHint(puzzle: TacticPuzzle, currentMoveIndex: number): string {
    if (currentMoveIndex >= puzzle.solution.length) {
      return '已完成！';
    }

    const nextMove = puzzle.solution[currentMoveIndex];

    if (puzzle.hint) {
      return puzzle.hint;
    }

    const hints: Record<TacticType, string> = {
      fork: '寻找一个能同时攻击两个目标的走法',
      pin: '利用一个棋子限制对方更有价值棋子的移动',
      skewer: '迫使对方被牵制的更有价值棋子移动',
      discovered: '移动遮挡的棋子同时发起攻击',
      double_attack: '同时攻击两个重要目标',
      deflection: '迫使对方防守棋子离开关键位置',
      decoy: '诱骗对方棋子到不利位置',
      zwischenzug: '在主要行动前插入一个有力的着法',
      overload: '利用对方棋子防守负担过重',
      xray: '通过直线远程攻击',
      clearance: '清除棋子占据的关键格子',
      interference: '打断对方防守协调',
      trapped_piece: '困住对方重要棋子',
      hanging_piece: '攻击无保护的棋子',
      weak_backrank: '利用对方底线薄弱进行攻击',
      mate_threat: '创造杀棋机会',
      promotion: '利用兵升变获得优势',
      en_passant: '利用吃过路兵规则',
    };

    return `${hints[puzzle.type]}。尝试从 ${nextMove.from} 走到 ${nextMove.to}`;
  }

  // 生成模拟题目库
  private generateMockPuzzles(): TacticPuzzle[] {
    const puzzles: TacticPuzzle[] = [];

    // 捉双 (Fork) 题目
    puzzles.push(
      {
        id: 'fork_001',
        type: 'fork',
        difficulty: 1,
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',
        turn: 'white',
        solution: [
          { from: 'f3' as Square, to: 'c3' as Square, san: 'Nc3' },
        ],
        hint: '用马同时攻击两个目标',
        keySquares: ['c3' as Square, 'b5' as Square, 'd5' as Square],
        keyPieces: ['f3' as Square],
        theme: '马捉双',
        attempts: 1250,
        solveRate: 0.75,
        avgTime: 30,
      },
      {
        id: 'fork_002',
        type: 'fork',
        difficulty: 2,
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
        turn: 'white',
        solution: [
          { from: 'f3' as Square, to: 'e5' as Square, san: 'Nxe5' },
        ],
        hint: '找到用马同时攻击后和车的机会',
        keySquares: ['e5' as Square, 'd8' as Square, 'a8' as Square],
        keyPieces: ['f3' as Square],
        theme: '马捉双后车',
        attempts: 890,
        solveRate: 0.68,
        avgTime: 45,
      }
    );

    // 牵制 (Pin) 题目
    puzzles.push(
      {
        id: 'pin_001',
        type: 'pin',
        difficulty: 2,
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
        turn: 'white',
        solution: [
          { from: 'e3' as Square, to: 'd4' as Square, san: 'Nxd4' },
        ],
        hint: '利用牵制战术吃掉对方棋子',
        keySquares: ['d4' as Square, 'f6' as Square, 'd8' as Square],
        keyPieces: ['c4' as Square, 'f6' as Square],
        theme: '斜线牵制',
        attempts: 1100,
        solveRate: 0.72,
        avgTime: 35,
      }
    );

    // 串击 (Skewer) 题目
    puzzles.push(
      {
        id: 'skewer_001',
        type: 'skewer',
        difficulty: 3,
        fen: '6k1/5ppp/8/8/8/2r5/5PPP/6K1 w - - 0 1',
        turn: 'white',
        solution: [
          { from: 'g1' as Square, to: 'h1' as Square, san: 'Kh1' },
          { from: 'c3' as Square, to: 'c8' as Square, san: 'Rc8+' },
        ],
        hint: '用车串击王和后',
        keySquares: ['c8' as Square, 'g8' as Square],
        keyPieces: ['c3' as Square],
        theme: '底线串击',
        attempts: 750,
        solveRate: 0.65,
        avgTime: 50,
      }
    );

    // 闪击 (Discovered Attack) 题目
    puzzles.push(
      {
        id: 'discovered_001',
        type: 'discovered',
        difficulty: 2,
        fen: 'rnb1k1nr/pppp1ppp/8/4p3/6b1/2N5/PPPP1PPP/R1BQKBNR w KQkq - 0 1',
        turn: 'white',
        solution: [
          { from: 'c3' as Square, to: 'd5' as Square, san: 'Nxd5' },
        ],
        hint: '移动马打开象的进攻线路',
        keySquares: ['d5' as Square, 'c4' as Square, 'g4' as Square],
        keyPieces: ['c3' as Square, 'c1' as Square],
        theme: '马闪象击',
        attempts: 920,
        solveRate: 0.70,
        avgTime: 40,
      }
    );

    // 杀棋威胁 (Mate Threat) 题目
    puzzles.push(
      {
        id: 'mate_001',
        type: 'mate_threat',
        difficulty: 3,
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/3P1N2/PPP2PPP/RNB1K1NR w KQkq - 4 4',
        turn: 'white',
        solution: [
          { from: 'h5' as Square, to: 'f7' as Square, san: 'Qxf7#' },
        ],
        hint: '找到将死对方的机会',
        keySquares: ['f7' as Square, 'e8' as Square],
        keyPieces: ['h5' as Square, 'c1' as Square],
        theme: '后象配合杀王',
        attempts: 680,
        solveRate: 0.78,
        avgTime: 25,
      },
      {
        id: 'mate_002',
        type: 'mate_threat',
        difficulty: 4,
        fen: 'r1bqkb1r/pp3ppp/2n1pn2/3p4/2BQP3/2N5/PPP2PPP/R3K1NR w KQkq - 0 6',
        turn: 'white',
        solution: [
          { from: 'd4' as Square, to: 'f6' as Square, san: 'Qxf6' },
          { from: 'b4' as Square, to: 'd6' as Square, san: 'Bd6#' },
        ],
        hint: '后象配合制造杀棋',
        keySquares: ['f6' as Square, 'd6' as Square, 'e8' as Square],
        keyPieces: ['d4' as Square, 'b4' as Square],
        theme: '两步杀',
        attempts: 540,
        solveRate: 0.62,
        avgTime: 55,
      }
    );

    // 弱底线 (Weak Backrank) 题目
    puzzles.push(
      {
        id: 'backrank_001',
        type: 'weak_backrank',
        difficulty: 2,
        fen: '6k1/5ppp/8/8/8/5r2/5PPP/6K1 w - - 0 1',
        turn: 'white',
        solution: [
          { from: 'a1' as Square, to: 'a8' as Square, san: 'Ra8+' },
        ],
        hint: '利用对方底线弱点',
        keySquares: ['a8' as Square, 'e1' as Square],
        keyPieces: ['a1' as Square],
        theme: '底线杀',
        attempts: 880,
        solveRate: 0.82,
        avgTime: 20,
      }
    );

    // 悬兵 (Hanging Piece) 题目
    puzzles.push(
      {
        id: 'hanging_001',
        type: 'hanging_piece',
        difficulty: 1,
        fen: 'rnbqkbnr/ppp2ppp/8/3pp3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1',
        turn: 'white',
        solution: [
          { from: 'd4' as Square, to: 'e5' as Square, san: 'dxe5' },
        ],
        hint: '吃掉对方无保护的兵',
        keySquares: ['e5' as Square],
        keyPieces: ['d4' as Square],
        theme: '吃悬兵',
        attempts: 1500,
        solveRate: 0.88,
        avgTime: 15,
      }
    );

    // 过载 (Overload) 题目
    puzzles.push(
      {
        id: 'overload_001',
        type: 'overload',
        difficulty: 4,
        fen: 'r2q1rk1/ppp2ppp/2n1pn2/3p4/2PP4/1QN1PN2/P4PPP/R3KB1R w KQ - 0 10',
        turn: 'white',
        solution: [
          { from: 'c3' as Square, to: 'b5' as Square, san: 'Nb5' },
        ],
        hint: '利用对方后防守过载的机会',
        keySquares: ['b5' as Square, 'd8' as Square, 'c6' as Square],
        keyPieces: ['c3' as Square],
        theme: '过载诱离',
        attempts: 420,
        solveRate: 0.55,
        avgTime: 65,
      }
    );

    // 诱离 (Deflection) 题目
    puzzles.push(
      {
        id: 'deflection_001',
        type: 'deflection',
        difficulty: 3,
        fen: 'r2q1rk1/ppp2ppp/2n1pn2/3p4/2PP4/P1Q1PN2/5PPP/R3KB1R w K - 0 12',
        turn: 'white',
        solution: [
          { from: 'c3' as Square, to: 'c7' as Square, san: 'Qxc7' },
        ],
        hint: '诱离对方防守的棋子',
        keySquares: ['c7' as Square, 'e8' as Square],
        keyPieces: ['c3' as Square],
        theme: '后诱离',
        attempts: 560,
        solveRate: 0.58,
        avgTime: 60,
      }
    );

    // 升变战术 (Promotion) 题目
    puzzles.push(
      {
        id: 'promotion_001',
        type: 'promotion',
        difficulty: 3,
        fen: '8/1P2k3/8/8/8/8/2K5/8 w - - 0 1',
        turn: 'white',
        solution: [
          { from: 'b7' as Square, to: 'b8' as Square, promotion: 'q', san: 'b8=Q' },
        ],
        hint: '兵升变获胜',
        keySquares: ['b8' as Square],
        keyPieces: ['b7' as Square],
        theme: '升变杀',
        attempts: 780,
        solveRate: 0.85,
        avgTime: 22,
      }
    );

    // 清空 (Clearance) 题目
    puzzles.push(
      {
        id: 'clearance_001',
        type: 'clearance',
        difficulty: 4,
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 6',
        turn: 'white',
        solution: [
          { from: 'c4' as Square, to: 'f7' as Square, san: 'Bxf7+' },
          { from: 'e1' as Square, to: 'g1' as Square, san: 'Kg1' },
        ],
        hint: '清空关键格子后发动攻击',
        keySquares: ['f7' as Square, 'g1' as Square],
        keyPieces: ['c4' as Square],
        theme: '清空格位',
        attempts: 380,
        solveRate: 0.48,
        avgTime: 70,
      }
    );

    // 过渡 (Zwischenzug) 题目
    puzzles.push(
      {
        id: 'zwischenzug_001',
        type: 'zwischenzug',
        difficulty: 5,
        fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/1QN1PN2/P4PPP/R3KB1R w KQ - 0 10',
        turn: 'white',
        solution: [
          { from: 'c3' as Square, to: 'b5' as Square, san: 'Nb5' },
          { from: 'c8' as Square, to: 'e8' as Square, san: 'Qe8' },
          { from: 'b5' as Square, to: 'c7' as Square, san: 'Nc7' },
        ],
        hint: '使用过渡着法保持优势',
        keySquares: ['b5' as Square, 'c7' as Square],
        keyPieces: ['c3' as Square],
        theme: '过渡攻击',
        attempts: 320,
        solveRate: 0.42,
        avgTime: 80,
      }
    );

    return puzzles;
  }

  // 打乱数组
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 根据用户表现调整题目难度
  adjustDifficulty(
    currentDifficulty: TacticDifficulty,
    consecutiveCorrect: number,
    consecutiveWrong: number,
    minDiff: TacticDifficulty = 1,
    maxDiff: TacticDifficulty = 5
  ): TacticDifficulty {
    let newDifficulty = currentDifficulty;

    if (consecutiveCorrect >= 3) {
      newDifficulty = Math.min(maxDiff, currentDifficulty + 1) as TacticDifficulty;
    } else if (consecutiveWrong >= 2) {
      newDifficulty = Math.max(minDiff, currentDifficulty - 1) as TacticDifficulty;
    }

    return newDifficulty;
  }

  // 生成个性化题目推荐
  getRecommendedPuzzles(
    weakTypes: TacticType[],
    currentDifficulty: TacticDifficulty,
    count: number = 5
  ): TacticPuzzle[] {
    // 优先推荐弱点类型的题目
    let filtered = this.puzzleDatabase.filter(p =>
      weakTypes.includes(p.type) && p.difficulty <= currentDifficulty
    );

    // 如果不足，补充其他类型
    if (filtered.length < count) {
      const others = this.puzzleDatabase.filter(p =>
        !weakTypes.includes(p.type) && p.difficulty <= currentDifficulty
      );
      filtered = [...filtered, ...others];
    }

    return this.shuffleArray(filtered).slice(0, count);
  }
}

// 导出单例
export const tacticsEngine = new TacticsEngine();
