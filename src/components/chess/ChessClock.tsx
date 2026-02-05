import React, { useState, useEffect, useCallback } from 'react'

interface ChessClockProps {
  timeControl: string
  activeColor: 'w' | 'b'
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'timeout'
  onTimeout: () => void
}

const ChessClock: React.FC<ChessClockProps> = ({
  timeControl,
  activeColor,
  gameStatus,
  onTimeout
}) => {
  const [whiteTime, setWhiteTime] = useState<number>(0)
  const [blackTime, setBlackTime] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  // 解析时间控制字符串，如 "10+5" 表示10分钟基本时间+5秒加秒
  const parseTimeControl = useCallback((control: string) => {
    const [minutes, increment] = control.split('+').map(Number)
    return {
      baseTime: (minutes || 10) * 60 * 1000, // 转换为毫秒
      increment: (increment || 0) * 1000 // 转换为毫秒
    }
  }, [])

  // 初始化时间
  useEffect(() => {
    const { baseTime } = parseTimeControl(timeControl)
    setWhiteTime(baseTime)
    setBlackTime(baseTime)
    setIsRunning(gameStatus === 'playing')
    setLastUpdate(Date.now())
  }, [timeControl, gameStatus, parseTimeControl])

  // 处理计时器
  useEffect(() => {
    if (!isRunning || gameStatus !== 'playing') return

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastUpdate

      if (activeColor === 'w') {
        const newWhiteTime = whiteTime - elapsed
        setWhiteTime(newWhiteTime)

        if (newWhiteTime <= 0) {
          setWhiteTime(0)
          setIsRunning(false)
          onTimeout()
        }
      } else {
        const newBlackTime = blackTime - elapsed
        setBlackTime(newBlackTime)

        if (newBlackTime <= 0) {
          setBlackTime(0)
          setIsRunning(false)
          onTimeout()
        }
      }

      setLastUpdate(now)
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, gameStatus, activeColor, whiteTime, blackTime, lastUpdate, onTimeout])

  // 切换走子时加秒
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const { increment } = parseTimeControl(timeControl)

    // 当activeColor变化时，给刚走完的一方加秒
    const now = Date.now()
    const elapsed = now - lastUpdate

    if (activeColor === 'b') {
      // 白方刚走完，给白方加秒
      const newWhiteTime = Math.max(0, whiteTime - elapsed) + increment
      setWhiteTime(newWhiteTime)
    } else {
      // 黑方刚走完，给黑方加秒
      const newBlackTime = Math.max(0, blackTime - elapsed) + increment
      setBlackTime(newBlackTime)
    }

    setLastUpdate(now)
  }, [activeColor, gameStatus, timeControl, parseTimeControl])

  // 格式化时间显示
  const formatTime = useCallback((milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const millis = Math.floor((milliseconds % 1000) / 10)

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    } else if (totalSeconds > 10) {
      return `${seconds}.${millis.toString().padStart(2, '0')}`
    } else {
      return `${seconds}.${millis.toString().padStart(2, '0')}`
    }
  }, [])

  // 获取时间颜色（根据剩余时间）
  const getTimeColor = useCallback((milliseconds: number) => {
    const totalSeconds = milliseconds / 1000

    if (totalSeconds < 30) return '#e74c3c' // 红色：少于30秒
    if (totalSeconds < 60) return '#f39c12' // 橙色：少于1分钟
    return '#2c3e50' // 默认颜色
  }, [])

  // 暂停/继续计时器
  const handlePauseResume = useCallback(() => {
    if (gameStatus !== 'playing') return
    setIsRunning(prev => !prev)
    setLastUpdate(Date.now())
  }, [gameStatus])

  // 重置计时器
  const handleReset = useCallback(() => {
    const { baseTime } = parseTimeControl(timeControl)
    setWhiteTime(baseTime)
    setBlackTime(baseTime)
    setIsRunning(gameStatus === 'playing')
    setLastUpdate(Date.now())
  }, [timeControl, gameStatus, parseTimeControl])

  return (
    <div className="chess-clock">
      <div className="clock-header">
        <h4>比赛计时器</h4>
        <div className="time-control">{timeControl}</div>
      </div>

      <div className="clock-display">
        <div className={`player-time ${activeColor === 'b' ? 'active' : ''}`}>
          <div className="time-label">黑方</div>
          <div
            className="time-value"
            style={{ color: getTimeColor(blackTime) }}
          >
            {formatTime(blackTime)}
          </div>
          {activeColor === 'b' && gameStatus === 'playing' && (
            <div className="active-indicator">●</div>
          )}
        </div>

        <div className="clock-separator">:</div>

        <div className={`player-time ${activeColor === 'w' ? 'active' : ''}`}>
          <div className="time-label">白方</div>
          <div
            className="time-value"
            style={{ color: getTimeColor(whiteTime) }}
          >
            {formatTime(whiteTime)}
          </div>
          {activeColor === 'w' && gameStatus === 'playing' && (
            <div className="active-indicator">●</div>
          )}
        </div>
      </div>

      <div className="clock-controls">
        <button
          className="btn btn-sm"
          onClick={handlePauseResume}
          disabled={gameStatus !== 'playing'}
        >
          {isRunning ? '暂停' : '继续'}
        </button>
        <button
          className="btn btn-sm btn-outline"
          onClick={handleReset}
        >
          重置
        </button>
      </div>

      <div className="clock-info">
        <div className="info-item">
          <span className="info-label">状态:</span>
          <span className="info-value">
            {gameStatus === 'playing'
              ? (isRunning ? '运行中' : '已暂停')
              : '已结束'
            }
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">轮到:</span>
          <span className="info-value">
            {activeColor === 'w' ? '白方' : '黑方'}
          </span>
        </div>
      </div>

      {gameStatus === 'playing' && (whiteTime < 30000 || blackTime < 30000) && (
        <div className="time-warning">
          ⚠️ 时间紧张！请加快走子速度
        </div>
      )}
    </div>
  )
}

export default ChessClock