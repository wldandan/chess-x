from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 从环境变量获取数据库URL，Render会自动提供DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

# 如果DATABASE_URL以postgres://开头，需要改为postgresql://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 本地开发使用的SQLite（可选）
LOCAL_DB_PATH = "sqlite:///./chess.db"

# 根据环境选择数据库URL
if DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
else:
    SQLALCHEMY_DATABASE_URL = LOCAL_DB_PATH

# 创建数据库引擎
# SQLite 不支持 pool 参数，需要条件配置
if DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
    )
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}  # SQLite 需要
    )

# 创建SessionLocal类
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建Base类
Base = declarative_base()

# 依赖项：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 创建数据库表（仅在需要时调用）
def create_tables():
    from . import models
    Base.metadata.create_all(bind=engine)

# 健康检查：测试数据库连接
def check_db_connection():
    try:
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as e:
        print(f"Database connection error: {e}")
        return False
