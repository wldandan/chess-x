# Render 部署指南

本指南将帮助你将 Aaron Chess 项目部署到 Render.com（免费额度）。

---

## 📋 前置准备

1. **GitHub 仓库**
   - 将代码推送到 GitHub 仓库
   - Render 从 GitHub 读取代码进行部署

2. **Render 账号**
   - 访问 [render.com](https://render.com)
   - 使用 GitHub 账号登录（推荐）

---

## 🗄️ 数据库配置（已完成 ✅）

**已创建的数据库：**
- Instance Name: `chess_x_db`
- Database Name: `chess-x`
- Render 会自动注入 `DATABASE_URL` 环境变量

---

## 🚀 部署步骤

### 第一步：部署后端 API

1. 登录 [Render Dashboard](https://dashboard.render.com)

2. 点击 **"New +"** 按钮 → 选择 **"Web Service"**

3. 连接你的 GitHub 仓库：`wldandan/chess-x`

4. 配置后端服务：

   | 配置项 | 值 |
   |--------|-----|
   | **Name** | `aaron-chess-api` |
   | **Region** | Singapore (或最近的) |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | Python 3 |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
   | **Plan** | Free |

5. **环境变量**（Render 自动从数据库获取 `DATABASE_URL`）

   手动添加：
   ```
   PYTHON_VERSION=3.11
   APP_ENV=production
   ```

6. 点击 **"Create Web Service"**，等待部署完成（约 3-5 分钟）

7. 部署成功后，验证健康检查：
   ```
   https://aaron-chess-api.onrender.com/health
   ```

   预期响应：
   ```json
   {
     "status": "healthy",
     "service": "chess-api",
     "database": "connected"
   }
   ```

---

### 第二步：部署前端

1. 再次点击 **"New +"** → 选择 **"Static Site"**

2. 配置前端服务：

   | 配置项 | 值 |
   |--------|-----|
   | **Name** | `aaron-chess-frontend` |
   | **Region** | Singapore (或最近的) |
   | **Branch** | `main` |
   | **Root Directory** | `/` (项目根目录) |
   | **Build Command** | `npm run build` |
   | **Publish Directory** | `dist` |
   | **Plan** | Free |

3. **环境变量**：
   ```
   VITE_API_BASE_URL=https://aaron-chess-api.onrender.com
   ```

4. 点击 **"Create Static Site"**，等待部署完成

---

## 🔗 部署后 URL

部署成功后，你将获得：

| 服务 | URL |
|------|-----|
| 前端 | `https://aaron-chess-frontend.onrender.com` |
| 后端 API | `https://aaron-chess-api.onrender.com` |
| API 文档 | `docs/API.md` |

---

## 📝 重要提示

### Render 免费计划的限制

| 资源 | 免费版限制 |
|------|-----------|
| **数据库** | 90 天免费，之后 $7/月 |
| **后端服务** | 512 MB RAM，15 分钟休眠 |
| **前端服务** | 无限带宽，CDN 加速 |
| **月限额** | 750 小时/月 |

### 解决冷启动问题

- 服务无请求 15 分钟后会休眠
- 休眠后首次请求需要 30 秒左右启动
- 可以在 [UptimeRobot](https://uptimerobot.com) 设置免费监控
- 每 5 分钟 ping 一次服务，保持活跃

---

## 🛠️ 故障排查

### 数据库连接失败

**解决：**
1. 确认数据库和后端在同一个 Render 账户下
2. 在 Render Dashboard 中，进入后端服务
3. 检查 "Environment" 选项卡是否显示了 `DATABASE_URL`

### CORS 错误

确认后端 `main.py` 中的 `origins` 包含前端 URL：
```python
origins = [
    "https://aaron-chess-frontend.onrender.com",
    "https://*.onrender.com",
]
```

### 后端部署失败

1. 检查 `backend/requirements.txt` 文件是否存在
2. 查看 Render 部署日志
3. 确认 `startCommand` 正确

### 前端部署失败

1. 检查 `package.json` 中的 `build` 脚本
2. 确认 `vite.config.ts` 配置正确
3. 查看构建日志

---

## 📊 监控和日志

- 访问 [Render Dashboard](https://dashboard.render.com)
- 查看服务状态、日志和指标
- 设置告警通知

---

## 🔄 自动部署

Render 配置了 `autoDeploy: true`，当你：
1. 推送代码到 GitHub 主分支
2. 合并 Pull Request

服务会自动重新部署。

```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

---

## 🎯 验证部署

### 1. 检查后端健康

访问：`https://aaron-chess-api.onrender.com/health`

```json
{
  "status": "healthy",
  "service": "chess-api",
  "database": "connected"
}
```

### 2. 访问前端

访问：`https://aaron-chess-frontend.onrender.com/demo`

检查：
- ✅ 棋盘正常显示
- ✅ 后端状态显示 "🟢 后端已连接"
- ✅ 走棋后游戏结束自动保存

---

## 🎯 下一步

1. ✅ 部署完成后，访问前端 URL 测试
2. ✅ 测试 AI 对战功能
3. ✅ 验证游戏记录保存功能
4. ✅ 配置自定义域名（可选）
5. ✅ 设置监控和告警
