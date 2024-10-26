/**
 * Displays current game state information and save functionality.
 * Shows character name, location, and health in current/max format.
 * Provides manual save capability with visual feedback.
 */
import React from 'react';
import { Character } from '../types/character';

interface StatusDisplayManagerProps {
  character: Character;
  location: string;
  onManualSave: () => void;
}

const StatusDisplayManager: React.FC<StatusDisplayManagerProps> = ({
  character,
  location,
  onManualSave
}) => {
  const healthDisplay = `${character.health}/100`;

  return (
    <div className="wireframe-section">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="font-medium" aria-label="Character name">
            Name: {character.name}
          </p>
          <p className="font-medium" aria-label="Current location">
            Location: {location || 'Unknown'}
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-medium" aria-label="Character health">
            Health: {healthDisplay}
          </p>
          <button 
            onClick={onManualSave}
            className="wireframe-button w-full"
            aria-label="Save game"
          >
            Save Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusDisplayManager;
