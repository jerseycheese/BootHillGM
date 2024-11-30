/**
 * StatusDisplayManager Component
 * 
 * Displays a character's current status including strength, location, and wounds.
 * Features a responsive design with visual feedback for different health states
 * and wound severities.
 */

'use client';

import React from 'react';
import { Character } from '../types/character';
import { calculateCurrentStrength } from '../utils/strengthSystem';
import { cleanLocationText } from '../utils/textCleaningUtils';

interface StrengthBarProps {
  current: number;
  max: number;
  showValue?: boolean;
  isUnconscious?: boolean;
  onReset?: () => void;  // Add reset handler
}

/**
 * StrengthBar Component
 * 
 * Displays a character's strength as a visual progress bar with color coding
 * based on current health percentage. Includes optional value display and
 * unconscious state indicator.
 */
const StrengthBar: React.FC<StrengthBarProps> = ({
  current,
  max,
  showValue = true,
  isUnconscious = false
}) => {
  const strengthPercentage = (current / max) * 100;
  
  const getBarColor = (percentage: number): string => {
    if (percentage <= 25) return 'bg-red-500';
    if (percentage <= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full">
      {showValue && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Strength</span>
          <div className="flex items-center gap-2">
            <span 
              className={`text-sm font-bold ${current <= max / 2 ? 'text-red-600' : ''}`}
              data-testid="strength-value"
            >
              {current}/{max}
              {isUnconscious && (
                <span className="text-red-600 ml-2 text-xs">(Unconscious)</span>
              )}
            </span>
            {/* Add dev mode reset button */}
            {process.env.NODE_ENV !== 'production' && onReset && (
              <button
                onClick={onReset}
                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                title="Reset Strength (Dev Mode)"
                data-testid="reset-strength-button"
              >
                ↻
              </button>
            )}
          </div>
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(strengthPercentage)} transition-all duration-500`}
          style={{ width: `${strengthPercentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          data-testid="strength-bar"
        />
      </div>
    </div>
  );
};

interface WoundDisplayProps {
  wounds: Character['wounds'];
}

/**
 * WoundDisplay Component
 * 
 * Shows a list of character wounds with visual indicators for severity.
 * Wounds are sorted by severity (most severe first) and include strength
 * reduction information.
 */
const WoundDisplay: React.FC<WoundDisplayProps> = ({ wounds }) => {
  const severityOrder = ['mortal', 'serious', 'light'] as const;
  
  // Sort wounds by severity (most severe first) and then by location
  const sortedWounds = [...wounds].sort((a, b) => {
    const severityA = severityOrder.indexOf(a.severity);
    const severityB = severityOrder.indexOf(b.severity);
    if (severityA !== severityB) return severityA - severityB;
    return a.location.localeCompare(b.location);
  });

  return wounds.length > 0 ? (
    <div className="mt-4" data-testid="wound-display">
      <h3 className="text-sm font-medium mb-2">Wounds</h3>
      <ul className="space-y-2">
        {sortedWounds.map((wound, index) => (
          <li 
            key={`${wound.location}-${index}`}
            className={`
              rounded-sm p-1.5
              ${wound.severity === 'light' ? 'bg-yellow-50 text-yellow-700' : ''}
              ${wound.severity === 'serious' ? 'bg-red-50 text-red-700' : ''}
              ${wound.severity === 'mortal' ? 'bg-red-100 text-red-900 font-bold' : ''}
            `}
            data-testid={`wound-${index}`}
          >
            <div className="flex justify-between items-start">
              <span>{wound.location}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-opacity-50 bg-black text-white">
                -{wound.strengthReduction} STR
              </span>
            </div>
            <div className="text-xs mt-0.5 opacity-75">
              {wound.severity.charAt(0).toUpperCase() + wound.severity.slice(1)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
};

interface StatusDisplayManagerProps {
  character: Character;
  location: string | null;
  onResetStrength?: () => void;  // Add reset handler
}

/**
 * Main StatusDisplayManager component that combines character information,
 * strength bar, and wound display into a cohesive status panel.
 */
const StatusDisplayManager: React.FC<StatusDisplayManagerProps> = ({
  character,
  location,
  onResetStrength
}) => {
  const currentStrength = calculateCurrentStrength(character);
  const maxStrength = character.attributes.baseStrength;

  return (
    <div className="wireframe-section space-y-4">
      <div className="border-b pb-2">
        <h2 className="font-medium text-lg" data-testid="character-name">
          {character.name}
        </h2>
        <p className="text-sm text-gray-600" data-testid="character-location">
          Location: {cleanLocationText(location) || 'Unknown'}
        </p>
      </div>

      <StrengthBar
        current={currentStrength}
        max={maxStrength}
        isUnconscious={character.isUnconscious}
        onReset={onResetStrength}
      />

      <WoundDisplay wounds={character.wounds} />
    </div>
  );
};

export default StatusDisplayManager;
