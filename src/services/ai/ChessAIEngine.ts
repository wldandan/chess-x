/**
 * AI Chess Engine Service using Stockfish.js
 * Provides AI opponent functionality with different difficulty levels
 */

import type { DifficultyLevel } from '../../types/chess.types';

// Re-export for convenience
export type { DifficultyLevel };

export interface EngineConfig {
  difficulty?: DifficultyLevel
  depth?: number
  lines?: number
}

export interface PositionAnalysis {
  evaluation: number // in centipawns (positive = white advantage)
  bestMove: string
  pv: string[] // principal variation
  depth: number
}

export interface ThinkingState {
  isThinking: boolean
  depth: number
  evaluation: number
  currentMove: string
}

// Difficulty level configurations
const DIFFICULTY_CONFIGS: Record<DifficultyLevel, { depth: number; skillLevel: number; nodes: number }> = {
  beginner: { depth: 1, skillLevel: 0, nodes: 10000 },
  easy: { depth: 5, skillLevel: 1, nodes: 50000 },
  medium: { depth: 10, skillLevel: 5, nodes: 100000 },
  hard: { depth: 13, skillLevel: 10, nodes: 200000 },
  expert: { depth: 15, skillLevel: 15, nodes: 500000 },
  master: { depth: 18, skillLevel: 20, nodes: 1000000 }
}

export class ChessAIEngine {
  private worker: Worker | null = null
  private isReady = false
  private currentDifficulty: DifficultyLevel = 'medium'
  private thinkingCallback: ((state: ThinkingState) => void) | null = null

  /**
   * Initialize the Stockfish engine
   */
  async initialize(): Promise<void> {
    if (this.worker) {
      return
    }

    return new Promise((resolve, reject) => {
      try {
        // Create worker from stockfish.js CDN
        const workerUrl = new URL(
          'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/src/stockfish-nnue-16.js',
          import.meta.url
        )
        this.worker = new Worker(workerUrl.toString(), { type: 'module' })

        this.worker.onmessage = (e) => this.handleMessage(e.data)

        // Wait for engine to be ready
        const readyCheck = setTimeout(() => {
          if (this.isReady) {
            resolve()
          } else {
            reject(new Error('Engine initialization timeout'))
          }
        }, 10000)

        // We'll consider it ready after first message
        this.worker.postMessage('uci')
        this.worker.postMessage('isready')

        // Send initial uci command to start UCI mode
        setTimeout(() => {
          this.isReady = true
          clearTimeout(readyCheck)
          resolve()
        }, 1000)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Handle messages from Stockfish worker
   */
  private handleMessage(data: string): void {
    // Parse UCI output from Stockfish
    if (data.startsWith('info depth')) {
      this.parseInfo(data)
    } else if (data.startsWith('bestmove')) {
      this.parseBestMove(data)
    }
  }

  /**
   * Parse info line from Stockfish
   */
  private parseInfo(line: string): void {
    // Extract evaluation and current move info
    const depthMatch = line.match(/depth (\d+)/)
    const scoreMatch = line.match(/score (cp|mate) (-?\d+)/)
    const currmoveMatch = line.match(/currmove (\S+)/)

    if (depthMatch && this.thinkingCallback) {
      const depth = parseInt(depthMatch[1])
      let evaluation = 0

      if (scoreMatch) {
        const type = scoreMatch[1]
        const value = parseInt(scoreMatch[2])
        if (type === 'cp') {
          evaluation = value / 100 // Convert centipawns to pawns
        } else if (type === 'mate') {
          evaluation = value > 0 ? 100 : -100 // Mate in N moves
        }
      }

      this.thinkingCallback({
        isThinking: true,
        depth,
        evaluation,
        currentMove: currmoveMatch ? currmoveMatch[1] : ''
      })
    }
  }

  /**
   * Parse bestmove from Stockfish
   */
  private parseBestMove(line: string): void {
    const match = line.match(/bestmove (\S+)/)
    if (match) {
      // Best move found - will be returned via getBestMove
    }
  }

  /**
   * Analyze a position and get the best move
   */
  async getBestMove(
    fen: string,
    config: EngineConfig = {}
  ): Promise<PositionAnalysis> {
    if (!this.worker || !this.isReady) {
      await this.initialize()
    }

    const { difficulty = this.currentDifficulty, depth } = config
    const configData = DIFFICULTY_CONFIGS[difficulty || this.currentDifficulty]
    const searchDepth = depth || configData.depth

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('AI analysis timeout'))
      }, 30000) // 30 second timeout

      let bestMove = ''
      let evaluation = 0
      let pv: string[] = []
      let finalDepth = 0

      // Set up message handler for this request
      const messageHandler = (e: MessageEvent) => {
        const data = e.data

        if (data.startsWith('bestmove')) {
          const match = data.match(/bestmove (\S+)/)
          if (match) {
            bestMove = match[1]
          }

          const ponderMatch = data.match(/ponder (\S+)/)
          if (ponderMatch) {
            pv.push(bestMove, ponderMatch[1])
          }

          clearTimeout(timeout)
          this.worker!.removeEventListener('message', messageHandler)
          resolve({
            evaluation,
            bestMove,
            pv,
            depth: finalDepth
          })
        } else if (data.startsWith('info')) {
          // Parse final info
          const depthMatch = data.match(/depth (\d+)/)
          const scoreMatch = data.match(/score (cp|mate) (-?\d+)/)
          const pvMatch = data.match(/pv (.+)/)

          if (depthMatch) {
            finalDepth = parseInt(depthMatch[1])
          }

          if (scoreMatch) {
            const type = scoreMatch[1]
            const value = parseInt(scoreMatch[2])
            if (type === 'cp') {
              evaluation = value / 100
            } else if (type === 'mate') {
              evaluation = value > 0 ? 100 - value : -100 - value
            }
          }

          if (pvMatch) {
            pv = pvMatch[1].split(' ')
          }
        }
      }

      this.worker!.addEventListener('message', messageHandler)

      // Send position to analyze
      this.worker!.postMessage(`position fen ${fen}`)

      // Set up search parameters based on difficulty
      const skillLevel = Math.min(configData.skillLevel, 20)
      this.worker!.postMessage(`setoption name Skill Level value ${skillLevel}`)
      this.worker!.postMessage(`setoption name Contempt value ${configData.skillLevel > 10 ? 100 : 0}`)

      // Go for best move
      this.worker!.postMessage(`go depth ${searchDepth}`)
    })
  }

  /**
   * Set thinking callback for UI updates
   */
  setThinkingCallback(callback: (state: ThinkingState) => void): void {
    this.thinkingCallback = callback
  }

  /**
   * Set difficulty level
   */
  setDifficulty(level: DifficultyLevel): void {
    this.currentDifficulty = level
  }

  /**
   * Stop the engine
   */
  stop(): void {
    if (this.worker) {
      this.worker.postMessage('stop')
    }
  }

  /**
   * Get current difficulty
   */
  getDifficulty(): DifficultyLevel {
    return this.currentDifficulty
  }

  /**
   * Check if engine is ready
   */
  ready(): boolean {
    return this.isReady
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
      this.isReady = false
    }
  }
}

// Singleton instance
let aiEngineInstance: ChessAIEngine | null = null

/**
 * Get the singleton AI engine instance
 */
export function getAIEngine(): ChessAIEngine {
  if (!aiEngineInstance) {
    aiEngineInstance = new ChessAIEngine()
  }
  return aiEngineInstance
}

/**
 * Clean up the AI engine
 */
export function disposeAIEngine(): void {
  if (aiEngineInstance) {
    aiEngineInstance.dispose()
    aiEngineInstance = null
  }
}
