import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerProfileSelector } from '@/components/ai/PlayerProfileSelector';

describe('PlayerProfileSelector', () => {
  it('should render all available player profiles', () => {
    render(<PlayerProfileSelector onSelect={vi.fn()} />);

    expect(screen.getByText(/Magnus Carlsen/i)).toBeInTheDocument();
    expect(screen.getByText(/Garry Kasparov/i)).toBeInTheDocument();
    expect(screen.getByText(/Fabiano Caruana/i)).toBeInTheDocument();
    expect(screen.getByText(/Ding Liren/i)).toBeInTheDocument();
  });

  it('should call onSelect with profile ID when profile is clicked', () => {
    const onSelect = vi.fn();
    render(<PlayerProfileSelector onSelect={onSelect} />);

    const carlsenCard = screen.getByTestId('profile-magnus_carlsen');
    fireEvent.click(carlsenCard);

    expect(onSelect).toHaveBeenCalledWith('magnus_carlsen');
  });

  it('should highlight selected profile', () => {
    render(<PlayerProfileSelector onSelect={vi.fn()} selectedId="magnus_carlsen" />);

    const carlsenCard = screen.getByTestId('profile-magnus_carlsen');
    expect(carlsenCard).toHaveClass('selected');
  });
});
