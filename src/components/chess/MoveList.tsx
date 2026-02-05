import React, { useRef, useEffect } from 'react'
import { Chess } from 'chess.js'

interface MoveListProps {
  moves: string[]
  currentMoveIndex: number
  onMoveClick: (index: number) => void
  game: Chess
}

const MoveList: React.FC<MoveListProps> = ({
  moves,
  currentMoveIndex,
  onMoveClick,
  game
}) => {
  const movesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (movesEndRef.current) {
      movesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [moves.length, currentMoveIndex])

  // 将走法分组为对（白方+黑方）
  const groupedMoves = React.useMemo(() => {
    const groups = []
    for (let i = 0; i < moves.length; i += 2) {
      groups.push({
        moveNumber: Math.floor(i / 2) + 1,
        whiteMove: moves[i],
        blackMove: moves[i + 1]
      })
    }
    return groups
  }, [moves])

  // 获取走法评估（模拟）
  const getMoveEvaluation = React.useCallback((moveIndex: number) => {
    // 这里可以集成AI评估
    // 暂时返回随机评估值用于演示
    const evaluations = ['+0.5', '+1.2', '-0.3', '+0.8', '-1.5', '+0.2']
    return evaluations[moveIndex % evaluations.length]
  }, [])

  // 判断走法质量
  const getMoveQuality = React.useCallback((evaluation: string) => {
    const score = parseFloat(evaluation)
    if (score > 1.0) return 'excellent'
    if (score > 0.5) return 'good'
    if (score > -0.5) return 'neutral'
    if (score > -1.0) return 'mistake'
    return 'blunder'
  }, [])

  // 获取走法注释
  const getMoveComment = React.useCallback((move: string, moveNumber: number, color: 'white' | 'black') => {
    // 这里可以根据走法生成注释
    // 暂时返回示例注释
    const comments = [
      '好棋，控制中心',
      '标准应着',
      '错过战术机会',
      '有力攻击',
      '防御稳固',
      '局面性错误'
    ]
    return comments[(moveNumber * 2 + (color === 'white' ? 0 : 1)) % comments.length]
  }, [])

  // 跳转到开始
  const handleGoToStart = () => {
    onMoveClick(-1)
  }

  // 跳转到结束
  const handleGoToEnd = () => {
    onMoveClick(moves.length - 1)
  }

  // 上一步
  const handlePrevMove = () => {
    if (currentMoveIndex > -1) {
      onMoveClick(currentMoveIndex - 1)
    }
  }

  // 下一步
  const handleNextMove = () => {
    if (currentMoveIndex < moves.length - 1) {
      onMoveClick(currentMoveIndex + 1)
    }
  }

  // 导出PGN
  const handleExportPGN = () => {
    const pgn = game.pgn()
    const blob = new Blob([pgn], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chess-game-${new Date().toISOString().split('T')[0]}.pgn`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 复制FEN
  const handleCopyFEN = () => {
    const fen = game.fen()
    navigator.clipboard.writeText(fen)
      .then(() => alert('FEN已复制到剪贴板'))
      .catch(err => console.error('复制失败:', err))
  }

  return (
    <div className="move-list">
      <div className="move-list-header">
        <h4>走法记录</h4>
        <div className="move-list-controls">
          <button
            className="btn btn-sm btn-outline"
            onClick={handleGoToStart}
            disabled={currentMoveIndex === -1}
            title="跳转到开始"
          >
            ⏮️
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={handlePrevMove}
            disabled={currentMoveIndex === -1}
            title="上一步"
          >
            ◀️
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={handleNextMove}
            disabled={currentMoveIndex === moves.length - 1}
            title="下一步"
          >
            ▶️
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={handleGoToEnd}
            disabled={currentMoveIndex === moves.length - 1}
            title="跳转到结束"
          >
            ⏭️
          </button>
        </div>
      </div>

      <div className="move-list-content">
        {groupedMoves.length === 0 ? (
          <div className="empty-moves">
            <p>暂无走法记录</p>
            <p>开始对弈后，走法将显示在这里</p>
          </div>
        ) : (
          <div className="moves-table">
            <div className="moves-header">
              <div className="move-number">#</div>
              <div>白方</div>
              <div>黑方</div>
              <div>评估</div>
            </div>

            <div className="moves-body">
              {groupedMoves.map((group, groupIndex) => {
                const whiteMoveIndex = groupIndex * 2
                const blackMoveIndex = whiteMoveIndex + 1
                const whiteMoveActive = currentMoveIndex === whiteMoveIndex
                const blackMoveActive = currentMoveIndex === blackMoveIndex

                return (
                  <div key={group.moveNumber} className="move-row">
                    <div className="move-number">{group.moveNumber}.</div>

                    <div className="move-cell">
                      <button
                        className={`move-button ${whiteMoveActive ? 'active' : ''}`}
                        onClick={() => onMoveClick(whiteMoveIndex)}
                        disabled={whiteMoveIndex >= moves.length}
                      >
                        <span className="move-text">{group.whiteMove || '...'}</span>
                        {group.whiteMove && (
                          <span className="move-eval-small">
                            {getMoveEvaluation(whiteMoveIndex)}
                          </span>
                        )}
                      </button>
                      {group.whiteMove && (
                        <div className="move-comment">
                          {getMoveComment(group.whiteMove, group.moveNumber, 'white')}
                        </div>
                      )}
                    </div>

                    <div className="move-cell">
                      {group.blackMove && (
                        <>
                          <button
                            className={`move-button ${blackMoveActive ? 'active' : ''}`}
                            onClick={() => onMoveClick(blackMoveIndex)}
                          >
                            <span className="move-text">{group.blackMove}</span>
                            <span className="move-eval-small">
                              {getMoveEvaluation(blackMoveIndex)}
                            </span>
                          </button>
                          <div className="move-comment">
                            {getMoveComment(group.blackMove, group.moveNumber, 'black')}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="move-eval">
                      {group.blackMove ? (
                        <span className={`eval-badge eval-${getMoveQuality(getMoveEvaluation(blackMoveIndex))}`}>
                          {getMoveEvaluation(blackMoveIndex)}
                        </span>
                      ) : group.whiteMove ? (
                        <span className={`eval-badge eval-${getMoveQuality(getMoveEvaluation(whiteMoveIndex))}`}>
                          {getMoveEvaluation(whiteMoveIndex)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
              <div ref={movesEndRef} />
            </div>
          </div>
        )}
      </div>

      <div className="move-list-footer">
        <div className="move-stats">
          <div className="stat-item">
            <span className="stat-label">总步数:</span>
            <span className="stat-value">{moves.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">当前步:</span>
            <span className="stat-value">{currentMoveIndex + 1}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">局面:</span>
            <span className="stat-value">
              {game.isCheck() ? '将军' : game.isCheckmate() ? '将杀' : '正常'}
            </span>
          </div>
        </div>

        <div className="move-actions">
          <button
            className="btn btn-sm btn-outline"
            onClick={handleCopyFEN}
            title="复制FEN"
          >
            复制FEN
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={handleExportPGN}
            title="导出PGN"
          >
            导出PGN
          </button>
        </div>
      </div>

      <div className="move-legend">
        <div className="legend-title">评估说明:</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color excellent"></span>
            <span className="legend-text">优秀 (+1.0以上)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color good"></span>
            <span className="legend-text">良好 (+0.5到+1.0)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color neutral"></span>
            <span className="legend-text">一般 (-0.5到+0.5)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color mistake"></span>
            <span className="legend-text">失误 (-1.0到-0.5)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color blunder"></span>
            <span className="legend-text">严重错误 (-1.0以下)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoveList