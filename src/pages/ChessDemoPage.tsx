import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Chess } from 'chess.js'
import '../styles/theme.css'
import '../styles/pages.css'
import { chessAPI } from '../services/api'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const

type Square = `${typeof FILES[number]}${typeof RANKS[number]}`

const PIECE_SYMBOLS: Record<string, string> = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
}

// 棋子价值评估
const PIECE_VALUES: Record<string, number> = {
  'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
}

// 位置加分表（简化版）
const POSITION_BONUS: Record<string, number[]> = {
  'p': [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 40, 50, 60, 70, 5, 10, 30, 40, 50, 60, 70, 80, 0, 0, 0, 20, 30, 40, 60, 80, 5, -5, -10, 0, 20, 40, 70, 90, 5, 10, 10, -20, -20, 20, 70, 90, 0, 0, 0, 0, 0, 0, 0, 0],
  'n': [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 10, 5, 0, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
}

// 评估局面分数（正数对白方有利）
function evaluatePosition(fen: string): number {
  const tempGame = new Chess(fen)
  let score = 0

  // 遍历所有格子
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const square = `${FILES[file]}${RANKS[rank]}` as Square
      const piece = tempGame.get(square)
      if (piece) {
        const pieceType = piece.type
        const value = PIECE_VALUES[pieceType] || 0

        // 位置加分
        let positionBonus = 0
        if (pieceType === 'p' && POSITION_BONUS.p) {
          const idx = piece.color === 'w' ? rank * 8 + file : (7 - rank) * 8 + file
          positionBonus = POSITION_BONUS.p[idx] || 0
        } else if (pieceType === 'n' && POSITION_BONUS.n) {
          const idx = rank * 8 + file
          positionBonus = POSITION_BONUS.n[idx] || 0
        }

        if (piece.color === 'w') {
          score += value + positionBonus
        } else {
          score -= value + positionBonus
        }
      }
    }
  }

  // 额外评估
  if (tempGame.isCheckmate()) {
    score = tempGame.turn() === 'w' ? -100000 : 100000
  } else if (tempGame.isCheck()) {
    score += tempGame.turn() === 'w' ? -50 : 50
  }

  return score
}

const ChessDemoPage: React.FC = () => {
  const [game, setGame] = useState(new Chess())
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([])
  const [aiMode, setAiMode] = useState(true)  // 默认开启 AI
  const [aiThinking, setAiThinking] = useState(false)
  const [hintMove, setHintMove] = useState<string | null>(null)  // 存储推荐走法
  const [hintSquares, setHintSquares] = useState<{ from: Square; to: Square } | null>(null)  // 存储推荐的起始和目标位置
  const [hintClickCount, setHintClickCount] = useState(0)  // 提示点击次数

  // API 相关状态
  const [currentGameId, setCurrentGameId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [backendConnected, setBackendConnected] = useState(false)

  function getPieceSymbol(piece: { type: string; color: string } | null): string {
    if (!piece) return ''
    const type = piece.type.toUpperCase()
    const symbols: Record<string, string> = {
      'K': 'K', 'Q': 'Q', 'R': 'R', 'B': 'B', 'N': 'N', 'P': 'P',
    }
    const symbol = symbols[type] || ''
    return piece.color === 'w' ? symbol : symbol.toLowerCase()
  }

  function getSquareColor(file: string, rank: string): 'light' | 'dark' {
    const fileIndex = FILES.indexOf(file)
    const rankIndex = RANKS.indexOf(rank)
    return (fileIndex + rankIndex) % 2 === 0 ? 'light' : 'dark'
  }

  // AI 走棋逻辑
  useEffect(() => {
    if (!aiMode || aiThinking) return

    // 如果是黑方走棋，AI 自动走
    if (game.turn() === 'b' && !game.isGameOver()) {
      setAiThinking(true)
      setTimeout(() => {
        const moves = game.moves({ verbose: true })
        if (moves.length > 0) {
          // 使用 PGN 保留历史记录
          const pgn = game.pgn()
          const newGame = new Chess()
          newGame.loadPgn(pgn)
          // 简单 AI：随机走棋
          const randomMove = moves[Math.floor(Math.random() * moves.length)]
          newGame.move(randomMove.san)
          setGame(newGame)
          setHintMove(null)  // 清除提示
          setHintSquares(null)  // 清除棋盘提示
          setHintClickCount(0)  // 重置计数
        }
        setAiThinking(false)
      }, 500)
    }
  }, [game.fen(), aiMode, aiThinking])

  const handleSquareClick = (square: Square) => {
    // 只在 AI 模式下，黑方走棋时才禁止玩家操作
    if (aiMode && game.turn() === 'b') {
      console.log('AI 正在思考，请等待...')
      return
    }

    // 获取点击位置的棋子
    const clickedPiece = game.get(square)

    if (selectedSquare) {
      // 点击同一个格子，取消选择
      if (selectedSquare === square) {
        setSelectedSquare(null)
        setPossibleMoves([])
        setHintSquares(null)  // 清除提示
        setHintClickCount(0)  // 重置计数
        return
      }

      // 点击另一个己方棋子，切换选择
      if (clickedPiece && clickedPiece.color === game.turn()) {
        setSelectedSquare(square)
        // 计算新选中棋子的合法走法
        const moves = game.moves({ square: square, verbose: true })
        const possibleSquares = moves.map(move => move.to as Square)
        setPossibleMoves(possibleSquares)
        setHintMove(null)  // 清除文字提示，让用户可以重新获取该棋子的提示
        setHintSquares(null)  // 清除棋盘提示
        setHintClickCount(0)  // 重置计数
        return
      }

      // 尝试走棋
      const pgn = game.pgn()
      const tempGame = new Chess()
      tempGame.loadPgn(pgn)
      const move = tempGame.move({ from: selectedSquare, to: square, promotion: 'q' })

      if (move) {
        console.log('走棋成功，历史长度:', tempGame.history().length, '历史:', tempGame.history())
        setGame(tempGame)
        setSelectedSquare(null)
        setPossibleMoves([])
        setHintMove(null)
        setHintSquares(null)
        setHintClickCount(0)  // 重置计数
      } else {
        // 无效走棋，取消选择
        setSelectedSquare(null)
        setPossibleMoves([])
        setHintSquares(null)
        setHintClickCount(0)  // 重置计数
      }
    } else {
      // 没有选中棋子时，选择己方棋子并显示可行走位置
      if (clickedPiece && clickedPiece.color === game.turn()) {
        setSelectedSquare(square)
        // 计算选中棋子的合法走法
        const moves = game.moves({ square: square, verbose: true })
        const possibleSquares = moves.map(move => move.to as Square)
        setPossibleMoves(possibleSquares)
        setHintMove(null)  // 清除提示，让用户可以从棋子提示开始
        setHintSquares(null)
        setHintClickCount(0)  // 重置计数
      }
    }
  }

  const handleNewGame = () => {
    // 如果游戏已经开始，显示确认提示
    if (game.history().length > 0) {
      const confirmed = window.confirm('是否要放弃当前对局，重新开始？')
      if (!confirmed) {
        return
      }
    }

    setGame(new Chess())
    setSelectedSquare(null)
    setPossibleMoves([])
    setHintMove(null)  // 清除提示
    setHintSquares(null)  // 清除棋盘提示
    setHintClickCount(0)  // 重置计数
    setCurrentGameId(null)  // 清除当前游戏 ID
    setSaveStatus('idle')
  }

  // 保存游戏到后端
  const saveGameToBackend = async () => {
    if (game.history().length === 0) return

    setSaveStatus('saving')
    try {
      const result = game.isCheckmate() ? (game.turn() === 'w' ? '0-1' : '1-0') : null
      const data = {
        fen: game.fen(),
        moves: game.history(),
        result: result || undefined,
        game_type: aiMode ? 'ai' : 'human',
        white_username: 'Player',
        black_username: aiMode ? 'AI' : 'Player2',
      }

      if (currentGameId) {
        // 更新现有游戏
        await chessAPI.updateGame(currentGameId, data)
      } else {
        // 创建新游戏
        const saved = await chessAPI.saveGame(data)
        setCurrentGameId(saved.id)
      }
      setSaveStatus('saved')
    } catch (error) {
      console.error('Failed to save game:', error)
      setSaveStatus('error')
    }
  }

  // 检查后端连接状态
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const health = await chessAPI.getHealth()
        setBackendConnected(health.database === 'connected')
      } catch {
        setBackendConnected(false)
      }
    }
    checkBackend()
  }, [])

  // 监听游戏结束，自动保存
  useEffect(() => {
    if (game.isGameOver() && saveStatus !== 'saved') {
      saveGameToBackend()
    }
  }, [game.fen(), game.isGameOver()])

  // 提示功能：AI 推荐最佳走法（不自动执行）
  const handleHint = () => {
    if (game.isGameOver()) return

    // 增加点击次数
    const newCount = hintClickCount + 1
    setHintClickCount(newCount)

    // 判断是否已经显示过选中棋子的提示
    const showFullBoardHint = hintSquares && selectedSquare && hintSquares.from === selectedSquare

    // 根据状态决定评估范围
    const moves = showFullBoardHint
      ? game.moves({ verbose: true })  // 整盘棋
      : selectedSquare
      ? game.moves({ square: selectedSquare, verbose: true })  // 只评估选中棋子
      : game.moves({ verbose: true })  // 没选中棋子时，评估整盘棋

    if (moves.length === 0) return

    let bestMove = moves[0]
    let bestScore = game.turn() === 'w' ? -Infinity : Infinity

    // 评估每种走法
    for (const move of moves) {
      const tempGame = new Chess(game.fen())
      tempGame.move(move.san)
      const score = evaluatePosition(tempGame.fen())

      if (game.turn() === 'w') {
        if (score > bestScore) {
          bestScore = score
          bestMove = move
        }
      } else {
        if (score < bestScore) {
          bestScore = score
          bestMove = move
        }
      }
    }

    // 只显示推荐走法，不执行
    setHintMove(bestMove.san)
    setHintSquares({ from: bestMove.from as Square, to: bestMove.to as Square })
    console.log(`推荐走法: ${bestMove.san}, 评分: ${bestScore}`)
  }

  return (
    <div className="page-wrapper">
      {/* 顶部导航栏 - 与首页保持一致 */}
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="logo">
            <span className="logo-icon">♞</span>
            <span>Aaron Chess</span>
          </Link>
          <div className="nav-links">
            <Link to="/demo" className="nav-link active">对弈</Link>
            <Link to="/training" className="nav-link">训练</Link>
            <Link to="/analysis" className="nav-link">分析</Link>
            <Link to="/training-setup" className="nav-link">设置</Link>
          </div>
        </div>
        <div className="nav-right">
          <button className="nav-btn nav-btn-secondary">登录</button>
          <button className="nav-btn">注册</button>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="main-layout">
        <div className="chess-demo-content">
          <div className="chess-board-container">
            <div className="chess-turn-indicator">
              <span className={`turn-badge ${game.turn() === 'w' ? 'white-turn' : 'black-turn'}`}>
                {game.turn() === 'w' ? '白方走棋' : aiMode ? 'AI 思考中...' : '黑方走棋'}
              </span>
              <div className="chess-controls">
                {hintMove && hintClickCount > 0 && (
                  <span className="hint-message">
                    推荐: {hintMove}
                  </span>
                )}
                {aiThinking && (
                  <span className="thinking-message">思考中...</span>
                )}
                {game.isCheckmate() && (
                  <span className="checkmate-message">将死</span>
                )}
                {game.isCheck() && (
                  <span className="check-message">将军</span>
                )}
                <button
                  onClick={handleNewGame}
                  className="chess-btn chess-btn-new"
                >
                  新游戏
                </button>
                <button
                  onClick={handleHint}
                  disabled={game.isGameOver()}
                  className={`chess-btn chess-btn-hint ${game.isGameOver() ? 'disabled' : ''}`}
                >
                  提示
                </button>
              </div>
            </div>

          <div className="chess-board-grid">
            {RANKS.map((rank) =>
              FILES.map((file) => {
                const square = `${file}${rank}` as Square
                const piece = game.get(square)
                const isSelected = selectedSquare === square
                const isPossibleMove = possibleMoves.includes(square)
                const isHintFrom = hintSquares?.from === square
                const isHintTo = hintSquares?.to === square
                const squareColor = getSquareColor(file, rank)

                return (
                  <div
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    className={`chess-square ${squareColor} ${isSelected ? 'selected' : ''} ${isPossibleMove ? 'possible-move' : ''} ${isHintFrom ? 'hint-from' : ''} ${isHintTo ? 'hint-to' : ''}`}
                  >
                    {piece && (
                      <span className={`chess-piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`}>
                        {PIECE_SYMBOLS[getPieceSymbol(piece)]}
                      </span>
                    )}
                    {isPossibleMove && !piece && (
                      <div className="possible-move-indicator" />
                    )}
                    {isHintTo && !piece && (
                      <div className="hint-move-indicator" />
                    )}
                  </div>
                )
              })
            )}
          </div>
          </div>

          <div className="chess-settings-panel">
            <div className="settings-card">
              <h3>调试信息</h3>
              <div className="settings-section">
                <div className="debug-panel">
                  <div><strong>FEN:</strong> {game.fen()}</div>
                  <div><strong>历史长度:</strong> {game.history().length}</div>
                  <div><strong>历史记录:</strong> {game.history().length > 0 ? game.history().join(', ') : '无'}</div>
                  <div><strong>当前回合:</strong> {game.turn() === 'w' ? '白方' : '黑方'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChessDemoPage
