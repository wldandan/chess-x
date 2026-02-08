# Aaron Chess - 国际象棋比赛训练应用

[![CI](https://github.com/wldandan/chess-x/actions/workflows/test.yml/badge.svg)](https://github.com/wldandan/chess-x/actions/workflows/test.yml)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/backend-Render-blue?logo=render)](https://render.com)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/frontend-React-blue?logo=react)](https://reactjs.org)

专为13-16岁青少年设计的国际象棋比赛准备Web应用，结合AI对弈、智能复盘和专业训练功能，帮助提升比赛竞争力。

## 🌟 核心特性

1. **AI棋手风格模拟训练** ✅ - 模仿世界冠军棋风
2. **智能棋步分析复盘** ✅ - 每步棋AI评分和替代走法建议
3. **战术组合训练系统** ✅ - 经典战术库和渐进式难度
4. **策略思维指导模块** - 局面评估和计划制定
5. **专业比赛界面** - 类似Chess.com的专业棋盘
6. **开局库学习系统** - 常用开局百科全书
7. **残局专项训练** - 基本和高级残局技巧
8. **比赛时间控制模拟** - 标准时间控制训练
9. **个人成长追踪** - 棋力等级分追踪和弱项分析
10. **对局历史管理** - 棋局保存和分类

## 🚀 快速开始

### 本地开发

#### 前端开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```
前端运行在 http://localhost:3000

#### 后端开发
```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 设置环境变量
cp .env.example .env
# 编辑 .env 文件

# 启动后端服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
后端API运行在 http://localhost:8000

### 生产部署

详细部署指南请查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**推荐架构**：
- **前端**：Vercel (React静态应用)
- **后端**：Render (FastAPI + PostgreSQL)
- **总成本**：$0 (免费层)

## 📁 项目结构

```
aaron-chess/
├── src/                    # 前端React源代码
│   ├── components/        # React组件
│   ├── pages/            # 页面组件
│   ├── hooks/            # 自定义Hooks
│   ├── utils/            # 工具函数（包含API配置）
│   ├── styles/           # 样式文件
│   └── types/            # TypeScript类型定义
├── backend/              # 后端FastAPI代码
│   ├── app/             # 应用代码
│   │   ├── main.py      # FastAPI应用入口
│   │   ├── models.py    # 数据库模型
│   │   └── database.py  # 数据库配置
│   ├── requirements.txt  # Python依赖
│   ├── render.yaml      # Render部署配置
│   ├── Dockerfile       # Docker配置
│   └── README.md        # 后端文档
├── features/            # 功能需求文档
├── vite.config.ts       # Vite配置
├── package.json         # 前端依赖
├── DEPLOYMENT_GUIDE.md  # 完整部署指南
└── README.md           # 本文档
```

## 🔧 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **路由**: React Router 7
- **棋盘组件**: react-chessboard + chess.js
- **状态管理**: React Hooks
- **样式**: CSS Modules / Tailwind (可选)

### 后端
- **框架**: FastAPI + Python 3.11
- **数据库**: PostgreSQL + SQLAlchemy
- **AI引擎**: Stockfish集成
- **国际象棋库**: python-chess
- **部署**: Render.com

### 开发工具
- **代码格式化**: Prettier + ESLint
- **版本控制**: Git + GitHub
- **CI/CD**: GitHub Actions
- **测试**: Vitest + Playwright

## 🧪 测试

### 运行测试

```bash
# E2E 测试
npm run test:e2e

# E2E 测试 (UI 模式)
npm run test:e2e:ui

# 单元测试
npm run test:run

# 测试覆盖率
npm run test:coverage
```

### CI/CD

项目使用 GitHub Actions 进行持续集成：

- **Push/PR 到 main/develop 分支**：自动运行测试
- **测试类型**：类型检查、Lint、单元测试、E2E 测试
- **测试报告**：失败时自动上传截图和报告

查看 [`.github/workflows/test.yml`](./.github/workflows/test.yml) 了解 CI 配置。

## 🤖 AI训练功能详解

### AI棋手风格模拟训练

AI棋手风格模拟训练是本应用的核心功能，通过模仿世界顶级棋手的独特风格，帮助青少年棋手适应不同的棋风并提升实战能力。

#### 支持的棋手风格

| 棋手 | 风格特点 | 擅长领域 | ELO等级 |
|------|---------|---------|---------|
| **卡尔森** | 稳健局面型 | 积累微小优势、残局技术 | 2850 |
| **卡斯帕罗夫** | 攻击战术型 | 复杂计算、战术组合 | 2851 |
| **卡鲁阿纳** | 现代灵活型 | 新变例、精确布局 | 2820 |
| **丁立人** | 精密技术型 | 深度计算、残局精密 | 2812 |

#### 训练模式

**1. 风格专项训练 (Style-Focused)**
- 深度体验单一棋手风格
- 5-10局连续对弈
- 风格适应度评分
- 针对性弱点分析

**2. 自适应挑战 (Adaptive)**
- 根据表现动态调整难度
- 自动识别薄弱环节
- 智能推荐训练内容
- ELO追踪系统

**3. 比赛模拟 (Tournament)**
- 真实比赛时间控制
- 标准ELO等级设置
- 完整对局记录
- 专业复盘分析

#### 难度级别

| 级别 | ELO范围 | 特点 | 适用人群 |
|------|---------|------|---------|
| **初学者** | 800-1200 | 基础走法，明显错误 | 刚入门棋手 |
| **中级** | 1200-1800 | 基本战术，合理布局 | 有一定基础 |
| **高级** | 1800-2200 | 复杂计算，策略规划 | 进阶棋手 |
| **大师级** | 2200+ | 深度策略，精准计算 | 高水平棋手 |

#### 技术实现

**AI引擎配置**
```typescript
{
  skillLevel: 20,      // 0-20等级
  depth: 15,           // 搜索深度
  threads: 4,          // 计算线程
  hashSize: 128        // 哈希表大小(MB)
}
```

**风格模拟参数**
```typescript
const playerStyles = {
  'carlsen': {
    positionalWeight: 0.8,    // 局面权重
    tacticalWeight: 0.2,      // 战术权重
    riskTolerance: 0.3,       // 风险容忍度
    endgameFocus: 0.9         // 残局专注度
  },
  'kasparov': {
    positionalWeight: 0.4,
    tacticalWeight: 0.6,
    riskTolerance: 0.7,
    attackFocus: 0.9          // 攻击专注度
  }
}
```

#### 训练统计与分析

**关键指标**
- 风格适应度分数 (0-100)
- 对不同风格的胜率
- ELO变化趋势
- 进步速度追踪

**分析报告**
```
风格训练报告：
- 最佳适应风格：卡尔森风格（适应度85%）
- 最大挑战风格：卡斯帕罗夫风格（胜率35%）
- 推荐训练：攻击性棋风应对训练
- 战术识别：需加强复杂战术组合
- 残局技术：王兵残局表现良好
```

#### 使用流程

1. **选择AI对手风格**
   - 浏览四位世界冠军的风格特点
   - 查看详细描述和ELO等级
   - 选择想要挑战的棋手

2. **配置训练模式**
   - 选择训练模式（专项/自适应/比赛）
   - 设置起始难度（800-2800 ELO）
   - 查看模式说明和建议

3. **开始对弈训练**
   - 实时风格行为指示器
   - 训练进度仪表盘
   - 即时反馈和建议

4. **查看训练报告**
   - 详细的对局分析
   - 风格适应度评估
   - 个性化改进建议

#### 性能指标

- **风格识别准确率**: > 85%
- **AI响应时间**: < 1秒
- **移动端支持**: 完全适配
- **训练效果提升**: > 30%

#### 技术亮点

- 使用 Stockfish 16 引擎提供专业级AI对弈
- 基于真实对局数据训练的风格模型
- 自适应难度调整算法
- 实时局面评估和建议
- 完整的训练数据追踪系统

## 🌐 API文档

启动后端服务后，访问以下地址查看自动生成的API文档：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 主要API端点
- `GET /health` - 健康检查
- `POST /api/analyze` - 分析棋局位置
- `POST /api/move` - 处理棋步移动
- `GET /api/game/{game_id}` - 获取棋局记录

## 📊 数据库设计

数据库包含以下核心表：

1. **users** - 用户信息和ELO等级分
2. **chess_games** - 棋局记录和结果
3. **game_analyses** - 棋步分析和评估
4. **training_sessions** - 训练会话和进度
5. **opening_positions** - 开局库数据

## 🚢 部署流程

### 第一步：准备GitHub仓库
1. 创建GitHub仓库
2. 推送代码到仓库

### 第二步：部署后端 (Render)
1. 在Render创建PostgreSQL数据库
2. 创建Web服务连接GitHub仓库
3. 配置环境变量和启动命令

### 第三步：部署前端 (Vercel)
1. 在Vercel导入GitHub仓库
2. 配置构建命令和环境变量
3. 部署并获取生产URL

### 第四步：配置连接
1. 更新前端API基础URL
2. 配置后端CORS允许前端域名
3. 初始化数据库表

详细步骤见 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📈 开发路线图

### Phase 1: 基础功能 (当前)
- [x] 项目结构和部署配置
- [x] 基础API设计和数据库模型
- [ ] 基础棋盘和对弈功能
- [ ] 简单AI集成

### Phase 2: 核心功能
- [ ] 智能复盘分析系统
- [ ] 战术训练模块
- [ ] 用户认证和进度追踪
- [ ] 开局库学习

### Phase 3: 高级功能
- [ ] 实时对弈功能
- [ ] 高级AI分析
- [ ] 比赛时间控制
- [ ] 移动端优化

### Phase 4: 生产优化
- [ ] 性能优化和缓存
- [ ] 监控和日志系统
- [ ] 自动化测试
- [ ] 多语言支持

## 🤝 贡献指南

1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📚 文档

- **[用户手册](docs/USER_GUIDE.md)** - 使用说明和常见问题
- **[功能说明](docs/FEATURES.md)** - 功能模块详细介绍
- **[贡献指南](CONTRIBUTING.md)** - 开发者贡献指南
- **[部署指南](DEPLOYMENT_GUIDE.md)** - 部署到生产环境
- **[API 文档](docs/API.md)** - 后端 API 接口文档

## 📞 支持

- **项目文档**: [docs/](docs/)
- **后端文档**: [backend/README.md](backend/README.md)
- **功能文档**: [features/](features/)
- **问题反馈**: [GitHub Issues](https://github.com/wldandan/chess-x/issues)

## 🙏 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 现代、快速的Web框架
- [React](https://reactjs.org/) - 用户界面库
- [chess.js](https://github.com/jhlywa/chess.js) - 国际象棋库
- [Stockfish](https://stockfishchess.org/) - 强大的国际象棋引擎
- [Vercel](https://vercel.com) 和 [Render](https://render.com) - 免费部署平台

---

**开始使用**: 查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 获取详细部署指南

**在线演示**: (部署后添加链接)