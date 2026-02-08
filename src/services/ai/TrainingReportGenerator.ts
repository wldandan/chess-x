import { TrainingProgress, TrainingReport, SimplifiedWeaknessAnalysis, TrainingRecommendation } from '@/types/chess.types';

export class TrainingReportGenerator {
  static generateReport(progress: TrainingProgress): TrainingReport {
    return {
      summary: this.generateSummary(progress),
      weaknesses: this.analyzeWeaknesses(progress),
      strengths: this.analyzeStrengths(progress),
      recommendations: this.generateRecommendations(progress),
      styleAnalysis: this.analyzeStylePerformance(progress),
      timestamp: new Date()
    };
  }

  private static generateSummary(progress: TrainingProgress) {
    const winRate = (progress.gamesWon / progress.gamesPlayed * 100).toFixed(1);
    const eloChange = progress.currentElo - progress.startingElo;

    return {
      totalGames: progress.gamesPlayed,
      record: `${progress.gamesWon}-${progress.gamesDrawn}-${progress.gamesLost}`,
      winRate: parseFloat(winRate),
      eloChange,
      currentElo: progress.currentElo,
      startingElo: progress.startingElo
    };
  }

  private static analyzeWeaknesses(progress: TrainingProgress): SimplifiedWeaknessAnalysis[] {
    const weaknesses: SimplifiedWeaknessAnalysis[] = [];

    // Analyze style adaptation weaknesses
    if (progress.styleAdaptation) {
      Object.entries(progress.styleAdaptation).forEach(([style, score]) => {
        if (score < 50) {
          weaknesses.push({
            type: 'style-adaptation',
            description: `对${style}风格的适应度较低 (${score}%)`,
            priority: score < 40 ? 'high' : 'medium',
            count: 0,
            affectedStyles: [style]
          });
        }
      });
    }

    // Add explicitly tracked weaknesses
    if (progress.weaknesses) {
      progress.weaknesses.forEach(w => {
        weaknesses.push({
          type: w.type as any,
          description: w.description,
          priority: w.count >= 5 ? 'high' : 'medium',
          count: w.count
        });
      });
    }

    return weaknesses.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private static analyzeStrengths(progress: TrainingProgress) {
    const strengths: any[] = [];

    if (progress.styleAdaptation) {
      Object.entries(progress.styleAdaptation).forEach(([style, score]) => {
        if (score >= 75) {
          strengths.push({
            type: 'style-adaptation',
            description: `擅长应对${style}风格`,
            score: score
          });
        }
      });
    }

    // Check overall performance
    const winRate = progress.gamesWon / progress.gamesPlayed;
    if (winRate >= 0.6) {
      strengths.push({
        type: 'overall-performance',
        description: '整体胜率优秀',
        score: winRate * 100
      });
    }

    return strengths;
  }

  private static generateRecommendations(progress: TrainingProgress): TrainingRecommendation[] {
    const recommendations: TrainingRecommendation[] = [];

    // Style-specific recommendations
    if (progress.styleAdaptation) {
      const weakStyles = Object.entries(progress.styleAdaptation)
        .filter(([_, score]) => score < 50)
        .sort((a, b) => a[1] - b[1]);

      if (weakStyles.length > 0) {
        recommendations.push({
          type: 'style-focused',
          title: '针对弱点风格的训练',
          description: `重点练习应对${weakStyles[0][0]}风格`,
          targetStyle: weakStyles[0][0] as any,
          priority: 'high',
          estimatedSessions: 5
        });
      }
    }

    // Weakness-specific recommendations
    if (progress.weaknesses) {
      const tacticalWeakness = progress.weaknesses.find(w => w.type === 'tactical');
      if (tacticalWeakness && tacticalWeakness.count >= 3) {
        recommendations.push({
          type: 'tactics-training',
          title: '战术训练强化',
          description: '增加战术组合练习',
          priority: 'high',
          estimatedSessions: 10
        });
      }

      const endgameWeakness = progress.weaknesses.find(w => w.type === 'endgame');
      if (endgameWeakness && endgameWeakness.count >= 3) {
        recommendations.push({
          type: 'endgame-training',
          title: '残局技术提升',
          description: '加强残局技巧训练',
          priority: 'medium',
          estimatedSessions: 8
        });
      }
    }

    // ELO-based recommendations
    const eloChange = progress.currentElo - progress.startingElo;
    if (eloChange < 0) {
      recommendations.push({
        type: 'difficulty-adjustment',
        title: '降低训练难度',
        description: '当前难度可能过高，建议降低100-200 ELO',
        priority: 'medium',
        estimatedSessions: 3
      });
    } else if (eloChange > 200 && progress.gamesWon / progress.gamesPlayed > 0.7) {
      recommendations.push({
        type: 'difficulty-adjustment',
        title: '提升训练难度',
        description: '表现优异，可以尝试更高难度',
        priority: 'low',
        estimatedSessions: 0
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private static analyzeStylePerformance(progress: TrainingProgress) {
    if (!progress.styleAdaptation) return null;

    const entries = Object.entries(progress.styleAdaptation);
    const bestStyle = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    const worstStyle = entries.reduce((a, b) => a[1] < b[1] ? a : b);
    const avgAdaptation = entries.reduce((sum, [, score]) => sum + score, 0) / entries.length;

    return {
      bestStyle: {
        name: bestStyle[0],
        score: bestStyle[1]
      },
      worstStyle: {
        name: worstStyle[0],
        score: worstStyle[1]
      },
      averageAdaptation: Math.round(avgAdaptation),
      overallAssessment: avgAdaptation >= 70 ? 'excellent' : avgAdaptation >= 50 ? 'good' : 'needs-improvement'
    };
  }
}
