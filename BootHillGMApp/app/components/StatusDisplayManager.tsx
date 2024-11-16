/**
 * Displays current game state information.
 * Shows character name, location, strength, and wounds.
 * Provides visual feedback for character status.
 */
import React from 'react';
import { Character } from '../types/character';
import { calculateCurrentStrength } from '../utils/strengthSystem';
import { cleanLocationText } from '../utils/textCleaningUtils';

interface StatusDisplayManagerProps {
  character: Character;
  location: string | null;
}

const StatusDisplayManager: React.FC<StatusDisplayManagerProps> = ({
  character,
  location
}) => {
  const currentStrength = calculateCurrentStrength(character);
  const maxStrength = character.attributes.baseStrength;

  return (
    <div className="wireframe-section">

      <p className="font-medium" aria-label="Character name">
        {character.name}
      </p>
      <p className="font-medium" aria-label="Current location">
        Location:&nbsp;
        <span className="text-sm font-normal">{cleanLocationText(location) || 'Unknown'}</span>
      </p>

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
    </div>
  );
};

export default StatusDisplayManager;
