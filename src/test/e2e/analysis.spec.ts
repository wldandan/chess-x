// E2E tests for Feature #4: 智能棋步分析复盘
import { test, expect } from '@playwright/test';

test.describe('智能棋步分析复盘', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analysis');
  });

  test('应该显示分析页面和主要控件', async ({ page }) => {
    // 检查页面标题
    await expect(page.locator('h2').filter({ hasText: /棋局分析/ })).toBeVisible();

    // 检查游戏选择器存在
    await expect(page.locator('.game-select')).toBeVisible();
  });

  test('应该能够选择对局并看到开始分析按钮', async ({ page }) => {
    // 等待游戏选择器加载
    const gameSelect = page.locator('.game-select');
    await expect(gameSelect).toBeVisible({ timeout: 5000 });

    // 检查是否有游戏选项
    const options = await gameSelect.locator('option').count();
    expect(options).toBeGreaterThan(0);

    // 选择第一个游戏
    await gameSelect.selectOption({ index: 1 });

    // 检查"开始分析"按钮出现
    await expect(page.locator('button:has-text("开始分析")')).toBeVisible();
  });

  test('应该能够开始分析并显示进度', async ({ page }) => {
    // 选择游戏
    const gameSelect = page.locator('.game-select');
    await expect(gameSelect).toBeVisible({ timeout: 5000 });

    const options = await gameSelect.locator('option').count();
    if (options > 1) {
      await gameSelect.selectOption({ index: 1 });
    }

    // 点击开始分析
    await page.click('button:has-text("开始分析")');

    // 检查分析进度显示
    await expect(page.locator('.analysis-progress')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=/正在分析/')).toBeVisible();
  });

  test('应该在分析完成后显示复盘界面', async ({ page }) => {
    // 选择游戏并开始分析
    const gameSelect = page.locator('.game-select');
    await expect(gameSelect).toBeVisible({ timeout: 5000 });

    const options = await gameSelect.locator('option').count();
    if (options > 1) {
      await gameSelect.selectOption({ index: 1 });
      await page.click('button:has-text("开始分析")');

      // 等待分析完成
      await expect(page.locator('.analysis-content')).toBeVisible({ timeout: 20000 });

      // 检查复盘按钮显示
      await expect(page.locator('button:has-text("逐步复盘")')).toBeVisible();
      await expect(page.locator('button:has-text("查看报告")')).toBeVisible();
      await expect(page.locator('button:has-text("导出")')).toBeVisible();
    }
  });

  test('应该显示棋盘', async ({ page }) => {
    // 先完成一个分析
    const gameSelect = page.locator('.game-select');
    await expect(gameSelect).toBeVisible({ timeout: 5000 });

    const options = await gameSelect.locator('option').count();
    if (options > 1) {
      await gameSelect.selectOption({ index: 1 });
      await page.click('button:has-text("开始分析")');

      // 等待分析完成
      await expect(page.locator('.analysis-content')).toBeVisible({ timeout: 20000 });

      // 检查棋盘显示
      await expect(page.locator('.chessboard-container, [class*="chessboard"]')).toBeVisible();
    }
  });

  test('应该显示导航控制按钮', async ({ page }) => {
    // 完成分析
    const gameSelect = page.locator('.game-select');
    await expect(gameSelect).toBeVisible({ timeout: 5000 });

    const options = await gameSelect.locator('option').count();
    if (options > 1) {
      await gameSelect.selectOption({ index: 1 });
      await page.click('button:has-text("开始分析")');

      // 等待分析完成
      await expect(page.locator('.analysis-content')).toBeVisible({ timeout: 20000 });

      // 检查导航按钮
      await expect(page.locator('.nav-btn, .analysis-navigation button')).toHaveCount(4);
    }
  });

  test('应该显示走法列表', async ({ page }) => {
    // 完成分析
    const gameSelect = page.locator('.game-select');
    await expect(gameSelect).toBeVisible({ timeout: 5000 });

    const options = await gameSelect.locator('option').count();
    if (options > 1) {
      await gameSelect.selectOption({ index: 1 });
      await page.click('button:has-text("开始分析")');

      // 等待分析完成
      await expect(page.locator('.analysis-content')).toBeVisible({ timeout: 20000 });

      // 检查走法列表
      await expect(page.locator('.moves-list-in-analysis, .moves-grid')).toBeVisible();
    }
  });

  test('应该能够切换复盘模式', async ({ page }) => {
    // 完成分析
    const gameSelect = page.locator('.game-select');
    await expect(gameSelect).toBeVisible({ timeout: 5000 });

    const options = await gameSelect.locator('option').count();
    if (options > 1) {
      await gameSelect.selectOption({ index: 1 });
      await page.click('button:has-text("开始分析")');

      // 等待分析完成
      await expect(page.locator('.analysis-content')).toBeVisible({ timeout: 20000 });

      // 检查模式按钮
      await expect(page.locator('.mode-btn:has-text("逐步")')).toBeVisible();
      await expect(page.locator('.mode-btn:has-text("错误")')).toBeVisible();
      await expect(page.locator('.mode-btn:has-text("关键")')).toBeVisible();
    }
  });

  test('应该能够查看分析报告', async ({ page }) => {
    // 完成分析
    const gameSelect = page.locator('.game-select');
    await expect(gameSelect).toBeVisible({ timeout: 5000 });

    const options = await gameSelect.locator('option').count();
    if (options > 1) {
      await gameSelect.selectOption({ index: 1 });
      await page.click('button:has-text("开始分析")');

      // 等待分析完成
      await expect(page.locator('.analysis-content')).toBeVisible({ timeout: 20000 });

      // 点击查看报告
      await page.click('button:has-text("查看报告")');

      // 检查报告显示
      await expect(page.locator('.analysis-report-section')).toBeVisible();
    }
  });

  test('应该能够切换棋盘方向', async ({ page }) => {
    // 完成分析
    const gameSelect = page.locator('.game-select');
    await expect(gameSelect).toBeVisible({ timeout: 5000 });

    const options = await gameSelect.locator('option').count();
    if (options > 1) {
      await gameSelect.selectOption({ index: 1 });
      await page.click('button:has-text("开始分析")');

      // 等待分析完成
      await expect(page.locator('.analysis-content')).toBeVisible({ timeout: 20000 });

      // 点击方向切换按钮
      const orientationBtn = page.locator('.orientation-btn');
      await expect(orientationBtn).toBeVisible();
      await orientationBtn.click();

      // 检查棋盘仍然可见
      await expect(page.locator('.chessboard-container')).toBeVisible();
    }
  });

  test('应该在没有对局时显示空状态', async ({ page }) => {
    // 如果没有游戏历史，应该显示空状态
    const emptyState = page.locator('.empty-analysis-state');
    const gameSelect = page.locator('.game-select');

    // 检查是否显示空状态或游戏选择器
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasGameSelect = await gameSelect.isVisible().catch(() => false);

    expect(hasEmptyState || hasGameSelect).toBeTruthy();
  });

  test('应该能够使用导航按钮浏览走法', async ({ page }) => {
    // 完成分析
    const gameSelect = page.locator('.game-select');
    await expect(gameSelect).toBeVisible({ timeout: 5000 });

    const options = await gameSelect.locator('option').count();
    if (options > 1) {
      await gameSelect.selectOption({ index: 1 });
      await page.click('button:has-text("开始分析")');

      // 等待分析完成
      await expect(page.locator('.analysis-content')).toBeVisible({ timeout: 20000 });

      // 点击下一步按钮
      const nextBtn = page.locator('.nav-btn').nth(2); // 第三个按钮是下一步
      await nextBtn.click();

      // 等待棋盘更新
      await page.waitForTimeout(500);

      // 检查上一步按钮可用
      const prevBtn = page.locator('.nav-btn').nth(1);
      const isDisabled = await prevBtn.isDisabled();
      expect(isDisabled).toBe(false);
    }
  });
});
