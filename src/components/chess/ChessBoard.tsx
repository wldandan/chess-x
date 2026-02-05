import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import ChessClock from './ChessClock'
import MoveList from './MoveList'
import EvaluationBar from './EvaluationBar'
import GameControls from './GameControls'
import '../../styles/chess.css'

interface ChessBoardProps {
  initialFen?: string
  timeControl?: string
  orientation?: 'white' | 'black'
  showCoordinates?: boolean
  highlightLastMove?: boolean
  showLegalMoves?: boolean
  enableAnimation?: boolean
  onMove?: (move: string, game: Chess) => void
  onGameEnd?: (result: string, game: Chess) => void
  onNotification?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  initialFen = 'start',
  timeControl = '10+5',
  orientation = 'white',
  showCoordinates = true,
  // highlightLastMove = true,
  // showLegalMoves = true,
  enableAnimation = true,
  onMove,
  onGameEnd,
  onNotification
}) => {
  const [game, setGame] = useState<Chess>(new Chess(initialFen))
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>(orientation)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [evaluation, setEvaluation] = useState<number>(0)
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'draw' | 'timeout'>('playing')
  const [winner, setWinner] = useState<'white' | 'black' | null>(null)

  // 通知处理器（默认使用 console.log，可被 onNotification 覆盖）
  const notify = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (onNotification) {
      onNotification(message, type)
    } else {
      // 默认使用 console，可以后续替换为更好的通知系统
      console.log(`[${type.toUpperCase()}] ${message}`)
    }
  }, [onNotification])

  // 初始化游戏
  useEffect(() => {
    const newGame = new Chess(initialFen)
    setGame(newGame)
    setMoveHistory([])
    setCurrentMoveIndex(-1)
    setGameStatus('playing')
    setWinner(null)
    setEvaluation(0)
  }, [initialFen])

  // 检查游戏状态
  const checkGameStatus = useCallback((gameInstance: Chess) => {
    if (gameInstance.isCheckmate()) {
      setGameStatus('checkmate')
      setWinner(gameInstance.turn() === 'w' ? 'black' : 'white')
      onGameEnd?.('checkmate', gameInstance)
      return true
    }
    if (gameInstance.isStalemate()) {
      setGameStatus('stalemate')
      onGameEnd?.('stalemate', gameInstance)
      return true
    }
    if (gameInstance.isDraw()) {
      setGameStatus('draw')
      onGameEnd?.('draw', gameInstance)
      return true
    }
    if (gameInstance.isThreefoldRepetition()) {
      setGameStatus('draw')
      onGameEnd?.('threefold', gameInstance)
      return true
    }
    if (gameInstance.isInsufficientMaterial()) {
      setGameStatus('draw')
      onGameEnd?.('insufficient', gameInstance)
      return true
    }
    return false
  }, [onGameEnd])

  // 处理走子
  const handleMove = useCallback((sourceSquare: string, targetSquare: string) => {
    // 如果游戏已结束，不允许走子
    if (gameStatus !== 'playing') return false

    try {
      const moveResult = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // 默认升变为后
      })

      if (moveResult) {
        const newGame = new Chess(game.fen())
        setGame(newGame)

        // 更新走子历史
        const newMoveHistory = [...moveHistory, moveResult.san]
        setMoveHistory(newMoveHistory)
        setCurrentMoveIndex(newMoveHistory.length - 1)

        // 触发回调
        onMove?.(moveResult.san, newGame)

        // 检查游戏状态
        checkGameStatus(newGame)

        return true
      }
    } catch (error) {
      console.error('Invalid move:', error)
    }

    return false
  }, [game, gameStatus, moveHistory, onMove, checkGameStatus])

  // 悔棋
  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0 || currentMoveIndex < 0) return

    try {
      const newGame = new Chess()
      const movesToKeep = moveHistory.slice(0, currentMoveIndex)

      movesToKeep.forEach(move => {
        newGame.move(move)
      })

      setGame(newGame)
      setCurrentMoveIndex(currentMoveIndex - 1)
    } catch (error) {
      console.error('Undo failed:', error)
    }
  }, [moveHistory, currentMoveIndex])

  // 跳转到指定步数
  const handleGoToMove = useCallback((index: number) => {
    if (index < -1 || index >= moveHistory.length) return

    try {
      const newGame = new Chess()
      const movesToApply = moveHistory.slice(0, index + 1)

      movesToApply.forEach(move => {
        newGame.move(move)
      })

      setGame(newGame)
      setCurrentMoveIndex(index)
    } catch (error) {
      console.error('Go to move failed:', error)
    }
  }, [moveHistory])

  // 重置棋局
  const handleReset = useCallback(() => {
    const newGame = new Chess(initialFen)
    setGame(newGame)
    setMoveHistory([])
    setCurrentMoveIndex(-1)
    setGameStatus('playing')
    setWinner(null)
    setEvaluation(0)
  }, [initialFen])

  // 切换棋盘方向
  const handleFlipBoard = useCallback(() => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')
  }, [])

  // 切换分析模式
  const handleToggleAnalysis = useCallback(() => {
    setIsAnalyzing(prev => !prev)
  }, [])

  // 获取当前局面FEN
  const getCurrentFen = useCallback(() => {
    return game.fen()
  }, [game])

  // 获取当前局面PGN
  const getCurrentPgn = useCallback(() => {
    return game.pgn()
  }, [game])

  // 导出棋局
  const handleExportGame = useCallback(() => {
    const pgn = getCurrentPgn()
    const blob = new Blob([pgn], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chess-game-${new Date().toISOString().split('T')[0]}.pgn`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [getCurrentPgn])

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 如果焦点在输入框中，不触发快捷键
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      // 忽略组合键
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'z':
          if (moveHistory.length > 0 && currentMoveIndex >= 0 && gameStatus === 'playing') {
            handleUndo()
          }
          break
        case 'f':
          handleFlipBoard()
          break
        case 'a':
          handleToggleAnalysis()
          break
        case 'arrowleft':
          e.preventDefault()
          if (currentMoveIndex > -1) {
            handleGoToMove(currentMoveIndex - 1)
          }
          break
        case 'arrowright':
          e.preventDefault()
          if (currentMoveIndex < moveHistory.length - 1) {
            handleGoToMove(currentMoveIndex + 1)
          }
          break
        case 'home':
          e.preventDefault()
          handleGoToMove(-1)
          break
        case 'end':
          e.preventDefault()
          handleGoToMove(moveHistory.length - 1)
          break
        case 'r':
          if (gameStatus !== 'playing') {
            handleReset()
          }
          break
        case 's':
          handleExportGame()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    moveHistory,
    currentMoveIndex,
    gameStatus,
    handleUndo,
    handleFlipBoard,
    handleToggleAnalysis,
    handleGoToMove,
    handleReset,
    handleExportGame
  ])

  return (
    <div className="chess-board-container">
      <div className="chess-game-header">
        <div className="player-info player-black">
          <div className="player-name">黑方</div>
          <div className="player-rating">ELO 2400</div>
        </div>

        <div className="game-status">
          {gameStatus === 'playing' && (
            <div className="status-playing">
              轮到 {game.turn() === 'w' ? '白方' : '黑方'} 走子
              {game.isCheck() && ' - 将军！'}
            </div>
          )}
          {gameStatus === 'checkmate' && (
            <div className="status-checkmate">
              {winner === 'white' ? '白方' : '黑方'} 将杀获胜！
            </div>
          )}
          {gameStatus === 'stalemate' && (
            <div className="status-stalemate">逼和</div>
          )}
          {gameStatus === 'draw' && (
            <div className="status-draw">和棋</div>
          )}
          {gameStatus === 'timeout' && (
            <div className="status-timeout">超时判负</div>
          )}
        </div>

        <div className="player-info player-white">
          <div className="player-name">白方</div>
          <div className="player-rating">ELO 1650</div>
        </div>
      </div>

      <div className="chess-main-area">
        <div className="chess-left-panel">
          <ChessClock
            timeControl={timeControl}
            activeColor={game.turn()}
            gameStatus={gameStatus}
            onTimeout={() => {
              setGameStatus('timeout')
              setWinner(game.turn() === 'w' ? 'black' : 'white')
              onGameEnd?.('timeout', game)
            }}
          />

          <EvaluationBar
            evaluation={evaluation}
            isAnalyzing={isAnalyzing}
          />
        </div>

        <div className="chess-center-panel">
          <div className="chess-board-wrapper">
            <Chessboard
              id="basic-chessboard"
              position={game.fen()}
              onPieceDrop={handleMove}
              boardOrientation={boardOrientation}
              boardWidth={560}
              customBoardStyle={{
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              customDarkSquareStyle={{ backgroundColor: '#b58863' }}
              customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
              customPieces={{}}
              arePiecesDraggable={gameStatus === 'playing'}
              animationDuration={enableAnimation ? 300 : 0}
              showBoardNotation={showCoordinates}
              snapToCursor={true}
            />
          </div>

          <GameControls
            onUndo={handleUndo}
            onReset={handleReset}
            onFlipBoard={handleFlipBoard}
            onToggleAnalysis={handleToggleAnalysis}
            onExportGame={handleExportGame}
            canUndo={moveHistory.length > 0 && currentMoveIndex >= 0}
            isAnalyzing={isAnalyzing}
            gameStatus={gameStatus}
            onNotification={notify}
          />
        </div>

        <div className="chess-right-panel">
          <MoveList
            moves={moveHistory}
            currentMoveIndex={currentMoveIndex}
            onMoveClick={handleGoToMove}
            game={game}
          />

          <div className="game-info">
            <div className="info-section">
              <h4>局面信息</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">FEN:</span>
                  <span className="info-value truncated">{getCurrentFen()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">步数:</span>
                  <span className="info-value">{moveHistory.length}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">轮到:</span>
                  <span className="info-value">{game.turn() === 'w' ? '白方' : '黑方'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">将军:</span>
                  <span className="info-value">{game.isCheck() ? '是' : '否'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <div className="analysis-panel">
          <h4>局面分析</h4>
          <div className="analysis-content">
            <p>分析功能开发中...</p>
            <p>将提供：</p>
            <ul>
              <li>最佳走法推荐</li>
              <li>局面评估分数</li>
              <li>战术机会识别</li>
              <li>战略建议</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChessBoard