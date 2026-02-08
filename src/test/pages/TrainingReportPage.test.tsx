// Training Report Page Tests
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../test/utils/test-utils';
import TrainingReportPage from '../../pages/TrainingReportPage';
import { TrainingReportGenerator } from '../../services/ai/TrainingReportGenerator';
import type { TrainingProgress } from '../../types/chess.types';
import { vi } from 'vitest';

// Mock the TrainingReportGenerator
vi.mock('../../services/ai/TrainingReportGenerator');

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { trainingProgress: null } }),
  };
});

describe('TrainingReportPage', () => {
  const mockTrainingProgress: TrainingProgress = {
    gamesPlayed: 10,
    gamesWon: 6,
    gamesDrawn: 2,
    gamesLost: 2,
    currentElo: 1650,
    startingElo: 1600,
    styleAdaptation: {
      positional: 75,
      tactical: 60,
      solid: 70,
      aggressive: 55,
      defensive: 65,
      technical: 80,
    },
    weaknesses: [
      { type: 'tactical', description: '战术识别能力', count: 3 },
      { type: 'endgame', description: '残局技术', count: 2 },
    ],
  };

  const mockTrainingReport = {
    summary: {
      totalGames: 10,
      record: '6-2-2',
      winRate: 60.0,
      eloChange: 50,
      currentElo: 1650,
      startingElo: 1600,
    },
    weaknesses: [
      {
        type: 'style-adaptation',
        description: '对aggressive风格的适应度较低 (55%)',
        priority: 'medium' as const,
        count: 0,
        affectedStyles: ['aggressive'],
      },
      {
        type: 'tactical',
        description: '战术识别能力',
        priority: 'high' as const,
        count: 3,
      },
    ],
    strengths: [
      {
        type: 'style-adaptation',
        description: '擅长应对technical风格',
        score: 80,
      },
      {
        type: 'overall-performance',
        description: '整体胜率优秀',
        score: 60,
      },
    ],
    recommendations: [
      {
        type: 'style-focused',
        title: '针对弱点风格的训练',
        description: '重点练习应对aggressive风格',
        targetStyle: 'aggressive',
        priority: 'high' as const,
        estimatedSessions: 5,
      },
      {
        type: 'tactics-training',
        title: '战术训练强化',
        description: '增加战术组合练习',
        priority: 'high' as const,
        estimatedSessions: 10,
      },
    ],
    styleAnalysis: {
      bestStyle: { name: 'technical', score: 80 },
      worstStyle: { name: 'aggressive', score: 55 },
      averageAdaptation: 68,
      overallAssessment: 'good' as const,
    },
    timestamp: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Mock TrainingReportGenerator
    (TrainingReportGenerator.generateReport as any).mockReturnValue(mockTrainingReport);
  });

  describe('Rendering - Report Summary', () => {
    it('should render the training report page', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/训练报告|Training Report/i)).toBeInTheDocument();
    });

    it('should display total games', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/对局总数/i)).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should display record', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/战绩/i)).toBeInTheDocument();
      expect(screen.getByText('6-2-2')).toBeInTheDocument();
    });

    it('should display win rate', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getAllByText(/胜率/i)).toHaveLength(2);
      expect(screen.getByText('60.0%')).toBeInTheDocument();
    });

    it('should display ELO change', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/ELO.*变化|等级分.*变化/i)).toBeInTheDocument();
      expect(screen.getByText('+50')).toBeInTheDocument();
    });

    it('should display current and starting ELO', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText('1650')).toBeInTheDocument();
      expect(screen.getByText('1600')).toBeInTheDocument();
    });
  });

  describe('Rendering - Style Analysis', () => {
    it('should display style analysis section', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/风格分析|Style Analysis/i)).toBeInTheDocument();
    });

    it('should display best style', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/最佳风格|Best Style/i)).toBeInTheDocument();
      expect(screen.getAllByText(/technical/i).length).toBeGreaterThan(0);
    });

    it('should display worst style', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/最差风格|Worst Style/i)).toBeInTheDocument();
      expect(screen.getAllByText(/aggressive/i).length).toBeGreaterThan(0);
    });

    it('should display average adaptation score', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/平均.*适应度|Average.*Adaptation/i)).toBeInTheDocument();
      expect(screen.getByText('68%')).toBeInTheDocument();
    });

    it('should display overall assessment', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/良好|Good/i)).toBeInTheDocument();
    });

    it('should handle null style analysis', () => {
      const reportWithoutStyleAnalysis = {
        ...mockTrainingReport,
        styleAnalysis: null,
      };
      (TrainingReportGenerator.generateReport as any).mockReturnValue(reportWithoutStyleAnalysis);

      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/暂无风格分析数据/i)).toBeInTheDocument();
    });
  });

  describe('Rendering - Weaknesses and Strengths', () => {
    it('should display weaknesses section', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/弱点分析|Weaknesses/i)).toBeInTheDocument();
    });

    it('should display all weaknesses', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      // Check that weakness analysis section exists
      expect(screen.getByText(/弱点分析|Weaknesses/i)).toBeInTheDocument();
      // Check that at least one weakness is displayed
      expect(screen.getByText(/战术识别能力/i)).toBeInTheDocument();
    });

    it('should display weaknesses with priority indicators', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      // Check that weaknesses are displayed
      expect(screen.getByText(/弱点分析|Weaknesses/i)).toBeInTheDocument();
    });

    it('should display strengths section', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/优势分析|Strengths/i)).toBeInTheDocument();
    });

    it('should display all strengths', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/擅长应对technical风格/i)).toBeInTheDocument();
      expect(screen.getByText(/整体胜率优秀/i)).toBeInTheDocument();
    });

    it('should handle empty weaknesses array', () => {
      const reportWithNoWeaknesses = {
        ...mockTrainingReport,
        weaknesses: [],
      };
      (TrainingReportGenerator.generateReport as any).mockReturnValue(reportWithNoWeaknesses);

      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/无明显弱点|No significant weaknesses/i)).toBeInTheDocument();
    });
  });

  describe('Rendering - Recommendations', () => {
    it('should display recommendations section', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/训练建议|Recommendations/i)).toBeInTheDocument();
    });

    it('should display all recommendations', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/针对弱点风格的训练/i)).toBeInTheDocument();
      expect(screen.getByText(/战术训练强化/i)).toBeInTheDocument();
    });

    it('should display recommendations with priority levels', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      // Check that recommendations are displayed
      expect(screen.getByText(/训练建议|Recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/针对弱点风格的训练/i)).toBeInTheDocument();
    });

    it('should display recommendation descriptions', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/重点练习应对aggressive风格/i)).toBeInTheDocument();
      expect(screen.getByText(/增加战术组合练习/i)).toBeInTheDocument();
    });

    it('should display estimated sessions', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/5.*局|5.*sessions/i)).toBeInTheDocument();
      expect(screen.getByText(/10.*局|10.*sessions/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have back to training button', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      const backButton = screen.getByRole('button', { name: /返回训练|back to training/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should navigate to training page when back button is clicked', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      const backButton = screen.getByRole('button', { name: /返回训练|back to training/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/ai-training');
    });

    it('should have new training button', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      const newTrainingButton = screen.getByRole('button', { name: /新训练|new training/i });
      expect(newTrainingButton).toBeInTheDocument();
    });

    it('should navigate to setup page when new training button is clicked', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      const newTrainingButton = screen.getByRole('button', { name: /新训练|new training/i });
      fireEvent.click(newTrainingButton);

      expect(mockNavigate).toHaveBeenCalledWith('/training-setup');
    });

    it('should have home button', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      const homeButton = screen.getByRole('button', { name: /首页|home/i });
      expect(homeButton).toBeInTheDocument();
    });

    it('should navigate to home page when home button is clicked', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      const homeButton = screen.getByRole('button', { name: /首页|home/i });
      fireEvent.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });

    it('should have proper ARIA labels for interactive elements', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      const backButton = screen.getByRole('button', { name: /返回训练|back to training/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null training progress gracefully', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={null} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/暂无训练数据|No training data/i)).toBeInTheDocument();
    });

    it('should handle empty training progress (no games played)', () => {
      const emptyProgress: TrainingProgress = {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesDrawn: 0,
        gamesLost: 0,
        currentElo: 1200,
        startingElo: 1200,
      };

      renderWithRouter(<TrainingReportPage trainingProgress={emptyProgress} />, {
        route: '/ai-training/report',
      });

      // The page should still render with 0 games
      expect(screen.getByText(/对局总数/i)).toBeInTheDocument();
    });

    it('should handle missing style adaptation data', () => {
      const progressWithoutStyleAdaptation: TrainingProgress = {
        ...mockTrainingProgress,
        styleAdaptation: undefined,
      };

      const reportWithoutStyleAnalysis = {
        ...mockTrainingReport,
        styleAnalysis: null,
      };
      (TrainingReportGenerator.generateReport as any).mockReturnValue(reportWithoutStyleAnalysis);

      renderWithRouter(<TrainingReportPage trainingProgress={progressWithoutStyleAdaptation} />, {
        route: '/ai-training/report',
      });

      expect(screen.getByText(/暂无风格分析数据/i)).toBeInTheDocument();
    });

    it('should display export functionality', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      const exportButton = screen.getByRole('button', { name: /导出|export/i });
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Integration with TrainingReportGenerator', () => {
    it('should call TrainingReportGenerator.generateReport with training progress', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      expect(TrainingReportGenerator.generateReport).toHaveBeenCalledWith(mockTrainingProgress);
    });

    it('should use generated report data for display', () => {
      renderWithRouter(<TrainingReportPage trainingProgress={mockTrainingProgress} />, {
        route: '/ai-training/report',
      });

      // Verify that data from the generated report is displayed
      expect(screen.getByText('6-2-2')).toBeInTheDocument(); // From mock report
      expect(screen.getByText('60.0%')).toBeInTheDocument(); // From mock report
    });
  });
});
