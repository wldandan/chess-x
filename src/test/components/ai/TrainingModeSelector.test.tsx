import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrainingModeSelector } from '@/components/ai/TrainingModeSelector';

describe('TrainingModeSelector', () => {
  it('should render all training modes', () => {
    render(<TrainingModeSelector onSelect={vi.fn()} />);

    expect(screen.getByText(/风格专项训练/i)).toBeInTheDocument();
    expect(screen.getByText(/混合风格挑战/i)).toBeInTheDocument();
    expect(screen.getByText(/弱点针对性训练/i)).toBeInTheDocument();
  });

  it('should display mode descriptions', () => {
    render(<TrainingModeSelector onSelect={vi.fn()} />);

    expect(screen.getByText(/适应特定棋风/i)).toBeInTheDocument();
    expect(screen.getByText(/全面应对能力/i)).toBeInTheDocument();
  });

  it('should call onSelect with mode when selected', () => {
    const onSelect = vi.fn();
    render(<TrainingModeSelector onSelect={onSelect} />);

    const styleMode = screen.getByTestId('mode-style');
    fireEvent.click(styleMode);

    expect(onSelect).toHaveBeenCalledWith('style-focused');
  });
});
