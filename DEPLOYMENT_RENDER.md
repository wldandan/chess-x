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

## 🚀 部署步骤

### 第一步：部署后端 API

1. 登录 [Render Dashboard](https://dashboard.render.com)

2. 点击 **"New +"** 按钮

3. 选择 **"Web Service"**

4. 连接你的 GitHub 仓库

5. 配置后端服务：
   ```yaml
   Name: aaron-chess-api
   Environment: Python 3
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

6. 选择 **"Free"** 计划

7. 点击 **"Create Web Service"**

8. 等待部署完成（约 3-5 分钟）

9. 部署成功后，记录下 API URL：
   ```
   https://aaron-chess-api.onrender.com
   ```

---

### 第二步：部署前端

1. 再次点击 **"New +"** 按钮

2. 选择 **"Static Site"**

3. 配置前端服务：
   ```yaml
   Name: aaron-chess-frontend
   Root Directory: / (项目根目录)
   Build Command: npm run build
   Publish Directory: dist
   ```

4. 添加环境变量：
   ```
   VITE_API_URL = https://aaron-chess-api.onrender.com
   ```

5. 选择 **"Free"** 计划

6. 点击 **"Create Static Site"**

7. 等待部署完成

---

## 🔧 配置说明

### 后端服务 (Web Service)

| 配置项 | 值 |
|--------|-----|
| Name | `aaron-chess-api` |
| Environment | `Python 3` |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Plan | `Free` |

### 前端服务 (Static Site)

| 配置项 | 值 |
|--------|-----|
| Name | `aaron-chess-frontend` |
| Root Directory | `/` (项目根目录) |
| Build Command | `npm run build` |
| Publish Directory | `dist` |
| Plan | `Free` |

---

## 📝 重要提示

### Render 免费计划的限制

1. **休眠时间**：服务无请求 15 分钟后会休眠
2. **冷启动**：休眠后首次请求需要 30 秒左右启动
3. **月限额**：750 小时/月 的运行时间

### 解决冷启动问题

- 可以在 [UptimeRobot](https://uptimerobot.com) 设置免费监控
- 每 5 分钟 ping 一次服务，保持活跃

### 环境变量

确保前端的 `VITE_API_URL` 指向后端的实际 URL。

---

## 🔗 部署后 URL

部署成功后，你将获得：

| 服务 | URL |
|------|-----|
| 前端 | `https://aaron-chess-frontend.onrender.com` |
| 后端 API | `https://aaron-chess-api.onrender.com` |
| API 文档 | `https://aaron-chess-api.onrender.com/docs` |

---

## 🛠️ 故障排查

### 后端部署失败

1. 检查 `requirements.txt` 文件是否存在
2. 查看 Render 部署日志
3. 确认 `startCommand` 正确

### 前端部署失败

1. 检查 `package.json` 中的 `build` 脚本
2. 确认 `vite.config.ts` 配置正确
3. 查看构建日志

### CORS 错误

确认后端 `main.py` 中的 `origins` 包含前端 URL：
```python
origins = [
    "https://aaron-chess-frontend.onrender.com",
    "https://*.onrender.com",
]
```

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

---

## 🎯 下一步

1. ✅ 部署完成后，访问前端 URL 测试
2. ✅ 测试 AI 对战功能
3. ✅ 配置自定义域名（可选）
4. ✅ 设置监控和告警
