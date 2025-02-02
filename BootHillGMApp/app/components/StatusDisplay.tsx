import React from 'react';
import { MAX_STRENGTH, MIN_STRENGTH } from '../utils/combat/strengthUtils';
import { Character } from '../types/character';
import { calculateCurrentStrength } from '../utils/strengthSystem';

interface StatusDisplayProps {
  character: Pick<Character, 'attributes'>;
}

export function StatusDisplay({ character }: StatusDisplayProps) {
  const strength = calculateCurrentStrength(character as Character);
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