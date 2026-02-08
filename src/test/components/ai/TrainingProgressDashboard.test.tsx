import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TrainingProgressDashboard } from '@/components/ai/TrainingProgressDashboard';

describe('TrainingProgressDashboard', () => {
  const mockStats = {
    gamesPlayed: 150,
    wins: 75,
    draws: 45,
    losses: 30,
    currentElo: 1650,
    eloHistory: [
      { elo: 1500, date: '2024-01-01' },
      { elo: 1520, date: '2024-01-15' },
      { elo: 1540, date: '2024-02-01' },
      { elo: 1530, date: '2024-02-15' },
      { elo: 1560, date: '2024-03-01' },
      { elo: 1600, date: '2024-03-15' },
      { elo: 1620, date: '2024-04-01' },
      { elo: 1650, date: '2024-04-15' },
    ],
    styleAdaptation: {
      positional: 85,
      tactical: 72,
      solid: 60,
      aggressive: 78,
      defensive: 55,
      technical: 82,
    },
    weaknesses: [
      { area: '防御技巧', count: 15, improvement: 12 },
      { area: '残局计算', count: 12, improvement: 8 },
      { area: '开局理论', count: 8, improvement: 20 },
    ],
  };

  it('should display overall statistics', () => {
    render(<TrainingProgressDashboard stats={mockStats} />);

    expect(screen.getByText('150')).toBeInTheDocument(); // games played
    expect(screen.getByText(/75.*45.*30/s)).toBeInTheDocument(); // W-D-L
    // Current ELO appears in both stat card and ELO section, use getAllByText
    expect(screen.getAllByText('1650').length).toBeGreaterThan(0); // current ELO
  });

  it('should display ELO progress with positive styling for gains', () => {
    render(<TrainingProgressDashboard stats={mockStats} />);

    const positiveChange = screen.getByText(/\+150/);
    expect(positiveChange).toBeInTheDocument();
    expect(positiveChange).toHaveClass('positive-change');
  });

  it('should display ELO progress with negative styling for losses', () => {
    const statsWithDrop = {
      ...mockStats,
      eloHistory: [
        { elo: 1600, date: '2024-01-01' },
        { elo: 1550, date: '2024-01-15' },
      ],
      currentElo: 1550,
    };

    render(<TrainingProgressDashboard stats={statsWithDrop} />);

    const negativeChange = screen.getByText(/-50/);
    expect(negativeChange).toBeInTheDocument();
    expect(negativeChange).toHaveClass('negative-change');
  });

  it('should display style adaptation scores', () => {
    render(<TrainingProgressDashboard stats={mockStats} />);

    expect(screen.getByText('85%')).toBeInTheDocument(); // positional
    expect(screen.getByText('72%')).toBeInTheDocument(); // tactical
    expect(screen.getByText('60%')).toBeInTheDocument(); // solid
    expect(screen.getByText('78%')).toBeInTheDocument(); // aggressive
    expect(screen.getByText('55%')).toBeInTheDocument(); // defensive
    expect(screen.getByText('82%')).toBeInTheDocument(); // technical
  });

  it('should display stat cards for key metrics', () => {
    render(<TrainingProgressDashboard stats={mockStats} />);

    expect(screen.getByText('对局总数')).toBeInTheDocument();
    expect(screen.getByText('战绩')).toBeInTheDocument();
    expect(screen.getByText('胜率')).toBeInTheDocument();
    expect(screen.getByText('当前等级分')).toBeInTheDocument();
  });

  it('should calculate win rate correctly', () => {
    render(<TrainingProgressDashboard stats={mockStats} />);

    const winRate = ((75 / 150) * 100).toFixed(1);
    expect(screen.getByText(`${winRate}%`)).toBeInTheDocument();
  });

  it('should display weakness analysis section', () => {
    render(<TrainingProgressDashboard stats={mockStats} />);

    expect(screen.getByText('弱点分析')).toBeInTheDocument();
    expect(screen.getByText('防御技巧')).toBeInTheDocument();
    expect(screen.getByText('残局计算')).toBeInTheDocument();
    expect(screen.getByText('开局理论')).toBeInTheDocument();
  });

  it('should show improvement metrics in weakness analysis', () => {
    render(<TrainingProgressDashboard stats={mockStats} />);

    expect(screen.getByText('15次')).toBeInTheDocument();
    expect(screen.getByText('12次')).toBeInTheDocument();
    expect(screen.getByText('已改善12次')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes for accessibility', () => {
    const { container } = render(<TrainingProgressDashboard stats={mockStats} />);

    const region = container.querySelector('[role="region"]');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-label', '训练进度仪表板');
  });

  it('should provide accessible labels for progress bars', () => {
    const { container } = render(<TrainingProgressDashboard stats={mockStats} />);

    const progressBars = container.querySelectorAll('[role="progressbar"]');
    expect(progressBars.length).toBeGreaterThan(0);

    progressBars.forEach(bar => {
      expect(bar).toHaveAttribute('aria-valuenow');
      expect(bar).toHaveAttribute('aria-valuemin');
      expect(bar).toHaveAttribute('aria-valuemax');
    });
  });

  it('should be keyboard navigable', () => {
    const { container } = render(<TrainingProgressDashboard stats={mockStats} />);

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    expect(focusableElements.length).toBeGreaterThan(0);
  });

  it('should handle zero games played', () => {
    const emptyStats = {
      ...mockStats,
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      currentElo: 1200,
      eloHistory: [{ elo: 1200, date: '2024-01-01' }],
    };

    render(<TrainingProgressDashboard stats={emptyStats} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0-0-0')).toBeInTheDocument();
  });

  it('should handle empty weakness array', () => {
    const statsWithoutWeaknesses = {
      ...mockStats,
      weaknesses: [],
    };

    render(<TrainingProgressDashboard stats={statsWithoutWeaknesses} />);

    expect(screen.getByText('无明显弱点')).toBeInTheDocument();
  });

  it('should display style adaptation section', () => {
    render(<TrainingProgressDashboard stats={mockStats} />);

    expect(screen.getByText('风格适应度')).toBeInTheDocument();
  });

  it('should show ELO history section', () => {
    render(<TrainingProgressDashboard stats={mockStats} />);

    expect(screen.getByText('等级分走势')).toBeInTheDocument();
  });
});
