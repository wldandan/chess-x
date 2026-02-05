# Aaron Chess 部署指南

本文档详细说明如何将Aaron Chess应用部署到生产环境。

## 架构概述

```
前端 (React) → Vercel (静态托管)
     ↓
后端 (FastAPI) → Render (Python Web服务)
     ↓
数据库 (PostgreSQL) → Render (数据库服务)
```

## 1. 准备工作

### 1.1 GitHub仓库
1. 在GitHub创建新仓库：`aaron-chess`
2. 将本地代码推送到仓库：
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/aaron-chess.git
git push -u origin main
```

### 1.2 账户注册
- [Vercel](https://vercel.com) - 前端部署
- [Render](https://render.com) - 后端和数据库部署
- 两个平台都支持GitHub登录

## 2. 后端部署 (Render)

### 2.1 创建数据库
1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 点击 "New +" → "PostgreSQL"
3. 配置：
   - **Name**: `chess-db`
   - **Database**: `chess_db` (可选)
   - **User**: `chess_user` (可选)
   - **Plan**: Free
4. 点击 "Create Database"
5. 等待数据库创建完成，复制 "Internal Database URL"

### 2.2 创建Web服务
1. 在Render Dashboard中点击 "New +" → "Web Service"
2. 连接你的GitHub仓库 `aaron-chess`
3. 配置服务：
   - **Name**: `aaron-chess-api`
   - **Environment**: Python 3
   - **Region**: 选择离你最近的地区
   - **Branch**: `main`
   - **Root Directory**: `backend` (重要！)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. 点击 "Advanced" → 添加环境变量：
   - `DATABASE_URL`: 粘贴从数据库服务复制的URL
   - `APP_ENV`: `production`
   - `CORS_ORIGINS`: `https://*.vercel.app`
5. 点击 "Create Web Service"

### 2.3 验证后端部署
1. 等待部署完成（约2-5分钟）
2. 访问服务URL：`https://aaron-chess-api.onrender.com`
3. 应看到JSON响应：`{"message":"Aaron Chess API","status":"healthy"}`
4. 访问健康检查端点：`https://aaron-chess-api.onrender.com/health`

## 3. 前端部署 (Vercel)

### 3.1 创建Vercel项目
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 导入GitHub仓库 `aaron-chess`
4. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (根目录)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 点击 "Environment Variables" 添加：
   - `VITE_API_BASE_URL`: `https://aaron-chess-api.onrender.com/api`
   - `VITE_APP_NAME`: `Aaron Chess`
   - `VITE_APP_ENV`: `production`
6. 点击 "Deploy"

### 3.2 自定义域名（可选）
1. 在Vercel项目设置中点击 "Domains"
2. 添加你的自定义域名（如 `chess.yourdomain.com`）
3. 按照提示配置DNS记录

## 4. 配置前后端连接

### 4.1 更新前端API配置
部署完成后，更新前端环境变量：
1. 在Vercel项目设置中更新 `VITE_API_BASE_URL`
2. 重新部署前端

### 4.2 更新后端CORS配置
1. 在Render后端服务的环境变量中更新 `CORS_ORIGINS`：
   - 包含你的Vercel域名：`https://aaron-chess.vercel.app`
   - 如果使用自定义域名，也添加进去
2. 重启后端服务

## 5. 数据库初始化

### 5.1 创建数据库表
1. 获取数据库连接信息：
   - 在Render Dashboard中进入 `chess-db` 服务
   - 点击 "Connect" → "External Connection"
   - 复制连接字符串

2. 使用pgAdmin或psql连接数据库：
```bash
psql "postgresql://user:password@host:port/dbname"
```

3. 运行SQL创建表（或等待应用自动创建）：
```sql
-- 应用首次启动时会自动创建表
-- 如需手动创建，参考 backend/app/models.py
```

### 5.2 导入初始数据（可选）
如果需要开局库数据：
```bash
# 连接到数据库后运行
\i path/to/opening_data.sql
```

## 6. 环境变量参考

### 后端环境变量 (Render)
| 变量名 | 值 | 说明 |
|--------|-----|------|
| DATABASE_URL | 自动生成 | 数据库连接URL |
| APP_ENV | production | 运行环境 |
| CORS_ORIGINS | https://*.vercel.app | 允许的前端域名 |
| PORT | 自动设置 | 服务端口 |

### 前端环境变量 (Vercel)
| 变量名 | 值 | 说明 |
|--------|-----|------|
| VITE_API_BASE_URL | https://aaron-chess-api.onrender.com/api | API基础URL |
| VITE_APP_NAME | Aaron Chess | 应用名称 |
| VITE_APP_ENV | production | 运行环境 |

## 7. 监控和维护

### 7.1 查看日志
- **Render日志**: Dashboard → Service → Logs
- **Vercel日志**: Dashboard → Project → Deployments → 选择部署 → "View Logs"

### 7.2 服务状态
- **Render服务状态**: Dashboard中查看服务状态指示器
- **Vercel部署状态**: Dashboard中查看部署状态

### 7.3 备份数据库
1. Render免费数据库不支持自动备份
2. 手动备份：
```bash
pg_dump "postgresql://user:password@host:port/dbname" > backup.sql
```

## 8. 故障排除

### 8.1 后端无法启动
1. 检查Render日志中的错误信息
2. 验证 `requirements.txt` 中的依赖
3. 检查Python版本兼容性

### 8.2 数据库连接失败
1. 验证 `DATABASE_URL` 格式正确
2. 检查数据库服务是否运行
3. 确认网络连接和防火墙设置

### 8.3 CORS错误
1. 前端控制台出现CORS错误
2. 检查后端 `CORS_ORIGINS` 配置
3. 确保包含正确的前端域名

### 8.4 API请求失败
1. 验证API端点URL正确
2. 检查后端服务是否运行
3. 查看网络请求的响应状态码

## 9. 成本估算

### 免费层限制
- **Render**:
  - Web服务：免费实例休眠（15分钟无流量后停止）
  - 数据库：100MB存储，免费
- **Vercel**:
  - 100GB带宽/月，完全免费
  - 自动HTTPS，全球CDN

### 升级建议
当用户量增加时：
1. Render升级到Starter计划（$7/月）- 不休眠实例
2. 数据库升级到更大存储
3. Vercel保持免费计划通常足够

## 10. 自动化部署

### GitHub Actions（可选）
创建 `.github/workflows/deploy.yml` 自动化测试和部署。

## 支持

- 后端问题：查看 `backend/README.md`
- 前端问题：查看项目文档
- Render支持：https://render.com/docs
- Vercel支持：https://vercel.com/docs

---

**部署完成后的访问地址**：
- 前端：`https://aaron-chess.vercel.app`（或你的自定义域名）
- 后端API：`https://aaron-chess-api.onrender.com`
- API文档：`https://aaron-chess-api.onrender.com/docs`（自动生成的Swagger UI）