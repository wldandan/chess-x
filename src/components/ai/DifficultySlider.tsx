interface DifficultySliderProps {
  value: number | 'adaptive';
  onChange: (value: number | 'adaptive') => void;
}

const ELO_RANGE = { min: 800, max: 2800 };
const DIFFICULTY_LABELS = {
  beginner: '初学者 (800-1200)',
  intermediate: '中级 (1200-1800)',
  advanced: '高级 (1800-2200)',
  master: '大师级 (2200+)',
  adaptive: '自适应模式'
};

function getDifficultyLabel(elo: number | 'adaptive'): string {
  if (elo === 'adaptive') return DIFFICULTY_LABELS.adaptive;
  if (elo < 1200) return DIFFICULTY_LABELS.beginner;
  if (elo < 1800) return DIFFICULTY_LABELS.intermediate;
  if (elo < 2200) return DIFFICULTY_LABELS.advanced;
  return DIFFICULTY_LABELS.master;
}

export function DifficultySlider({ value, onChange }: DifficultySliderProps) {
  const isAdaptive = value === 'adaptive';

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  };

  const toggleAdaptive = () => {
    if (isAdaptive) {
      onChange(1500); // Default to intermediate
    } else {
      onChange('adaptive');
    }
  };

  return (
    <div className="difficulty-slider">
      <div className="difficulty-header">
        <h3>难度设置</h3>
        <span className="difficulty-label">{getDifficultyLabel(value)}</span>
      </div>

      <div className="adaptive-toggle">
        <label>
          <input
            type="checkbox"
            checked={isAdaptive}
            onChange={toggleAdaptive}
          />
          自适应难度
        </label>
      </div>

      {!isAdaptive && (
        <div className="slider-container">
          <input
            type="range"
            role="slider"
            min={ELO_RANGE.min}
            max={ELO_RANGE.max}
            value={value}
            onChange={handleSliderChange}
            className="elo-slider"
          />
          <div className="elo-display">
            <span>{ELO_RANGE.min}</span>
            <span>ELO: {value}</span>
            <span>{ELO_RANGE.max}</span>
          </div>
        </div>
      )}
    </div>
  );
}
