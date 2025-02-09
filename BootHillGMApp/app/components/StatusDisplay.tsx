import React from 'react';
import { MAX_STRENGTH, MIN_STRENGTH } from '../utils/combat/strengthUtils';
import { Character } from '../types/character';
import { CombatState } from '../types/combat';
import { getCharacterStrength } from '../utils/strengthSystem';

interface StatusDisplayProps {
  character: Pick<Character, 'attributes'>;
  combatState?: CombatState;
}

export function StatusDisplay({ character, combatState }: StatusDisplayProps) {
  const strength = getCharacterStrength(character as Character, combatState);
  // TODO: Consider refactoring to use a utility function for color thresholds
  // if MAX_STRENGTH changes, these thresholds may need review
  const strengthColor =
    strength === MIN_STRENGTH
      ? 'text-red-600'
      : strength < MAX_STRENGTH * 0.3
      ? 'text-yellow-600'
      : 'text-green-600';

  return (
    <div className="status-display" data-testid="status-display">
      <div className={`strength-value ${strengthColor}`} data-testid="status-display-strength-value">
        {strength} STR
      </div>
    </div>
  );
}
