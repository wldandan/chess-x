import { describe, it, expect } from 'vitest';
import { TrainingReportGenerator } from '@/services/ai/TrainingReportGenerator';
import { TrainingProgress } from '@/types/chess.types';

describe('TrainingReportGenerator', () => {
  it('should generate a complete training report', () => {
    const progress: TrainingProgress = {
      gamesPlayed: 10,
      gamesWon: 4,
      gamesDrawn: 2,
      gamesLost: 4,
      currentElo: 1650,
      startingElo: 1500,
      styleAdaptation: {
        magnus_carlsen: 85,
        garry_kasparov: 45
      }
    };

    const report = TrainingReportGenerator.generateReport(progress);

    expect(report.summary).toBeDefined();
    expect(report.summary.totalGames).toBe(10);
    expect(report.summary.eloChange).toBe(150);
    expect(report.recommendations).toBeDefined();
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it('should identify weaknesses correctly', () => {
    const progress: TrainingProgress = {
      gamesPlayed: 10,
      gamesWon: 2,
      gamesDrawn: 1,
      gamesLost: 7,
      currentElo: 1400,
      startingElo: 1500,
      weaknesses: [
        { type: 'tactical', description: '战术识别能力不足', count: 5 },
        { type: 'endgame', description: '残局技术需要提高', count: 3 }
      ]
    };

    const report = TrainingReportGenerator.generateReport(progress);

    expect(report.weaknesses.length).toBeGreaterThan(0);
    expect(report.weaknesses.some(w => w.type === 'tactical' || w.type === 'style-adaptation')).toBe(true);
  });

  it('should provide style-specific recommendations', () => {
    const progress: TrainingProgress = {
      gamesPlayed: 10,
      gamesWon: 4,
      gamesDrawn: 2,
      gamesLost: 4,
      currentElo: 1650,
      startingElo: 1500,
      styleAdaptation: {
        magnus_carlsen: 85,
        garry_kasparov: 35
      }
    };

    const report = TrainingReportGenerator.generateReport(progress);

    expect(report.recommendations).toContainEqual(
      expect.objectContaining({
        type: 'style-focused',
        targetStyle: 'garry_kasparov'
      })
    );
  });
});
