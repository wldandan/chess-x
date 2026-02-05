# Aaron Chess 后端API

基于FastAPI的国际象棋比赛训练应用后端，提供AI对弈、棋局分析和数据存储功能。

## 功能特性

- ✅ FastAPI + PostgreSQL 后端架构
- ✅ 国际象棋棋局管理
- ✅ AI分析集成（Stockfish）
- ✅ 用户和训练数据存储
- ✅ CORS配置支持前端访问
- ✅ Render.com 一键部署

## 快速开始

### 1. 本地开发环境设置

```bash
# 克隆项目（如果尚未克隆）
# git clone <your-repo>
# cd aaron-chess/backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 复制环境变量文件
cp .env.example .env
# 编辑 .env 文件，配置数据库连接

# 运行开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 数据库设置

#### 使用SQLite（开发）
默认使用SQLite，无需额外设置。

#### 使用PostgreSQL（生产）
1. 安装PostgreSQL
2. 创建数据库：
```sql
CREATE DATABASE chess_db;
CREATE USER chess_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chess_db TO chess_user;
```
3. 更新`.env`文件中的`DATABASE_URL`

### 3. API端点

- `GET /` - API状态
- `GET /health` - 健康检查
- `POST /api/move` - 处理棋步
- `POST /api/analyze` - 分析棋局
- `GET /api/game/{game_id}` - 获取棋局

### 4. 部署到Render.com

#### 方法一：使用render.yaml（推荐）
1. 将代码推送到GitHub仓库
2. 登录 [Render Dashboard](https://dashboard.render.com)
3. 点击 "New +" → "Blueprint"
4. 连接GitHub仓库，选择包含render.yaml的分支
5. Render会自动配置服务和数据库

#### 方法二：手动创建服务
1. 创建PostgreSQL数据库：
   - "New +" → "PostgreSQL"
   - 名称: `chess-db`
   - 计划: Free

2. 创建Web服务：
   - "New +" → "Web Service"
   - 连接GitHub仓库
   - 名称: `aaron-chess-api`
   - 环境: Python
   - 构建命令: `pip install -r requirements.txt`
   - 启动命令: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - 环境变量:
     - `DATABASE_URL`: 从数据库服务复制
     - `APP_ENV`: `production`
     - `CORS_ORIGINS`: `https://*.vercel.app`

### 5. 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DATABASE_URL | 数据库连接URL | - |
| APP_ENV | 运行环境 | development |
| PORT | 服务端口 | 8000 |
| CORS_ORIGINS | 允许的CORS源 | http://localhost:3000 |

## 项目结构

```
backend/
├── app/
│   ├── main.py          # FastAPI应用入口
│   ├── models.py        # SQLAlchemy数据模型
│   ├── database.py      # 数据库连接配置
│   └── services/        # 业务逻辑（待添加）
├── requirements.txt     # Python依赖
├── render.yaml          # Render部署配置
├── Dockerfile          # Docker配置
├── .env.example        # 环境变量示例
└── README.md           # 本文档
```

## 数据库模型

1. **users** - 用户信息
2. **chess_games** - 棋局记录
3. **game_analyses** - 棋局分析数据
4. **training_sessions** - 训练会话
5. **opening_positions** - 开局库

## 开发路线图

- [ ] 集成Stockfish AI引擎
- [ ] 实现完整的棋局管理
- [ ] 添加用户认证系统
- [ ] 开发训练模块API
- [ ] 实现实时对弈功能
- [ ] 添加数据统计和分析端点

## 故障排除

### 数据库连接问题
- 确保PostgreSQL服务正在运行
- 检查DATABASE_URL格式：`postgresql://user:password@host:port/dbname`
- 验证数据库用户权限

### CORS错误
- 检查CORS_ORIGINS配置是否包含前端域名
- 确保前端请求包含正确的Origin头

### 部署问题
- 查看Render部署日志：Dashboard → Service → Logs
- 检查环境变量配置
- 验证requirements.txt中的依赖版本

## 相关链接

- [FastAPI文档](https://fastapi.tiangolo.com/)
- [Render文档](https://render.com/docs)
- [SQLAlchemy文档](https://docs.sqlalchemy.org/)
- [Python Chess库](https://python-chess.readthedocs.io/)