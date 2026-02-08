import { describe, it, expect } from 'vitest';
import { PlayerStyleEngine } from '@/services/ai/PlayerStyleEngine';
import type { StyleParameters, AIPlayerProfile } from '@/types/chess.types';

describe('PlayerStyleEngine', () => {
  describe('toUCICommands', () => {
    it('should convert StockfishConfig to UCI command array', () => {
      const styleParams: StyleParameters = {
        positionalWeight: 0.6,
        tacticalWeight: 0.4,
        riskTolerance: 0.5,
        attackFocus: 0.5,
        endgameFocus: 0.5
      };

      const config = PlayerStyleEngine.mapStyleToStockfishConfig(styleParams, 1500, 'middlegame');
      const commands = PlayerStyleEngine.toUCICommands(config);

      expect(commands).toBeInstanceOf(Array);
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.some(cmd => cmd.includes('setoption name Skill Level value'))).toBe(true);
      expect(commands.some(cmd => cmd.includes('setoption name Contempt value'))).toBe(true);
    });

    it('should include skill level command', () => {
      const styleParams: StyleParameters = {
        positionalWeight: 0.6,
        tacticalWeight: 0.4,
        riskTolerance: 0.5,
        attackFocus: 0.5,
        endgameFocus: 0.5
      };

      const config = PlayerStyleEngine.mapStyleToStockfishConfig(styleParams, 1500);
      const commands = PlayerStyleEngine.toUCICommands(config);

      const skillCommand = commands.find(cmd => cmd.includes('Skill Level'));
      expect(skillCommand).toBeDefined();
      expect(skillCommand).toMatch(/Skill Level value \d+/);
    });

    it('should include contempt command', () => {
      const styleParams: StyleParameters = {
        positionalWeight: 0.6,
        tacticalWeight: 0.4,
        riskTolerance: 0.5,
        attackFocus: 0.5,
        endgameFocus: 0.5
      };

      const config = PlayerStyleEngine.mapStyleToStockfishConfig(styleParams, 1500);
      const commands = PlayerStyleEngine.toUCICommands(config);

      const contemptCommand = commands.find(cmd => cmd.includes('Contempt'));
      expect(contemptCommand).toBeDefined();
      expect(contemptCommand).toMatch(/Contempt value -?\d+/);
    });

    it('should respect minimum and maximum UCI values', () => {
      const styleParams: StyleParameters = {
        positionalWeight: 0.6,
        tacticalWeight: 0.4,
        riskTolerance: 0.5,
        attackFocus: 0.5,
        endgameFocus: 0.5
      };

      // Test minimum ELO
      const minConfig = PlayerStyleEngine.mapStyleToStockfishConfig(styleParams, 800);
      const minCommands = PlayerStyleEngine.toUCICommands(minConfig);
      const minSkillCmd = minCommands.find(cmd => cmd.includes('Skill Level'));
      expect(minSkillCmd).toMatch(/value [0-4]/);

      // Test maximum ELO
      const maxConfig = PlayerStyleEngine.mapStyleToStockfishConfig(styleParams, 2800);
      const maxCommands = PlayerStyleEngine.toUCICommands(maxConfig);
      const maxSkillCmd = maxCommands.find(cmd => cmd.includes('Skill Level'));
      expect(maxSkillCmd).toMatch(/value 1[7-9]|20/);
    });
  });

  describe('getContemptValue', () => {
    it('should calculate contempt based on risk tolerance', () => {
      // High risk tolerance = lower contempt
      const contempt1 = PlayerStyleEngine.getContemptValue(0.8, 'middlegame');
      expect(contempt1).toBeLessThan(20);

      // Low risk tolerance = higher contempt
      const contempt2 = PlayerStyleEngine.getContemptValue(0.2, 'middlegame');
      expect(contempt2).toBeGreaterThan(30);
    });

    it('should adjust contempt based on position type', () => {
      const baseContempt = PlayerStyleEngine.getContemptValue(0.5, 'middlegame');
      const openingContempt = PlayerStyleEngine.getContemptValue(0.5, 'opening');
      const endgameContempt = PlayerStyleEngine.getContemptValue(0.5, 'endgame');

      // Opening should have higher contempt (more aggressive)
      expect(openingContempt).toBeGreaterThan(baseContempt);

      // Endgame should have lower contempt (more drawish)
      expect(endgameContempt).toBeLessThan(baseContempt);
    });

    it('should respect contempt bounds (-100 to 100)', () => {
      const extremeHigh = PlayerStyleEngine.getContemptValue(1.0, 'opening');
      expect(extremeHigh).toBeGreaterThanOrEqual(-100);
      expect(extremeHigh).toBeLessThanOrEqual(100);

      const extremeLow = PlayerStyleEngine.getContemptValue(0.0, 'endgame');
      expect(extremeLow).toBeGreaterThanOrEqual(-100);
      expect(extremeLow).toBeLessThanOrEqual(100);
    });

    it('should calculate contempt correctly for extreme risk values', () => {
      // Maximum risk tolerance = minimum contempt
      const maxRisk = PlayerStyleEngine.getContemptValue(1.0, 'middlegame');
      expect(maxRisk).toBeCloseTo(0, 5);

      // Minimum risk tolerance = maximum contempt
      const minRisk = PlayerStyleEngine.getContemptValue(0.0, 'middlegame');
      expect(minRisk).toBeCloseTo(50, 5);
    });
  });

  describe('getThinkingTime', () => {
    it('should calculate thinking time based on ELO', () => {
      const time1 = PlayerStyleEngine.getThinkingTime(1200);
      const time2 = PlayerStyleEngine.getThinkingTime(2000);

      // Higher ELO should get more thinking time
      expect(time2).toBeGreaterThan(time1);
    });

    it('should adjust thinking time based on style', () => {
      const positionalStyle: StyleParameters = {
        positionalWeight: 0.8,
        tacticalWeight: 0.2,
        riskTolerance: 0.5,
        attackFocus: 0.5,
        endgameFocus: 0.5
      };

      const tacticalStyle: StyleParameters = {
        positionalWeight: 0.2,
        tacticalWeight: 0.8,
        riskTolerance: 0.5,
        attackFocus: 0.5,
        endgameFocus: 0.5
      };

      const time1 = PlayerStyleEngine.getThinkingTime(1500, positionalStyle);
      const time2 = PlayerStyleEngine.getThinkingTime(1500, tacticalStyle);

      // Tactical style may need more time for complex calculations
      expect(time2).toBeGreaterThan(0);
      expect(time1).toBeGreaterThan(0);
    });

    it('should respect minimum and maximum time bounds', () => {
      const minTime = PlayerStyleEngine.getThinkingTime(800);
      const maxTime = PlayerStyleEngine.getThinkingTime(2800);

      expect(minTime).toBeGreaterThanOrEqual(100); // At least 100ms
      expect(maxTime).toBeLessThanOrEqual(10000); // At most 10 seconds
    });

    it('should handle position type parameter', () => {
      const openingTime = PlayerStyleEngine.getThinkingTime(1500, undefined, 'opening');
      const middlegameTime = PlayerStyleEngine.getThinkingTime(1500, undefined, 'middlegame');
      const endgameTime = PlayerStyleEngine.getThinkingTime(1500, undefined, 'endgame');

      // All should be positive values
      expect(openingTime).toBeGreaterThan(0);
      expect(middlegameTime).toBeGreaterThan(0);
      expect(endgameTime).toBeGreaterThan(0);

      // Endgame should get more time for precision
      expect(endgameTime).toBeGreaterThanOrEqual(middlegameTime);
    });
  });

  describe('getSearchDepth', () => {
    it('should return depth from config when provided', () => {
      const styleParams: StyleParameters = {
        positionalWeight: 0.6,
        tacticalWeight: 0.4,
        riskTolerance: 0.5,
        attackFocus: 0.5,
        endgameFocus: 0.5
      };

      const config = PlayerStyleEngine.mapStyleToStockfishConfig(styleParams, 1500, 'middlegame');
      const depth = PlayerStyleEngine.getSearchDepth(config, 'middlegame');

      expect(depth).toBe(config.depth);
      expect(depth).toBeGreaterThan(0);
      expect(depth).toBeLessThanOrEqual(25);
    });

    it('should adjust depth based on position type', () => {
      const styleParams: StyleParameters = {
        positionalWeight: 0.6,
        tacticalWeight: 0.4,
        riskTolerance: 0.5,
        attackFocus: 0.5,
        endgameFocus: 0.5
      };

      const config = PlayerStyleEngine.mapStyleToStockfishConfig(styleParams, 1500);

      const openingDepth = PlayerStyleEngine.getSearchDepth(config, 'opening');
      const endgameDepth = PlayerStyleEngine.getSearchDepth(config, 'endgame');

      // Endgame should get more depth for precise calculation
      expect(endgameDepth).toBeGreaterThanOrEqual(openingDepth);
    });

    it('should respect depth bounds (1-25)', () => {
      const styleParams: StyleParameters = {
        positionalWeight: 0.6,
        tacticalWeight: 0.4,
        riskTolerance: 0.5,
        attackFocus: 0.5,
        endgameFocus: 0.5
      };

      // Minimum ELO
      const minConfig = PlayerStyleEngine.mapStyleToStockfishConfig(styleParams, 800);
      const minDepth = PlayerStyleEngine.getSearchDepth(minConfig, 'middlegame');
      expect(minDepth).toBeGreaterThanOrEqual(1);
      expect(minDepth).toBeLessThanOrEqual(25);

      // Maximum ELO
      const maxConfig = PlayerStyleEngine.mapStyleToStockfishConfig(styleParams, 2800);
      const maxDepth = PlayerStyleEngine.getSearchDepth(maxConfig, 'middlegame');
      expect(maxDepth).toBeGreaterThanOrEqual(1);
      expect(maxDepth).toBeLessThanOrEqual(25);
    });
  });

  describe('getPositionModifier', () => {
    it('should return correct modifier for opening', () => {
      const modifier = PlayerStyleEngine.getPositionModifier('opening');
      expect(typeof modifier).toBe('number');
      expect(modifier).toBeDefined();
    });

    it('should return correct modifier for middlegame', () => {
      const modifier = PlayerStyleEngine.getPositionModifier('middlegame');
      expect(typeof modifier).toBe('number');
      expect(modifier).toBeDefined();
    });

    it('should return correct modifier for endgame', () => {
      const modifier = PlayerStyleEngine.getPositionModifier('endgame');
      expect(typeof modifier).toBe('number');
      expect(modifier).toBeDefined();
    });

    it('should have consistent modifiers for same position type', () => {
      const modifier1 = PlayerStyleEngine.getPositionModifier('opening');
      const modifier2 = PlayerStyleEngine.getPositionModifier('opening');

      expect(modifier1).toBe(modifier2);
    });

    it('should differentiate between position types', () => {
      const openingMod = PlayerStyleEngine.getPositionModifier('opening');
      const middlegameMod = PlayerStyleEngine.getPositionModifier('middlegame');
      const endgameMod = PlayerStyleEngine.getPositionModifier('endgame');

      // Modifiers should differ based on position characteristics
      const modifiers = [openingMod, middlegameMod, endgameMod];
      const uniqueModifiers = new Set(modifiers);

      // At least some should be different
      expect(uniqueModifiers.size).toBeGreaterThan(1);
    });
  });

  describe('Integration tests', () => {
    it('should work with complete AI player profile', () => {
      const profile: AIPlayerProfile = {
        id: 'test_profile',
        name: 'Test Player',
        displayName: 'Test',
        description: 'Test profile',
        elo: 1800,
        style: 'positional',
        styleParams: {
          positionalWeight: 0.7,
          tacticalWeight: 0.3,
          riskTolerance: 0.4,
          attackFocus: 0.5,
          endgameFocus: 0.8
        },
        difficultyRange: [1200, 2200],
        characteristics: ['Test characteristic']
      };

      const config = PlayerStyleEngine.getConfigForPlayer(profile, 1800, 'middlegame');
      const commands = PlayerStyleEngine.toUCICommands(config);
      const contempt = PlayerStyleEngine.getContemptValue(profile.styleParams.riskTolerance, 'middlegame');
      const thinkingTime = PlayerStyleEngine.getThinkingTime(profile.elo, profile.styleParams, 'middlegame');
      const searchDepth = PlayerStyleEngine.getSearchDepth(config, 'middlegame');

      expect(commands.length).toBeGreaterThan(0);
      expect(contempt).toBeGreaterThanOrEqual(-100);
      expect(contempt).toBeLessThanOrEqual(100);
      expect(thinkingTime).toBeGreaterThan(0);
      expect(searchDepth).toBeGreaterThan(0);
      expect(searchDepth).toBe(config.depth);
    });

    it('should handle different ELO ranges correctly', () => {
      const styleParams: StyleParameters = {
        positionalWeight: 0.5,
        tacticalWeight: 0.5,
        riskTolerance: 0.5,
        attackFocus: 0.5,
        endgameFocus: 0.5
      };

      const eloRanges = [800, 1200, 1500, 1800, 2200, 2800];

      eloRanges.forEach(elo => {
        const config = PlayerStyleEngine.mapStyleToStockfishConfig(styleParams, elo);
        const commands = PlayerStyleEngine.toUCICommands(config);

        expect(config.skillLevel).toBeGreaterThanOrEqual(0);
        expect(config.skillLevel).toBeLessThanOrEqual(20);
        expect(commands.length).toBeGreaterThan(0);
      });
    });
  });
});
