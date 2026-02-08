import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TrainingSetupPage } from '@/pages/TrainingSetupPage';
import { useGameStore } from '@/stores/game.store';

// Mock the game store
vi.mock('@/stores/game.store', () => ({
  useGameStore: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithRouter(component: React.ReactNode) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('TrainingSetupPage', () => {
  const mockStartTrainingSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockStartTrainingSession.mockClear();

    // Mock the store hook
    vi.mocked(useGameStore).mockImplementation((selector) => {
      const state = {
        startTrainingSession: mockStartTrainingSession,
      };
      // @ts-ignore - simple mock implementation
      return selector ? selector(state) : state;
    });
  });

  it('should render all configuration steps', () => {
    renderWithRouter(<TrainingSetupPage />);

    expect(screen.getByText(/选择AI对手风格/i)).toBeInTheDocument();
    expect(screen.getByText(/选择训练模式/i)).toBeInTheDocument();
    expect(screen.getByText(/难度设置/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /开始训练/i })).toBeInTheDocument();
  });

  it('should enable start button when all options are selected', async () => {
    renderWithRouter(<TrainingSetupPage />);

    const startButton = screen.getByRole('button', { name: /开始训练/i });
    expect(startButton).toBeDisabled();

    // Select profile, mode, and difficulty
    fireEvent.click(screen.getByTestId('profile-magnus_carlsen'));
    fireEvent.click(screen.getByTestId('mode-style'));

    const slider = screen.getByRole('slider');
    // Change slider value to enable button
    Object.defineProperty(slider, 'value', { writable: true, configurable: true });
    fireEvent.change(slider, { target: { value: '1500' } });

    await waitFor(() => {
      expect(startButton).not.toBeDisabled();
    });
  });

  it('should initialize training session when start is clicked', async () => {
    renderWithRouter(<TrainingSetupPage />);

    // Select all options
    fireEvent.click(screen.getByTestId('profile-magnus_carlsen'));
    fireEvent.click(screen.getByTestId('mode-style'));

    const slider = screen.getByRole('slider');
    Object.defineProperty(slider, 'value', { writable: true, configurable: true });
    fireEvent.change(slider, { target: { value: '1500' } });

    // Click start button
    await waitFor(() => {
      const startButton = screen.getByRole('button', { name: /开始训练/i });
      fireEvent.click(startButton);
    });

    expect(mockStartTrainingSession).toHaveBeenCalledWith(
      expect.objectContaining({
        playerProfileId: 'magnus_carlsen',
        mode: 'style-focused',
      })
    );
  });

  it('should navigate to training page after start', async () => {
    renderWithRouter(<TrainingSetupPage />);

    // Select all options
    fireEvent.click(screen.getByTestId('profile-magnus_carlsen'));
    fireEvent.click(screen.getByTestId('mode-style'));

    const slider = screen.getByRole('slider');
    Object.defineProperty(slider, 'value', { writable: true, configurable: true });
    fireEvent.change(slider, { target: { value: '1500' } });

    // Click start button
    await waitFor(() => {
      const startButton = screen.getByRole('button', { name: /开始训练/i });
      fireEvent.click(startButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/training');
  });
});
