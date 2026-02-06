// E2E tests for Feature #5: 战术组合训练系统
import { test, expect } from '@playwright/test';

test.describe('战术组合训练系统', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/training');
  });

  test('应该显示训练中心页面和主要控件', async ({ page }) => {
    // 检查页面标题（训练中心）
    await expect(page.locator('h2').filter({ hasText: /训练中心/ })).toBeVisible();

    // 检查开始训练按钮
    await expect(page.locator('button:has-text("开始战术训练")')).toBeVisible();
  });

  test('应该显示用户统计数据', async ({ page }) => {
    // 检查统计卡片
    await expect(page.locator('.training-stats')).toBeVisible();

    // 检查统计项存在
    await expect(page.locator('text=/完成题目/')).toBeVisible();
    await expect(page.locator('text=/正确率/')).toBeVisible();
    await expect(page.locator('text=/当前连击/')).toBeVisible();
  });

  test('应该显示战术类型展示', async ({ page }) => {
    // 检查战术类型标题
    await expect(page.locator('text=/战术类型/')).toBeVisible();

    // 检查战术类型卡片
    const tacticCards = page.locator('.tactic-type-card');
    const count = await tacticCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('应该能够开始战术训练', async ({ page }) => {
    // 点击开始训练
    await page.click('button:has-text("开始战术训练")');

    // 等待训练页面加载
    await expect(page.locator('h2').filter({ hasText: /战术组合训练/ })).toBeVisible({ timeout: 5000 });
  });

  test('应该在训练中显示进度概览', async ({ page }) => {
    // 开始训练
    await page.click('button:has-text("开始战术训练")');

    // 等待训练页面加载
    await expect(page.locator('.tactics-training-page')).toBeVisible({ timeout: 5000 });

    // 检查进度显示
    await expect(page.locator('text=/进度|等级|经验/')).toBeVisible();
  });

  test('应该显示棋盘和题目', async ({ page }) => {
    // 开始训练
    await page.click('button:has-text("开始战术训练")');

    // 等待棋盘加载
    await expect(page.locator('.tactics-board-section, [class*="chessboard"]')).toBeVisible({ timeout: 5000 });
  });

  test('应该显示控制面板', async ({ page }) => {
    // 开始训练
    await page.click('button:has-text("开始战术训练")');

    // 等待控制面板加载
    await expect(page.locator('.tactics-panel-section')).toBeVisible({ timeout: 5000 });
  });

  test('应该能够退出训练', async ({ page }) => {
    // 开始训练
    await page.click('button:has-text("开始战术训练")');

    // 等待训练页面加载
    await expect(page.locator('.tactics-training-page')).toBeVisible({ timeout: 5000 });

    // 点击退出训练
    await page.click('button:has-text("退出训练")');

    // 应该回到训练中心
    await expect(page.locator('h2').filter({ hasText: /训练中心/ })).toBeVisible();
  });

  test('应该显示题目信息', async ({ page }) => {
    // 开始训练
    await page.click('button:has-text("开始战术训练")');

    // 等待训练页面加载
    await expect(page.locator('.tactics-training-page')).toBeVisible({ timeout: 5000 });

    // 检查是否有题目相关元素显示
    const hasContent = await page.locator('.tactics-board-section, .tactics-panel-section').count() > 0;
    expect(hasContent).toBeTruthy();
  });

  test('应该在训练中心显示战术训练入口卡片', async ({ page }) => {
    // 检查入口卡片
    await expect(page.locator('.entry-card')).toBeVisible();

    // 检查卡片内容
    await expect(page.locator('text=/战术组合训练/')).toBeVisible();
    await expect(page.locator('text=/自适应难度/')).toBeVisible();
  });

  test('应该显示战术训练特性说明', async ({ page }) => {
    // 检查特性项
    await expect(page.locator('text=/自动调整难度/')).toBeVisible();
    await expect(page.locator('text=/针对性弱点训练/')).toBeVisible();
    await expect(page.locator('text=/即时反馈/')).toBeVisible();
  });

  test('应该显示用户等级和经验值', async ({ page }) => {
    // 检查等级显示
    await expect(page.locator('text=/Lv\\.|Level/')).toBeVisible();

    // 检查经验值显示
    await expect(page.locator('text=/XP|经验/')).toBeVisible();
  });

  test('应该显示用户连击统计', async ({ page }) => {
    // 检查连击统计
    await expect(page.locator('text=/当前连击|最佳连击/')).toBeVisible();
  });

  test('应该显示多种战术类型', async ({ page }) => {
    // 检查常见战术类型
    await expect(page.locator('text=/捉双|牵制|串击/')).toBeVisible();
  });

  test('训练卡片应该有图标', async ({ page }) => {
    // 检查图标元素
    const icons = page.locator('.entry-icon, .feature-icon, .tactic-type-icon');
    const count = await icons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('应该显示训练统计卡片', async ({ page }) => {
    // 检查统计卡片
    const statCards = page.locator('.stat-card');
    const count = await statCards.count();
    expect(count).toBeGreaterThan(0);

    // 检查每个卡片有图标和内容
    if (count > 0) {
      await expect(statCards.first().locator('.stat-icon')).toBeVisible();
      await expect(statCards.first().locator('.stat-content')).toBeVisible();
    }
  });
});
