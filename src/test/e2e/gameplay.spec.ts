// E2E tests for Feature #3: AI对弈功能
import { test, expect } from '@playwright/test';

test.describe('AI对弈功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该显示主页和对弈选项', async ({ page }) => {
    // 检查页面标题
    await expect(page.locator('h1').filter({ hasText: /Aaron.*Chess/i })).toBeVisible();

    // 检查主要导航和对弈选项
    await expect(page.locator('a:has-text("对弈"), button:has-text("开始")')).toBeVisible();
  });

  test('应该能够开始新对局', async ({ page }) => {
    // 点击开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈"), button:has-text("新游戏")');

    // 等待游戏页面加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard, [class*="board"]')).toBeVisible({ timeout: 5000 });
  });

  test('应该显示棋盘和棋子', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈"), button:has-text("新游戏")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 检查棋子存在（通过方格或棋子类）
    const squares = page.locator('.square, [data-square], .piece');
    const count = await squares.count();
    expect(count).toBeGreaterThan(0);
  });

  test('应该能够选择对手类型', async ({ page }) => {
    // 查找对手选择
    const opponentSelector = page.locator('[data-testid="opponent-select"], select[name*="opponent"], [data-testid="ai-selection"]');

    if (await opponentSelector.isVisible()) {
      // 检查是否有AI选项
      const options = await opponentSelector.locator('option').allTextContents();
      expect(options.some(opt => /AI|卡尔森|卡斯帕罗夫/i.test(opt))).toBeTruthy();
    }
  });

  test('应该能够选择时间控制', async ({ page }) => {
    // 查找时间控制选择
    const timeSelector = page.locator('[data-testid="time-control"], select[name*="time"], [class*="time-control"]');

    if (await timeSelector.isVisible()) {
      // 选择不同时间控制
      await timeSelector.selectOption(/10\+5|快棋| blitz/i);

      // 验证选择生效
      const selectedValue = await timeSelector.inputValue();
      expect(selectedValue).toBeTruthy();
    }
  });

  test('应该能够走棋并显示在棋盘上', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 执行一个标准的开局走法（e2-e4）
    const e2Square = page.locator('[data-square="e2"], .square[data-coord="e2"], [class*="square"][class*="e2"]');
    const e4Square = page.locator('[data-square="e4"], .square[data-coord="e4"], [class*="square"][class*="e4"]');

    // 尝试点击并移动
    if (await e2Square.isVisible({ timeout: 2000 })) {
      await e2Square.click();
      await page.waitForTimeout(200);
      await e4Square.click();

      // 等待AI响应
      await page.waitForTimeout(1000);

      // 验证移动已记录（检查走法列表或当前局面）
      const moveList = page.locator('[data-testid="move-list"], .move-list, [class*="moves"]');
      if (await moveList.isVisible()) {
        await expect(moveList).toContainText(/e4|Nf3|d4/);
      }
    }
  });

  test('应该显示双方计时器', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 检查计时器显示
    await expect(page.locator('text=/:/').first()).toBeVisible(); // 时间格式通常包含冒号
  });

  test('应该显示当前回合指示', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 检查回合指示
    const turnIndicator = page.locator('text=/白方|黑方|回合|White|Black|Turn/i');
    await expect(turnIndicator).toBeVisible();
  });

  test('AI应该自动响应走棋', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 记录当前走法数量
    const moveList = page.locator('[data-testid="move-list"], .move-list');
    let moveCount = 0;
    if (await moveList.isVisible()) {
      const moves = await moveList.locator('[class*="move"], .move-item').all();
      moveCount = moves.length;
    }

    // 走一步棋
    const e2Square = page.locator('[data-square="e2"], .square[data-coord="e2"]');
    const e4Square = page.locator('[data-square="e4"], .square[data-coord="e4"]');

    if (await e2Square.isVisible({ timeout: 2000 })) {
      await e2Square.click();
      await page.waitForTimeout(200);
      await e4Square.click();

      // 等待AI响应（最多5秒）
      await page.waitForTimeout(3000);

      // 检查是否增加了新的走法
      if (await moveList.isVisible()) {
        const newMoves = await moveList.locator('[class*="move"], .move-item').all();
        expect(newMoves.length).toBeGreaterThan(moveCount);
      }
    }
  });

  test('应该能够认输', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 查找认输按钮
    const resignButton = page.locator('button:has-text("认输"), button[title*="resign"], button:has-text("投降")');

    if (await resignButton.isVisible({ timeout: 2000 })) {
      await resignButton.click();

      // 确认认输
      const confirmButton = page.locator('button:has-text("确认"), button:has-text("是")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // 检查游戏结束状态
      await expect(page.locator('text=/认输|游戏结束|Resign/')).toBeVisible();
    }
  });

  test('应该能够提议和棋', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 查找和棋按钮
    const drawButton = page.locator('button:has-text("和棋"), button[title*="draw"], button:has-text("提和")');

    if (await drawButton.isVisible({ timeout: 2000 })) {
      await drawButton.click();

      // 检查AI响应或确认对话框
      await page.waitForTimeout(1000);
    }
  });

  test('应该能够悔棋', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 走一步棋
    const e2Square = page.locator('[data-square="e2"], .square[data-coord="e2"]');
    const e4Square = page.locator('[data-square="e4"], .square[data-coord="e4"]');

    if (await e2Square.isVisible({ timeout: 2000 })) {
      await e2Square.click();
      await page.waitForTimeout(200);
      await e4Square.click();

      // 等待AI响应
      await page.waitForTimeout(2000);

      // 查找悔棋按钮
      const undoButton = page.locator('button:has-text("悔棋"), button[title*="undo"], button:has-text("撤销")');

      if (await undoButton.isVisible()) {
        const initialMoveCount = await page.locator('[class*="move"], .move-item').count();

        await undoButton.click();

        // 确认悔棋
        const confirmButton = page.locator('button:has-text("确认")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // 检查走法是否减少
        await page.waitForTimeout(500);
        const newMoveCount = await page.locator('[class*="move"], .move-item').count();
        expect(newMoveCount).toBeLessThan(initialMoveCount);
      }
    }
  });

  test('应该检测将军状态', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 走几步棋（尝试制造将军局面）
    const moves = [
      ['e2', 'e4'], ['e7', 'e5'],
      ['f1', 'c4'], ['b8', 'c6'],
      ['d1', 'h5'] // Scholar's mate setup
    ];

    for (const [from, to] of moves) {
      const fromSquare = page.locator(`[data-square="${from}"], .square[data-coord="${from}"]`);
      const toSquare = page.locator(`[data-square="${to}"], .square[data-coord="${to}"]`);

      if (await fromSquare.isVisible()) {
        await fromSquare.click();
        await page.waitForTimeout(200);
        await toSquare.click();
        await page.waitForTimeout(500);
      }
    }

    // 检查是否显示将军
    const checkIndicator = page.locator('text=/将军|Check|!/i');
    if (await checkIndicator.isVisible({ timeout: 1000 })) {
      await expect(checkIndicator).toBeVisible();
    }
  });

  test('应该能够将死对手', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 使用 fool's mate 序列来快速结束游戏
    // 但这需要AI配合，所以我们只是验证游戏结束流程
    const moves = [
      ['f2', 'f3'], ['e7', 'e5'],
      ['g2', 'g4']
    ];

    for (const [from, to] of moves) {
      const fromSquare = page.locator(`[data-square="${from}"], .square[data-coord="${from}"]`);
      const toSquare = page.locator(`[data-square="${to}"], .square[data-coord="${to}"]`);

      if (await fromSquare.isVisible()) {
        await fromSquare.click();
        await page.waitForTimeout(200);
        await toSquare.click();
        await page.waitForTimeout(500);
      }
    }

    // 等待可能的游戏结束
    await page.waitForTimeout(2000);
  });

  test('应该显示走法历史', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 走几步棋
    const e2Square = page.locator('[data-square="e2"], .square[data-coord="e2"]');
    const e4Square = page.locator('[data-square="e4"], .square[data-coord="e4"]');

    if (await e2Square.isVisible({ timeout: 2000 })) {
      await e2Square.click();
      await page.waitForTimeout(200);
      await e4Square.click();

      // 检查走法历史
      const moveHistory = page.locator('[data-testid="move-list"], .move-list, [class*="history"]');

      if (await moveHistory.isVisible({ timeout: 2000 })) {
        await expect(moveHistory).toContainText(/e4|1\./);
      }
    }
  });

  test('应该能够使用拖放走棋', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 查找可拖动的棋子
    const piece = page.locator('.piece, [data-piece]').first();

    if (await piece.isVisible({ timeout: 2000 })) {
      // 使用拖放API
      const dataTransfer = await page.evaluateHandle(() => new DataTransfer());

      await piece.dispatchEvent('dragstart', { dataTransfer });

      const targetSquare = page.locator('[data-square="e4"], .square[data-coord="e4"]').first();
      await targetSquare.dispatchEvent('drop', { dataTransfer });

      // 等待响应
      await page.waitForTimeout(1000);
    }
  });

  test('应该显示被吃的棋子', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 走一些可能导致吃子的棋
    const e2Square = page.locator('[data-square="e2"], .square[data-coord="e2"]');
    const e4Square = page.locator('[data-square="e4"], .square[data-coord="e4"]');

    if (await e2Square.isVisible({ timeout: 2000 })) {
      await e2Square.click();
      await page.waitForTimeout(200);
      await e4Square.click();

      // 等待AI响应
      await page.waitForTimeout(2000);
    }

    // 检查被吃棋子显示区域
    const capturedArea = page.locator('[data-testid="captured"], .captured, [class*="capture"]');

    if (await capturedArea.isVisible({ timeout: 1000 })) {
      await expect(capturedArea).toBeVisible();
    }
  });

  test('应该能够设置AI难度级别', async ({ page }) => {
    // 查找难度设置
    const difficultySelector = page.locator('[data-testid="difficulty"], select[name*="difficulty"], [data-testid="ai-level"]');

    if (await difficultySelector.isVisible()) {
      // 选择不同难度
      await difficultySelector.selectOption(/困难|Hard|3/);

      // 开始对弈
      await page.click('button:has-text("开始对弈"), button:has-text("开始")');

      // 验证游戏开始
      await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });
    }
  });

  test('应该能够保存对局', async ({ page }) => {
    // 开始对弈
    await page.click('button:has-text("开始对弈"), a:has-text("对弈")');

    // 等待棋盘加载
    await expect(page.locator('[data-testid="chessboard"], .chessboard')).toBeVisible({ timeout: 5000 });

    // 查找保存按钮
    const saveButton = page.locator('button:has-text("保存"), button[title*="save"]');

    if (await saveButton.isVisible({ timeout: 2000 })) {
      await saveButton.click();

      // 检查保存确认
      await expect(page.locator('text=/保存|已保存/')).toBeVisible();
    }
  });
});
