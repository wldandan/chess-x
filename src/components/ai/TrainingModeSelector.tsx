import { TrainingMode } from '@/types/chess.types';

interface TrainingModeSelectorProps {
  onSelect: (mode: TrainingMode) => void;
  selectedMode?: TrainingMode;
}

const TRAINING_MODES = [
  {
    id: 'style-focused' as TrainingMode,
    name: '风格专项训练',
    description: '适应特定棋风，建议5-10局连续对弈',
    icon: '🎯'
  },
  {
    id: 'mixed-challenge' as TrainingMode,
    name: '混合风格挑战',
    description: '随机切换不同风格AI，全面应对能力',
    icon: '🎲'
  },
  {
    id: 'weakness-targeted' as TrainingMode,
    name: '弱点针对性训练',
    description: '识别弱点，针对性强化训练',
    icon: '🎓'
  }
];

export function TrainingModeSelector({ onSelect, selectedMode }: TrainingModeSelectorProps) {
  return (
    <div className="training-mode-selector">
      <h2>选择训练模式</h2>
      <div className="modes-grid">
        {TRAINING_MODES.map((mode) => (
          <div
            key={mode.id}
            data-testid={`mode-${mode.id.split('-')[0]}`}
            className={`mode-card ${selectedMode === mode.id ? 'selected' : ''}`}
            onClick={() => onSelect(mode.id)}
            role="button"
            tabIndex={0}
            aria-selected={selectedMode === mode.id}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(mode.id);
              }
            }}
          >
            <span className="mode-icon" aria-hidden="true">{mode.icon}</span>
            <h3>{mode.name}</h3>
            <p>{mode.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
