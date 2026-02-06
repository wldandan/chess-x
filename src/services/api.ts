// API 服务配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// API 响应类型
export interface GameRecord {
  id: string
  fen: string
  moves: string[]
  result: string | null
  game_type: string
  created_at: string
}

export interface SaveGameRequest {
  fen: string
  moves: string[]
  result?: string
  game_type?: string
  white_username?: string
  black_username?: string
}

export interface HealthResponse {
  status: string
  service: string
  database: string
}

// API 服务类
class ChessAPIService {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: response.statusText,
        }))
        throw new Error(error.detail || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error')
    }
  }

  // 健康检查
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health')
  }

  // 保存游戏
  async saveGame(data: SaveGameRequest): Promise<GameRecord> {
    return this.request<GameRecord>('/api/games', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // 获取游戏历史
  async getGames(params?: {
    skip?: number
    limit?: number
    game_type?: string
  }): Promise<GameRecord[]> {
    const searchParams = new URLSearchParams()
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.game_type) searchParams.append('game_type', params.game_type)

    const query = searchParams.toString()
    return this.request<GameRecord[]>(`/api/games${query ? `?${query}` : ''}`)
  }

  // 获取单个游戏
  async getGame(gameId: string): Promise<GameRecord> {
    return this.request<GameRecord>(`/api/games/${gameId}`)
  }

  // 更新游戏
  async updateGame(gameId: string, data: SaveGameRequest): Promise<{ message: string; game_id: string }> {
    return this.request(`/api/games/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // 分析棋局（占位）
  async analyzePosition(fen: string, depth: number = 15) {
    return this.request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ fen, depth }),
    })
  }
}

// 导出单例
export const chessAPI = new ChessAPIService()
