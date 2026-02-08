import type { AIPlayerProfile } from '@/types/chess.types';

interface PlayerProfileCardProps {
  profile: AIPlayerProfile;
  isSelected: boolean;
  onSelect: (profileId: string) => void;
}

export function PlayerProfileCard({ profile, isSelected, onSelect }: PlayerProfileCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(profile.id);
    }
  };

  return (
    <div
      data-testid={`profile-${profile.id}`}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Select ${profile.name}`}
      className={`profile-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(profile.id)}
      onKeyDown={handleKeyDown}
    >
      <span className="icon" role="img" aria-label={profile.name}>
        {profile.icon}
      </span>
      <h3>{profile.name}</h3>
      <p className="elo">ELO: {profile.elo}</p>
      <p className="style">{profile.style}</p>
      <p className="description">{profile.description}</p>
    </div>
  );
}
