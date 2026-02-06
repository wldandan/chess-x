// 测试工具函数和辅助函数
import { render, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// 组件渲染辅助函数（带路由）
export function renderWithRouter(
  ui: React.ReactElement,
  { route = '/' }: { route?: string } = {}
): RenderResult {
  return render(
    <BrowserRouter initialEntries={[route]}>
      {ui}
    </BrowserRouter>
  );
}

// 等待元素出现
export async function waitForElement<T>(
  callback: () => T,
  options?: { timeout?: number }
): Promise<T> {
  const startTime = Date.now();
  const timeout = options?.timeout || 5000;

  while (Date.now() - startTime < timeout) {
    try {
      const result = callback();
      if (result !== null && result !== undefined) {
        return result;
      }
    } catch (error) {
      // Element not ready yet, continue waiting
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  throw new Error(`Element not found within ${timeout}ms`);
}

// 等待文本内容
export async function waitForTextContent(
  container: HTMLElement,
  text: string,
  options?: { timeout?: number }
): Promise<boolean> {
  const startTime = Date.now();
  const timeout = options?.timeout || 5000;

  while (Date.now() - startTime < timeout) {
    if (container.textContent?.includes(text)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return false;
}

// 模拟延迟
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// 创建模拟对局数据
export const createMockGame = (overrides = {}) => ({
  id: `game_${Date.now()}`,
  config: {
    whitePlayer: { name: 'White', type: 'human' as const, rating: 1500 },
    blackPlayer: { name: 'AI-卡尔森', type: 'ai' as const, rating: 2830, style: 'positional' as const },
    timeControl: {
      baseMinutes: 10,
      incrementSeconds: 5,
      type: 'increment' as const,
      totalTime: 600000,
    },
  },
  metadata: {
    event: 'Training Game',
    site: 'Aaron Chess',
    date: new Date().toISOString().split('T')[0],
    white: 'White',
    black: 'AI-卡尔森',
    result: '*',
  },
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/8/8/8 w KQkq - 0 1',
  pgn: '',
  moves: [],
  positionEvaluations: [],
  status: 'in_progress' as const,
  currentTurn: 'white' as const,
  moveNumber: 1,
  startTime: new Date(),
  timeUsed: { white: 0, black: 0 },
  inCheck: false,
  checkmate: false,
  stalemate: false,
  repetition: false,
  insufficientMaterial: false,
  takebacks: [],
  tags: ['training'],
  ...overrides,
});

// 创建模拟分析结果
export const createMockAnalysisReport = (overrides = {}) => ({
  gameId: 'test_game_1',
  analyzedAt: new Date(),
  overallAccuracy: 75.5,
  whiteAccuracy: 78.0,
  blackAccuracy: 73.0,
  totalMoves: 40,
  bestMoves: 12,
  greatMoves: 8,
  goodMoves: 15,
  inaccuracies: 3,
  mistakes: 2,
  blunders: 0,
  bestMovePercent: 30,
  goodMovePercent: 87.5,
  errorPercent: 12.5,
  criticalMoments: [],
  opening: {
    eco: 'B20',
    name: '西西里防御',
    variation: undefined,
    moves: ['e4', 'c5'],
    isBook: true,
  },
  openingAccuracy: 85.0,
  deviation: undefined,
  tacticsFound: 5,
  tacticsMissed: 2,
  tacticsUsed: [],
  timeManagement: {
    averageTimePerMove: 30,
    fastestMove: { move: { from: 'e2' as const, to: 'e4' as const }, time: 15 },
    slowestMove: { move: { from: 'e2' as const, to: 'e4' as const }, time: 45 },
    timeTroubleMoves: 2,
    goodTimeManagement: 80,
    timeUsedInCritical: 60,
  },
  strengths: ['开局准备充分', '战术识别能力良好'],
  weaknesses: ['中局计划制定需要加强'],
  recommendations: ['建议进行中局训练', '加强残局学习'],
  analysisDepth: 15,
  engineName: 'Mock Analysis Engine v1.0',
  ...overrides,
});

// 创建模拟战术题目
export const createMockPuzzle = (overrides = {}) => ({
  id: 'fork_001',
  type: 'fork' as const,
  difficulty: 1 as const,
  fen: 'rnbqkbnr/pppp1ppp/8/4p3/4/4P3/8/8/8/8/8/8/8 w KQkq - 0 1',
  turn: 'white' as const,
  solution: [
    { from: 'f3' as const, to: 'c3' as const, san: 'Nc3' },
  ],
  hint: '用马同时攻击两个目标',
  keySquares: ['c3' as const, 'b5' as const],
  keyPieces: ['f3' as const],
  theme: '马捉双',
  attempts: 1250,
  solveRate: 0.75,
  avgTime: 30,
  ...overrides,
});

// 模拟Chess实例
export const createMockChess = () => {
  const chess = require('chess.js').Chess;
  return new chess();
};

// 模拟AI响应延迟
export const mockAIResponse = (delay: number = 500): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, delay));

// 模拟鼠标移动
export async function clickElement(
  element: HTMLElement
): Promise<void> {
  element.click();
  await delay(100);
}

// 模拟拖放
export async function dragAndDrop(
  from: HTMLElement,
  to: HTMLElement
): Promise<void> {
  const dragEvent = new MouseEvent('mousedown', { bubbles: true });
  const dropEvent = new MouseEvent('mouseup', { bubbles: true });

  from.dispatchEvent(dragEvent);
  await delay(100);
  to.dispatchEvent(dropEvent);
}
