from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    elo_rating = Column(Integer, default=1200)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class ChessGame(Base):
    __tablename__ = "chess_games"

    id = Column(String(50), primary_key=True, index=True)
    white_player_id = Column(Integer, index=True, nullable=True)
    black_player_id = Column(Integer, index=True, nullable=True)
    white_username = Column(String(50), nullable=False)
    black_username = Column(String(50), nullable=False)
    fen = Column(Text, default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    pgn = Column(Text, nullable=True)
    moves = Column(JSON, default=[])  # 存储棋步列表
    result = Column(String(10), nullable=True)  # "1-0", "0-1", "1/2-1/2"
    game_type = Column(String(20), default="ai")  # "ai", "human", "training"
    time_control = Column(String(20), nullable=True)  # "5+3", "10+5"
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)

class GameAnalysis(Base):
    __tablename__ = "game_analyses"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(String(50), index=True, nullable=False)
    move_number = Column(Integer, nullable=False)
    fen = Column(Text, nullable=False)
    move_played = Column(String(10), nullable=False)
    best_move = Column(String(10), nullable=True)
    evaluation = Column(Integer, nullable=True)  # 百分制评分
    is_blunder = Column(Boolean, default=False)
    is_mistake = Column(Boolean, default=False)
    alternative_moves = Column(JSON, default=[])  # 替代走法
    created_at = Column(DateTime, default=func.now())

class TrainingSession(Base):
    __tablename__ = "training_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    session_type = Column(String(30), nullable=False)  # "tactics", "endgame", "opening"
    difficulty = Column(String(20), default="beginner")  # beginner, intermediate, advanced
    score = Column(Integer, default=0)
    total_problems = Column(Integer, default=0)
    completed_problems = Column(Integer, default=0)
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)

class OpeningPosition(Base):
    __tablename__ = "opening_positions"

    id = Column(Integer, primary_key=True, index=True)
    eco_code = Column(String(10), index=True)  # 国际象棋开局分类码
    name = Column(String(100), nullable=False)
    variation = Column(String(100), nullable=True)
    fen = Column(Text, nullable=False)
    moves = Column(JSON, default=[])  # 标准走法序列
    popularity = Column(Integer, default=0)  # 流行度指数
    description = Column(Text, nullable=True)