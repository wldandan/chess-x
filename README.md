# Aaron Chess - 国际象棋比赛训练应用

[![CI](https://github.com/your-username/aaron-chess/actions/workflows/test.yml/badge.svg)](https://github.com/your-username/aaron-chess/actions/workflows/test.yml)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/backend-Render-blue?logo=render)](https://render.com)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/frontend-React-blue?logo=react)](https://reactjs.org)

专为13-16岁青少年设计的国际象棋比赛准备Web应用，结合AI对弈、智能复盘和专业训练功能，帮助提升比赛竞争力。

## 🌟 核心特性

1. **AI棋手风格模拟训练** - 模仿世界冠军棋风
2. **智能棋步分析复盘** - 每步棋AI评分和替代走法建议
3. **战术组合训练系统** - 经典战术库和渐进式难度
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

## 📞 支持

- **项目文档**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **后端文档**: [backend/README.md](./backend/README.md)
- **功能文档**: [features/README.md](./features/README.md)
- **问题反馈**: GitHub Issues

## 🙏 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 现代、快速的Web框架
- [React](https://reactjs.org/) - 用户界面库
- [chess.js](https://github.com/jhlywa/chess.js) - 国际象棋库
- [Stockfish](https://stockfishchess.org/) - 强大的国际象棋引擎
- [Vercel](https://vercel.com) 和 [Render](https://render.com) - 免费部署平台

---

**开始使用**: 查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 获取详细部署指南

**在线演示**: (部署后添加链接)