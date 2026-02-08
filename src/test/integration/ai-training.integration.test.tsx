// Integration Test: AI Training Workflow
// Tests the complete flow from training setup to active training session

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { TrainingSetupPage } from '@/pages/TrainingSetupPage';
import { AITrainingPage } from '@/pages/AITrainingPage';
import { useGameStore } from '@/stores/game.store';

// Mock the game store
const mockStartTrainingSession = vi.fn();
const mockSetCurrentPlayerProfile = vi.fn();
const mockSetTrainingSession = vi.fn();

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

describe('AI Training Integration Tests', () => {
  const defaultStoreState = {
    loading: false,
    error: null,
    currentPlayerProfile: null,
    trainingSession: null,
    trainingProgress: null,
    playerProfiles: [],
    adaptiveDifficulty: {
      baseElo: 1200,
      adjustmentRate: 0.3,
      minElo: 800,
      maxElo: 2800,
      performanceThresholds: {
        win: 0.4,
        draw: 0.3,
        loss: 0.6
      },
      consistencyThreshold: 0.7
    },
    startTrainingSession: mockStartTrainingSession,
    setCurrentPlayerProfile: mockSetCurrentPlayerProfile,
    setTrainingSession: mockSetTrainingSession,
    initializeAI: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockStartTrainingSession.mockClear();
    mockSetCurrentPlayerProfile.mockClear();
    mockSetTrainingSession.mockClear();

    // Mock the store hook
    vi.mocked(useGameStore).mockImplementation((selector) => {
      const state = { ...defaultStoreState };
      // @ts-ignore - simple mock implementation
      return selector ? selector(state) : state;
    });
  });

  describe('Complete Training Workflow', () => {
    it('should navigate from setup to training page with full configuration', async () => {
      // Step 1: Render training setup page
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
            <Route path="/training" element={<AITrainingPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Step 2: Verify setup page loads
      expect(screen.getByText(/选择AI对手风格/i)).toBeInTheDocument();
      expect(screen.getByText(/选择训练模式/i)).toBeInTheDocument();
      expect(screen.getByText(/难度设置/i)).toBeInTheDocument();

      // Step 3: Select player profile (Magnus Carlsen)
      const magnusProfile = screen.getByTestId('profile-magnus_carlsen');
      expect(magnusProfile).toBeInTheDocument();
      fireEvent.click(magnusProfile);

      // Step 4: Select training mode (Style-focused)
      const styleMode = screen.getByTestId('mode-style');
      expect(styleMode).toBeInTheDocument();
      fireEvent.click(styleMode);

      // Step 5: Set difficulty level (1500 ELO)
      const slider = screen.getByRole('slider', { name: /ELO等级分选择/i });
      expect(slider).toBeInTheDocument();

      // Update slider value programmatically
      Object.defineProperty(slider, 'value', { writable: true, configurable: true });
      fireEvent.change(slider, { target: { value: '1500' } });

      // Step 6: Verify start button becomes enabled
      const startButton = screen.getByRole('button', { name: /开始训练/i });
      await waitFor(() => {
        expect(startButton).not.toBeDisabled();
      });

      // Step 7: Click start button
      fireEvent.click(startButton);

      // Step 8: Verify training session was initialized with correct config
      await waitFor(() => {
        expect(mockStartTrainingSession).toHaveBeenCalledTimes(1);
        expect(mockStartTrainingSession).toHaveBeenCalledWith(
          expect.objectContaining({
            playerProfileId: 'magnus_carlsen',
            mode: 'style-focused',
            baseDifficulty: expect.objectContaining({
              elo: expect.any(Number)
            })
          })
        );
      });

      // Step 9: Verify navigation to training page
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/training');
      });
    });

    it('should handle different training modes correctly', async () => {
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
            <Route path="/training" element={<AITrainingPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Select Mixed Challenge mode
      fireEvent.click(screen.getByTestId('profile-garry_kasparov'));
      fireEvent.click(screen.getByTestId('mode-mixed'));

      const slider = screen.getByRole('slider', { name: /ELO等级分选择/i });
      Object.defineProperty(slider, 'value', { writable: true, configurable: true });
      fireEvent.change(slider, { target: { value: '1800' } });

      const startButton = screen.getByRole('button', { name: /开始训练/i });
      await waitFor(() => {
        expect(startButton).not.toBeDisabled();
      });

      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockStartTrainingSession).toHaveBeenCalledWith(
          expect.objectContaining({
            playerProfileId: 'garry_kasparov',
            mode: 'mixed-challenge',
          })
        );
      });
    });

    it('should validate all required selections before enabling start button', async () => {
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
          </Routes>
        </MemoryRouter>
      );

      const startButton = screen.getByRole('button', { name: /开始训练/i });

      // Initially disabled - no selections
      expect(startButton).toBeDisabled();

      // Select profile only - still disabled
      fireEvent.click(screen.getByTestId('profile-magnus_carlsen'));
      await waitFor(() => {
        expect(startButton).toBeDisabled();
      });

      // Select mode - still disabled (no difficulty)
      fireEvent.click(screen.getByTestId('mode-style'));
      await waitFor(() => {
        expect(startButton).toBeDisabled();
      });

      // Set difficulty - now enabled
      const slider = screen.getByRole('slider', { name: /ELO等级分选择/i });
      Object.defineProperty(slider, 'value', { writable: true, configurable: true });
      fireEvent.change(slider, { target: { value: '1500' } });

      await waitFor(() => {
        expect(startButton).not.toBeDisabled();
      });
    });
  });

  describe('Profile Selection Workflow', () => {
    it('should display all available player profiles', async () => {
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify key profiles are available
      expect(screen.getByTestId('profile-magnus_carlsen')).toBeInTheDocument();
      expect(screen.getByTestId('profile-garry_kasparov')).toBeInTheDocument();
      expect(screen.getByTestId('profile-fabiano_caruana')).toBeInTheDocument();
      expect(screen.getByTestId('profile-ding_liren')).toBeInTheDocument();

      // Verify profile information is displayed
      expect(screen.getByText(/卡尔森/i)).toBeInTheDocument();
      expect(screen.getByText(/卡斯帕罗夫/i)).toBeInTheDocument();
      expect(screen.getByText(/卡鲁阿纳/i)).toBeInTheDocument();
      expect(screen.getByText(/丁立人/i)).toBeInTheDocument();
    });

    it('should allow switching between profiles', async () => {
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Select Magnus Carlsen
      fireEvent.click(screen.getByTestId('profile-magnus_carlsen'));
      expect(screen.getByTestId('profile-magnus_carlsen')).toHaveClass('selected');

      // Switch to Garry Kasparov
      fireEvent.click(screen.getByTestId('profile-garry_kasparov'));
      expect(screen.getByTestId('profile-garry_kasparov')).toHaveClass('selected');
      expect(screen.getByTestId('profile-magnus_carlsen')).not.toHaveClass('selected');
    });
  });

  describe('Training Mode Selection Workflow', () => {
    it('should display all training modes with descriptions', async () => {
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify all modes are present
      expect(screen.getByTestId('mode-style')).toBeInTheDocument();
      expect(screen.getByTestId('mode-mixed')).toBeInTheDocument();
      expect(screen.getByTestId('mode-weakness')).toBeInTheDocument();

      // Verify mode descriptions
      expect(screen.getByText(/风格专项训练/i)).toBeInTheDocument();
      expect(screen.getByText(/混合风格挑战/i)).toBeInTheDocument();
      expect(screen.getByText(/弱点针对性训练/i)).toBeInTheDocument();
    });

    it('should update mode description when different mode is selected', async () => {
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Select style mode
      fireEvent.click(screen.getByTestId('mode-style'));
      expect(screen.getByText(/适应特定棋风，建议5-10局连续对弈/i)).toBeInTheDocument();

      // Switch to mixed challenge mode
      fireEvent.click(screen.getByTestId('mode-mixed'));
      expect(screen.getByText(/随机切换不同风格AI，全面应对能力/i)).toBeInTheDocument();
    });
  });

  describe('Difficulty Configuration Workflow', () => {
    it('should allow setting difficulty within valid range', async () => {
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
          </Routes>
        </MemoryRouter>
      );

      const slider = screen.getByRole('slider', { name: /ELO等级分选择/i });

      // Test minimum value
      Object.defineProperty(slider, 'value', { writable: true, configurable: true });
      fireEvent.change(slider, { target: { value: '800' } });
      expect(slider).toHaveAttribute('value', '800');

      // Test maximum value
      fireEvent.change(slider, { target: { value: '2800' } });
      expect(slider).toHaveAttribute('value', '2800');

      // Test mid-range value
      fireEvent.change(slider, { target: { value: '1800' } });
      expect(slider).toHaveAttribute('value', '1800');
    });

    it('should display difficulty level indicators', async () => {
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify difficulty section is shown
      expect(screen.getByText(/难度设置/i)).toBeInTheDocument();

      // Verify slider is present with proper attributes
      const slider = screen.getByRole('slider', { name: /ELO等级分选择/i });
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('aria-valuemin', '800');
      expect(slider).toHaveAttribute('aria-valuemax', '2800');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle training session initialization failure gracefully', async () => {
      // Mock failure scenario
      mockStartTrainingSession.mockRejectedValueOnce(new Error('Failed to initialize session'));

      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Complete setup
      fireEvent.click(screen.getByTestId('profile-magnus_carlsen'));
      fireEvent.click(screen.getByTestId('mode-style'));

      const slider = screen.getByRole('slider', { name: /ELO等级分选择/i });
      Object.defineProperty(slider, 'value', { writable: true, configurable: true });
      fireEvent.change(slider, { target: { value: '1500' } });

      // Try to start training
      const startButton = screen.getByRole('button', { name: /开始训练/i });
      fireEvent.click(startButton);

      // Verify the session initialization was attempted
      await waitFor(() => {
        expect(mockStartTrainingSession).toHaveBeenCalled();
      });
    });

    it('should prevent navigation without completing setup', async () => {
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
          </Routes>
        </MemoryRouter>
      );

      const startButton = screen.getByRole('button', { name: /开始训练/i });

      // Verify button is disabled without complete setup
      expect(startButton).toBeDisabled();

      // Verify navigation doesn't happen
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility and UX', () => {
    it('should have proper keyboard navigation support', async () => {
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify all interactive elements are focusable
      const profiles = screen.getAllByTestId(/profile-/);
      profiles.forEach(profile => {
        expect(profile).toHaveAttribute('role', 'button');
      });

      const modes = screen.getAllByTestId(/mode-/);
      modes.forEach(mode => {
        expect(mode).toHaveAttribute('role', 'button');
      });

      expect(screen.getByRole('slider')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /开始训练/i })).toBeInTheDocument();
    });

    it('should provide clear visual feedback for selections', async () => {
      render(
        <MemoryRouter initialEntries={['/training-setup']}>
          <Routes>
            <Route path="/training-setup" element={<TrainingSetupPage />} />
          </Routes>
        </MemoryRouter>
      );

      const profile = screen.getByTestId('profile-magnus_carlsen');

      // Before selection
      expect(profile).not.toHaveClass('selected');

      // After selection
      fireEvent.click(profile);
      await waitFor(() => {
        expect(profile).toHaveClass('selected');
      });
    });
  });
});
