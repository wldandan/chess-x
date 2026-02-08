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
