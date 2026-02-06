# Aaron Chess - 测试套件文档

本项目的测试套件使用 **Vitest** (单元测试/组件测试) 和 **Playwright** (E2E测试)。

## 测试架构

```
src/test/
├── e2e/                    # E2E测试
│   ├── analysis.spec.ts    # Feature #4: 智能棋步分析复盘
│   ├── training.spec.ts    # Feature #5: 战术组合训练系统
│   ├── gameplay.spec.ts    # Feature #3: AI对弈功能
│   └── fixtures.ts         # 测试辅助工具
├── utils/
│   └── test-utils.ts       # 通用测试工具
└── setup.ts                # 测试环境配置
```

## 运行测试

### 单元测试/组件测试 (Vitest)

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:ui

# 单次运行
npm run test:run

# 生成覆盖率报告
npm run test:coverage
```

### E2E测试 (Playwright)

```bash
# 运行所有E2E测试
npm run test:e2e

# 运行E2E测试UI模式
npm run test:e2e:ui

# 在单个浏览器上运行
npx playwright test --project=chromium

# 调试模式
npx playwright test --debug
```

## 测试覆盖的功能

### Feature #3: AI对弈功能 (`gameplay.spec.ts`)

- ✅ 显示主页和对弈选项
- ✅ 开始新对局
- ✅ 显示棋盘和棋子
- ✅ 选择对手类型
- ✅ 选择时间控制
- ✅ 走棋并显示在棋盘上
- ✅ 显示双方计时器
- ✅ 显示当前回合指示
- ✅ AI自动响应走棋
- ✅ 认输
- ✅ 提议和棋
- ✅ 悔棋
- ✅ 检测将军状态
- ✅ 显示走法历史
- ✅ 拖放走棋
- ✅ 显示被吃的棋子
- ✅ 设置AI难度级别
- ✅ 保存对局

### Feature #4: 智能棋步分析复盘 (`analysis.spec.ts`)

- ✅ 显示分析页面和主要控件
- ✅ 选择对局进行完整分析
- ✅ 显示棋步评分面板
- ✅ 浏览单个棋步的详细分析
- ✅ 显示战术机会检测
- ✅ 显示完整的对局报告
- ✅ 导出分析报告
- ✅ 取消正在进行的分析
- ✅ 显示开局信息和分析
- ✅ 导航到不同的棋步
- ✅ 没有对局时显示提示信息

### Feature #5: 战术组合训练系统 (`training.spec.ts`)

- ✅ 显示训练页面和主要控件
- ✅ 显示战术类型选择
- ✅ 开始训练并显示第一题
- ✅ 显示当前题目的提示信息
- ✅ 回答正确并获得反馈
- ✅ 显示用户进度和经验值
- ✅ 选择特定战术类型
- ✅ 跳过当前题目
- ✅ 完成一组训练并显示总结
- ✅ 自适应调整难度
- ✅ 显示用户历史统计
- ✅ 支持不同难度级别
- ✅ 重新开始训练
- ✅ 显示连击奖励信息
- ✅ 回答错误时显示正确答案
- ✅ 暂停和恢复训练

## 测试辅助工具

### test-utils.ts

提供以下工具函数:

- `renderWithRouter()` - 带路由的组件渲染
- `waitForElement()` - 等待元素出现
- `waitForTextContent()` - 等待文本内容
- `delay()` - 模拟延迟
- `createMockGame()` - 创建模拟对局数据
- `createMockAnalysisReport()` - 创建模拟分析报告
- `createMockPuzzle()` - 创建模拟战术题目
- `createMockChess()` - 创建Chess实例
- `clickElement()` - 模拟点击
- `dragAndDrop()` - 模拟拖放

### fixtures.ts (E2E)

提供以下测试夹具:

- `chessBoard` - 棋盘操作工具
  - `makeMove(from, to)` - 走棋
  - `waitForMove(san)` - 等待走法
  - `getSquare(square)` - 获取方格
  - `isCheck()` - 检查将军
  - `isCheckmate()` - 检查将死

- `gameControls` - 游戏控制工具
  - `startNewGame()` - 开始新游戏
  - `resign()` - 认输
  - `offerDraw()` - 提和
  - `undo()` - 悔棋
  - `pause()` - 暂停
  - `resume()` - 继续

## 配置文件

- `vitest.config.ts` - Vitest配置
- `playwright.config.ts` - Playwright配置
- `src/test/setup.ts` - 测试环境设置

## 编写新测试

### 单元测试示例

```typescript
import { renderWithRouter, createMockGame } from '@/test/utils/test-utils';
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { container } = renderWithRouter(<MyComponent />);
    expect(container).toMatchSnapshot();
  });
});
```

### E2E测试示例

```typescript
import { test, expect } from '@/test/e2e/fixtures';

test('my e2e test', async ({ page, chessBoard, gameControls }) => {
  await gameControls.startNewGame();
  await chessBoard.makeMove('e2', 'e4');
  await chessBoard.waitForMove('e4');
});
```

## CI/CD集成

测试可以在CI/CD流水线中自动运行:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:run

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload coverage
  run: npm run test:coverage
```

## 常见问题

### Playwright浏览器未安装

```bash
npx playwright install
```

### 测试超时

在`playwright.config.ts`中增加超时时间:

```typescript
use: {
  actionTimeout: 10000,
}
```

### 元素未找到

使用`waitFor`或增加超时时间:

```typescript
await expect(page.locator('.element')).toBeVisible({ timeout: 10000 });
```
