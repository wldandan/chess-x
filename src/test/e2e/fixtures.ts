// E2E test fixtures for chess application
import { test as base } from '@playwright/test';

type ChessFixtures = {
  chessBoard: {
    makeMove: (from: string, to: string) => Promise<void>;
    waitForMove: (san: string) => Promise<void>;
    getSquare: (square: string) => ReturnType<typeof import('@playwright/test').Page.prototype.locator>;
    isCheck: () => Promise<boolean>;
    isCheckmate: () => Promise<boolean>;
  };
  gameControls: {
    startNewGame: () => Promise<void>;
    resign: () => Promise<void>;
    offerDraw: () => Promise<void>;
    undo: () => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
  };
};

export const test = base.extend<ChessFixtures>({
  chessBoard: async ({ page }, use) => {
    const chessBoard = {
      // 在棋盘上走棋
      async makeMove(from: string, to: string) {
        const fromSquare = page.locator(`[data-square="${from}"], .square[data-coord="${from}"]`);
        const toSquare = page.locator(`[data-square="${to}"], .square[data-coord="${to}"]`);

        await fromSquare.click();
        await page.waitForTimeout(200);
        await toSquare.click();
      },

      // 等待特定走法出现
      async waitForMove(san: string) {
        const moveList = page.locator('[data-testid="move-list"], .move-list');
        await moveList.waitFor({ state: 'visible' });
        await moveList.locator(`text=${san}`).waitFor({ state: 'visible' });
      },

      // 获取棋盘点位
      getSquare(square: string) {
        return page.locator(`[data-square="${square}"], .square[data-coord="${square}"]`);
      },

      // 检查是否将军
      async isCheck() {
        const checkIndicator = page.locator('text=/将军|Check|!/i');
        return await checkIndicator.isVisible().catch(() => false);
      },

      // 检查是否将死
      async isCheckmate() {
        const checkmateIndicator = page.locator('text=/将死|Checkmate|游戏结束/i');
        return await checkmateIndicator.isVisible().catch(() => false);
      },
    };

    await use(chessBoard);
  },

  gameControls: async ({ page }, use) => {
    const gameControls = {
      // 开始新游戏
      async startNewGame() {
        await page.click('button:has-text("开始对弈"), a:has-text("对弈"), button:has-text("新游戏")');
        await page.locator('[data-testid="chessboard"], .chessboard').waitFor({ state: 'visible', timeout: 5000 });
      },

      // 认输
      async resign() {
        const resignButton = page.locator('button:has-text("认输"), button[title*="resign"]');
        await resignButton.click();

        const confirmButton = page.locator('button:has-text("确认"), button:has-text("是")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      },

      // 提议和棋
      async offerDraw() {
        const drawButton = page.locator('button:has-text("和棋"), button[title*="draw"]');
        await drawButton.click();
      },

      // 悔棋
      async undo() {
        const undoButton = page.locator('button:has-text("悔棋"), button[title*="undo"]');
        await undoButton.click();

        const confirmButton = page.locator('button:has-text("确认")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      },

      // 暂停
      async pause() {
        const pauseButton = page.locator('button:has-text("暂停"), button[aria-label="pause"]');
        await pauseButton.click();
      },

      // 继续
      async resume() {
        const resumeButton = page.locator('button:has-text("继续"), button[aria-label="resume"]');
        await resumeButton.click();
      },
    };

    await use(gameControls);
  },
});

export { expect } from '@playwright/test';
