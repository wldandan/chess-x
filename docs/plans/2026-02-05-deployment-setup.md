# Aaron Chess 部署配置 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 配置Aaron Chess项目的完整生产部署流程，包括GitHub仓库设置、Render后端部署和Vercel前端部署。

**Architecture:** 使用GitHub作为代码仓库，Render部署FastAPI后端和PostgreSQL数据库，Vercel部署React前端。前后端通过环境变量配置连接。

**Tech Stack:** GitHub, Render.com, Vercel, FastAPI, PostgreSQL, React, Vite

---

### Task 1: 初始化Git仓库并推送到GitHub

**Files:**
- Create: `.gitignore` (已存在，需要验证)
- Create: `README.md` (已存在)
- Create: `DEPLOYMENT_GUIDE.md` (已存在)

**Step 1: 检查当前Git状态**

```bash
git status
```

**Step 2: 添加所有文件到暂存区**

```bash
git add .
```

**Step 3: 创建初始提交**

```bash
git commit -m "feat: 初始化Aaron Chess项目

- 添加React前端基础结构
- 添加FastAPI后端API
- 添加数据库模型和配置
- 添加部署文档和指南
- 添加项目功能需求文档

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Step 4: 创建GitHub仓库（手动步骤）**

说明：用户需要在GitHub.com创建新仓库 `aaron-chess`

**Step 5: 添加远程仓库并推送**

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/aaron-chess.git
git push -u origin main
```

**Step 6: 验证推送成功**

```bash
git log --oneline -5
```

---

### Task 2: 在Render创建PostgreSQL数据库

**Files:**
- Modify: `backend/.env.example` (参考配置)
- Modify: `DEPLOYMENT_GUIDE.md` (更新部署状态)

**Step 1: 登录Render Dashboard**

手动步骤：访问 https://dashboard.render.com

**Step 2: 创建PostgreSQL数据库服务**

手动步骤：
1. 点击 "New +" → "PostgreSQL"
2. 配置：
   - Name: `chess-db`
   - Database: `chess_db`
   - User: `chess_user`
   - Plan: Free
3. 点击 "Create Database"

**Step 3: 等待数据库创建完成**

等待约1-2分钟，直到状态显示为 "Available"

**Step 4: 复制数据库连接URL**

手动步骤：
1. 在数据库服务页面点击 "Connect"
2. 复制 "Internal Database URL"
3. 格式：`postgresql://chess_user:password@host:port/chess_db`

**Step 5: 更新本地环境变量文件**

```bash
cd /Users/leiw/Projects/tutorials/aaron-chess/backend
cp .env.example .env.production
```

编辑 `.env.production` 文件：
```
DATABASE_URL=postgresql://chess_user:password@host:port/chess_db
APP_ENV=production
CORS_ORIGINS=https://*.vercel.app
PORT=8000
```

**Step 6: 提交数据库配置**

```bash
git add backend/.env.production
git commit -m "chore: 添加生产环境数据库配置"
```

---

### Task 3: 在Render部署FastAPI后端

**Files:**
- Modify: `backend/render.yaml` (验证配置)
- Modify: `backend/app/main.py` (验证CORS配置)

**Step 1: 验证render.yaml配置**

检查 `backend/render.yaml` 内容：
```yaml
services:
  - type: web
    name: aaron-chess-api
    runtime: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: chess-db
          property: connectionString
      - key: APP_ENV
        value: production
      - key: CORS_ORIGINS
        value: https://*.vercel.app,http://localhost:3000
    healthCheckPath: /health
    autoDeploy: true

databases:
  - name: chess-db
    plan: free
    databaseName: chess_db
    user: chess_user
    ipAllowList: []
```

**Step 2: 验证后端CORS配置**

检查 `backend/app/main.py` 中的CORS配置：
```python
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://*.vercel.app",
]
```

**Step 3: 在Render创建Web服务**

手动步骤：
1. 在Render Dashboard点击 "New +" → "Blueprint"
2. 连接GitHub仓库 `aaron-chess`
3. 选择包含 `backend/render.yaml` 的分支（main）
4. 点击 "Apply"
5. Render会自动创建Web服务和连接数据库

**Step 4: 等待部署完成**

等待约3-5分钟，直到状态显示为 "Live"

**Step 5: 测试后端API**

```bash
curl https://aaron-chess-api.onrender.com/
```
预期输出：
```json
{"message":"Aaron Chess API","status":"healthy"}
```

**Step 6: 测试健康检查端点**

```bash
curl https://aaron-chess-api.onrender.com/health
```
预期输出：
```json
{"status":"healthy","service":"chess-api"}
```

**Step 7: 提交部署状态更新**

```bash
git add DEPLOYMENT_GUIDE.md
git commit -m "docs: 更新后端部署状态和测试结果"
```

---

### Task 4: 在Vercel部署React前端

**Files:**
- Modify: `.env.production` (前端环境变量)
- Modify: `vite.config.ts` (验证代理配置)
- Modify: `src/utils/api.ts` (验证API配置)

**Step 1: 验证前端环境变量**

检查 `.env.production` 内容：
```
VITE_API_BASE_URL=https://aaron-chess-api.onrender.com/api
VITE_APP_NAME=Aaron Chess
VITE_APP_ENV=production
```

**Step 2: 验证API配置**

检查 `src/utils/api.ts` 中的API基础URL配置：
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```

**Step 3: 验证Vite代理配置**

检查 `vite.config.ts` 中的开发代理配置：
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/api'),
  },
},
```

**Step 4: 登录Vercel Dashboard**

手动步骤：访问 https://vercel.com/dashboard

**Step 5: 创建Vercel项目**

手动步骤：
1. 点击 "Add New..." → "Project"
2. 导入GitHub仓库 `aaron-chess`
3. 配置项目：
   - Framework Preset: Vite
   - Root Directory: `.`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 点击 "Deploy"

**Step 6: 配置环境变量**

手动步骤：
1. 在Vercel项目设置中点击 "Environment Variables"
2. 添加变量：
   - `VITE_API_BASE_URL`: `https://aaron-chess-api.onrender.com/api`
   - `VITE_APP_NAME`: `Aaron Chess`
   - `VITE_APP_ENV`: `production`
3. 点击 "Save"
4. 重新部署项目

**Step 7: 等待部署完成**

等待约1-2分钟，直到部署状态显示为 "Ready"

**Step 8: 获取前端URL**

手动步骤：复制Vercel提供的URL，格式：`https://aaron-chess.vercel.app`

**Step 9: 测试前端访问**

```bash
curl https://aaron-chess.vercel.app
```
预期：返回HTML页面

**Step 10: 提交前端部署配置**

```bash
git add .env.production
git commit -m "chore: 添加前端生产环境配置"
```

---

### Task 5: 配置前后端连接

**Files:**
- Modify: `backend/app/main.py` (更新CORS配置)
- Modify: `DEPLOYMENT_GUIDE.md` (更新连接配置)

**Step 1: 获取前端生产URL**

从Vercel Dashboard复制前端URL，例如：`https://aaron-chess.vercel.app`

**Step 2: 更新后端CORS配置**

在Render Dashboard中更新环境变量：
1. 进入 `aaron-chess-api` 服务
2. 点击 "Environment"
3. 更新 `CORS_ORIGINS` 变量：
   ```
   https://aaron-chess.vercel.app,http://localhost:3000
   ```
4. 点击 "Save Changes"

**Step 3: 重启后端服务**

在Render Dashboard中：
1. 进入 `aaron-chess-api` 服务
2. 点击 "Manual Deploy" → "Clear Cache and Deploy"

**Step 4: 测试CORS配置**

```bash
curl -H "Origin: https://aaron-chess.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS --verbose \
  https://aaron-chess-api.onrender.com/health
```
预期：返回包含 `Access-Control-Allow-Origin: https://aaron-chess.vercel.app` 的响应头

**Step 5: 测试完整API调用**

```bash
curl -H "Origin: https://aaron-chess.vercel.app" \
  https://aaron-chess-api.onrender.com/api/analyze \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1","depth":10}'
```
预期：返回JSON响应，没有CORS错误

**Step 6: 更新部署文档**

更新 `DEPLOYMENT_GUIDE.md` 中的连接配置部分

**Step 7: 提交连接配置更新**

```bash
git add DEPLOYMENT_GUIDE.md
git commit -m "docs: 更新前后端连接配置和测试结果"
```

---

### Task 6: 数据库初始化和测试

**Files:**
- Modify: `backend/app/database.py` (验证连接)
- Modify: `backend/app/models.py` (验证模型)
- Create: `backend/scripts/init_db.py` (数据库初始化脚本)

**Step 1: 创建数据库初始化脚本**

```bash
mkdir -p /Users/leiw/Projects/tutorials/aaron-chess/backend/scripts
```

创建 `backend/scripts/init_db.py`：
```python
#!/usr/bin/env python3
"""
数据库初始化脚本
在Render部署后自动创建表结构
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app import models

def init_database():
    """创建所有数据库表"""
    print("正在创建数据库表...")
    Base.metadata.create_all(bind=engine)
    print("数据库表创建完成！")

    # 验证表创建
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"已创建的表: {tables}")

if __name__ == "__main__":
    init_database()
```

**Step 2: 添加数据库初始化到requirements.txt**

```bash
echo "alembic==1.13.1" >> /Users/leiw/Projects/tutorials/aaron-chess/backend/requirements.txt
```

**Step 3: 创建Alembic迁移配置（可选）**

```bash
cd /Users/leiw/Projects/tutorials/aaron-chess/backend
alembic init alembic
```

**Step 4: 更新render.yaml添加初始化命令**

修改 `backend/render.yaml`：
```yaml
buildCommand: |
  pip install -r requirements.txt
  python scripts/init_db.py
```

**Step 5: 测试数据库连接**

创建测试脚本 `backend/scripts/test_db.py`：
```python
#!/usr/bin/env python3
"""测试数据库连接"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import check_db_connection

if __name__ == "__main__":
    if check_db_connection():
        print("✅ 数据库连接成功")
        sys.exit(0)
    else:
        print("❌ 数据库连接失败")
        sys.exit(1)
```

**Step 6: 在Render中手动触发数据库初始化**

手动步骤：
1. 在Render Dashboard进入 `aaron-chess-api` 服务
2. 点击 "Manual Deploy" → "Clear Cache and Deploy"
3. 查看部署日志，确认数据库初始化成功

**Step 7: 验证数据库表**

通过Render数据库的外部连接工具或pgAdmin连接数据库，验证表已创建。

**Step 8: 提交数据库初始化配置**

```bash
git add backend/scripts/ backend/requirements.txt backend/render.yaml
git commit -m "feat: 添加数据库初始化脚本和配置"
```

---

### Task 7: 完整端到端测试

**Files:**
- Create: `tests/e2e/deployment.test.js` (端到端测试)
- Modify: `DEPLOYMENT_GUIDE.md` (添加测试结果)

**Step 1: 创建端到端测试脚本**

```bash
mkdir -p /Users/leiw/Projects/tutorials/aaron-chess/tests/e2e
```

创建 `tests/e2e/deployment.test.js`：
```javascript
// 部署端到端测试
const fetch = require('node-fetch');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://aaron-chess.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://aaron-chess-api.onrender.com';

async function testBackendHealth() {
  console.log('测试后端健康检查...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();

    if (response.status === 200 && data.status === 'healthy') {
      console.log('✅ 后端健康检查通过');
      return true;
    } else {
      console.log('❌ 后端健康检查失败:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ 后端连接失败:', error.message);
    return false;
  }
}

async function testFrontendAccess() {
  console.log('测试前端访问...');
  try {
    const response = await fetch(FRONTEND_URL);

    if (response.status === 200) {
      console.log('✅ 前端访问通过');
      return true;
    } else {
      console.log('❌ 前端访问失败:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ 前端连接失败:', error.message);
    return false;
  }
}

async function testAPIConnection() {
  console.log('测试API连接...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
      },
      body: JSON.stringify({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        depth: 10
      })
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log('✅ API连接通过');
      console.log('API响应:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('❌ API连接失败:', response.status, data);
      return false;
    }
  } catch (error) {
    console.log('❌ API连接异常:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 开始部署端到端测试\n');

  const tests = [
    { name: '后端健康检查', test: testBackendHealth },
    { name: '前端访问', test: testFrontendAccess },
    { name: 'API连接', test: testAPIConnection },
  ];

  let allPassed = true;

  for (const { name, test } of tests) {
    console.log(`\n=== ${name} ===`);
    const passed = await test();
    if (!passed) {
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 所有测试通过！部署成功！');
    process.exit(0);
  } else {
    console.log('❌ 部分测试失败，请检查部署配置');
    process.exit(1);
  }
}

runAllTests();
```

**Step 2: 添加测试依赖**

```bash
echo "node-fetch@^2.6.7" >> /Users/leiw/Projects/tutorials/aaron-chess/package.json
```

**Step 3: 运行端到端测试**

```bash
cd /Users/leiw/Projects/tutorials/aaron-chess
npm install node-fetch
node tests/e2e/deployment.test.js
```

**Step 4: 添加测试脚本到package.json**

修改 `package.json`：
```json
{
  "scripts": {
    "test:e2e": "node tests/e2e/deployment.test.js"
  }
}
```

**Step 5: 更新部署文档**

在 `DEPLOYMENT_GUIDE.md` 中添加测试章节

**Step 6: 提交测试配置**

```bash
git add tests/e2e/ package.json DEPLOYMENT_GUIDE.md
git commit -m "test: 添加部署端到端测试脚本"
```

---

### Task 8: 监控和文档完善

**Files:**
- Modify: `README.md` (更新部署状态)
- Create: `MONITORING.md` (监控文档)
- Modify: `DEPLOYMENT_GUIDE.md` (添加故障排除)

**Step 1: 创建监控文档**

创建 `MONITORING.md`：
```markdown
# Aaron Chess 监控指南

## 服务状态监控

### Render 后端监控
1. **Dashboard**: https://dashboard.render.com
2. **服务状态**: 查看 `aaron-chess-api` 和 `chess-db` 状态
3. **日志查看**: 服务页面 → Logs
4. **指标**: CPU、内存使用率

### Vercel 前端监控
1. **Dashboard**: https://vercel.com/dashboard
2. **部署状态**: 查看最新部署状态
3. **分析**: 访问量、性能指标
4. **日志**: 部署页面 → View Logs

## 健康检查端点

### 后端健康检查
```bash
curl https://aaron-chess-api.onrender.com/health
```
预期响应: `{"status":"healthy","service":"chess-api"}`

### 数据库连接检查
通过Render数据库控制台或外部工具连接测试。

## 故障排除

### 后端服务无法启动
1. 检查Render日志中的错误信息
2. 验证环境变量配置
3. 检查Python依赖版本

### 数据库连接失败
1. 验证DATABASE_URL格式
2. 检查数据库服务状态
3. 确认网络连接

### CORS错误
1. 检查前端控制台错误
2. 验证CORS_ORIGINS配置
3. 测试OPTIONS请求

## 备份策略

### 数据库备份
Render免费层不支持自动备份，建议：
1. 定期手动导出数据
2. 使用pg_dump命令备份
3. 存储备份到安全位置

### 代码备份
GitHub仓库自动备份所有代码。
```

**Step 2: 更新README.md部署状态**

在 `README.md` 中添加部署状态章节：
```markdown
## 🚀 部署状态

- **前端**: [![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel)](https://aaron-chess.vercel.app)
- **后端API**: [![Render](https://img.shields.io/badge/backend-Render-blue?logo=render)](https://aaron-chess-api.onrender.com)
- **API文档**: https://aaron-chess-api.onrender.com/docs
- **健康检查**: https://aaron-chess-api.onrender.com/health

### 快速测试
```bash
# 测试后端健康
curl https://aaron-chess-api.onrender.com/health

# 测试前端访问
curl https://aaron-chess.vercel.app
```
```

**Step 3: 添加故障排除到部署指南**

在 `DEPLOYMENT_GUIDE.md` 中完善故障排除章节

**Step 4: 创建部署完成报告**

创建 `docs/deployments/2026-02-05-initial-deployment.md`：
```markdown
# 初始部署报告 - 2026-02-05

## 部署概览
- **时间**: 2026年2月5日
- **环境**: 生产环境
- **架构**: GitHub + Render + Vercel

## 服务详情
- **前端URL**: https://aaron-chess.vercel.app
- **后端URL**: https://aaron-chess-api.onrender.com
- **数据库**: Render PostgreSQL (chess-db)

## 测试结果
- [x] 后端健康检查通过
- [x] 前端访问通过
- [x] API连接测试通过
- [x] CORS配置正确
- [x] 数据库连接正常

## 配置详情
### 环境变量
- `VITE_API_BASE_URL`: https://aaron-chess-api.onrender.com/api
- `DATABASE_URL`: postgresql://chess_user:***@***:***/chess_db
- `CORS_ORIGINS`: https://aaron-chess.vercel.app,http://localhost:3000

### 资源使用
- **Render**: Free tier (数据库100MB + Web服务)
- **Vercel**: Free tier (100GB带宽/月)
- **总成本**: $0

## 后续步骤
1. 添加域名自定义（可选）
2. 配置自动化测试
3. 设置监控告警
4. 定期备份数据库
```

**Step 5: 提交最终文档**

```bash
git add MONITORING.md README.md DEPLOYMENT_GUIDE.md docs/deployments/
git commit -m "docs: 添加监控文档和部署完成报告"
```

---

## 计划完成总结

已创建完整的部署实施计划，包含8个任务：

1. **GitHub仓库初始化** - 代码版本控制和远程存储
2. **Render数据库创建** - PostgreSQL数据库服务配置
3. **Render后端部署** - FastAPI应用部署和配置
4. **Vercel前端部署** - React应用部署和配置
5. **前后端连接配置** - CORS和API连接测试
6. **数据库初始化** - 表结构创建和验证
7. **端到端测试** - 完整部署验证测试
8. **监控文档完善** - 运维监控和故障排除文档

每个任务包含具体的步骤、命令、预期输出和验证方法。

---

Plan complete and saved to `docs/plans/2026-02-05-deployment-setup.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**