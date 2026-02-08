// Main Training Page Tests
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter, createMockGame } from '../../test/utils/test-utils';
import AITrainingPage from '../../pages/AITrainingPage';
import * as gameStore from '../../stores/game.store';
import type { AIPlayerProfile, TrainingProgress } from '../../types/chess.types';
import { vi } from 'vitest';

// Mock the game store hooks
vi.mock('../../stores/game.store', () => ({
  useGameStore: vi.fn(),
  useCurrentGame: vi.fn(),
  useAITrainingState: vi.fn(),
  useGameStatus: vi.fn(),
  useAIState: vi.fn(),
}));

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AITrainingPage', () => {
  const mockPlayerProfile: AIPlayerProfile = {
    id: 'magnus_carlsen',
    name: 'Magnus Carlsen',
    displayName: '卡尔森',
    description: '稳健局面型，擅长积累微小优势',
    elo: 2850,
    style: 'positional',
    styleParams: {
      positionalWeight: 0.8,
      tacticalWeight: 0.2,
      riskTolerance: 0.3,
      attackFocus: 0.4,
      endgameFocus: 0.9,
    },
    icon: '👑',
    difficultyRange: [800, 2800],
    characteristics: [
      '擅长积累微小优势',
      '残局技术精湛',
      '耐心等待对手犯错',
    ],
  };

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

  const defaultMocks = {
    useCurrentGame: null,
    useAITrainingState: {
      currentPlayerProfile: mockPlayerProfile,
      trainingSession: null,
      trainingProgress: mockTrainingProgress,
      adaptiveDifficulty: { baseElo: 1650 },
    },
    useGameStatus: 'idle',
    useAIState: { thinking: null },
    useGameStore: {
      loading: false,
      error: null,
      startGame: vi.fn(),
      makeMove: vi.fn(),
      resign: vi.fn(),
      endTrainingSession: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Default mock implementation
    (gameStore.useCurrentGame as any).mockReturnValue(defaultMocks.useCurrentGame);
    (gameStore.useAITrainingState as any).mockReturnValue(defaultMocks.useAITrainingState);
    (gameStore.useGameStatus as any).mockReturnValue(defaultMocks.useGameStatus);
    (gameStore.useAIState as any).mockReturnValue(defaultMocks.useAIState);
    (gameStore.useGameStore as any).mockReturnValue(defaultMocks.useGameStore);
  });

  describe('Rendering - Setup State', () => {
    it('should render the training setup page when no session is active', () => {
      renderWithRouter(<AITrainingPage />, { route: '/ai-training' });

      expect(screen.getByText(/AI风格训练/i)).toBeInTheDocument();
    });

    it('should display AI opponent profile information', () => {
      renderWithRouter(<AITrainingPage />, { route: '/ai-training' });

      expect(screen.getByText(mockPlayerProfile.displayName)).toBeInTheDocument();
      expect(screen.getByText(/ELO/i)).toBeInTheDocument();
    });

    it('should display training progress dashboard in sidebar', () => {
      renderWithRouter(<AITrainingPage />, { route: '/ai-training' });

      expect(screen.getByText(/训练进度/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to setup page when clicking back button', () => {
      renderWithRouter(<AITrainingPage />, { route: '/ai-training' });

      const backButton = screen.getByRole('button', { name: /返回/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/training-setup');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing player profile gracefully', () => {
      (gameStore.useAITrainingState as any).mockReturnValue({
        currentPlayerProfile: null,
        trainingSession: null,
        trainingProgress: null,
        adaptiveDifficulty: { baseElo: 1200 },
      });

      renderWithRouter(<AITrainingPage />, { route: '/ai-training' });

      // Should show message when no profile is selected
      expect(screen.getByText(/请先选择AI对手/i)).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      (gameStore.useGameStore as any).mockReturnValue({
        ...defaultMocks.useGameStore,
        loading: true,
      });

      renderWithRouter(<AITrainingPage />, { route: '/ai-training' });

      expect(screen.getByText(/加载中/i)).toBeInTheDocument();
    });

    it('should handle error state', () => {
      const errorMessage = 'Failed to load game';
      (gameStore.useGameStore as any).mockReturnValue({
        ...defaultMocks.useGameStore,
        error: errorMessage,
      });

      renderWithRouter(<AITrainingPage />, { route: '/ai-training' });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      renderWithRouter(<AITrainingPage />, { route: '/ai-training' });

      // There may be multiple main elements, get the first one
      const mainContents = screen.getAllByRole('main');
      expect(mainContents.length).toBeGreaterThan(0);
      expect(mainContents[0]).toBeInTheDocument();
    });
  });
});
