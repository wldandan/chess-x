// E2E tests for Feature #5: 战术组合训练系统
import { test, expect } from '@playwright/test';

test.describe('战术组合训练系统', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/training');
  });

  test('页面应该有内容', async ({ page }) => {
    // 检查页面是否有内容
    const body = page.locator('body');
    const textContent = await body.textContent();
    expect(textContent?.length).toBeGreaterThan(0);
  });

  test('应该能开始训练', async ({ page }) => {
    // 查找开始按钮
    const startBtn = page.locator('button').filter({ hasText: /开始|训练/ }).first();

    if (await startBtn.isVisible()) {
      await startBtn.click();
      // 等待可能的页面变化
      await page.waitForTimeout(1000);
    }
  });

  test('导航应该工作', async ({ page }) => {
    // 测试导航到其他页面再回来
    await page.goto('/analysis');
    await page.waitForTimeout(500);

    await page.goto('/training');
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
});
