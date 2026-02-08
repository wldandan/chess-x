# AI Player Style Simulation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete AI player style simulation training system that allows users to play against world champion-style AI opponents with adaptive difficulty and comprehensive progress tracking.

**Architecture:** Extend existing Stockfish integration with style-specific parameter tuning, build UI components for profile selection and training configuration, and implement visual feedback for style-specific behavior patterns.

**Tech Stack:** React + TypeScript, Zustand state management, Stockfish.js chess engine, chess.js for game logic

---

## Prerequisites

**Existing Foundation (Already Implemented):**
- ✅ `ChessAIEngine.ts` - Stockfish wrapper with difficulty levels
- ✅ `PlayerStyleEngine.ts` - Style-to-Stockfish parameter mapping
- ✅ `AdaptiveTrainingService.ts` - Dynamic difficulty adjustment
- ✅ `playerProfiles.ts` - 4 world champion profiles
- ✅ Game store with training state management
- ✅ Type definitions for all AI training concepts

**What Needs to be Built:**
1. UI components for profile selection and training setup
2. Training mode workflows and configuration
3. Visual feedback for style-specific behavior
4. Progress analytics and reporting dashboard
5. Integration and testing

---

## Task 1: Player Profile Selection Component

**Files:**
- Create: `src/components/ai/PlayerProfileSelector.tsx`
- Create: `src/components/ai/PlayerProfileCard.tsx`
- Create: `src/components/ai/DifficultySlider.tsx`
- Test: `src/test/components/ai/PlayerProfileSelector.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/test/components/ai/PlayerProfileSelector.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

    const carlsenCard = screen.getByTestId('profile-carlsen');
    carlsenCard.click();

    expect(onSelect).toHaveBeenCalledWith('carlsen');
  });

  it('should highlight selected profile', () => {
    render(<PlayerProfileSelector onSelect={vi.fn()} selectedId="carlsen" />);

    const carlsenCard = screen.getByTestId('profile-carlsen');
    expect(carlsenCard).toHaveClass('selected');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test PlayerProfileSelector.test.tsx
```

Expected: FAIL - "Cannot find module '@/components/ai/PlayerProfileSelector'"

**Step 3: Write minimal implementation**

```typescript
// src/components/ai/PlayerProfileCard.tsx
import { AIPlayerProfile } from '@/types/chess.types';

interface PlayerProfileCardProps {
  profile: AIPlayerProfile;
  isSelected: boolean;
  onSelect: (profileId: string) => void;
}

export function PlayerProfileCard({ profile, isSelected, onSelect }: PlayerProfileCardProps) {
  return (
    <div
      data-testid={`profile-${profile.id}`}
      className={`profile-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(profile.id)}
    >
      <img src={profile.avatar} alt={profile.name} className="avatar" />
      <h3>{profile.name}</h3>
      <p className="elo">ELO: {profile.elo}</p>
      <p className="style">{profile.style}</p>
      <p className="description">{profile.description}</p>
    </div>
  );
}
```

```typescript
// src/components/ai/PlayerProfileSelector.tsx
import { playerProfiles } from '@/data/playerProfiles';
import { PlayerProfileCard } from './PlayerProfileCard';

interface PlayerProfileSelectorProps {
  onSelect: (profileId: string) => void;
  selectedId?: string;
}

export function PlayerProfileSelector({ onSelect, selectedId }: PlayerProfileSelectorProps) {
  return (
    <div className="player-profile-selector">
      <h2>选择AI对手风格</h2>
      <div className="profiles-grid">
        {playerProfiles.map((profile) => (
          <PlayerProfileCard
            key={profile.id}
            profile={profile}
            isSelected={selectedId === profile.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test PlayerProfileSelector.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ai/PlayerProfileSelector.tsx src/components/ai/PlayerProfileCard.tsx src/test/components/ai/PlayerProfileSelector.test.tsx
git commit -m "feat: add player profile selector component"
```

---

## Task 2: Difficulty Slider Component

**Files:**
- Create: `src/components/ai/DifficultySlider.tsx`
- Test: `src/test/components/ai/DifficultySlider.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/test/components/ai/DifficultySlider.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DifficultySlider } from '@/components/ai/DifficultySlider';

describe('DifficultySlider', () => {
  it('should render with default ELO range', () => {
    render(<DifficultySlider value={1200} onChange={vi.fn()} />);

    expect(screen.getByText(/800/)).toBeInTheDocument();
    expect(screen.getByText(/2800/)).toBeInTheDocument();
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
    expect(screen.getByText(/初学者/i)).toBeInTheDocument();

    rerender(<DifficultySlider value={1500} onChange={vi.fn()} />);
    expect(screen.getByText(/中级/i)).toBeInTheDocument();

    rerender(<DifficultySlider value={2000} onChange={vi.fn()} />);
    expect(screen.getByText(/高级/i)).toBeInTheDocument();

    rerender(<DifficultySlider value="adaptive" onChange={vi.fn()} />);
    expect(screen.getByText(/自适应/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test DifficultySlider.test.tsx
```

Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/components/ai/DifficultySlider.tsx
import { useState } from 'react';

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
  const [isAdaptive, setIsAdaptive] = useState(value === 'adaptive');

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
    setIsAdaptive(!isAdaptive);
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
            value={value as number}
            onChange={handleSliderChange}
            className="elo-slider"
          />
          <div className="elo-display">
            <span>ELO: {value}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test DifficultySlider.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ai/DifficultySlider.tsx src/test/components/ai/DifficultySlider.test.tsx
git commit -m "feat: add difficulty slider component"
```

---

## Task 3: Training Mode Selection Component

**Files:**
- Create: `src/components/ai/TrainingModeSelector.tsx`
- Test: `src/test/components/ai/TrainingModeSelector.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/test/components/ai/TrainingModeSelector.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrainingModeSelector } from '@/components/ai/TrainingModeSelector';

describe('TrainingModeSelector', () => {
  it('should render all training modes', () => {
    render(<TrainingModeSelector onSelect={vi.fn()} />);

    expect(screen.getByText(/风格专项训练/i)).toBeInTheDocument();
    expect(screen.getByText(/混合风格挑战/i)).toBeInTheDocument();
    expect(screen.getByText(/弱点针对性训练/i)).toBeInTheDocument();
  });

  it('should display mode descriptions', () => {
    render(<TrainingModeSelector onSelect={vi.fn()} />);

    expect(screen.getByText(/适应特定棋风/i)).toBeInTheDocument();
    expect(screen.getByText(/全面应对能力/i)).toBeInTheDocument();
  });

  it('should call onSelect with mode when selected', () => {
    const onSelect = vi.fn();
    render(<TrainingModeSelector onSelect={onSelect} />);

    const styleMode = screen.getByTestId('mode-style');
    styleMode.click();

    expect(onSelect).toHaveBeenCalledWith('style-focused');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test TrainingModeSelector.test.tsx
```

Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/components/ai/TrainingModeSelector.tsx
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
          >
            <span className="mode-icon">{mode.icon}</span>
            <h3>{mode.name}</h3>
            <p>{mode.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Update types if needed**

Add to `src/types/chess.types.ts`:

```typescript
export type TrainingMode = 'style-focused' | 'mixed-challenge' | 'weakness-targeted';
```

**Step 5: Run test to verify it passes**

```bash
npm test TrainingModeSelector.test.tsx
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/components/ai/TrainingModeSelector.tsx src/test/components/ai/TrainingModeSelector.test.tsx
git update-index --assume-unchanged src/types/chess.types.ts  # If types were already there
git commit -m "feat: add training mode selector component"
```

---

## Task 4: Training Session Configuration Page

**Files:**
- Create: `src/pages/TrainingSetupPage.tsx`
- Modify: `src/App.tsx` - Add route
- Test: `src/test/pages/TrainingSetupPage.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/test/pages/TrainingSetupPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TrainingSetupPage } from '@/pages/TrainingSetupPage';

function renderWithRouter(component: React.ReactNode) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('TrainingSetupPage', () => {
  it('should render all configuration steps', () => {
    renderWithRouter(<TrainingSetupPage />);

    expect(screen.getByText(/选择AI对手风格/i)).toBeInTheDocument();
    expect(screen.getByText(/选择训练模式/i)).toBeInTheDocument();
    expect(screen.getByText(/难度设置/i)).toBeInTheDocument();
    expect(screen.getByText(/开始训练/i)).toBeInTheDocument();
  });

  it('should enable start button when all options are selected', () => {
    renderWithRouter(<TrainingSetupPage />);

    const startButton = screen.getByRole('button', { name: /开始训练/i });
    expect(startButton).toBeDisabled();

    // Select profile, mode, and difficulty
    fireEvent.click(screen.getByTestId('profile-carlsen'));
    fireEvent.click(screen.getByTestId('mode-style'));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1500' } });

    expect(startButton).toBeEnabled();
  });

  it('should navigate to training page on start', () => {
    const navigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => navigate
    }));

    renderWithRouter(<TrainingSetupPage />);

    // Complete setup
    fireEvent.click(screen.getByTestId('profile-carlsen'));
    fireEvent.click(screen.getByTestId('mode-style'));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1500' } });
    fireEvent.click(screen.getByRole('button', { name: /开始训练/i }));

    expect(navigate).toHaveBeenCalledWith('/training');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test TrainingSetupPage.test.tsx
```

Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/pages/TrainingSetupPage.tsx
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
      initialDifficulty: typeof config.difficulty === 'number' ? config.difficulty : undefined,
      isAdaptive: config.difficulty === 'adaptive'
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
```

**Step 4: Add route to App.tsx**

```typescript
// In src/App.tsx, add:
import { TrainingSetupPage } from '@/pages/TrainingSetupPage';

// In routes:
<Route path="/training-setup" element={<TrainingSetupPage />} />
```

**Step 5: Run test to verify it passes**

```bash
npm test TrainingSetupPage.test.tsx
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/pages/TrainingSetupPage.tsx src/test/pages/TrainingSetupPage.test.tsx src/App.tsx
git commit -m "feat: add training setup page"
```

---

## Task 5: Style Behavior Visualization Component

**Files:**
- Create: `src/components/ai/StyleBehaviorIndicator.tsx`
- Test: `src/test/components/ai/StyleBehaviorIndicator.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/test/components/ai/StyleBehaviorIndicator.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StyleBehaviorIndicator } from '@/components/ai/StyleBehaviorIndicator';

describe('StyleBehaviorIndicator', () => {
  it('should display style-specific traits', () => {
    render(
      <StyleBehaviorIndicator
        style="positional"
        currentPhase="middlegame"
        lastMove="e2e4"
      />
    );

    expect(screen.getByText(/稳健局面型/i)).toBeInTheDocument();
    expect(screen.getByText(/局面控制/i)).toBeInTheDocument();
  });

  it('should show different traits for different styles', () => {
    const { rerender } = render(
      <StyleBehaviorIndicator
        style="tactical"
        currentPhase="middlegame"
        lastMove="e2e4"
      />
    );

    expect(screen.getByText(/攻击战术型/i)).toBeInTheDocument();
    expect(screen.getByText(/战术机会/i)).toBeInTheDocument();
  });

  it('should adapt message based on game phase', () => {
    const { rerender } = render(
      <StyleBehaviorIndicator
        style="positional"
        currentPhase="endgame"
        lastMove="e2e4"
      />
    );

    expect(screen.getByText(/残局/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test StyleBehaviorIndicator.test.tsx
```

Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/components/ai/StyleBehaviorIndicator.tsx
import { PlayerStyle } from '@/types/chess.types';

interface StyleBehaviorIndicatorProps {
  style: PlayerStyle;
  currentPhase: 'opening' | 'middlegame' | 'endgame';
  lastMove: string;
}

const STYLE_TRAITS = {
  positional: {
    name: '稳健局面型',
    traits: ['局面控制', '微小优势积累', '长期计划'],
    color: '#4CAF50'
  },
  tactical: {
    name: '攻击战术型',
    traits: ['战术机会', '复杂计算', '主动权'],
    color: '#FF5722'
  },
  solid: {
    name: '坚实防守型',
    traits: ['稳健布局', '防御反击', '少失误'],
    color: '#2196F3'
  },
  aggressive: {
    name: '激进进攻型',
    traits: ['王翼攻击', '弃子进攻', '复杂化'],
    color: '#F44336'
  },
  defensive: {
    name: '防守反击型',
    traits: ['坚固防线', '耐心等待', '反击机会'],
    color: '#9C27B0'
  },
  technical: {
    name: '精密技术型',
    traits: ['精确计算', '残局技巧', '技术优势'],
    color: '#FF9800'
  }
};

const PHASE_MESSAGES = {
  opening: {
    positional: '正在构建稳健的开局局面...',
    tactical: '寻找开局中的战术机会...',
    solid: '采用坚实的开局布局...',
    aggressive: '尝试主动的开局变例...',
    defensive: '建立稳固的防守结构...',
    technical: '精确的开局着法选择...'
  },
  middlegame: {
    positional: '积累微小的局面优势...',
    tactical: '寻找战术组合机会...',
    solid: '保持稳固的防守结构...',
    aggressive: '制造复杂的战术局面...',
    defensive: '寻找反击的机会...',
    technical: '精确计算变化...'
  },
  endgame: {
    positional: '将优势转化为胜势...',
    tactical: '寻找最后的战术机会...',
    solid: '稳健地将局面导入和棋...',
    aggressive: '尝试将局面复杂化...',
    defensive: '坚守最后的防线...',
    technical: '展示精湛的残局技巧...'
  }
};

export function StyleBehaviorIndicator({ style, currentPhase, lastMove }: StyleBehaviorIndicatorProps) {
  const styleInfo = STYLE_TRAITS[style];
  const phaseMessage = PHASE_MESSAGES[currentPhase][style];

  return (
    <div className="style-behavior-indicator" style={{ '--style-color': styleInfo.color }}>
      <div className="style-header">
        <span className="style-name">{styleInfo.name}</span>
        <span className="phase-badge">{currentPhase}</span>
      </div>

      <div className="current-behavior">
        <span className="behavior-icon">💭</span>
        <span className="behavior-message">{phaseMessage}</span>
      </div>

      <div className="style-traits">
        {styleInfo.traits.map((trait) => (
          <span key={trait} className="trait-tag">
            {trait}
          </span>
        ))}
      </div>

      <div className="last-move">
        <span>最后一步: {lastMove}</span>
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test StyleBehaviorIndicator.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ai/StyleBehaviorIndicator.tsx src/test/components/ai/StyleBehaviorIndicator.test.tsx
git commit -m "feat: add style behavior indicator component"
```

---

## Task 6: Training Progress Dashboard

**Files:**
- Create: `src/components/ai/TrainingProgressDashboard.tsx`
- Test: `src/test/components/ai/TrainingProgressDashboard.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/test/components/ai/TrainingProgressDashboard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrainingProgressDashboard } from '@/components/ai/TrainingProgressDashboard';

describe('TrainingProgressDashboard', () => {
  const mockProgress = {
    gamesPlayed: 10,
    gamesWon: 4,
    gamesDrawn: 2,
    gamesLost: 4,
    currentElo: 1650,
    startingElo: 1500,
    styleAdaptation: {
      carlsen: 85,
      kasparov: 45,
      caruana: 70,
      ding: 60
    }
  };

  it('should display overall statistics', () => {
    render(<TrainingProgressDashboard progress={mockProgress} />);

    expect(screen.getByText(/10/i)).toBeInTheDocument(); // Games played
    expect(screen.getByText(/4-2-4/i)).toBeInTheDocument(); // W-D-L
    expect(screen.getByText(/1650/i)).toBeInTheDocument(); // Current ELO
  });

  it('should display ELO progress', () => {
    render(<TrainingProgressDashboard progress={mockProgress} />);

    expect(screen.getByText(/\+150/i)).toBeInTheDocument(); // ELO gain
  });

  it('should display style adaptation scores', () => {
    render(<TrainingProgressDashboard progress={mockProgress} />);

    expect(screen.getByText(/85%/)).toBeInTheDocument(); // Carlsen adaptation
    expect(screen.getByText(/45%/)).toBeInTheDocument(); // Kasparov adaptation
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test TrainingProgressDashboard.test.tsx
```

Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/components/ai/TrainingProgressDashboard.tsx
import { TrainingProgress } from '@/types/chess.types';

interface TrainingProgressDashboardProps {
  progress: TrainingProgress;
}

export function TrainingProgressDashboard({ progress }: TrainingProgressDashboardProps) {
  const eloChange = progress.currentElo - progress.startingElo;
  const winRate = (progress.gamesWon / progress.gamesPlayed * 100).toFixed(1);

  return (
    <div className="training-progress-dashboard">
      <h2>训练进度</h2>

      <div className="progress-overview">
        <div className="stat-card">
          <span className="stat-label">对局数</span>
          <span className="stat-value">{progress.gamesPlayed}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">战绩</span>
          <span className="stat-value">
            {progress.gamesWon}-{progress.gamesDrawn}-{progress.gamesLost}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">胜率</span>
          <span className="stat-value">{winRate}%</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">当前ELO</span>
          <span className="stat-value">{progress.currentElo}</span>
        </div>
      </div>

      <div className="elo-progress">
        <h3>ELO变化</h3>
        <div className="elo-bar">
          <span className="elo-start">{progress.startingElo}</span>
          <div
            className="elo-fill"
            style={{
              width: `${Math.min(Math.abs(eloChange) / 5, 100)}%`,
              backgroundColor: eloChange >= 0 ? '#4CAF50' : '#F44336'
            }}
          />
          <span className="elo-current">{progress.currentElo}</span>
        </div>
        <span className={`elo-change ${eloChange >= 0 ? 'positive' : 'negative'}`}>
          {eloChange >= 0 ? '+' : ''}{eloChange}
        </span>
      </div>

      {progress.styleAdaptation && (
        <div className="style-adaptation">
          <h3>风格适应度</h3>
          <div className="adaptation-list">
            {Object.entries(progress.styleAdaptation).map(([style, score]) => (
              <div key={style} className="adaptation-item">
                <span className="style-name">{style}</span>
                <div className="adaptation-bar">
                  <div
                    className="adaptation-fill"
                    style={{
                      width: `${score}%`,
                      backgroundColor: score >= 70 ? '#4CAF50' : score >= 50 ? '#FF9800' : '#F44336'
                    }}
                  />
                </div>
                <span className="adaptation-score">{score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {progress.weaknesses && progress.weaknesses.length > 0 && (
        <div className="weakness-analysis">
          <h3>需要改进</h3>
          <ul className="weakness-list">
            {progress.weaknesses.map((weakness, index) => (
              <li key={index} className="weakness-item">
                <span className="weakness-type">{weakness.type}</span>
                <span className="weakness-desc">{weakness.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test TrainingProgressDashboard.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ai/TrainingProgressDashboard.tsx src/test/components/ai/TrainingProgressDashboard.test.tsx
git commit -m "feat: add training progress dashboard component"
```

---

## Task 7: Training Report Generator

**Files:**
- Create: `src/services/ai/TrainingReportGenerator.ts`
- Test: `src/test/services/ai/TrainingReportGenerator.test.ts`

**Step 1: Write the failing test**

```typescript
// src/test/services/ai/TrainingReportGenerator.test.ts
import { describe, it, expect } from 'vitest';
import { TrainingReportGenerator } from '@/services/ai/TrainingReportGenerator';
import { TrainingProgress, ChessGame } from '@/types/chess.types';

describe('TrainingReportGenerator', () => {
  it('should generate a complete training report', () => {
    const progress: TrainingProgress = {
      gamesPlayed: 10,
      gamesWon: 4,
      gamesDrawn: 2,
      gamesLost: 4,
      currentElo: 1650,
      startingElo: 1500,
      styleAdaptation: {
        carlsen: 85,
        kasparov: 45
      }
    };

    const report = TrainingReportGenerator.generateReport(progress);

    expect(report.summary).toBeDefined();
    expect(report.summary.totalGames).toBe(10);
    expect(report.summary.eloChange).toBe(150);
    expect(report.recommendations).toBeDefined();
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it('should identify weaknesses correctly', () => {
    const progress: TrainingProgress = {
      gamesPlayed: 10,
      gamesWon: 2,
      gamesDrawn: 1,
      gamesLost: 7,
      currentElo: 1400,
      startingElo: 1500,
      weaknesses: [
        { type: 'tactical', description: '战术识别能力不足', count: 5 },
        { type: 'endgame', description: '残局技术需要提高', count: 3 }
      ]
    };

    const report = TrainingReportGenerator.generateReport(progress);

    expect(report.weaknesses.length).toBeGreaterThan(0);
    expect(report.weaknesses.some(w => w.type === 'tactical')).toBe(true);
  });

  it('should provide style-specific recommendations', () => {
    const progress: TrainingProgress = {
      gamesPlayed: 10,
      gamesWon: 4,
      gamesDrawn: 2,
      gamesLost: 4,
      currentElo: 1650,
      startingElo: 1500,
      styleAdaptation: {
        carlsen: 85,
        kasparov: 35
      }
    };

    const report = TrainingReportGenerator.generateReport(progress);

    expect(report.recommendations).toContainEqual(
      expect.objectContaining({
        type: 'style-focused',
        targetStyle: 'kasparov'
      })
    );
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test TrainingReportGenerator.test.ts
```

Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/services/ai/TrainingReportGenerator.ts
import { TrainingProgress, TrainingReport, WeaknessAnalysis, TrainingRecommendation } from '@/types/chess.types';

export class TrainingReportGenerator {
  static generateReport(progress: TrainingProgress): TrainingReport {
    return {
      summary: this.generateSummary(progress),
      weaknesses: this.analyzeWeaknesses(progress),
      strengths: this.analyzeStrengths(progress),
      recommendations: this.generateRecommendations(progress),
      styleAnalysis: this.analyzeStylePerformance(progress),
      timestamp: new Date()
    };
  }

  private static generateSummary(progress: TrainingProgress) {
    const winRate = (progress.gamesWon / progress.gamesPlayed * 100).toFixed(1);
    const eloChange = progress.currentElo - progress.startingElo;

    return {
      totalGames: progress.gamesPlayed,
      record: `${progress.gamesWon}-${progress.gamesDrawn}-${progress.gamesLost}`,
      winRate: parseFloat(winRate),
      eloChange,
      currentElo: progress.currentElo,
      startingElo: progress.startingElo
    };
  }

  private static analyzeWeaknesses(progress: TrainingProgress): WeaknessAnalysis[] {
    const weaknesses: WeaknessAnalysis[] = [];

    // Analyze style adaptation weaknesses
    if (progress.styleAdaptation) {
      Object.entries(progress.styleAdaptation).forEach(([style, score]) => {
        if (score < 50) {
          weaknesses.push({
            type: 'style-adaptation',
            description: `对${style}风格的适应度较低 (${score}%)`,
            priority: score < 40 ? 'high' : 'medium',
            count: 0,
            affectedStyles: [style]
          });
        }
      });
    }

    // Add explicitly tracked weaknesses
    if (progress.weaknesses) {
      progress.weaknesses.forEach(w => {
        weaknesses.push({
          type: w.type as any,
          description: w.description,
          priority: w.count >= 5 ? 'high' : 'medium',
          count: w.count
        });
      });
    }

    return weaknesses.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private static analyzeStrengths(progress: TrainingProgress) {
    const strengths: any[] = [];

    if (progress.styleAdaptation) {
      Object.entries(progress.styleAdaptation).forEach(([style, score]) => {
        if (score >= 75) {
          strengths.push({
            type: 'style-adaptation',
            description: `擅长应对${style}风格`,
            score: score
          });
        }
      });
    }

    // Check overall performance
    const winRate = progress.gamesWon / progress.gamesPlayed;
    if (winRate >= 0.6) {
      strengths.push({
        type: 'overall-performance',
        description: '整体胜率优秀',
        score: winRate * 100
      });
    }

    return strengths;
  }

  private static generateRecommendations(progress: TrainingProgress): TrainingRecommendation[] {
    const recommendations: TrainingRecommendation[] = [];

    // Style-specific recommendations
    if (progress.styleAdaptation) {
      const weakStyles = Object.entries(progress.styleAdaptation)
        .filter(([_, score]) => score < 50)
        .sort((a, b) => a[1] - b[1]);

      if (weakStyles.length > 0) {
        recommendations.push({
          type: 'style-focused',
          title: '针对弱点风格的训练',
          description: `重点练习应对${weakStyles[0][0]}风格`,
          targetStyle: weakStyles[0][0] as any,
          priority: 'high',
          estimatedSessions: 5
        });
      }
    }

    // Weakness-specific recommendations
    if (progress.weaknesses) {
      const tacticalWeakness = progress.weaknesses.find(w => w.type === 'tactical');
      if (tacticalWeakness && tacticalWeakness.count >= 3) {
        recommendations.push({
          type: 'tactics-training',
          title: '战术训练强化',
          description: '增加战术组合练习',
          priority: 'high',
          estimatedSessions: 10
        });
      }

      const endgameWeakness = progress.weaknesses.find(w => w.type === 'endgame');
      if (endgameWeakness && endgameWeakness.count >= 3) {
        recommendations.push({
          type: 'endgame-training',
          title: '残局技术提升',
          description: '加强残局技巧训练',
          priority: 'medium',
          estimatedSessions: 8
        });
      }
    }

    // ELO-based recommendations
    const eloChange = progress.currentElo - progress.startingElo;
    if (eloChange < 0) {
      recommendations.push({
        type: 'difficulty-adjustment',
        title: '降低训练难度',
        description: '当前难度可能过高，建议降低100-200 ELO',
        priority: 'medium',
        estimatedSessions: 3
      });
    } else if (eloChange > 200 && progress.gamesWon / progress.gamesPlayed > 0.7) {
      recommendations.push({
        type: 'difficulty-adjustment',
        title: '提升训练难度',
        description: '表现优异，可以尝试更高难度',
        priority: 'low',
        estimatedSessions: 0
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private static analyzeStylePerformance(progress: TrainingProgress) {
    if (!progress.styleAdaptation) return null;

    const entries = Object.entries(progress.styleAdaptation);
    const bestStyle = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    const worstStyle = entries.reduce((a, b) => a[1] < b[1] ? a : b);
    const avgAdaptation = entries.reduce((sum, [, score]) => sum + score, 0) / entries.length;

    return {
      bestStyle: {
        name: bestStyle[0],
        score: bestStyle[1]
      },
      worstStyle: {
        name: worstStyle[0],
        score: worstStyle[1]
      },
      averageAdaptation: Math.round(avgAdaptation),
      overallAssessment: avgAdaptation >= 70 ? 'excellent' : avgAdaptation >= 50 ? 'good' : 'needs-improvement'
    };
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test TrainingReportGenerator.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/services/ai/TrainingReportGenerator.ts src/test/services/ai/TrainingReportGenerator.test.ts
git commit -m "feat: add training report generator service"
```

---

## Task 8: Integrate Style-Specific AI Configuration

**Files:**
- Modify: `src/services/ai/PlayerStyleEngine.ts` - Enhance with Stockfish UCI commands
- Modify: `src/services/ai/ChessAIEngine.ts` - Add style-aware methods
- Test: `src/test/services/ai/PlayerStyleEngine.test.ts`

**Step 1: Write the failing test**

```typescript
// src/test/services/ai/PlayerStyleEngine.test.ts
import { describe, it, expect } from 'vitest';
import { PlayerStyleEngine } from '@/services/ai/PlayerStyleEngine';
import { StyleParameters } from '@/types/chess.types';

describe('PlayerStyleEngine', () => {
  it('should convert style parameters to Stockfish UCI commands', () => {
    const styleParams: StyleParameters = {
      positionalWeight: 0.8,
      tacticalWeight: 0.2,
      riskTolerance: 0.3,
      attackFocus: 0.4,
      endgameFocus: 0.9
    };

    const uciCommands = PlayerStyleEngine.toUCICommands(styleParams);

    expect(uciCommands).toContain('setoption name Skill Level value');
    expect(uciCommands).toContain('setoption name Contempt value');
  });

  it('should calculate appropriate contempt value based on style', () => {
    const aggressiveStyle = PlayerStyleEngine.getContemptValue({ riskTolerance: 0.8 } as StyleParameters);
    const positionalStyle = PlayerStyleEngine.getContemptValue({ riskTolerance: 0.2 } as StyleParameters);

    expect(aggressiveStyle).toBeGreaterThan(positionalStyle);
  });

  it('should adjust search depth based on game phase and style', () => {
    const endgameDepth = PlayerStyleEngine.getSearchDepth('endgame', { endgameFocus: 0.9 });
    const openingDepth = PlayerStyleEngine.getSearchDepth('opening', { endgameFocus: 0.9 });

    expect(endgameDepth).toBeGreaterThanOrEqual(openingDepth);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test PlayerStyleEngine.test.ts
```

Expected: FAIL (methods don't exist yet)

**Step 3: Enhance implementation**

```typescript
// Add to src/services/ai/PlayerStyleEngine.ts

export class PlayerStyleEngine {
  // ... existing code ...

  static toUCICommands(styleParams: StyleParameters, baseElo: number): string[] {
    const skillLevel = this.eloToSkillLevel(baseElo);
    const contempt = this.getContemptValue(styleParams);
    const commands: string[] = [];

    // Base skill level
    commands.push(`setoption name Skill Level value ${skillLevel}`);

    // Contempt (draw tendency - lower = more willing to draw)
    // Aggressive players have higher contempt (avoid draws)
    // Positional players have lower contempt (accept small advantages)
    commands.push(`setoption name Contempt value ${contempt}`);

    // Set thinking time based on style
    // Aggressive/tactical styles think less (more intuitive)
    // Positional/technical styles think more
    const thinkingTime = this.getThinkingTime(styleParams);
    commands.push(`setoption name Move Overhead value ${thinkingTime}`);

    return commands;
  }

  static getContemptValue(styleParams: StyleParameters): number {
    // Contempt range: -100 to 100
    // Positive = avoid draws, Negative = accept draws
    const baseContempt = (styleParams.riskTolerance - 0.5) * 200;

    // Adjust based on attack focus
    const attackBonus = styleParams.attackFocus * 50;

    return Math.round(Math.max(-100, Math.min(100, baseContempt + attackBonus)));
  }

  static getThinkingTime(styleParams: StyleParameters): number {
    // Positional/technical styles take more time
    const baseTime = 100; // ms

    const timeMultiplier =
      styleParams.positionalWeight * 1.5 +
      styleParams.tacticalWeight * 0.8 +
      styleParams.endgameFocus * 1.2;

    return Math.round(baseTime * timeMultiplier);
  }

  static getSearchDepth(phase: 'opening' | 'middlegame' | 'endgame', styleParams: StyleParameters): number {
    const baseDepth = 15;

    // Endgame focus = deeper searches in endgame
    const phaseMultiplier = phase === 'endgame' ? 1.2 :
                           phase === 'middlegame' ? 1.0 : 0.9;

    // Technical players search deeper
    const styleMultiplier = styleParams.endgameFocus * 0.3 + 0.7;

    return Math.round(baseDepth * phaseMultiplier * styleMultiplier);
  }

  static getPositionModifier(fen: string, styleParams: StyleParameters): number {
    // Detect position type and adjust evaluation
    // This is called during position analysis to bias the evaluation

    // Simplified detection based on FEN characteristics
    const isEndgame = !fen.includes('q') && !fen.includes('Q');

    if (isEndgame && styleParams.endgameFocus > 0.7) {
      return 50; // Bonus for technical players in endgame
    }

    if (styleParams.attackFocus > 0.7) {
      // Bonus for open positions (less pawns)
      const pawnCount = (fen.match(/p/g) || []).length;
      if (pawnCount < 8) return 30;
    }

    return 0;
  }
}
```

**Step 4: Update ChessAIEngine to use style commands**

```typescript
// In src/services/ai/ChessAIEngine.ts, add method:

async getBestMoveWithStyle(
  fen: string,
  styleParams: StyleParameters,
  elo: number
): Promise<AIMoveResult> {
  const uciCommands = PlayerStyleEngine.toUCICommands(styleParams, elo);

  // Apply style-specific UCI commands
  for (const command of uciCommands) {
    await this.sendCommand(command);
  }

  // Get best move with style applied
  return this.getBestMove(fen, { depth: 15 });
}
```

**Step 5: Run test to verify it passes**

```bash
npm test PlayerStyleEngine.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/services/ai/PlayerStyleEngine.ts src/services/ai/ChessAIEngine.ts src/test/services/ai/PlayerStyleEngine.test.ts
git commit -m "feat: add style-specific UCI command generation"
```

---

## Task 9: Update Game Store for Style-Aware AI

**Files:**
- Modify: `src/stores/game.store.ts`
- Test: `src/test/stores/game.store.test.ts`

**Step 1: Write the failing test**

```typescript
// src/test/stores/game.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/stores/game.store';

describe('Game Store - Style Training', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should start a style training session', () => {
    const store = useGameStore.getState();

    store.startTrainingSession({
      playerProfileId: 'carlsen',
      mode: 'style-focused',
      initialDifficulty: 1500,
      isAdaptive: false
    });

    expect(store.trainingSession).toBeDefined();
    expect(store.trainingSession?.playerProfileId).toBe('carlsen');
    expect(store.currentPlayerProfile).toBeDefined();
    expect(store.currentPlayerProfile?.id).toBe('carlsen');
  });

  it('should update adaptive difficulty after game', () => {
    const store = useGameStore.getState();

    store.startTrainingSession({
      playerProfileId: 'kasparov',
      mode: 'style-focused',
      isAdaptive: true
    });

    // Simulate game completion
    store.updateAdaptiveDifficulty({
      won: true,
      quality: 85,
      moveAccuracy: 0.8
    });

    expect(store.trainingProgress?.currentElo).toBeGreaterThan(store.trainingProgress?.startingElo || 0);
  });

  it('should switch AI style in mixed mode', async () => {
    const store = useGameStore.getState();

    store.startTrainingSession({
      playerProfileId: 'carlsen',
      mode: 'mixed-challenge',
      isAdaptive: false
    });

    const initialProfile = store.currentPlayerProfile?.id;

    // Simulate game end and style switch
    await store.switchToNextStyle();

    expect(store.currentPlayerProfile?.id).not.toBe(initialProfile);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test game.store.test.ts
```

Expected: FAIL (methods don't exist or don't work correctly)

**Step 3: Update game store implementation**

Add/Update methods in `src/stores/game.store.ts`:

```typescript
// Add to actions:
startTrainingSession: (config) => {
  const profile = playerProfiles.find(p => p.id === config.playerProfileId);
  if (!profile) return;

  const session: TrainingSessionConfig = {
    playerProfileId: config.playerProfileId,
    mode: config.mode,
    initialDifficulty: config.initialDifficulty || profile.elo - 500,
    isAdaptive: config.isAdaptive ?? false,
    targetGames: config.targetGames || 5
  };

  set({
    trainingSession: session,
    currentPlayerProfile: profile,
    trainingProgress: {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesDrawn: 0,
      gamesLost: 0,
      currentElo: config.initialDifficulty || 1500,
      startingElo: config.initialDifficulty || 1500,
      styleAdaptation: {}
    }
  });

  // Configure AI engine with style
  const aiService = new PlayerStyleEngine();
  const styleConfig = aiService.getStyleConfig(profile.style, profile.elo);

  // Apply to AI engine (implementation depends on ChessAIEngine integration)
  ChessAIEngine.getInstance().setStyleParameters(profile.styleParameters);
},

updateAdaptiveDifficulty: (performance) => {
  const { trainingSession, trainingProgress } = get();
  if (!trainingSession || !trainingProgress || !trainingSession.isAdaptive) return;

  const adaptiveService = new AdaptiveTrainingService();
  const newElo = adaptiveService.adjustDifficulty(
    trainingProgress.currentElo,
    performance.won,
    performance.quality
  );

  set({
    trainingProgress: {
      ...trainingProgress,
      currentElo: newElo
    }
  });
},

switchToNextStyle: async () => {
  const { trainingSession, trainingProgress } = get();
  if (!trainingSession || trainingSession.mode !== 'mixed-challenge') return;

  const availableProfiles = playerProfiles.filter(p => p.id !== get().currentPlayerProfile?.id);
  const nextProfile = availableProfiles[Math.floor(Math.random() * availableProfiles.length)];

  set({
    currentPlayerProfile: nextProfile
  });

  return nextProfile;
}
```

**Step 4: Run test to verify it passes**

```bash
npm test game.store.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/stores/game.store.ts src/test/stores/game.store.test.ts
git commit -m "feat: add style training session management to store"
```

---

## Task 10: Main Training Page Integration

**Files:**
- Create: `src/pages/TrainingPage.tsx`
- Modify: `src/App.tsx` - Add route
- Test: `src/test/pages/TrainingPage.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/test/pages/TrainingPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TrainingPage } from '@/pages/TrainingPage';

function renderWithRouter(component: React.ReactNode) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('TrainingPage', () => {
  beforeEach(() => {
    vi.mock('@/stores/game.store', () => ({
      useGameStore: () => ({
        currentPlayerProfile: { id: 'carlsen', name: 'Magnus Carlsen' },
        trainingSession: { mode: 'style-focused' },
        trainingProgress: { gamesPlayed: 0, currentElo: 1500 },
        startGame: vi.fn(),
        makeMove: vi.fn()
      })
    }));
  });

  it('should render training interface', () => {
    renderWithRouter(<TrainingPage />);

    expect(screen.getByText(/Magnus Carlsen/i)).toBeInTheDocument();
    expect(screen.getByText(/开始训练对局/i)).toBeInTheDocument();
  });

  it('should start game when start button is clicked', () => {
    const startGame = vi.fn();
    vi.mock('@/stores/game.store', () => ({
      useGameStore: () => ({ startGame })
    }));

    renderWithRouter(<TrainingPage />);
    fireEvent.click(screen.getByText(/开始训练对局/i));

    expect(startGame).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test TrainingPage.test.tsx
```

Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/pages/TrainingPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/game.store';
import { PlayerProfileSelector } from '@/components/ai/PlayerProfileSelector';
import { TrainingProgressDashboard } from '@/components/ai/TrainingProgressDashboard';
import { StyleBehaviorIndicator } from '@/components/ai/StyleBehaviorIndicator';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { AIThinkingIndicator } from '@/components/ai/AIThinkingIndicator';

export function TrainingPage() {
  const navigate = useNavigate();
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'finished'>('setup');

  const currentPlayerProfile = useGameStore((state) => state.currentPlayerProfile);
  const trainingProgress = useGameStore((state) => state.trainingProgress);
  const aiThinking = useGameStore((state) => state.aiThinking);
  const currentGame = useGameStore((state) => state.currentGame);

  const startGame = useGameStore((state) => state.startGame);
  const makeMove = useGameStore((state) => state.makeMove);

  const handleStartGame = () => {
    if (!currentPlayerProfile) return;

    startGame({
      playerConfig: {
        white: { type: 'human', name: 'You' },
        black: { type: 'ai', profile: currentPlayerProfile }
      },
      timeControl: { type: 'untimed' }
    });

    setGamePhase('playing');
  };

  const handleMove = (move: any) => {
    makeMove(move);
  };

  const handleGameEnd = () => {
    setGamePhase('finished');
  };

  if (!currentPlayerProfile) {
    return (
      <div className="training-page">
        <p>请先选择训练配置</p>
        <button onClick={() => navigate('/training-setup')}>
          返回设置
        </button>
      </div>
    );
  }

  return (
    <div className="training-page">
      <div className="training-header">
        <h1>AI风格训练</h1>
        <button onClick={() => navigate('/training-setup')}>
          返回设置
        </button>
      </div>

      <div className="training-content">
        <div className="training-main">
          <div className="opponent-info">
            <h2>对手: {currentPlayerProfile.name}</h2>
            <p>风格: {currentPlayerProfile.style}</p>
            <p>ELO: {currentPlayerProfile.elo}</p>
          </div>

          {gamePhase === 'setup' && (
            <div className="game-setup">
              <button className="start-game-btn" onClick={handleStartGame}>
                开始训练对局
              </button>
            </div>
          )}

          {gamePhase === 'playing' && currentGame && (
            <div className="active-game">
              <ChessBoard
                position={currentGame.fen}
                onMove={handleMove}
                orientation="white"
              />

              {aiThinking && (
                <AIThinkingIndicator
                  depth={aiThinking.depth}
                  evaluation={aiThinking.evaluation}
                  currentMove={aiThinking.currentMove}
                />
              )}

              <StyleBehaviorIndicator
                style={currentPlayerProfile.style}
                currentPhase={currentGame.phase || 'middlegame'}
                lastMove={currentGame.lastMove || ''}
              />
            </div>
          )}

          {gamePhase === 'finished' && (
            <div className="game-summary">
              <h2>对局结束</h2>
              <button onClick={handleStartGame}>
                下一局
              </button>
              <button onClick={() => navigate('/training-report')}>
                查看报告
              </button>
            </div>
          )}
        </div>

        <aside className="training-sidebar">
          {trainingProgress && (
            <TrainingProgressDashboard progress={trainingProgress} />
          )}
        </aside>
      </div>
    </div>
  );
}
```

**Step 4: Add route to App.tsx**

```typescript
// In src/App.tsx:
import { TrainingPage } from '@/pages/TrainingPage';

// Add to routes:
<Route path="/training" element={<TrainingPage />} />
```

**Step 5: Run test to verify it passes**

```bash
npm test TrainingPage.test.tsx
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/pages/TrainingPage.tsx src/test/pages/TrainingPage.test.tsx src/App.tsx
git commit -m "feat: add main training page"
```

---

## Task 11: Training Report Page

**Files:**
- Create: `src/pages/TrainingReportPage.tsx`
- Modify: `src/App.tsx` - Add route
- Test: `src/test/pages/TrainingReportPage.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/test/pages/TrainingReportPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TrainingReportPage } from '@/pages/TrainingReportPage';

describe('TrainingReportPage', () => {
  it('should display training summary', () => {
    render(
      <BrowserRouter>
        <TrainingReportPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/训练报告/i)).toBeInTheDocument();
  });

  it('should show recommendations', () => {
    render(
      <BrowserRouter>
        <TrainingReportPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/推荐训练/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test TrainingReportPage.test.tsx
```

Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/pages/TrainingReportPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/game.store';
import { TrainingReportGenerator } from '@/services/ai/TrainingReportGenerator';
import { TrainingReport } from '@/types/chess.types';

export function TrainingReportPage() {
  const navigate = useNavigate();
  const trainingProgress = useGameStore((state) => state.trainingProgress);
  const [report, setReport] = useState<TrainingReport | null>(null);

  useEffect(() => {
    if (trainingProgress) {
      const generatedReport = TrainingReportGenerator.generateReport(trainingProgress);
      setReport(generatedReport);
    }
  }, [trainingProgress]);

  if (!report) {
    return <div>加载中...</div>;
  }

  return (
    <div className="training-report-page">
      <div className="report-header">
        <h1>训练报告</h1>
        <button onClick={() => navigate('/training')}>
          返回训练
        </button>
      </div>

      <section className="report-section summary">
        <h2>总体概览</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <span>总对局数</span>
            <strong>{report.summary.totalGames}</strong>
          </div>
          <div className="summary-card">
            <span>战绩</span>
            <strong>{report.summary.record}</strong>
          </div>
          <div className="summary-card">
            <span>胜率</span>
            <strong>{report.summary.winRate}%</strong>
          </div>
          <div className="summary-card">
            <span>ELO变化</span>
            <strong className={report.summary.eloChange >= 0 ? 'positive' : 'negative'}>
              {report.summary.eloChange >= 0 ? '+' : ''}{report.summary.eloChange}
            </strong>
          </div>
        </div>
      </section>

      {report.styleAnalysis && (
        <section className="report-section style-analysis">
          <h2>风格表现分析</h2>
          <div className="style-cards">
            <div className="style-card best">
              <h3>最佳表现</h3>
              <p>{report.styleAnalysis.bestStyle.name}</p>
              <span className="score">{report.styleAnalysis.bestStyle.score}%</span>
            </div>
            <div className="style-card worst">
              <h3>需要改进</h3>
              <p>{report.styleAnalysis.worstStyle.name}</p>
              <span className="score">{report.styleAnalysis.worstStyle.score}%</span>
            </div>
          </div>
        </section>
      )}

      {report.weaknesses.length > 0 && (
        <section className="report-section weaknesses">
          <h2>弱点分析</h2>
          <ul className="weakness-list">
            {report.weaknesses.map((weakness, index) => (
              <li key={index} className={`weakness-item ${weakness.priority}`}>
                <span className="weakness-type">{weakness.type}</span>
                <span className="weakness-desc">{weakness.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.strengths.length > 0 && (
        <section className="report-section strengths">
          <h2>优势分析</h2>
          <ul className="strength-list">
            {report.strengths.map((strength, index) => (
              <li key={index} className="strength-item">
                <span className="strength-type">{strength.type}</span>
                <span className="strength-desc">{strength.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="report-section recommendations">
        <h2>推荐训练</h2>
        <div className="recommendations-list">
          {report.recommendations.map((rec, index) => (
            <div key={index} className={`recommendation-card ${rec.priority}`}>
              <h3>{rec.title}</h3>
              <p>{rec.description}</p>
              {rec.targetStyle && (
                <span className="target-style">目标风格: {rec.targetStyle}</span>
              )}
              {rec.estimatedSessions > 0 && (
                <span className="sessions">建议训练: {rec.estimatedSessions}局</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="report-actions">
        <button onClick={() => navigate('/training-setup')}>
          开始新训练
        </button>
        <button onClick={() => navigate('/')}>
          返回主页
        </button>
      </div>
    </div>
  );
}
```

**Step 4: Add route**

```typescript
// In src/App.tsx:
import { TrainingReportPage } from '@/pages/TrainingReportPage';

// Add to routes:
<Route path="/training-report" element={<TrainingReportPage />} />
```

**Step 5: Run test to verify it passes**

```bash
npm test TrainingReportPage.test.tsx
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/pages/TrainingReportPage.tsx src/test/pages/TrainingReportPage.test.tsx src/App.tsx
git commit -m "feat: add training report page"
```

---

## Task 12: Add CSS Styles

**Files:**
- Create: `src/styles/ai-training.css`

**Step 1: Create comprehensive styles**

```css
/* src/styles/ai-training.css */

/* Player Profile Selector */
.player-profile-selector {
  padding: 2rem;
}

.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.profile-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.profile-card.selected {
  border-color: #4CAF50;
  background-color: #f1f8f4;
}

.profile-card .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.profile-card h3 {
  margin: 0.5rem 0;
  font-size: 1.25rem;
}

.profile-card .elo {
  color: #666;
  font-weight: 500;
}

.profile-card .style {
  color: #4CAF50;
  font-weight: 600;
  text-transform: capitalize;
}

.profile-card .description {
  color: #888;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Difficulty Slider */
.difficulty-slider {
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 12px;
}

.difficulty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.difficulty-label {
  padding: 0.25rem 0.75rem;
  background: #2196F3;
  color: white;
  border-radius: 16px;
  font-size: 0.875rem;
}

.adaptive-toggle {
  margin-bottom: 1rem;
}

.adaptive-toggle label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.slider-container {
  margin-top: 1rem;
}

.elo-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.elo-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2196F3;
  cursor: pointer;
}

.elo-display {
  text-align: center;
  margin-top: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

/* Training Mode Selector */
.training-mode-selector {
  padding: 2rem;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.mode-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-card:hover {
  border-color: #2196F3;
}

.mode-card.selected {
  border-color: #2196F3;
  background-color: #e3f2fd;
}

.mode-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

/* Style Behavior Indicator */
.style-behavior-indicator {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid var(--style-color, #4CAF50);
}

.style-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.style-name {
  font-weight: 600;
  font-size: 1.125rem;
}

.phase-badge {
  padding: 0.125rem 0.5rem;
  background: #e0e0e0;
  border-radius: 12px;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.current-behavior {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.behavior-icon {
  font-size: 1.25rem;
}

.style-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.trait-tag {
  padding: 0.125rem 0.5rem;
  background: #e0e0e0;
  border-radius: 4px;
  font-size: 0.75rem;
}

.last-move {
  color: #666;
  font-size: 0.875rem;
}

/* Training Progress Dashboard */
.training-progress-dashboard {
  padding: 1.5rem;
  background: #f5f5f5;
  border-radius: 12px;
}

.progress-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.elo-progress {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.elo-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.elo-fill {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.elo-change {
  font-weight: 600;
}

.elo-change.positive {
  color: #4CAF50;
}

.elo-change.negative {
  color: #F44336;
}

.style-adaptation {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.adaptation-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.adaptation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.adaptation-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.adaptation-fill {
  height: 100%;
  transition: width 0.3s ease;
}

/* Training Setup Page */
.training-setup-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.setup-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.setup-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
}

.setup-actions {
  text-align: center;
}

.start-button {
  padding: 1rem 3rem;
  font-size: 1.125rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.start-button:hover:not(:disabled) {
  background: #45a049;
}

.start-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Training Page */
.training-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.training-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.training-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.training-sidebar {
  width: 320px;
  background: #f9f9f9;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
}

.opponent-info {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.start-game-btn {
  width: 100%;
  padding: 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  cursor: pointer;
}

.active-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-summary {
  text-align: center;
  padding: 2rem;
}

.game-summary button {
  margin: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #2196F3;
  color: white;
}

/* Training Report Page */
.training-report-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.report-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.summary-card {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
}

.summary-card span {
  display: block;
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.summary-card strong {
  display: block;
  font-size: 1.5rem;
}

.summary-card strong.positive {
  color: #4CAF50;
}

.summary-card strong.negative {
  color: #F44336;
}

.style-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.style-card {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.style-card.best {
  background: #e8f5e9;
}

.style-card.worst {
  background: #ffebee;
}

.style-card .score {
  font-size: 1.5rem;
  font-weight: 600;
}

.weakness-list,
.strength-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.weakness-item,
.strength-item {
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
}

.weakness-item.high {
  background: #ffebee;
  border-left: 4px solid #F44336;
}

.weakness-item.medium {
  background: #fff3e0;
  border-left: 4px solid #FF9800;
}

.strength-item {
  background: #e8f5e9;
  border-left: 4px solid #4CAF50;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-card {
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.recommendation-card.high {
  background: #ffebee;
  border-left-color: #F44336;
}

.recommendation-card.medium {
  background: #fff3e0;
  border-left-color: #FF9800;
}

.recommendation-card.low {
  background: #e3f2fd;
  border-left-color: #2196F3;
}

.report-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.report-actions button {
  padding: 0.75rem 1.5rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
```

**Step 2: Import styles in main entry**

```typescript
// In src/main.tsx:
import './styles/ai-training.css';
```

**Step 3: Commit**

```bash
git add src/styles/ai-training.css src/main.tsx
git commit -m "feat: add AI training styles"
```

---

## Task 13: Update Feature Status

**Files:**
- Modify: `features/feature01-ai-player-simulation.md`
- Modify: `features/README.md`

**Step 1: Update feature status to completed**

**Step 2: Update README**

```markdown
### 1. AI棋手风格模拟训练 ✅
- 模仿世界冠军棋风（卡尔森、卡斯帕罗夫等）
- 自适应难度调整
- 风格分析报告
```

**Step 3: Commit**

```bash
git add features/feature01-ai-player-simulation.md features/README.md
git commit -m "docs: mark AI player style simulation as complete"
```

---

## Task 14: Integration Testing

**Files:**
- Create: `src/test/integration/ai-training.integration.test.tsx`

**Step 1: Write integration test**

```typescript
// src/test/integration/ai-training.integration.test.tsx
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { App } from '@/App';

describe('AI Training Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should complete full training workflow', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Navigate to training setup
    fireEvent.click(screen.getByText(/训练/i));

    // Select profile
    fireEvent.click(screen.getByTestId('profile-carlsen'));

    // Select mode
    fireEvent.click(screen.getByTestId('mode-style'));

    // Set difficulty
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '1500' } });

    // Start training
    fireEvent.click(screen.getByRole('button', { name: /开始训练/i }));

    // Verify navigation to training page
    await waitFor(() => {
      expect(screen.getByText(/Magnus Carlsen/i)).toBeInTheDocument();
    });
  });
});
```

**Step 2: Run integration test**

```bash
npm test ai-training.integration.test.tsx
```

**Step 3: Fix any issues**

**Step 4: Commit**

```bash
git add src/test/integration/ai-training.integration.test.tsx
git commit -m "test: add AI training integration tests"
```

---

## Task 15: Final Polish and Documentation

**Files:**
- Update: `README.md` - Add feature documentation
- Update: Any missing type definitions

**Step 1: Update main README**

Add section about AI training features.

**Step 2: Ensure all types are exported**

**Step 3: Run full test suite**

```bash
npm test
```

**Step 4: Build verification**

```bash
npm run build
```

**Step 5: Final commit**

```bash
git add README.md src/types/
git commit -m "docs: complete AI player style simulation documentation"
```

---

## Summary

This plan implements a complete AI Player Style Simulation training system with:

**Components Created:**
- PlayerProfileSelector, PlayerProfileCard, DifficultySlider
- TrainingModeSelector, StyleBehaviorIndicator
- TrainingProgressDashboard, TrainingReportGenerator

**Pages Created:**
- TrainingSetupPage, TrainingPage, TrainingReportPage

**Services Enhanced:**
- PlayerStyleEngine (UCI command generation)
- ChessAIEngine (style-aware configuration)
- TrainingReportGenerator (new)

**State Management:**
- Enhanced game.store.ts with training session management

**Styling:**
- Complete CSS for all AI training components

**Testing:**
- Unit tests for all components
- Integration tests for full workflow

The implementation follows TDD, DRY, and YAGNI principles with small, focused commits.
