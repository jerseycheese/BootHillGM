'use client';

import React from 'react';
import { useCharacterCreation } from '../hooks/useCharacterCreation';
import { CharacterCreationForm } from '../components/CharacterCreation/CharacterCreationForm';
import { CharacterSummary } from '../components/CharacterCreation/CharacterSummary';

export default function CharacterCreation() {
  const {
    character,
    currentStep,
    steps,
    isGeneratingCharacter,
    isGeneratingField,
    isProcessingStep,
    aiPrompt,
    characterSummary,
    userResponse,
    error,
    handleSubmit,
    handleInputChange,
    generateCharacter,
    generateFieldValueForStep,
    getCurrentStepInfo,
  } = useCharacterCreation();

  return (
    <div className="wireframe-container">
      {currentStep < steps.length - 1 && (
        <button
          type="button"
          onClick={generateCharacter}
          className={`wireframe-button mb-4 ${isGeneratingCharacter ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isGeneratingCharacter}
        >
          Generate Random Character
        </button>
      )}
      
      {currentStep === steps.length - 1 ? (
        <CharacterSummary
          character={character}
          summary={characterSummary}
          onSubmit={handleSubmit}
          isLoading={isGeneratingCharacter}
        />
      ) : (
        <CharacterCreationForm
          step={getCurrentStepInfo()}
          aiPrompt={aiPrompt}
          onSubmit={handleSubmit}
          isProcessing={isProcessingStep}
          userResponse={userResponse}
          error={error}
          isGeneratingField={isGeneratingField}
          onInputChange={handleInputChange}
          onGenerateField={generateFieldValueForStep}
        />
      )}
    </div>
  );
}
