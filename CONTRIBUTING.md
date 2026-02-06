# 贡献指南

感谢你考虑为 Chess-X 做出贡献！🎉

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)

---

## 🤝 行为准则

- 尊重所有贡献者
- 建设性反馈
- 专注于项目改进
- 乐于助人

---

## 🚀 如何贡献

### 报告 Bug

1. 在 [Issues](https://github.com/wldandan/chess-x/issues) 搜索是否已存在
2. 如果没有，创建新 Issue 并包含：
   - 清晰的标题
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息（浏览器、系统等）

### 提出功能建议

1. 在 [Issues](https://github.com/wldandan/chess-x/issues) 搜索是否已存在
2. 创建新 Issue 并描述：
   - 功能描述
   - 使用场景
   - 预期效果

### 提交代码

1. Fork 项目仓库
2. 创建功能分支
3. 编写代码和测试
4. 提交 Pull Request

---

## 🔧 开发流程

### 环境准备

```bash
# 克隆仓库
git clone https://github.com/wldandan/chess-x.git
cd chess-x

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm run test:e2e
```

### 项目结构

```
chess-x/
├── src/
│   ├── components/      # React 组件
│   │   ├── chess/      # 棋盘相关组件
│   │   ├── analysis/   # 分析相关组件
│   │   ├── tactics/    # 训练相关组件
│   │   └── ui/         # 通用 UI 组件
│   ├── pages/          # 页面组件
│   ├── stores/         # Zustand 状态管理
│   ├── types/          # TypeScript 类型
│   ├── services/       # 业务逻辑服务
│   ├── utils/          # 工具函数
│   └── styles/         # 样式文件
├── backend/            # FastAPI 后端
├── features/           # 功能需求文档
└── docs/              # 文档
```

### 创建功能分支

```bash
# 格式: feature/<功能名> 或 fix/<问题名>
git checkout -b feature/add-opening-library
git checkout -b fix/analysis-crash
```

### 编写代码

1. 遵循现有代码风格
2. 添加必要的类型定义
3. 编写测试覆盖新功能
4. 更新相关文档

### 测试

```bash
# E2E 测试
npm run test:e2e

# E2E 测试 UI 模式
npm run test:e2e:ui

# 类型检查
npx tsc --noEmit
```

### 提交代码

```bash
# 添加更改
git add .

# 提交（遵循提交规范）
git commit -m "feat: add opening library feature"

# 推送到 Fork 仓库
git push origin feature/add-opening-library
```

### Pull Request

1. 访问 GitHub 创建 Pull Request
2. 填写 PR 模板
3. 等待 Code Review
4. 根据反馈修改
5. 合并后删除分支

---

## 📝 代码规范

### TypeScript

```typescript
// ✅ 好的示例
interface ChessBoardProps {
  position: string;
  onMove: (move: Move) => void;
  orientation?: 'white' | 'black';
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  position,
  onMove,
  orientation = 'white'
}) => {
  // ...
};

// ❌ 避免
export function ChessBoard(props: any) {
  // ...
}
```

### React 组件

```tsx
// ✅ 使用函数组件 + Hooks
const MyComponent: React.FC<Props> = ({ data }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // 副作用
  }, []);

  return <div>{/* JSX */}</div>;
};

// ❌ 避免使用 class 组件（除非必要）
class MyComponent extends React.Component {
  // ...
}
```

### 命名规范

```typescript
// 组件：PascalCase
const ChessBoard: React.FC = () => {};

// 函数/变量：camelCase
const getCurrentPosition = () => {};
let moveCount = 0;

// 常量：UPPER_SNAKE_CASE
const MAX_PUZZLES = 100;
const API_BASE_URL = 'https://...';

// 类型/接口：PascalCase
interface ChessMove {}
type PieceColor = 'white' | 'black';

// 文件名：kebab-case
// chess-board.tsx
// move-analysis-panel.tsx
```

### 样式

```css
/* 使用 BEM 命名 */
.chess-board { }
.chess-board__square { }
.chess-board__square--selected { }

/* 或使用 CSS Modules */
.chessBoard { }
.square { }
.selected { }
```

---

## 🎯 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<类型>(<范围>): <描述>

[可选的正文]

[可选的脚注]
```

### 类型

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能）|
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具链更新 |

### 示例

```bash
feat(analysis): add opening detection feature

fix(training): resolve puzzle loading issue

docs: update user guide with screenshots

refactor(game): simplify move validation logic

test(e2e): add tests for deployment flow
```

---

## 🧪 测试规范

### E2E 测试

```typescript
test.describe('功能名称', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path');
  });

  test('应该做什么', async ({ page }) => {
    // 准备
    await page.click('button');

    // 执行
    await expect(page.locator('.result')).toBeVisible();

    // 验证
    expect(await page.textContent('.result')).toContain('预期结果');
  });
});
```

### 测试文件位置

```
src/test/
├── e2e/              # E2E 测试
│   ├── analysis.spec.ts
│   ├── training.spec.ts
│   └── gameplay.spec.ts
├── utils/            # 测试工具
│   └── test-utils.ts
└── setup.ts          # 测试配置
```

---

## 📚 文档规范

### 组件文档

```tsx
/**
 * 棋盘组件
 *
 * @description 用于显示和交互国际象棋棋盘
 * @example
 * ```tsx
 * <ChessBoard
 *   position="rnbqkbnr/pppppppp/8/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
 *   onMove={(move) => console.log(move)}
 *   orientation="white"
 * />
 * ```
 */
export const ChessBoard: React.FC<ChessBoardProps> = (props) => {
  // ...
};
```

### 功能文档

每个功能应该在 `docs/` 或 `features/` 有对应的文档：
- 功能描述
- 使用场景
- 技术实现
- API 说明

---

## ✅ PR 检查清单

提交 PR 前确认：

- [ ] 代码通过所有测试
- [ ] 新功能有对应的测试
- [ ] 代码风格一致
- [ ] 文档已更新
- [ ] 提交信息符合规范
- [ ] 没有 console.log 或调试代码
- [ ] 没有合并冲突

---

## 🆘 获取帮助

- 查看 [文档](docs/)
- 搜索 [Issues](https://github.com/wldandan/chess-x/issues)
- 提问 [Discussions](https://github.com/wldandan/chess-x/discussions)

---

再次感谢你的贡献！🎉
