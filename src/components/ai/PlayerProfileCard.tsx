import type { AIPlayerProfile } from '@/types/chess.types';

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
      <div className="icon">{profile.icon}</div>
      <h3>{profile.name}</h3>
      <p className="elo">ELO: {profile.elo}</p>
      <p className="style">{profile.style}</p>
      <p className="description">{profile.description}</p>
    </div>
  );
}
