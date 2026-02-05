import React from 'react'

interface GameControlsProps {
  onUndo: () => void
  onReset: () => void
  onFlipBoard: () => void
  onToggleAnalysis: () => void
  onExportGame: () => void
  canUndo: boolean
  isAnalyzing: boolean
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'timeout'
}

const GameControls: React.FC<GameControlsProps> = ({
  onUndo,
  onReset,
  onFlipBoard,
  onToggleAnalysis,
  onExportGame,
  canUndo,
  isAnalyzing,
  gameStatus
}) => {
  const isGameActive = gameStatus === 'playing'

  return (
    <div className="game-controls">
      <div className="controls-section">
        <h5>对局控制</h5>
        <div className="controls-grid">
          <button
            className="control-btn undo-btn"
            onClick={onUndo}
            disabled={!canUndo || !isGameActive}
            title="悔棋 (Ctrl+Z)"
          >
            <span className="control-icon">↶</span>
            <span className="control-label">悔棋</span>
          </button>

          <button
            className="control-btn reset-btn"
            onClick={onReset}
            title="重置棋局"
          >
            <span className="control-icon">🔄</span>
            <span className="control-label">重置</span>
          </button>

          <button
            className="control-btn flip-btn"
            onClick={onFlipBoard}
            title="翻转棋盘 (F)"
          >
            <span className="control-icon">↕️</span>
            <span className="control-label">翻转</span>
          </button>

          <button
            className={`control-btn analysis-btn ${isAnalyzing ? 'active' : ''}`}
            onClick={onToggleAnalysis}
            title="切换分析模式 (A)"
          >
            <span className="control-icon">🔍</span>
            <span className="control-label">分析</span>
          </button>
        </div>
      </div>

      <div className="controls-section">
        <h5>游戏操作</h5>
        <div className="controls-grid">
          {isGameActive ? (
            <>
              <button
                className="control-btn draw-btn"
                onClick={() => alert('提和功能开发中...')}
                title="提和 (D)"
              >
                <span className="control-icon">🤝</span>
                <span className="control-label">提和</span>
              </button>

              <button
                className="control-btn resign-btn"
                onClick={() => {
                  if (window.confirm('确定要认输吗？')) {
                    alert('认输功能开发中...')
                  }
                }}
                title="认输 (R)"
              >
                <span className="control-icon">🏳️</span>
                <span className="control-label">认输</span>
              </button>
            </>
          ) : (
            <>
              <button
                className="control-btn newgame-btn"
                onClick={onReset}
                title="新对局 (N)"
              >
                <span className="control-icon">🆕</span>
                <span className="control-label">新对局</span>
              </button>

              <button
                className="control-btn review-btn"
                onClick={() => alert('复盘功能开发中...')}
                title="复盘学习"
              >
                <span className="control-icon">📖</span>
                <span className="control-label">复盘</span>
              </button>
            </>
          )}

          <button
            className="control-btn save-btn"
            onClick={onExportGame}
            title="保存对局 (S)"
          >
            <span className="control-icon">💾</span>
            <span className="control-label">保存</span>
          </button>

          <button
            className="control-btn share-btn"
            onClick={() => alert('分享功能开发中...')}
            title="分享对局"
          >
            <span className="control-icon">📤</span>
            <span className="control-label">分享</span>
          </button>
        </div>
      </div>

      <div className="controls-section">
        <h5>游戏状态</h5>
        <div className="status-display">
          <div className={`status-indicator status-${gameStatus}`}>
            {gameStatus === 'playing' && '对局进行中'}
            {gameStatus === 'checkmate' && '将杀结束'}
            {gameStatus === 'stalemate' && '逼和结束'}
            {gameStatus === 'draw' && '和棋结束'}
            {gameStatus === 'timeout' && '超时结束'}
          </div>
          <div className="status-actions">
            {isGameActive ? (
              <span className="status-active">⏱️ 计时器运行中</span>
            ) : (
              <span className="status-ended">✅ 对局已结束</span>
            )}
          </div>
        </div>
      </div>

      <div className="controls-section">
        <h5>快捷键</h5>
        <div className="shortcuts-grid">
          <div className="shortcut-item">
            <kbd>Z</kbd>
            <span>悔棋</span>
          </div>
          <div className="shortcut-item">
            <kbd>F</kbd>
            <span>翻转棋盘</span>
          </div>
          <div className="shortcut-item">
            <kbd>A</kbd>
            <span>分析模式</span>
          </div>
          <div className="shortcut-item">
            <kbd>←/→</kbd>
            <span>浏览走法</span>
          </div>
          <div className="shortcut-item">
            <kbd>Space</kbd>
            <span>播放/暂停</span>
          </div>
          <div className="shortcut-item">
            <kbd>S</kbd>
            <span>保存对局</span>
          </div>
        </div>
      </div>

      <div className="controls-footer">
        <div className="hint-text">
          💡 提示：使用鼠标拖放棋子走子，或点击棋子后点击目标格
        </div>
        <div className="support-links">
          <a href="#" className="support-link">规则说明</a>
          <a href="#" className="support-link">使用帮助</a>
          <a href="#" className="support-link">问题反馈</a>
        </div>
      </div>
    </div>
  )
}

export default GameControls