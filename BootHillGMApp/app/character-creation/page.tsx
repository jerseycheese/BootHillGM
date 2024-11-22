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
      {showSummary ? (
        <CharacterSummary
          character={character}
          summary={characterSummary}
          onSubmit={handleSubmit}
          generateCharacter={generateCharacter}
          isGeneratingCharacter={isGeneratingCharacter}
          isLoading={isProcessingStep}
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
          generateCharacter={generateCharacter}
          isGeneratingCharacter={isGeneratingCharacter}
        />
      )}
    </div>
  );
}
