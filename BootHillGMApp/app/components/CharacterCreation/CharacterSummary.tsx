'use client';

import React from 'react';
import { LoadingScreen } from '../GameArea/LoadingScreen';
import { Character } from '../../types/character';
import { STEP_DESCRIPTIONS } from '../../hooks/useCharacterCreation';

interface CharacterSummaryProps {
  character: Character;
  summary: string;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  onGoBack: () => void;
}

/**
 * Displays final character summary with attributes.
 * Shows AI-generated background and allows submission
 * to complete character creation.
 */
export function CharacterSummary({
  character,
  summary,
  onSubmit,
  isLoading,
  onGoBack
}: CharacterSummaryProps) {
  
  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    onGoBack();
  };

  if (isLoading) {
    return (
      <LoadingScreen 
        type="general" 
        size="small" 
        fullscreen={false} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleGoBack}
          className="wireframe-button"
          data-testid="go-back-button"
          role="button"
        >
          Go back and make changes
        </button>
        <button 
          type="button"
          onClick={onSubmit}
          className="wireframe-button primary"
          data-testid="start-game-button"
        >
          Start Game
        </button>
      </div>

      <div className="space-y-6" data-testid="character-summary-form">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Character Summary</h2>
          
          {/* AI-generated character background */}
          <p className="mb-4">{summary}</p>
        
          {/* Static character details */}
          <div className="space-y-4">
            <p><strong>Name:</strong> {character.name}</p>
            
            <div>
              <h3 className="text-lg font-bold">Attributes</h3>
              {Object.entries(character.attributes).map(([attr, value]) => (
                <p key={attr}>
                  <strong>{STEP_DESCRIPTIONS[attr]?.title || attr}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                </p>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
