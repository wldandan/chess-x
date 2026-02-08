import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DifficultySlider } from '@/components/ai/DifficultySlider';

describe('DifficultySlider', () => {
  it('should render with default ELO range', () => {
    render(<DifficultySlider value={1200} onChange={vi.fn()} />);

    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getByText('2800')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1200')).toBeInTheDocument();
  });

  it('should call onChange when slider value changes', () => {
    const onChange = vi.fn();
    render(<DifficultySlider value={1200} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '1500' } });

    expect(onChange).toHaveBeenCalledWith(1500);
  });

  it('should display difficulty label based on ELO', () => {
    const { rerender } = render(<DifficultySlider value={1000} onChange={vi.fn()} />);
    expect(screen.getByText(/初学者 \(800-1200\)/)).toBeInTheDocument();

    rerender(<DifficultySlider value={1500} onChange={vi.fn()} />);
    expect(screen.getByText(/中级 \(1200-1800\)/)).toBeInTheDocument();

    rerender(<DifficultySlider value={2000} onChange={vi.fn()} />);
    expect(screen.getByText(/高级 \(1800-2200\)/)).toBeInTheDocument();

    rerender(<DifficultySlider value="adaptive" onChange={vi.fn()} />);
    expect(screen.getByText('自适应模式')).toBeInTheDocument();
  });
});
