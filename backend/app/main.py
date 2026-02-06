from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
import os
import uuid
from datetime import datetime

from .database import get_db, check_db_connection
from . import models

app = FastAPI(title="Aaron Chess API", version="1.0.0")

# CORS配置
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "https://*.vercel.app",
    "https://*.onrender.com",
    "https://aaron-chess-frontend.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ 数据模型 ============

class MoveRequest(BaseModel):
    fen: str
    move: str
    game_id: Optional[str] = None

class AnalysisRequest(BaseModel):
    fen: str
    depth: int = 15

class SaveGameRequest(BaseModel):
    fen: str
    moves: List[str]
    result: Optional[str] = None
    game_type: str = "ai"
    white_username: str = "Player"
    black_username: str = "AI"

class GameResponse(BaseModel):
    id: str
    fen: str
    moves: List[str]
    result: Optional[str]
    game_type: str
    created_at: datetime

# ============ 健康检查 ============

@app.get("/")
async def root():
    return {"message": "Aaron Chess API", "status": "healthy"}

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    db_status = check_db_connection()
    return {
        "status": "healthy" if db_status else "degraded",
        "service": "chess-api",
        "database": "connected" if db_status else "disconnected"
    }

# ============ 游戏相关 API ============

@app.post("/api/games", response_model=GameResponse)
async def save_game(request: SaveGameRequest, db: Session = Depends(get_db)):
    """保存游戏记录"""
    game_id = str(uuid.uuid4())

    db_game = models.ChessGame(
        id=game_id,
        fen=request.fen,
        moves=request.moves,
        result=request.result,
        game_type=request.game_type,
        white_username=request.white_username,
        black_username=request.black_username,
    )

    try:
        db.add(db_game)
        db.commit()
        db.refresh(db_game)
        return db_game
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save game: {str(e)}")

@app.get("/api/games", response_model=List[GameResponse])
async def get_games(
    skip: int = 0,
    limit: int = 20,
    game_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取游戏历史"""
    query = db.query(models.ChessGame)

    if game_type:
        query = query.filter(models.ChessGame.game_type == game_type)

    games = query.order_by(models.ChessGame.created_at.desc()).offset(skip).limit(limit).all()
    return games

@app.get("/api/games/{game_id}", response_model=GameResponse)
async def get_game(game_id: str, db: Session = Depends(get_db)):
    """获取单个游戏记录"""
    game = db.query(models.ChessGame).filter(models.ChessGame.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@app.put("/api/games/{game_id}")
async def update_game(
    game_id: str,
    request: SaveGameRequest,
    db: Session = Depends(get_db)
):
    """更新游戏记录"""
    game = db.query(models.ChessGame).filter(models.ChessGame.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    game.fen = request.fen
    game.moves = request.moves
    game.result = request.result

    try:
        db.commit()
        db.refresh(game)
        return {"message": "Game updated", "game_id": game_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update game: {str(e)}")

# ============ 用户相关 API（基础） ============

@app.get("/api/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """获取用户信息"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ============ 分析相关 API（占位） ============

@app.post("/api/analyze")
async def analyze_position(request: AnalysisRequest):
    """分析棋局位置（占位实现）"""
    # TODO: 集成 Stockfish 进行实际分析
    return {
        "fen": request.fen,
        "depth": request.depth,
        "best_move": "e2e4",
        "evaluation": 0.5,
        "pv": ["e2e4", "e7e5", "g1f3"],
        "message": "Analysis endpoint - Stockfish integration pending"
    }

# ============ 初始化数据库表 ============

@app.on_event("startup")
async def startup_event():
    """应用启动时创建数据库表"""
    try:
        from .database import create_tables
        create_tables()
        print("✅ Database tables created/verified")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
