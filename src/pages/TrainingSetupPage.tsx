import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerProfileSelector } from '@/components/ai/PlayerProfileSelector';
import { TrainingModeSelector } from '@/components/ai/TrainingModeSelector';
import { DifficultySlider } from '@/components/ai/DifficultySlider';
import { TrainingMode } from '@/types/chess.types';
import { useGameStore } from '@/stores/game.store';

interface TrainingConfig {
  profileId: string | null;
  mode: TrainingMode | null;
  difficulty: number | 'adaptive';
}

export function TrainingSetupPage() {
  const navigate = useNavigate();
  const startTrainingSession = useGameStore((state) => state.startTrainingSession);

  const [config, setConfig] = useState<TrainingConfig>({
    profileId: null,
    mode: null,
    difficulty: 1500
  });

  const isConfigComplete = config.profileId && config.mode && config.difficulty;

  const handleStartTraining = () => {
    if (!isConfigComplete || !config.profileId || !config.mode) return;

    // Initialize training session in store
    startTrainingSession({
      playerProfileId: config.profileId,
      mode: config.mode,
      targetElo: typeof config.difficulty === 'number' ? config.difficulty : 1500,
      adaptiveMode: config.difficulty === 'adaptive',
      sessionLength: 5,
      focusAreas: []
    });

    navigate('/training');
  };

  return (
    <div className="training-setup-page">
      <div className="setup-container">
        <h1>AI风格训练设置</h1>

        <div className="setup-section">
          <PlayerProfileSelector
            selectedId={config.profileId || undefined}
            onSelect={(profileId) => setConfig({ ...config, profileId })}
          />
        </div>

        <div className="setup-section">
          <TrainingModeSelector
            selectedMode={config.mode || undefined}
            onSelect={(mode) => setConfig({ ...config, mode })}
          />
        </div>

        <div className="setup-section">
          <DifficultySlider
            value={config.difficulty}
            onChange={(difficulty) => setConfig({ ...config, difficulty })}
          />
        </div>

        <div className="setup-actions">
          <button
            className="start-button"
            disabled={!isConfigComplete}
            onClick={handleStartTraining}
          >
            开始训练
          </button>
        </div>
      </div>
    </div>
  );
}
