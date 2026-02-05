from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import Optional

app = FastAPI(title="Aaron Chess API", version="1.0.0")

# CORS配置 - 允许前端访问
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://*.vercel.app",
    # 生产环境的前端域名可以在这里添加
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class MoveRequest(BaseModel):
    fen: str
    move: str
    game_id: Optional[str] = None

class AnalysisRequest(BaseModel):
    fen: str
    depth: int = 15

class ChessGame(BaseModel):
    fen: str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    moves: list[str] = []

# 健康检查端点
@app.get("/")
async def root():
    return {"message": "Aaron Chess API", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "chess-api"}

# 国际象棋相关端点
@app.post("/api/move")
async def make_move(request: MoveRequest):
    """处理棋步移动"""
    # TODO: 集成chess.js或python-chess验证棋步
    return {
        "valid": True,
        "fen": request.fen,
        "move": request.move,
        "message": "Move processed"
    }

@app.post("/api/analyze")
async def analyze_position(request: AnalysisRequest):
    """分析棋局位置"""
    # TODO: 集成Stockfish进行棋局分析
    return {
        "fen": request.fen,
        "depth": request.depth,
        "best_move": "e2e4",
        "evaluation": 0.5,
        "pv": ["e2e4", "e7e5", "g1f3"]
    }

@app.get("/api/game/{game_id}")
async def get_game(game_id: str):
    """获取棋局记录"""
    # TODO: 从数据库获取棋局
    return {
        "game_id": game_id,
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "moves": [],
        "players": {"white": "Player1", "black": "Player2"}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))