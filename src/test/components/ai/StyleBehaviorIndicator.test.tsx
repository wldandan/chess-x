import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StyleBehaviorIndicator } from '@/components/ai/StyleBehaviorIndicator';
import type { GamePhase } from '@/types/chess.types';

describe('StyleBehaviorIndicator', () => {
  const defaultProps = {
    style: 'positional' as const,
    phase: 'middlegame' as GamePhase,
    lastMove: 'e2e4',
  };

  it('should display style-specific traits for positional style', () => {
    render(<StyleBehaviorIndicator {...defaultProps} />);

    expect(screen.getByText('稳健局面型')).toBeInTheDocument();
    expect(screen.getByText('注重长远规划')).toBeInTheDocument();
    expect(screen.getByText('结构优势')).toBeInTheDocument();
  });

  it('should show different traits for different styles', () => {
    const { rerender } = render(<StyleBehaviorIndicator {...defaultProps} />);
    expect(screen.getByText('稳健局面型')).toBeInTheDocument();

    rerender(<StyleBehaviorIndicator {...defaultProps} style="tactical" />);
    expect(screen.getByText('战术攻击型')).toBeInTheDocument();

    rerender(<StyleBehaviorIndicator {...defaultProps} style="solid" />);
    expect(screen.getByText('防守反击型')).toBeInTheDocument();

    rerender(<StyleBehaviorIndicator {...defaultProps} style="aggressive" />);
    expect(screen.getByText('进攻主导型')).toBeInTheDocument();

    rerender(<StyleBehaviorIndicator {...defaultProps} style="defensive" />);
    expect(screen.getByText('坚固防守型')).toBeInTheDocument();

    rerender(<StyleBehaviorIndicator {...defaultProps} style="technical" />);
    expect(screen.getByText('技术执行型')).toBeInTheDocument();
  });

  it('should adapt message based on game phase', () => {
    const { rerender } = render(<StyleBehaviorIndicator {...defaultProps} phase="opening" />);
    expect(screen.getByText(/开局阶段/)).toBeInTheDocument();

    rerender(<StyleBehaviorIndicator {...defaultProps} phase="middlegame" />);
    expect(screen.getByText(/中局阶段/)).toBeInTheDocument();

    rerender(<StyleBehaviorIndicator {...defaultProps} phase="endgame" />);
    expect(screen.getByText(/残局阶段/)).toBeInTheDocument();
  });

  it('should display last move', () => {
    render(<StyleBehaviorIndicator {...defaultProps} lastMove="Nf3" />);
    expect(screen.getByText('Nf3')).toBeInTheDocument();
  });

  it('should display phase badge', () => {
    render(<StyleBehaviorIndicator {...defaultProps} phase="middlegame" />);
    const phaseBadge = screen.getByText('中局');
    expect(phaseBadge).toBeInTheDocument();
    expect(phaseBadge).toHaveClass('phase-badge');
  });

  it('should have proper ARIA attributes for accessibility', () => {
    const { container } = render(<StyleBehaviorIndicator {...defaultProps} />);

    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
  });

  it('should be keyboard accessible', () => {
    const { container } = render(<StyleBehaviorIndicator {...defaultProps} />);

    const focusableElement = container.querySelector('[tabindex="0"]');
    expect(focusableElement).toBeInTheDocument();
  });

  it('should display all traits for positional style', () => {
    render(<StyleBehaviorIndicator {...defaultProps} style="positional" />);

    expect(screen.getByText('注重长远规划')).toBeInTheDocument();
    expect(screen.getByText('结构优势')).toBeInTheDocument();
    expect(screen.getByText('缓慢积累')).toBeInTheDocument();
  });

  it('should display all traits for tactical style', () => {
    render(<StyleBehaviorIndicator {...defaultProps} style="tactical" />);

    expect(screen.getByText('主动寻求复杂化')).toBeInTheDocument();
    expect(screen.getByText('战术敏锐')).toBeInTheDocument();
    expect(screen.getByText('攻王欲望')).toBeInTheDocument();
  });

  it('should display all traits for solid style', () => {
    render(<StyleBehaviorIndicator {...defaultProps} style="solid" />);

    expect(screen.getByText('稳健为先')).toBeInTheDocument();
    expect(screen.getByText('反击机会')).toBeInTheDocument();
    expect(screen.getByText('安全第一')).toBeInTheDocument();
  });

  it('should display all traits for aggressive style', () => {
    render(<StyleBehaviorIndicator {...defaultProps} style="aggressive" />);

    expect(screen.getByText('弃子求攻')).toBeInTheDocument();
    expect(screen.getByText('主导进攻')).toBeInTheDocument();
    expect(screen.getByText('制造混乱')).toBeInTheDocument();
  });

  it('should display all traits for defensive style', () => {
    render(<StyleBehaviorIndicator {...defaultProps} style="defensive" />);

    expect(screen.getByText('被动防守')).toBeInTheDocument();
    expect(screen.getByText('化解压力')).toBeInTheDocument();
    expect(screen.getByText('求稳求和')).toBeInTheDocument();
  });

  it('should display all traits for technical style', () => {
    render(<StyleBehaviorIndicator {...defaultProps} style="technical" />);

    expect(screen.getByText('精确计算')).toBeInTheDocument();
    expect(screen.getByText('局面评估')).toBeInTheDocument();
    expect(screen.getByText('执行到位')).toBeInTheDocument();
  });
});
