import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '@/stores/game.store';
import type { AIPlayerProfile, TrainingSessionConfig, TrainingProgress } from '@/types/chess.types';
import { playerProfiles } from '@/data/playerProfiles';

describe('GameStore - Style Training Support', () => {
  beforeEach(() => {
    // Reset store state before each test
    vi.clearAllMocks();
    // Reset to initial state by setting null values
    // Note: Don't reset playerProfiles to empty since selectPlayerProfile uses imported defaultPlayerProfiles
    useGameStore.setState({
      currentPlayerProfile: null,
      trainingSession: null,
      trainingProgress: null,
      // playerProfiles is managed by loadPlayerProfiles, not reset here
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
      }
    });
  });

  describe('startTrainingSession', () => {
    it('should initialize training session with profile', () => {
      const store = useGameStore.getState();

      // First select a profile
      store.selectPlayerProfile('magnus_carlsen');

      const config: TrainingSessionConfig = {
        playerProfileId: 'magnus_carlsen',
        targetElo: 1500,
        adaptiveMode: true,
        sessionLength: 5,
        focusAreas: ['positional', 'endgame']
      };

      store.startTrainingSession(config);

      const state = useGameStore.getState();

      expect(state.trainingSession).toBeDefined();
      expect(state.trainingSession?.playerProfileId).toBe('magnus_carlsen');
      expect(state.trainingSession?.targetElo).toBe(1500);
      expect(state.trainingSession?.adaptiveMode).toBe(true);
      expect(state.trainingSession?.sessionLength).toBe(5);
      expect(state.trainingSession?.startedAt).toBeInstanceOf(Date);
    });

    it('should create initial training progress', () => {
      const store = useGameStore.getState();

      store.selectPlayerProfile('garry_kasparov');

      const config: TrainingSessionConfig = {
        playerProfileId: 'garry_kasparov',
        targetElo: 1800,
        adaptiveMode: false,
        sessionLength: 10,
        focusAreas: ['tactical']
      };

      store.startTrainingSession(config);

      const state = useGameStore.getState();

      expect(state.trainingProgress).toBeDefined();
      expect(state.trainingProgress?.gamesPlayed).toBe(0);
      expect(state.trainingProgress?.gamesWon).toBe(0);
      expect(state.trainingProgress?.gamesDrawn).toBe(0);
      expect(state.trainingProgress?.gamesLost).toBe(0);
      expect(state.trainingProgress?.playerProfileId).toBe('garry_kasparov');
      expect(state.trainingProgress?.sessionId).toMatch(/^session_\d+$/);
      expect(state.trainingProgress?.createdAt).toBeInstanceOf(Date);
    });

    it('should update adaptive difficulty base ELO', () => {
      const store = useGameStore.getState();

      store.selectPlayerProfile('fabiano_caruana');

      const targetElo = 2000;
      const config: TrainingSessionConfig = {
        playerProfileId: 'fabiano_caruana',
        targetElo,
        adaptiveMode: true,
        sessionLength: 8,
        focusAreas: ['opening']
      };

      store.startTrainingSession(config);

      const state = useGameStore.getState();

      expect(state.adaptiveDifficulty.baseElo).toBe(targetElo);
    });

    it('should throw error when no profile is selected', () => {
      const store = useGameStore.getState();

      const config: TrainingSessionConfig = {
        playerProfileId: 'magnus_carlsen',
        targetElo: 1500,
        adaptiveMode: true,
        sessionLength: 5,
        focusAreas: []
      };

      // Don't select a profile first
      expect(() => store.startTrainingSession(config)).toThrow('请先选择棋手配置');
    });

    it('should preserve existing adaptive difficulty settings', () => {
      const store = useGameStore.getState();

      store.selectPlayerProfile('ding_liren');

      const initialAdaptive = {
        ...store.adaptiveDifficulty,
        baseElo: 1400,
        adjustmentRate: 0.5
      };

      useGameStore.setState({ adaptiveDifficulty: initialAdaptive });

      const config: TrainingSessionConfig = {
        playerProfileId: 'ding_liren',
        targetElo: 1600,
        adaptiveMode: true,
        sessionLength: 5,
        focusAreas: []
      };

      store.startTrainingSession(config);

      const state = useGameStore.getState();

      expect(state.adaptiveDifficulty.adjustmentRate).toBe(0.5);
      expect(state.adaptiveDifficulty.baseElo).toBe(1600);
      expect(state.adaptiveDifficulty.minElo).toBe(initialAdaptive.minElo);
      expect(state.adaptiveDifficulty.maxElo).toBe(initialAdaptive.maxElo);
    });
  });

  describe('updateAdaptiveDifficulty', () => {
    beforeEach(() => {
      const store = useGameStore.getState();
      store.selectPlayerProfile('magnus_carlsen');
      store.startTrainingSession({
        playerProfileId: 'magnus_carlsen',
        targetElo: 1500,
        adaptiveMode: true,
        sessionLength: 5,
        focusAreas: []
      });
    });

    it('should decrease ELO after win', () => {
      const store = useGameStore.getState();
      const initialElo = store.adaptiveDifficulty.baseElo;

      store.updateAdaptiveDifficulty('win');

      const state = useGameStore.getState();

      expect(state.adaptiveDifficulty.baseElo).toBeLessThan(initialElo);
    });

    it('should increase ELO after loss', () => {
      const store = useGameStore.getState();
      const initialElo = store.adaptiveDifficulty.baseElo;

      store.updateAdaptiveDifficulty('loss');

      const state = useGameStore.getState();

      expect(state.adaptiveDifficulty.baseElo).toBeGreaterThan(initialElo);
    });

    it('should keep ELO similar after draw', () => {
      const store = useGameStore.getState();
      const initialElo = store.adaptiveDifficulty.baseElo;

      store.updateAdaptiveDifficulty('draw');

      const state = useGameStore.getState();

      // Draw should have minimal impact
      expect(Math.abs(state.adaptiveDifficulty.baseElo - initialElo)).toBeLessThan(10);
    });

    it('should respect ELO bounds', () => {
      const store = useGameStore.getState();

      // Set to minimum
      useGameStore.setState({
        adaptiveDifficulty: {
          ...store.adaptiveDifficulty,
          baseElo: 800
        }
      });

      store.updateAdaptiveDifficulty('win');

      let state = useGameStore.getState();
      expect(state.adaptiveDifficulty.baseElo).toBeGreaterThanOrEqual(800);

      // Set to maximum
      useGameStore.setState({
        adaptiveDifficulty: {
          ...state.adaptiveDifficulty,
          baseElo: 2800
        }
      });

      store.updateAdaptiveDifficulty('loss');

      state = useGameStore.getState();
      expect(state.adaptiveDifficulty.baseElo).toBeLessThanOrEqual(2800);
    });

    it('should adjust based on game quality', () => {
      const store = useGameStore.getState();
      const initialElo = store.adaptiveDifficulty.baseElo;

      // Good quality win should decrease more
      store.updateAdaptiveDifficulty('win', 0.8);

      let state = useGameStore.getState();
      const goodQualityDecrease = initialElo - state.adaptiveDifficulty.baseElo;

      // Reset
      useGameStore.setState({
        adaptiveDifficulty: {
          ...state.adaptiveDifficulty,
          baseElo: initialElo
        }
      });

      // Poor quality win should decrease less
      store.updateAdaptiveDifficulty('win', 0.2);

      state = useGameStore.getState();
      const poorQualityDecrease = initialElo - state.adaptiveDifficulty.baseElo;

      expect(goodQualityDecrease).toBeGreaterThan(poorQualityDecrease);
    });

    it('should update training progress ELO change', () => {
      const store = useGameStore.getState();
      const initialElo = store.adaptiveDifficulty.baseElo;

      store.updateAdaptiveDifficulty('win');

      const state = useGameStore.getState();

      expect(state.trainingProgress).toBeDefined();
      expect(state.trainingProgress?.eloChange).toBeLessThan(0);
      expect(state.trainingProgress?.eloChange).toBe(state.adaptiveDifficulty.baseElo - initialElo);
      expect(state.trainingProgress?.updatedAt).toBeInstanceOf(Date);
    });

    it('should work without training progress', () => {
      const store = useGameStore.getState();

      // Clear training progress
      useGameStore.setState({ trainingProgress: null });

      const initialElo = store.adaptiveDifficulty.baseElo;

      expect(() => store.updateAdaptiveDifficulty('loss')).not.toThrow();

      const state = useGameStore.getState();
      expect(state.adaptiveDifficulty.baseElo).toBeGreaterThan(initialElo);
      expect(state.trainingProgress).toBeNull();
    });
  });

  describe('switchToNextStyle', () => {
    beforeEach(() => {
      const store = useGameStore.getState();
      store.loadPlayerProfiles();
    });

    it('should switch to a different profile in mixed mode', () => {
      const store = useGameStore.getState();

      // Start with Magnus
      store.selectPlayerProfile('magnus_carlsen');

      const initialProfileId = store.currentPlayerProfile?.id;

      store.switchToNextStyle();

      const state = useGameStore.getState();

      expect(state.currentPlayerProfile).toBeDefined();
      expect(state.currentPlayerProfile?.id).not.toBe(initialProfileId);
    });

    it('should not switch to the same profile', async () => {
      const store = useGameStore.getState();

      // Load profiles into state first
      await store.loadPlayerProfiles();
      store.selectPlayerProfile('garry_kasparov');

      // Verify profile was selected
      const state = useGameStore.getState();
      expect(state.currentPlayerProfile?.id).toBe('garry_kasparov');

      // Try multiple times to ensure it doesn't switch back immediately
      for (let i = 0; i < 10; i++) {
        const previousId = useGameStore.getState().currentPlayerProfile?.id;
        store.switchToNextStyle();
        const newId = useGameStore.getState().currentPlayerProfile?.id;

        expect(newId).toBeDefined();
        expect(newId).not.toBe(previousId);
      }
    });

    it('should select from available profiles', async () => {
      const store = useGameStore.getState();

      // Load profiles into state first
      await store.loadPlayerProfiles();
      store.selectPlayerProfile('fabiano_caruana');

      const allProfileIds = playerProfiles.map(p => p.id);

      // Switch several times and verify all selections are from the available profiles
      for (let i = 0; i < 10; i++) {
        store.switchToNextStyle();
        const currentId = useGameStore.getState().currentPlayerProfile?.id;
        expect(currentId).toBeDefined();
        expect(allProfileIds).toContain(currentId);
      }
    });

    it('should cycle through all profiles eventually', async () => {
      const store = useGameStore.getState();

      // Load profiles into state first
      await store.loadPlayerProfiles();
      store.selectPlayerProfile('ding_liren');

      const seenProfiles = new Set<string>();

      // Switch many times to see all profiles
      for (let i = 0; i < 20; i++) {
        store.switchToNextStyle();
        const currentProfile = useGameStore.getState().currentPlayerProfile;
        if (currentProfile) {
          seenProfiles.add(currentProfile.id);
        }
      }

      // Should have seen at least 3 different profiles
      expect(seenProfiles.size).toBeGreaterThanOrEqual(3);
    });

    it('should work when only one profile is available', () => {
      const store = useGameStore.getState();

      // Filter to only one profile
      const singleProfile = [playerProfiles[0]];
      useGameStore.setState({ playerProfiles: singleProfile });

      store.selectPlayerProfile(singleProfile[0].id);

      // Should not throw even with only one profile
      expect(() => store.switchToNextStyle()).not.toThrow();

      const state = useGameStore.getState();
      expect(state.currentPlayerProfile).toBeDefined();
    });

    it('should handle empty profile list gracefully', () => {
      const store = useGameStore.getState();

      useGameStore.setState({
        playerProfiles: [],
        currentPlayerProfile: null
      });

      // Should not throw
      expect(() => store.switchToNextStyle()).not.toThrow();

      const state = useGameStore.getState();
      expect(state.currentPlayerProfile).toBeNull();
    });

    it('should maintain training session when switching styles', () => {
      const store = useGameStore.getState();

      store.selectPlayerProfile('magnus_carlsen');

      store.startTrainingSession({
        playerProfileId: 'magnus_carlsen',
        targetElo: 1500,
        adaptiveMode: true,
        sessionLength: 5,
        focusAreas: []
      });

      const sessionBefore = store.trainingSession;

      store.switchToNextStyle();

      const state = useGameStore.getState();

      // Training session should remain, but profile should change
      expect(state.trainingSession).toBeDefined();
      expect(state.currentPlayerProfile?.id).not.toBe('magnus_carlsen');
      // Note: The training session itself is not updated, which is expected
      // as switching styles mid-session is for mixed mode training
    });
  });

  describe('Integration tests', () => {
    it('should handle complete training workflow', async () => {
      const store = useGameStore.getState();

      // Load profiles first
      await store.loadPlayerProfiles();

      // 1. Select profile
      store.selectPlayerProfile('magnus_carlsen');

      // Verify selection using getState()
      expect(useGameStore.getState().currentPlayerProfile?.id).toBe('magnus_carlsen');

      // 2. Start training session
      store.startTrainingSession({
        playerProfileId: 'magnus_carlsen',
        targetElo: 1500,
        adaptiveMode: true,
        sessionLength: 5,
        focusAreas: ['positional']
      });

      expect(useGameStore.getState().trainingSession).toBeDefined();
      expect(useGameStore.getState().trainingProgress).toBeDefined();

      // 3. Simulate some games and update difficulty
      const initialElo = useGameStore.getState().adaptiveDifficulty.baseElo;

      store.updateAdaptiveDifficulty('win');
      const afterWin = useGameStore.getState().adaptiveDifficulty.baseElo;
      expect(afterWin).toBeLessThan(initialElo);

      store.updateAdaptiveDifficulty('loss');
      const afterLoss = useGameStore.getState().adaptiveDifficulty.baseElo;
      expect(afterLoss).toBeGreaterThan(afterWin);

      // 4. Switch to next style
      store.switchToNextStyle();
      expect(useGameStore.getState().currentPlayerProfile?.id).not.toBe('magnus_carlsen');

      // 5. Verify state consistency
      const state = useGameStore.getState();
      expect(state.trainingProgress?.gamesPlayed).toBe(0); // No games actually played
      expect(state.trainingProgress?.eloChange).not.toBe(0);
    });

    it('should handle multiple training sessions', async () => {
      const store = useGameStore.getState();

      // Load profiles first
      await store.loadPlayerProfiles();

      // First session
      store.selectPlayerProfile('garry_kasparov');
      store.startTrainingSession({
        playerProfileId: 'garry_kasparov',
        targetElo: 1600,
        adaptiveMode: true,
        sessionLength: 3,
        focusAreas: ['tactical']
      });

      const firstSessionId = store.trainingSession?.playerProfileId;

      // End first session
      store.endTrainingSession();

      // Start second session
      store.selectPlayerProfile('fabiano_caruana');
      store.startTrainingSession({
        playerProfileId: 'fabiano_caruana',
        targetElo: 1700,
        adaptiveMode: true,
        sessionLength: 5,
        focusAreas: ['positional']
      });

      const state = useGameStore.getState();

      expect(state.trainingSession?.playerProfileId).not.toBe(firstSessionId);
      expect(state.trainingSession?.playerProfileId).toBe('fabiano_caruana');
    });
  });
});
