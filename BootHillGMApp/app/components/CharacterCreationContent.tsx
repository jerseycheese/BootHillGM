'use client';

import React from 'react';
import { useCharacterCreation } from '../hooks/useCharacterCreation';
import { CharacterForm } from '../components/CharacterCreation/CharacterForm';
import { CharacterSummary } from '../components/CharacterCreation/CharacterSummary';

export default function CharacterCreationContent() {
  const {
    character,
    showSummary,
    setShowSummary,
    isGeneratingField,
    characterSummary,
    error,
    handleSubmit,
    handleFieldChange,
    generateFieldValue,
    generateFullCharacter,
  } = useCharacterCreation();

  return (
    <div id="bhgmCharacterCreationContent" data-testid="character-creation-content" className="wireframe-container bhgm-character-creation-content">
      {showSummary ? (
        <CharacterSummary
          character={character}
          summary={characterSummary}
          onSubmit={handleSubmit}
          isLoading={isGeneratingField}
          onGoBack={() => setShowSummary(false)}
        />
      ) : (
        <CharacterForm
          character={character}
          isGeneratingField={isGeneratingField}
          error={error}
          onFieldChange={handleFieldChange}
          onGenerateField={generateFieldValue}
          onSubmit={handleSubmit}
          generateCharacter={generateFullCharacter}
          isGeneratingCharacter={isGeneratingField}
        />
      )}
    </div>
  );
}
