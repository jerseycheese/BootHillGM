/**
 * CombatStatus displays strength and wound information for both combatants.
 * Shows strength values with visual indicators for low strength (<=50% of base).
 * Displays wounds with severity indicators following Boot Hill v2 rules.
 */
import React from 'react';
import { Character } from '../../types/character';
import { calculateCurrentStrength } from '../../utils/strengthSystem';
import { cleanCharacterName } from '../../utils/combatUtils';

interface CombatStatusProps {
  playerCharacter: Character;
  opponent: Character;
}

export const CombatStatus: React.FC<CombatStatusProps> = ({
  playerCharacter,
  opponent
}) => {
  // Calculate current strength for both characters
  const playerStrength = calculateCurrentStrength(playerCharacter);
  const maxPlayerStrength = playerCharacter.attributes.baseStrength;
  const opponentStrength = calculateCurrentStrength(opponent);
  const maxOpponentStrength = opponent.attributes.baseStrength;

  // Clean character names for display
  const playerName = cleanCharacterName(playerCharacter.name);
  // Extract just the name part before any narrative text
  const opponentName = cleanCharacterName(opponent.name.split(/[.:\n]/)[0].trim());

  return (
    <div className="health-bars mb-4" aria-label="Combat Strength and Wound Status">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="font-medium" data-testid="player-strength-label">
            {playerName} <br />
            <div className="text-sm">Strength: <span 
              className={`${playerStrength <= maxPlayerStrength / 2 ? 'text-red-600' : ''}`}
              data-testid="player-strength-value"
              aria-label={`Player Strength: ${playerStrength} out of ${maxPlayerStrength}`}
            >
              {playerStrength}/{maxPlayerStrength}
              </span>
            </div>
          </span>
          {playerCharacter.isUnconscious && <span className="ml-2">(Unconscious)</span>}
        </div>
        <div>
          <span className="font-medium" data-testid="opponent-strength-label">
            {opponentName} <br />
            <div className="text-sm">Strength: <span 
              className={`${opponentStrength <= maxOpponentStrength / 2 ? 'text-red-600' : ''}`}
              data-testid="opponent-strength-value"
              aria-label={`Opponent Strength: ${opponentStrength} out of ${maxOpponentStrength}`}
            >
              {opponentStrength}/{maxOpponentStrength}
              </span>
            </div>
          </span>
          {opponent.isUnconscious && <span className="ml-2">(Unconscious)</span>}
        </div>
      </div>
      {/* Add wounds display only when wounds exist */}
      {(playerCharacter.wounds.length > 0 || opponent.wounds.length > 0) && (
        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
          {playerCharacter.wounds.length > 0 && (
            <div>
              <span className="font-medium" aria-label={`${playerName} Wounds`}>Wounds:</span>
              <ul className="list-none" aria-label={`${playerName} Wound List`}>
                {playerCharacter.wounds.map((wound, index) => (
                  <li key={index} className={`${wound.severity === 'serious' ? 'text-red-600' : wound.severity === 'mortal' ? 'text-black' : 'text-orange-600'}`} aria-label={`${playerName} Wound ${index + 1}: ${wound.location} - ${wound.severity} - Strength Reduction: ${wound.strengthReduction}`}>
                    {wound.location} - {wound.severity} (-{wound.strengthReduction} STR)
                  </li>
                ))}
              </ul>
            </div>
          )}
          {opponent.wounds.length > 0 && (
            <div>
              <span className="font-medium" aria-label={`${opponentName} Wounds`}>Wounds:</span>
              <ul className="list-none" aria-label={`${opponentName} Wound List`}>
                {opponent.wounds.map((wound, index) => (
                  <li key={index} className={`${wound.severity === 'serious' ? 'text-red-600' : wound.severity === 'mortal' ? 'text-black' : 'text-orange-600'}`} aria-label={`${opponentName} Wound ${index + 1}: ${wound.location} - ${wound.severity} - Strength Reduction: ${wound.strengthReduction}`}>
                    {wound.location} - {wound.severity} (-{wound.strengthReduction} STR)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
