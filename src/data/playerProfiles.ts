// 棋手风格配置库
// 定义四种世界顶级棋手的AI模拟风格

import type { AIPlayerProfile } from '../types/chess.types';

export const playerProfiles: AIPlayerProfile[] = [
  {
    id: 'magnus_carlsen',
    name: 'Magnus Carlsen',
    displayName: '卡尔森',
    description: '稳健局面型，擅长积累微小优势，残局大师。以耐心、精确和残局技术著称。',
    elo: 2850,
    style: 'positional',
    styleParams: {
      positionalWeight: 0.8,
      tacticalWeight: 0.2,
      riskTolerance: 0.3,
      attackFocus: 0.4,
      endgameFocus: 0.9
    },
    icon: '👑',
    difficultyRange: [800, 2800],
    characteristics: [
      '擅长积累微小优势',
      '残局技术精湛',
      '耐心等待对手犯错',
      '精确计算能力',
      '稳健防守'
    ]
  },
  {
    id: 'garry_kasparov',
    name: 'Garry Kasparov',
    displayName: '卡斯帕罗夫',
    description: '攻击战术型，擅长复杂计算和战术组合。以侵略性、创造性和战术敏锐度著称。',
    elo: 2850,
    style: 'tactical',
    styleParams: {
      positionalWeight: 0.4,
      tacticalWeight: 0.6,
      riskTolerance: 0.7,
      attackFocus: 0.9,
      endgameFocus: 0.5
    },
    icon: '⚔️',
    difficultyRange: [1000, 2800],
    characteristics: [
      '极具攻击性',
      '战术组合敏锐',
      '善于制造复杂局面',
      '心理战大师',
      '开局创新者'
    ]
  },
  {
    id: 'fabiano_caruana',
    name: 'Fabiano Caruana',
    displayName: '卡鲁阿纳',
    description: '现代稳健型，精通开局理论，擅长新变例和灵活布局。以全面性和准备充分著称。',
    elo: 2820,
    style: 'solid',
    styleParams: {
      positionalWeight: 0.6,
      tacticalWeight: 0.4,
      riskTolerance: 0.4,
      attackFocus: 0.6,
      endgameFocus: 0.7
    },
    icon: '🎯',
    difficultyRange: [900, 2800],
    characteristics: [
      '开局准备充分',
      '局面理解深刻',
      '全面型棋手',
      '灵活适应不同风格',
      '计算准确'
    ]
  },
  {
    id: 'ding_liren',
    name: 'Ding Liren',
    displayName: '丁立人',
    description: '技术精密型，擅长精密计算和残局技术。以沉稳、精确和抗压能力著称。',
    elo: 2810,
    style: 'technical',
    styleParams: {
      positionalWeight: 0.7,
      tacticalWeight: 0.3,
      riskTolerance: 0.2,
      attackFocus: 0.5,
      endgameFocus: 0.8
    },
    icon: '🔬',
    difficultyRange: [800, 2800],
    characteristics: [
      '计算极其精确',
      '残局技术出色',
      '心理素质稳定',
      '防守严密',
      '局面转换能力强'
    ]
  }
];

// 根据ID获取棋手配置
export function getPlayerProfileById(id: string): AIPlayerProfile | undefined {
  return playerProfiles.find(profile => profile.id === id);
}

// 根据风格获取棋手列表
export function getPlayerProfilesByStyle(style: string): AIPlayerProfile[] {
  return playerProfiles.filter(profile => profile.style === style);
}

// 根据难度范围获取可用棋手
export function getAvailableProfilesForElo(elo: number): AIPlayerProfile[] {
  return playerProfiles.filter(
    profile => elo >= profile.difficultyRange[0] && elo <= profile.difficultyRange[1]
  );
}

// 获取推荐训练棋手（基于用户ELO和风格偏好）
export function getRecommendedProfiles(
  userElo: number,
  userStyle?: string,
  trainingFocus?: string
): AIPlayerProfile[] {
  let profiles = getAvailableProfilesForElo(userElo);

  // 如果有风格偏好，优先推荐相同风格的棋手
  if (userStyle) {
    const sameStyleProfiles = profiles.filter(p => p.style === userStyle);
    if (sameStyleProfiles.length > 0) {
      return sameStyleProfiles;
    }
  }

  // 根据训练重点调整推荐
  if (trainingFocus === 'tactical') {
    return profiles.sort((a, b) => b.styleParams.tacticalWeight - a.styleParams.tacticalWeight);
  } else if (trainingFocus === 'positional') {
    return profiles.sort((a, b) => b.styleParams.positionalWeight - a.styleParams.positionalWeight);
  } else if (trainingFocus === 'endgame') {
    return profiles.sort((a, b) => b.styleParams.endgameFocus - a.styleParams.endgameFocus);
  }

  return profiles;
}

// 默认自适应难度配置
export const defaultAdaptiveConfig = {
  baseElo: 1200,
  adjustmentRate: 0.3,
  minElo: 800,
  maxElo: 2800,
  performanceThresholds: {
    win: 0.4,    // 胜率低于40%时降低难度
    draw: 0.3,   // 和棋率30%为理想状态
    loss: 0.6    // 负率高于60%时提高难度
  },
  consistencyThreshold: 0.7
};

// 训练模式配置
export const trainingModes = {
  style_specialization: {
    name: '风格专项训练',
    description: '专注于适应特定棋风，建议5-10局连续对弈',
    recommendedSessions: 5,
    focus: 'style_adaptation'
  },
  mixed_style_challenge: {
    name: '混合风格挑战',
    description: '随机切换不同风格AI，提升全面应对能力',
    recommendedSessions: 8,
    focus: 'versatility'
  },
  weakness_targeting: {
    name: '弱点针对性训练',
    description: '针对特定弱点选择相克棋风进行强化训练',
    recommendedSessions: 6,
    focus: 'weakness_improvement'
  }
};

// 导出类型
export type { AIPlayerProfile };