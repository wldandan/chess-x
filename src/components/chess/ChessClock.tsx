import React, { useState, useEffect, useCallback, useRef } from 'react'

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
  const lastActiveColorRef = useRef<'w' | 'b' | null>(null)
  const lastTickTimeRef = useRef<number>(Date.now())

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
    lastActiveColorRef.current = null
    lastTickTimeRef.current = Date.now()
  }, [timeControl, parseTimeControl])

  // 重置计时器当游戏状态变化时
  useEffect(() => {
    if (gameStatus !== 'playing') {
      setIsRunning(false)
    } else {
      setIsRunning(true)
      lastTickTimeRef.current = Date.now()
    }
  }, [gameStatus])

  // 处理加秒（当走方变化时）
  useEffect(() => {
    if (gameStatus !== 'playing') return
    if (lastActiveColorRef.current === null) {
      lastActiveColorRef.current = activeColor
      return
    }

    const { increment } = parseTimeControl(timeControl)
    const previousColor = lastActiveColorRef.current

    // 给刚走完的一方加秒
    if (previousColor !== activeColor) {
      if (previousColor === 'w') {
        setWhiteTime(prev => prev + increment)
      } else {
        setBlackTime(prev => prev + increment)
      }
      lastActiveColorRef.current = activeColor
      lastTickTimeRef.current = Date.now()
    }
  }, [activeColor, gameStatus, timeControl, parseTimeControl])

  // 主计时器循环
  useEffect(() => {
    if (!isRunning || gameStatus !== 'playing') return

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastTickTimeRef.current
      lastTickTimeRef.current = now

      if (activeColor === 'w') {
        setWhiteTime(prev => {
          const newTime = Math.max(0, prev - elapsed)
          if (newTime === 0 && prev > 0) {
            setIsRunning(false)
            onTimeout()
          }
          return newTime
        })
      } else {
        setBlackTime(prev => {
          const newTime = Math.max(0, prev - elapsed)
          if (newTime === 0 && prev > 0) {
            setIsRunning(false)
            onTimeout()
          }
          return newTime
        })
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, gameStatus, activeColor, onTimeout])

  // 格式化时间显示
  const formatTime = useCallback((milliseconds: number) => {
    const totalSeconds = Math.ceil(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${seconds}s`
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
    setIsRunning(prev => {
      const newValue = !prev
      if (newValue) {
        lastTickTimeRef.current = Date.now()
      }
      return newValue
    })
  }, [gameStatus])

  // 重置计时器
  const handleReset = useCallback(() => {
    const { baseTime } = parseTimeControl(timeControl)
    setWhiteTime(baseTime)
    setBlackTime(baseTime)
    setIsRunning(gameStatus === 'playing')
    lastActiveColorRef.current = null
    lastTickTimeRef.current = Date.now()
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
