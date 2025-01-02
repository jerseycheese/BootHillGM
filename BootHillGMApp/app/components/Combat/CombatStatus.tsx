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

import React, { useEffect } from 'react';
import { Character } from '../../types/character';
import { calculateCurrentStrength } from '../../utils/strengthSystem';
import { CombatState } from '../../types/combat';
import { cleanCharacterName } from '../../utils/combatUtils';
import { WeaponDisplay } from './WeaponDisplay';

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

interface CombatStatusProps {
  playerCharacter: Character;
  opponent: Character;
  combatState: CombatState;
}

const BaseCombatStatus: React.FC<CombatStatusProps> = ({
  playerCharacter,
  opponent,
  combatState
}) => {
  const playerStrength = calculateCurrentStrength(playerCharacter);
  const maxPlayerStrength = playerCharacter.attributes.baseStrength;
  

  // Use combat state strength if available, otherwise fall back to opponent attributes
  const currentOpponentStrength = Math.max(0, 
    combatState?.opponentStrength ?? 
    opponent?.attributes?.strength ?? 
    0
  );
  
  const maxOpponentStrength = opponent?.attributes?.baseStrength || opponent?.attributes?.strength || 0;

  const playerName = cleanCharacterName(playerCharacter.name);
  const opponentName = cleanCharacterName(opponent.name);

  return (
    <div className="wireframe-section" role="region" aria-label="Combat Status">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <StrengthDisplay
            current={playerStrength}
            max={maxPlayerStrength}
            name={playerName}
            isPlayer={true}
            wounds={playerCharacter.wounds}
            isUnconscious={playerCharacter.isUnconscious}
          />
          <div className="p-2 bg-gray-50 rounded mb-4">
            <h4 className="font-medium mb-1">Your Weapon</h4>
            <div className="text-sm">
              <p className="font-medium">{combatState?.weapon?.playerWeapon?.name || 'No weapon equipped'}</p>
            </div>
          </div>
        </div>
        <div>
          <StrengthDisplay
            current={currentOpponentStrength}
            max={maxOpponentStrength}
            name={opponentName}
            wounds={opponent.wounds}
            isUnconscious={opponent.isUnconscious}
          />
          <div className="p-2 bg-gray-50 rounded mb-4">
            <h4 className="font-medium mb-1">Opponent&#39;s Weapon</h4>
            <div className="text-sm">
              <p className="font-medium">{combatState?.weapon?.opponentWeapon?.name || 'Colt Revolver'}</p>
              {!combatState?.weapon?.opponentWeapon && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Default Weapon
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BaseCombatStatus as CombatStatus };
