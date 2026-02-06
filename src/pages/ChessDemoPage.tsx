import React, { useState, useEffect } from 'react'
import ChessBoard from '../components/chess/ChessBoard'
import AIThinkingIndicator from '../components/ai/AIThinkingIndicator'
import { useGameStore, useAIState, useIsPlaying } from '../stores/game.store'
import type { GameConfig, TimeControl } from '../types/game.types'
import type { DifficultyLevel } from '../types/chess.types'
import '../styles/pages.css'

// Parse time control string to TimeControl object
const parseTimeControl = (tc: string): TimeControl => {
  const [base, inc] = tc.split('+').map(Number)
  return {
    baseMinutes: base,
    incrementSeconds: inc || 0,
    type: inc ? 'increment' : 'suddenDeath',
    totalTime: base * 60 * 1000,
  }
}

const ChessDemoPage: React.FC = () => {
  const [timeControl, setTimeControl] = useState('10+5')
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [showCoordinates, setShowCoordinates] = useState(true)
  const [highlightLastMove, setHighlightLastMove] = useState(true)
  const [showLegalMoves, setShowLegalMoves] = useState(true)
  const [enableAnimation, setEnableAnimation] = useState(true)

  // AI mode state
  const [aiMode, setAiMode] = useState(false)
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>('medium')
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')

  // Game store hooks
  const aiState = useAIState()
  const isPlaying = useIsPlaying()
  const { initializeAI, setAIDifficulty, startGame } = useGameStore()

  // Initialize AI engine on mount
  useEffect(() => {
    if (aiMode && !aiState.isReady) {
      initializeAI()
    }
  }, [aiMode, aiState.isReady, initializeAI])

  const timeControls = [
    { value: '1+0', label: '闪电战 1+0' },
    { value: '3+2', label: '快棋 3+2' },
    { value: '5+3', label: '快棋 5+3' },
    { value: '10+5', label: '标准 10+5' },
    { value: '15+10', label: '标准 15+10' },
    { value: '30+0', label: '慢棋 30+0' }
  ]

  const aiDifficulties: { value: DifficultyLevel; label: string; description: string }[] = [
    { value: 'beginner', label: '初学者', description: '适合初学者，AI会犯错' },
    { value: 'easy', label: '简单', description: '基础战术，适合学习' },
    { value: 'medium', label: '中等', description: '平衡难度，有挑战性' },
    { value: 'hard', label: '困难', description: '需要深入思考' },
    { value: 'expert', label: '专家', description: '接近大师水平' },
    { value: 'master', label: '大师', description: '最强AI，极具挑战' },
  ]

  const handleMove = (_move: string, _game?: any) => {
    // Move handled by game store
  }

  const handleGameEnd = (_result: string, _game?: any) => {
    // Game end handled by game store
  }

  const handleStartNewGame = async () => {
    const tc = parseTimeControl(timeControl)

    if (aiMode) {
      // AI vs Human game
      const config: GameConfig = {
        whitePlayer: playerColor === 'white'
          ? { type: 'human', name: '你' }
          : { type: 'ai', name: `AI (${aiDifficulties.find(d => d.value === aiDifficulty)?.label})` },
        blackPlayer: playerColor === 'black'
          ? { type: 'human', name: '你' }
          : { type: 'ai', name: `AI (${aiDifficulties.find(d => d.value === aiDifficulty)?.label})` },
        timeControl: tc,
        variant: 'standard',
        rated: false,
        allowTakeback: true,
        allowDrawOffer: true,
        autoQueen: true,
      }

      await setAIDifficulty(aiDifficulty)
      await startGame(config)
      // Sync orientation with player color
      setOrientation(playerColor)
    } else {
      // Human vs Human game (demo mode)
      const config: GameConfig = {
        whitePlayer: { type: 'human', name: '白方玩家' },
        blackPlayer: { type: 'human', name: '黑方玩家' },
        timeControl: tc,
        variant: 'standard',
        rated: false,
        allowTakeback: true,
        allowDrawOffer: true,
        autoQueen: true,
      }

      await startGame(config)
    }
  }

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    setAiDifficulty(difficulty)
    if (aiState.isReady) {
      setAIDifficulty(difficulty)
    }
  }

  return (
    <div className="chess-demo-page">
      <div className="page-header">
        <h2 className="page-title">专业比赛界面演示</h2>
        <p className="page-subtitle">
          体验类似Chess.com的专业级国际象棋界面，符合国际比赛标准
        </p>
      </div>

      <div className="demo-container">
        <div className="demo-main">
          <ChessBoard
            timeControl={timeControl}
            orientation={orientation}
            showCoordinates={showCoordinates}
            highlightLastMove={highlightLastMove}
            showLegalMoves={showLegalMoves}
            enableAnimation={enableAnimation}
            onMove={handleMove}
            onGameEnd={handleGameEnd}
          />
        </div>

        <div className="demo-controls">
          <div className="control-section">
            <h3 className="section-title">比赛设置</h3>

            {/* Game Mode Toggle */}
            <div className="control-group">
              <label className="control-label">游戏模式</label>
              <div className="mode-toggle">
                <button
                  className={`mode-btn ${!aiMode ? 'active' : ''}`}
                  onClick={() => setAiMode(false)}
                >
                  两人对弈
                </button>
                <button
                  className={`mode-btn ${aiMode ? 'active' : ''}`}
                  onClick={() => setAiMode(true)}
                >
                  AI 对战
                </button>
              </div>
            </div>

            {/* AI Mode Settings */}
            {aiMode && (
              <>
                <div className="control-group">
                  <label className="control-label">AI 难度</label>
                  <div className="difficulty-selector">
                    <select
                      value={aiDifficulty}
                      onChange={(e) => handleDifficultyChange(e.target.value as DifficultyLevel)}
                      className="difficulty-select"
                    >
                      {aiDifficulties.map((diff) => (
                        <option key={diff.value} value={diff.value}>
                          {diff.label} - {diff.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="control-group">
                  <label className="control-label">执棋颜色</label>
                  <div className="color-selector">
                    <button
                      className={`color-btn ${playerColor === 'white' ? 'active' : ''}`}
                      onClick={() => setPlayerColor('white')}
                    >
                      <span className="btn-icon">♔</span>
                      <span className="btn-label">执白先行</span>
                    </button>
                    <button
                      className={`color-btn ${playerColor === 'black' ? 'active' : ''}`}
                      onClick={() => setPlayerColor('black')}
                    >
                      <span className="btn-icon">♚</span>
                      <span className="btn-label">执黑后手</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="control-group">
              <label className="control-label">时间控制</label>
              <div className="time-controls">
                {timeControls.map((tc) => (
                  <button
                    key={tc.value}
                    className={`time-btn ${timeControl === tc.value ? 'active' : ''}`}
                    onClick={() => setTimeControl(tc.value)}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">棋盘方向</label>
              <div className="orientation-controls">
                <button
                  className={`orientation-btn ${orientation === 'white' ? 'active' : ''}`}
                  onClick={() => setOrientation('white')}
                  disabled={isPlaying && aiMode}
                >
                  <span className="btn-icon">⬜</span>
                  <span className="btn-label">白方视角</span>
                </button>
                <button
                  className={`orientation-btn ${orientation === 'black' ? 'active' : ''}`}
                  onClick={() => setOrientation('black')}
                  disabled={isPlaying && aiMode}
                >
                  <span className="btn-icon">⬛</span>
                  <span className="btn-label">黑方视角</span>
                </button>
              </div>
            </div>

            {/* New Game Button */}
            <div className="control-group">
              <button
                className="btn btn-primary btn-large"
                onClick={handleStartNewGame}
                disabled={isPlaying}
              >
                {isPlaying ? '对局进行中...' : aiMode ? '开始 AI 对战' : '开始新对局'}
              </button>
            </div>

            {/* AI Thinking Indicator */}
            {aiMode && aiState.thinking && (
              <div className="ai-indicator-wrapper">
                <AIThinkingIndicator thinking={aiState.thinking} orientation={orientation} />
              </div>
            )}
          </div>

          <div className="control-section">
            <h3 className="section-title">显示选项</h3>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showCoordinates}
                  onChange={(e) => setShowCoordinates(e.target.checked)}
                />
                <span>显示坐标</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={highlightLastMove}
                  onChange={(e) => setHighlightLastMove(e.target.checked)}
                />
                <span>高亮上一步</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showLegalMoves}
                  onChange={(e) => setShowLegalMoves(e.target.checked)}
                />
                <span>显示合法走法</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={enableAnimation}
                  onChange={(e) => setEnableAnimation(e.target.checked)}
                />
                <span>走子动画</span>
              </label>
            </div>
          </div>

          <div className="control-section">
            <h3 className="section-title">功能说明</h3>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div className="feature-content">
                  <h4>专业棋盘</h4>
                  <p>8x8国际标准棋盘，高清矢量棋子，多种棋盘主题</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⏱️</div>
                <div className="feature-content">
                  <h4>比赛计时器</h4>
                  <p>支持标准时间控制（5+3, 10+5等），费舍尔加秒精确计时</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div className="feature-content">
                  <h4>走法记录</h4>
                  <p>PGN标准记谱，可编辑注释，变例分支记录和查看</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔍</div>
                <div className="feature-content">
                  <h4>局面分析</h4>
                  <p>实时评估条，引擎深度分析，最佳走法推荐</p>
                </div>
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3 className="section-title">操作指南</h3>

            <div className="guide-content">
              <h4>基本操作</h4>
              <ul>
                <li><strong>走子</strong>: 拖放棋子到目标格，或点击棋子后点击目标格</li>
                <li><strong>悔棋</strong>: 点击"悔棋"按钮或按Z键</li>
                <li><strong>翻转棋盘</strong>: 点击"翻转"按钮或按F键</li>
                <li><strong>分析模式</strong>: 点击"分析"按钮或按A键</li>
              </ul>

              <h4>快捷键</h4>
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
          </div>
        </div>
      </div>

      <div className="demo-features">
        <h3 className="section-title">专业比赛功能</h3>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h4 className="feature-title">标准记谱系统</h4>
            <p className="feature-description">
              完整PGN导入/导出，代数记谱，走法注释，变例记录
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚖️</div>
            <h4 className="feature-title">比赛规则执行</h4>
            <p className="feature-description">
              50步规则，三次重复，逼和识别，升变处理
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h4 className="feature-title">比赛数据记录</h4>
            <p className="feature-description">
              走法时间，局面评估，决策质量，心理数据
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h4 className="feature-title">比赛报告生成</h4>
            <p className="feature-description">
              技术统计，时间管理，错误分析，改进建议
            </p>
          </div>
        </div>
      </div>

      <div className="demo-actions">
        <button className="btn btn-primary btn-large">
          开始新对局
        </button>
        <button className="btn btn-secondary btn-large">
          加载PGN文件
        </button>
        <button className="btn btn-outline btn-large">
          查看使用教程
        </button>
      </div>
    </div>
  )
}

export default ChessDemoPage