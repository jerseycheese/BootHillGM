import React from 'react';
import { MIN_STRENGTH } from '../utils/combat/strengthUtils';
import { Character } from '../types/character';
import { CombatState } from '../types/combat';
import { getCharacterStrength } from '../utils/strengthSystem';

interface StatusDisplayProps {
  character: Character; // Changed to full Character type to access strengthHistory
  combatState?: CombatState;
}

export function StatusDisplay({ character }: StatusDisplayProps) {
  const strength = getCharacterStrength(character);
  const strengthColor =
    strength === MIN_STRENGTH
      ? 'text-red-600'
      : strength < character.attributes.baseStrength * 0.3
      ? 'text-yellow-600'
      : 'text-green-600';

  return (
    <div className="status-display" data-testid="status-display">
      <div className="flex flex-col gap-2">
        <div className={`strength-value ${strengthColor}`} data-testid="status-display-strength-value">
          {strength}/{character.attributes.baseStrength} STR
        </div>
        
        {/* Strength History Section */}
        {character.strengthHistory && character.strengthHistory.changes.length > 0 && (
          <div className="strength-history text-sm" data-testid="strength-history">
            <div className="text-gray-600 font-semibold mb-1">Strength History:</div>
            <div className="max-h-32 overflow-y-auto">
              {character.strengthHistory.changes.slice().reverse().map((change, index) => (
                <div 
                  key={index} 
                  className="flex justify-between text-xs py-1 border-b border-gray-200 last:border-0"
                  data-testid={`strength-change-${index}`}
                >
                  <span className="text-gray-700">
                    {change.previousValue} → {change.newValue}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(change.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
