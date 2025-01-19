import React from 'react';
import { MAX_STRENGTH, MIN_STRENGTH } from '../utils/combat/strengthUtils';
import { Character } from '../types/character';

interface StatusDisplayProps {
  character: Pick<Character, 'attributes'>;
}

export function StatusDisplay({ character }: StatusDisplayProps) {
  const strength = character.attributes.strength;
  const strengthColor =
    strength === MIN_STRENGTH
      ? 'text-red-600'
      : strength < MAX_STRENGTH * 0.3
      ? 'text-yellow-600'
      : 'text-green-600';

  return (
    <div className="status-display" data-testid="status-display">
      <div className={`strength-value ${strengthColor}`}>
        {strength} STR
      </div>
    </div>
  );
}