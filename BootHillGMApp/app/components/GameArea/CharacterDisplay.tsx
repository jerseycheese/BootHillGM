/**
 * CharacterDisplay Component
 * 
 * Displays character information in the SidePanel, including
 * character name, attributes, and status.
 */

import React from 'react';
import { Character } from '../../types/character';
import { ActionTypes } from '../../types/actionTypes';
import { Wound } from '../../types/wound';
import type { GameEngineAction } from '../../types/gameActions';

interface CharacterDisplayProps {
  character: Character;
  dispatch?: React.Dispatch<GameEngineAction>;
  showResetButton?: boolean;
}

/**
 * CharacterDisplay component - shows character attributes and status
 */
export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  character,
  dispatch,
  showResetButton = false
}) => {
  // Reset character strength to base value
  const resetStrength = () => {
    if (dispatch && character) {
      dispatch({
        type: ActionTypes.SET_CHARACTER,
        payload: {
          ...character,
          attributes: {
            ...character.attributes,
            strength: character.attributes.baseStrength
          }
        }
      });
    }
  };

  // Calculate strength percentage for the progress bar
  const strengthPercentage = character.attributes 
    ? Math.round((character.attributes.strength / character.attributes.baseStrength) * 100) 
    : 0;

  // Determine strength color based on value
  const getStrengthColor = () => {
    if (strengthPercentage >= 80) return 'text-green-600';
    if (strengthPercentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Determine progress bar color
  const getProgressBarColor = () => {
    if (strengthPercentage >= 80) return 'bg-green-500';
    if (strengthPercentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <>
      <h3 className="text-xl font-bold mb-2">{character.name}</h3>
      
      {/* Strength Display */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span>Strength:</span>
          <span className={`font-semibold ${getStrengthColor()}`}>
            {character.attributes.strength} / {character.attributes.baseStrength}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className={`h-full rounded-full ${getProgressBarColor()}`}
            style={{ width: `${Math.min(100, strengthPercentage)}%` }}
          />
        </div>
      </div>
      
      {/* Other Attributes Grid */}
      <div className="attributes-grid grid grid-cols-2 gap-2 mb-4">
        <div className="attribute-item">
          <span className="attribute-label">Speed:</span>
          <span className="attribute-value">{character.attributes.speed}</span>
        </div>
        <div className="attribute-item">
          <span className="attribute-label">Gun Accuracy:</span>
          <span className="attribute-value">{character.attributes.gunAccuracy}</span>
        </div>
        <div className="attribute-item">
          <span className="attribute-label">Bravery:</span>
          <span className="attribute-value">{character.attributes.bravery}</span>
        </div>
        <div className="attribute-item">
          <span className="attribute-label">Experience:</span>
          <span className="attribute-value">{character.attributes.experience}</span>
        </div>
      </div>
      
      {/* Reset Strength Button (visible in test mode) */}
      {(showResetButton || process.env.NODE_ENV === 'test') && (
        <button 
          onClick={resetStrength}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="reset-strength-button"
        >
          Reset Strength
        </button>
      )}
      
      {/* Wounds Section (if any) */}
      {character.wounds && character.wounds.length > 0 && (
        <div className="wounds-section mt-4">
          <h4 className="font-semibold mb-1">Wounds:</h4>
          <ul className="list-disc pl-4">
            {character.wounds.map((wound: Wound, index: number) => (
              <li key={`wound-${index}`} className="text-red-600">
                {wound.location}: {wound.severity} ({wound.strengthReduction} str)
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default CharacterDisplay;