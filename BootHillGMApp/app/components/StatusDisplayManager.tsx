/**
 * Displays current game state information and save functionality.
 * Shows character name, location, strength, and wounds.
 * Provides manual save capability with visual feedback.
 */
import React from 'react';
import { Character } from '../types/character';
import { calculateCurrentStrength } from '../utils/strengthSystem';
import { cleanMetadataMarkers } from '../utils/textCleaningUtils';

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
  const currentStrength = calculateCurrentStrength(character);
  const maxStrength = character.attributes.baseStrength;

  return (
    <div className="wireframe-section">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="font-medium" aria-label="Character name">
            {character.name}
          </p>
          <p className="font-medium" aria-label="Current location">
            Location: 
            <div className="text-sm font-normal">{cleanMetadataMarkers(location) || 'Unknown'}</div>
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-medium" aria-label="Character strength">
            Strength: {currentStrength}/{maxStrength}
            {character.isUnconscious && (
              <span className="text-red-600 ml-2">(Unconscious)</span>
            )}
          </p>
          {character.wounds.length > 0 && (
            <>
              <p className="text-sm font-medium">Wounds:</p>
              <ul className="list-none">
                {character.wounds.map((wound, index) => (
                  <li key={index} className={`${wound.severity === 'serious' ? 'text-red-600' : 'text-orange-600'}`}>
                    {wound.location} - {wound.severity}<br />
                    <div className="text-xs">(-{wound.strengthReduction} STR)</div>
                  </li>
                ))}
              </ul>
            </>
          )}
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
