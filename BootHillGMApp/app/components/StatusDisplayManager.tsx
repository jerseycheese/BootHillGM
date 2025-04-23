/**
 * StatusDisplayManager Component
 * 
 * Displays a character's current status including strength, location, and wounds.
 * Features a responsive design with visual feedback for different health states
 * and wound severities.
 */

'use client';

import React, { memo, useEffect } from 'react';
import { Character } from '../types/character';
import { getCharacterStrength } from '../utils/strengthSystem';
import { useGameState } from '../context/GameStateProvider'; // Import correct hook
import { LocationType } from '../services/locationService';
import { ActionTypes } from '../types/actionTypes'; // Import ActionTypes

interface StrengthBarProps {
    current: number;
    max: number;
    showValue?: boolean;
    isUnconscious?: boolean;
    onReset?: () => void;
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
  isUnconscious = false,
  onReset
}) => {
  const strengthPercentage = Math.max(1, (current / max) * 100);
  
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
              className={`text-sm font-bold ${
                current < 6 ? 'text-red-600' :
                current >= 6 && current <= 12 ? 'text-yellow-600' :
                'text-green-600'
              } transition-colors duration-300`}
              data-testid="strength-value"
            >
              {current}/{max}
              {isUnconscious && (
                <span className="text-red-600 ml-2 text-xs">(Unconscious)</span>
              )}
            </span>
            {process.env.NODE_ENV !== 'production' && (
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
const WoundDisplay: React.FC<WoundDisplayProps> = ({ wounds = [] }) => {
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
  location: LocationType | null;
}

/**
 * StatusDisplayManager Component
 */
export const StatusDisplayManager: React.FC<StatusDisplayManagerProps> = ({ 
  character, 
  location 
}) => {
    // Use the correct state hook
    const { dispatch } = useGameState();
    
    // Add null/undefined checks for character and attributes
    const currentStrength = character ? getCharacterStrength(character) : 0;
    const maxStrength = character?.attributes?.baseStrength ?? 10;
    const displayLocation = location;
    
    // Safely access character properties with null checks
    const characterName = character?.name || 'Unknown Character';
    const characterWounds = character?.wounds || [];
    const isUnconscious = character?.isUnconscious || false;
    const strengthHistory = character?.strengthHistory || { baseStrength: 0, changes: [] };
    
    // Debug log to see character data
    useEffect(() => {
        if (!character) {
            console.warn('StatusDisplayManager: Character is null or undefined');
        }
    }, [character]);

    const getLocationDisplay = (location: LocationType): string => {
        switch (location.type) {
            case 'town':
                return location.name;
            case 'wilderness':
                return location.description;
            case 'landmark':
                return `${location.name}${location.description ? ` (${location.description})` : ''}`;
            default:
                return 'Unknown Location';
        }
    };

    const handleResetStrength = () => {
        if (!character || !character.attributes) return;
        
        dispatch({
            // Use the standardized action type from ActionTypes
            type: ActionTypes.SET_CHARACTER,
            payload: {
                ...character,
                wounds: [],
                attributes: {
                    ...character.attributes,
                    baseStrength: character.attributes.baseStrength,
                    strength: character.attributes.baseStrength
                },
                isUnconscious: false
            }
        });
    };

    // Render a fallback if character is null or undefined
    if (!character) {
        return (
            <div id="bhgmStatusDisplayManager" data-testid="status-display-manager" className="wireframe-section space-y-4 bhgm-status-display-manager">
                <div className="border-b pb-2">
                    <h2 className="font-medium text-lg" data-testid="character-name">
                        No Character Data
                    </h2>
                </div>
                <p className="text-sm text-gray-600">Character information unavailable</p>
            </div>
        );
    }

    return (
      <div id="bhgmStatusDisplayManager" data-testid="status-display-manager" className="wireframe-section space-y-4 bhgm-status-display-manager">
            <div className="border-b pb-2">
                <h2 className="font-medium text-lg" data-testid="character-name">
                    {characterName}
                </h2>
                <p className="text-sm text-gray-600" data-testid="character-location">
                    Location: {displayLocation ? getLocationDisplay(displayLocation) : 'Unknown'}
                </p>
            </div>

            <StrengthBar
              current={currentStrength}
              max={maxStrength}
              isUnconscious={isUnconscious}
              onReset={handleResetStrength}
            />

            {/* Strength History Section */}
            {strengthHistory && strengthHistory.changes.length > 0 && (
                <div className="strength-history text-sm" data-testid="strength-history">
                    <div className="text-gray-600 font-semibold mb-1">Strength History:</div>
                    <div className="max-h-32 overflow-y-auto">
                        {strengthHistory.changes.slice().reverse().map((change, index) => (
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

            <WoundDisplay wounds={characterWounds} />
        </div>
    );
};

// Make the component memoized for better performance
export default memo(StatusDisplayManager);