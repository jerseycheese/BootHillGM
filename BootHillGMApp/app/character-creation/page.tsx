'use client';

import React from 'react';
import { useCharacterCreation } from '../hooks/useCharacterCreation';
import { CharacterForm } from '../components/CharacterCreation/CharacterForm';
import { CharacterSummary } from '../components/CharacterCreation/CharacterSummary';

export default function CharacterCreation() {
  const {
    character,
    showSummary,
    isGeneratingCharacter,
    isGeneratingField,
    isProcessingStep,
    characterSummary,
    error,
    handleSubmit,
    handleFieldChange,
    generateCharacter,
    generateFieldValue,
  } = useCharacterCreation();

  return (
    <div className="wireframe-container">
      <button
        type="button"
        onClick={generateCharacter}
        className={`wireframe-button mb-4 ${isGeneratingCharacter ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isGeneratingCharacter}
        data-testid="generate-character-button"
      >
        Generate Random Character
      </button>
      
      {showSummary ? (
        <CharacterSummary
          character={character}
          summary={characterSummary}
          onSubmit={handleSubmit}
          isLoading={isGeneratingCharacter}
        />
      ) : (
        <CharacterForm
          character={character}
          isGeneratingField={isGeneratingField}
          isProcessingStep={isProcessingStep}
          error={error}
          onFieldChange={handleFieldChange}
          onGenerateField={generateFieldValue}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
