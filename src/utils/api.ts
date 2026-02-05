// API配置和工具函数

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface ApiConfig {
  baseURL: string;
  headers: Record<string, string>;
}

const apiConfig: ApiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// 通用请求函数
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${apiConfig.baseURL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(error.message || 'API请求失败');
  }

  return response.json();
}

// 国际象棋相关API
export const chessApi = {
  // 分析棋局
  analyzePosition: (fen: string, depth: number = 15) => {
    return request<{
      fen: string;
      depth: number;
      best_move: string;
      evaluation: number;
      pv: string[];
    }>('/analyze', {
      method: 'POST',
      body: JSON.stringify({ fen, depth }),
    });
  },

  // 提交棋步
  submitMove: (fen: string, move: string, gameId?: string) => {
    return request<{
      valid: boolean;
      fen: string;
      move: string;
      message: string;
    }>('/move', {
      method: 'POST',
      body: JSON.stringify({ fen, move, game_id: gameId }),
    });
  },

  // 获取棋局
  getGame: (gameId: string) => {
    return request<{
      game_id: string;
      fen: string;
      moves: string[];
      players: { white: string; black: string };
    }>(`/game/${gameId}`);
  },

  // 创建新棋局
  createGame: (player1: string, player2: string, gameType: string = 'ai') => {
    return request<{ game_id: string }>('/game', {
      method: 'POST',
      body: JSON.stringify({
        white_player: player1,
        black_player: player2,
        game_type: gameType,
      }),
    });
  },
};

// 训练相关API
export const trainingApi = {
  // 获取训练题目
  getTrainingProblems: (type: string, difficulty: string, limit: number = 10) => {
    return request<Array<{
      id: string;
      fen: string;
      solution: string[];
      theme: string;
      rating: number;
    }>>(`/training/problems?type=${type}&difficulty=${difficulty}&limit=${limit}`);
  },

  // 提交训练答案
  submitTrainingAnswer: (problemId: string, moves: string[], timeSpent: number) => {
    return request<{
      correct: boolean;
      solution: string[];
      explanation: string;
      rating_change: number;
    }>(`/training/answer`, {
      method: 'POST',
      body: JSON.stringify({ problem_id: problemId, moves, time_spent: timeSpent }),
    });
  },
};

// 用户相关API
export const userApi = {
  // 获取用户信息
  getUserProfile: (userId: string) => {
    return request<{
      id: string;
      username: string;
      elo_rating: number;
      games_played: number;
      win_rate: number;
    }>(`/user/${userId}`);
  },

  // 更新用户设置
  updateUserSettings: (settings: Record<string, any>) => {
    return request<{ success: boolean }>('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

export default {
  chessApi,
  trainingApi,
  userApi,
  request,
};