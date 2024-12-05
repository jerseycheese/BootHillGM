/**
 * CombatStatus Component
 * 
 * Displays the current combat status including health bars and wound information
 * for both the player and opponent characters.
 * 
 * Key Features:
 * - Visual strength bars with color-coding based on health percentage
 * - Detailed wound display with severity indicators
 * - Accessibility support with ARIA labels and roles
 * - Responsive layout for different screen sizes
 */

'use client';

import React, { useEffect, useState} from 'react';
import { Character } from '../../types/character';
import { calculateCurrentStrength } from '../../utils/strengthSystem';
import { cleanCharacterName } from '../../utils/combatUtils';

interface StrengthDisplayProps {
  current: number;
  max: number;
  name: string;
  isPlayer?: boolean;
  wounds: Character['wounds'];
  isUnconscious: boolean;
}

/**
 * StrengthDisplay Component
 * 
 * Renders a character's strength status with a progress bar and wound list.
 * Color-codes the strength bar and wounds based on severity.
 */
const StrengthDisplay: React.FC<StrengthDisplayProps> = ({
  current,
  max,
  name,
  isPlayer,
  wounds,
  isUnconscious
}) => {
  const strengthPercentage = (current / max) * 100;
  
  const getBarColor = (percentage: number) => {
    if (percentage <= 25) return 'bg-red-500';
    if (percentage <= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium">
          {name}
          {isUnconscious && (
            <span className="ml-2 text-red-600 text-sm">(Unconscious)</span>
          )}
        </span>
        <span 
          className={`font-bold ${current <= max / 2 ? 'text-red-600' : ''}`}
          data-testid={`${isPlayer ? 'player' : 'opponent'}-strength-value`}
          aria-label={`${isPlayer ? 'Player' : 'Opponent'} Strength: ${current} out of ${max}`}
        >
          {current}/{max}
        </span>
      </div>
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(strengthPercentage)} transition-all duration-500`}
          style={{ width: `${strengthPercentage}%` }}
          data-testid={`${isPlayer ? 'player' : 'opponent'}-strength-bar`}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>

      {wounds.length > 0 && (
        <div className="mt-2 text-sm">
          <div className="font-medium mb-1">Wounds:</div>
          <ul className="space-y-1">
            {wounds.map((wound, index) => (
              <li 
                key={`${wound.location}-${index}`}
                className={`
                  ${wound.severity === 'light' ? 'text-yellow-600' : ''}
                  ${wound.severity === 'serious' ? 'text-red-600' : ''}
                  ${wound.severity === 'mortal' ? 'text-red-900 font-bold' : ''}
                `}
              >
                {wound.location} - {wound.severity}
                <span className="text-gray-600 text-xs ml-1">
                  (-{wound.strengthReduction} STR)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Add debug component wrapper
const CombatStatusWithDebug: React.FC<CombatStatusProps> = (props) => {
  return (
    <>
      <BaseCombatStatus {...props} />
      <TextCleaningDebug />
    </>
  );
};

// Export the wrapped version
export { CombatStatusWithDebug as CombatStatus };

import { TextCleaningDebug } from '../Debug/TextCleaningDebug';

interface CombatStatusProps {
  playerCharacter: Character;
  opponent: Character;
}

const BaseCombatStatus: React.FC<CombatStatusProps> = ({
  playerCharacter,
  opponent
}) => {
  const playerStrength = calculateCurrentStrength(playerCharacter);
  const maxPlayerStrength = playerCharacter.attributes.baseStrength;
  // Ensure we're using the most up-to-date opponent values
  const maxOpponentStrength = opponent?.attributes?.baseStrength || opponent?.attributes?.strength || 0;
  const opponentStrength = Math.max(0, opponent?.attributes?.strength || 0);

  // Enhanced strength tracking
  const [lastKnownStrength, setLastKnownStrength] = useState(opponentStrength);

  useEffect(() => {
    if (opponent?.attributes?.strength !== undefined && 
        opponent.attributes.strength !== lastKnownStrength) {
      setLastKnownStrength(opponent.attributes.strength);
    }
  }, [opponent?.attributes?.strength, lastKnownStrength]);

  // Use the most current strength value
  const currentOpponentStrength = Math.max(0, lastKnownStrength);

  // Enhanced debug logging
  console.log('Combat Status Strength Values:', {
    opponent,
    opponentStrength,
    maxOpponentStrength,
    rawStrength: opponent?.attributes?.strength,
    baseStrength: opponent?.attributes?.baseStrength,
    wounds: opponent?.wounds
  });

  // Force re-render when strength changes
  useEffect(() => {
    if (opponent?.attributes?.strength !== opponentStrength) {
      console.log('Strength mismatch detected:', {
        componentStrength: opponentStrength,
        opponentStrength: opponent?.attributes?.strength
      });
    }
  }, [opponent?.attributes?.strength, opponentStrength]);

  const playerName = cleanCharacterName(playerCharacter.name);
  const opponentName = cleanCharacterName(opponent.name);

  return (
    <div className="wireframe-section" role="region" aria-label="Combat Status">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StrengthDisplay
          current={playerStrength}
          max={maxPlayerStrength}
          name={playerName}
          isPlayer={true}
          wounds={playerCharacter.wounds}
          isUnconscious={playerCharacter.isUnconscious}
        />
        <StrengthDisplay
          current={currentOpponentStrength}
          max={maxOpponentStrength}
          name={opponentName}
          wounds={opponent.wounds}
          isUnconscious={opponent.isUnconscious}
        />
      </div>
    </div>
  );
};
