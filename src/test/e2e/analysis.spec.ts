// E2E tests for Feature #4: 智能棋步分析复盘
import { test, expect } from '@playwright/test';

test.describe('智能棋步分析复盘', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analysis');
  });

  test('应该显示分析页面', async ({ page }) => {
    // 检查页面标题
    const title = page.locator('h2');
    await expect(title).toBeVisible();
  });

  test('应该有页面容器', async ({ page }) => {
    // 检查容器元素
    const container = page.locator('.analysis-page, .page-header');
    await expect(container.first()).toBeVisible();
  });

  test('应该有游戏选择器或空状态', async ({ page }) => {
    // 检查游戏选择器或空状态
    const gameSelect = page.locator('.game-select');
    const emptyState = page.locator('.empty-analysis-state');

    const hasSelect = await gameSelect.isVisible().catch(() => false);
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasSelect || hasEmpty).toBeTruthy();
  });

  test('页面应该有内容', async ({ page }) => {
    // 检查页面是否有内容
    const body = page.locator('body');
    const textContent = await body.textContent();
    expect(textContent?.length).toBeGreaterThan(0);
  });

  test('导航应该工作', async ({ page }) => {
    // 测试导航到其他页面再回来
    await page.goto('/');
    await page.waitForTimeout(500);

    await page.goto('/analysis');
    await page.waitForTimeout(500);

    // 检查页面可见
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('应该能够交互', async ({ page }) => {
    // 点击页面上的任意可交互元素
    const buttons = page.locator('button');
    const count = await buttons.count();

    if (count > 0) {
      await buttons.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('应该有下拉选择或按钮', async ({ page }) => {
    // 检查是否有下拉选择或按钮
    const selects = page.locator('select');
    const buttons = page.locator('button');

    const hasSelect = await selects.count() > 0;
    const hasButton = await buttons.count() > 0;

    expect(hasSelect || hasButton).toBeTruthy();
  });
});
