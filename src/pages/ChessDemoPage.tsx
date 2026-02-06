import React, { useState, useEffect } from 'react'
import { Chess } from 'chess.js'
import '../styles/pages.css'

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
          // 简单 AI：随机走棋
          const randomMove = moves[Math.floor(Math.random() * moves.length)]
          const newGame = new Chess(game.fen())
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
        setPossibleMoves([])
        setHintMove(null)  // 清除文字提示，让用户可以重新获取该棋子的提示
        setHintSquares(null)  // 清除棋盘提示
        setHintClickCount(0)  // 重置计数
        return
      }

      // 尝试走棋
      const newGame = new Chess(game.fen())
      const move = newGame.move({ from: selectedSquare, to: square, promotion: 'q' })

      if (move) {
        setGame(newGame)
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
      // 没有选中棋子时，选择己方棋子（不显示可行走位置）
      if (clickedPiece && clickedPiece.color === game.turn()) {
        setSelectedSquare(square)
        setPossibleMoves([])
        setHintMove(null)  // 清除提示，让用户可以从棋子提示开始
        setHintSquares(null)
        setHintClickCount(0)  // 重置计数
      }
    }
  }

  const handleNewGame = () => {
    setGame(new Chess())
    setSelectedSquare(null)
    setPossibleMoves([])
    setHintMove(null)  // 清除提示
    setHintSquares(null)  // 清除棋盘提示
    setHintClickCount(0)  // 重置计数
  }

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
    <div className="chess-demo-page">
      <div className="page-header">
        <h2 className="page-title">♟️ 国际象棋对弈</h2>
        <p className="page-subtitle">点击棋子选择，再点击目标位置移动</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontWeight: 'bold',
              padding: '8px 16px',
              borderRadius: '6px',
              background: game.turn() === 'w' ? '#fff' : '#2c3e50',
              color: game.turn() === 'w' ? '#2c3e50' : '#fff',
              border: `2px solid ${game.turn() === 'w' ? '#27ae60' : '#e74c3c'}`,
              fontSize: '16px'
            }}>
              {game.turn() === 'w' ? '♔ 白方走棋' : aiMode ? '♚ AI 走棋中...' : '♚ 黑方走棋'}
            </span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {hintMove && hintClickCount > 0 && (
                <span style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: '14px' }}>
                  💡 [{hintClickCount}] 推荐: {hintMove}
                </span>
              )}
              {aiThinking && (
                <span style={{ color: '#3498db', fontSize: '14px' }}>🤔 思考中...</span>
              )}
              {game.isCheckmate() && (
                <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>将死！</span>
              )}
              {game.isCheck() && (
                <span style={{ color: '#e67e22', fontWeight: 'bold' }}>将军！</span>
              )}
              <button
                onClick={handleNewGame}
                style={{ padding: '6px 12px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                新对局
              </button>
              <button
                onClick={handleHint}
                disabled={game.isGameOver()}
                style={{ padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: game.isGameOver() ? 'not-allowed' : 'pointer', fontSize: '12px', opacity: game.isGameOver() ? 0.5 : 1 }}
              >
                💡 提示
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 50px)', gridTemplateRows: 'repeat(8, 50px)', border: '2px solid #2c3e50' }}>
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
                    style={{
                      backgroundColor: squareColor === 'light' ? '#f0d9b5' : '#b58863',
                      border: isHintFrom ? '3px solid #9b59b6' : isHintTo ? '3px solid #9b59b6' : isSelected ? '3px solid #3498db' : isPossibleMove ? '3px solid #27ae60' : '1px solid #2c3e50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative',
                    }}
                  >
                    {piece && (
                      <span style={{
                        color: piece.color === 'w' ? '#fff' : '#000',
                        textShadow: piece.color === 'w' ? '0 0 2px #000' : '0 0 2px #fff',
                        fontWeight: 'bold',
                      }}>
                        {PIECE_SYMBOLS[getPieceSymbol(piece)]}
                      </span>
                    )}
                    {isPossibleMove && !piece && (
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: 'rgba(39, 174, 96, 0.6)',
                      }} />
                    )}
                    {isHintTo && !piece && (
                      <div style={{
                        position: 'absolute',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'rgba(155, 89, 182, 0.7)',
                        border: '2px solid #8e44ad',
                      }} />
                    )}
                  </div>
                )
              })
            )}
          </div>

          <div style={{ marginTop: '10px', fontSize: '14px', color: '#7f8c8d', textAlign: 'center' }}>
            {game.history().map((move, i) => `${Math.floor(i / 2) + 1}. ${move}`).join('  ') || '暂无走法'}
          </div>
        </div>

        <div style={{ minWidth: '250px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3>游戏设置</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>游戏模式</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setAiMode(false); handleNewGame() }}
                  style={{ flex: 1, padding: '8px', border: aiMode ? '1px solid #ddd' : '2px solid #3498db', background: aiMode ? 'white' : '#3498db', color: aiMode ? '#2c3e50' : 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                >
                  两人
                </button>
                <button
                  onClick={() => { setAiMode(true); handleNewGame() }}
                  style={{ flex: 1, padding: '8px', border: aiMode ? '2px solid #3498db' : '1px solid #ddd', background: aiMode ? '#3498db' : 'white', color: aiMode ? 'white' : '#2c3e50', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                >
                  vs AI
                </button>
              </div>
            </div>
            <h3>游戏信息</h3>
            <p>走法数: {game.history().length}</p>
            <p>FEN: {game.fen()}</p>
            <p>状态: {game.isCheckmate() ? '将死' : game.isDraw() ? '和棋' : '进行中'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChessDemoPage
