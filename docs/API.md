# Aaron Chess API 文档

## 基础信息

- **Base URL**: `http://localhost:8000` (开发环境)
- **生产环境**: `https://aaron-chess-api.onrender.com`

## API 端点

### 1. 健康检查

**GET** `/health`

检查 API 和数据库状态。

**响应示例：**
```json
{
  "status": "healthy",
  "service": "chess-api",
  "database": "connected"
}
```

---

### 2. 保存游戏

**POST** `/api/games`

保存新的游戏记录。

**请求体：**
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "moves": ["e4", "e5"],
  "result": null,
  "game_type": "ai",
  "white_username": "Player",
  "black_username": "AI"
}
```

**响应示例：**
```json
{
  "id": "22f60b3c-e93a-49e4-98c2-376d9bc1fe44",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "moves": ["e4", "e5"],
  "result": null,
  "game_type": "ai",
  "created_at": "2025-02-06T12:00:00"
}
```

---

### 3. 获取游戏列表

**GET** `/api/games?skip=0&limit=20&game_type=ai`

获取游戏历史记录。

**查询参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `skip` | int | 0 | 跳过记录数 |
| `limit` | int | 20 | 返回记录数 |
| `game_type` | string | - | 筛选游戏类型 (ai/human) |

**响应示例：**
```json
[
  {
    "id": "22f60b3c-e93a-49e4-98c2-376d9bc1fe44",
    "fen": "...",
    "moves": ["e4", "e5"],
    "result": "1-0",
    "game_type": "ai",
    "created_at": "2025-02-06T12:00:00"
  }
]
```

---

### 4. 获取单个游戏

**GET** `/api/games/{game_id}`

获取指定游戏的详细信息。

**响应示例：**
```json
{
  "id": "22f60b3c-e93a-49e4-98c2-376d9bc1fe44",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "moves": ["e4", "e5"],
  "result": "1-0",
  "game_type": "ai",
  "created_at": "2025-02-06T12:00:00"
}
```

---

### 5. 更新游戏

**PUT** `/api/games/{game_id}`

更新游戏记录（如添加结果）。

**请求体：**
```json
{
  "fen": "...",
  "moves": ["e4", "e5", "Nf3"],
  "result": "1-0",
  "game_type": "ai"
}
```

**响应示例：**
```json
{
  "message": "Game updated",
  "game_id": "22f60b3c-e93a-49e4-98c2-376d9bc1fe44"
}
```

---

### 6. 分析棋局（占位）

**POST** `/api/analyze`

分析棋局位置（待集成 Stockfish）。

**请求体：**
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "depth": 15
}
```

**响应示例：**
```json
{
  "fen": "...",
  "depth": 15,
  "best_move": "e2e4",
  "evaluation": 0.5,
  "pv": ["e2e4", "e7e5", "g1f3"],
  "message": "Analysis endpoint - Stockfish integration pending"
}
```

---

## 前端集成示例

```typescript
import { chessAPI } from '@/services/api'

// 保存游戏
await chessAPI.saveGame({
  fen: game.fen(),
  moves: game.history(),
  game_type: 'ai',
  white_username: 'Player',
  black_username: 'AI'
})

// 获取历史
const games = await chessAPI.getGames({ limit: 10, game_type: 'ai' })
```

---

## 错误处理

所有错误响应格式：
```json
{
  "detail": "Error message here"
}
```

常见 HTTP 状态码：
- `200` - 成功
- `404` - 资源未找到
- `500` - 服务器错误
