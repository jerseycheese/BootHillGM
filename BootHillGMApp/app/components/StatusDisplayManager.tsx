/**
 * StatusDisplayManager Component
 * 
 * Displays a character's current status including strength, location, and wounds.
 * Features a responsive design with visual feedback for different health states
 * and wound severities.
 */

'use client';

import React, { memo } from 'react';
import { Character } from '../types/character';
import { getCharacterStrength } from '../utils/strengthSystem';
import { useLocation } from '../hooks/useLocation';
import { useCampaignState } from './CampaignStateManager';
import { LocationType } from '../services/locationService';

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
  location: LocationType | null;
}

function StatusDisplayManager({ character, location }: StatusDisplayManagerProps) {
    const { dispatch } = useCampaignState();
    const { locationState } = useLocation();
    const currentStrength = getCharacterStrength(character);
    const maxStrength = character.attributes.baseStrength;
    const displayLocation = location;

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
        dispatch({
            type: 'UPDATE_CHARACTER',
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

    return (
      <div id="bhgmStatusDisplayManager" data-testid="status-display-manager" className="wireframe-section space-y-4 bhgm-status-display-manager">
            <div className="border-b pb-2">
                <h2 className="font-medium text-lg" data-testid="character-name">
                    {character.name}
                </h2>
                <p className="text-sm text-gray-600" data-testid="character-location">
                    Location: {displayLocation ? getLocationDisplay(displayLocation) : 'Unknown'}
                </p>
            </div>

            <StrengthBar
              current={currentStrength}
              max={maxStrength}
              isUnconscious={character.isUnconscious}
              onReset={handleResetStrength}
            />

            {/* Location History */}
            {locationState.history.length > 0 && (
              <div className="location-history text-sm" data-testid="location-history">
                <div className="text-gray-600 font-semibold mb-1">
                  Location History:
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {locationState.history
                    .slice()
                    .reverse()
                    .map((loc, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-xs py-1 border-b border-gray-200 last:border-0"
                        data-testid={`location-history-${index}`}
                      >
                        <span className="text-gray-700">
                          {loc.type === 'town'
                            ? loc.name
                            : loc.type === 'wilderness'
                            ? loc.description
                            : loc.type === 'landmark'
                            ? `${loc.name}${
                                loc.description ? ` (${loc.description})` : ''
                              }`
                            : 'Unknown'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

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

            <WoundDisplay wounds={character.wounds} />
        </div>
    );
};

export default memo(StatusDisplayManager);
