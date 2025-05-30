import React from 'react';
import { useCampaignState } from '../../hooks/useCampaignStateContext';
import { Character } from '../../types/character';
import { createMockCharacter, initialCharacter } from './characterData';

type CharacterFieldKey = keyof Character['attributes'] | 'name';

const mockCharacterState = {
  character: initialCharacter,
  setCharacter: null as React.Dispatch<React.SetStateAction<Character>> | null
};

function useCharacterCreationHandler() {
  const campaignStateContext = useCampaignState();

  // Handle potential null context (though unlikely in a test with providers)
  if (!campaignStateContext) {
    // Throw an error if context is unexpectedly null
    throw new Error('useCampaignState must be used within a CampaignStateProvider in this test.');
  }

  const { cleanupState, saveGame } = campaignStateContext;


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (e.currentTarget.dataset.testid === 'character-creation-form') {
      try {
        const mockCharacter = await createMockCharacter();
        const savedData = {
          character: mockCharacter,
          currentStep: 1,
          lastUpdated: Date.now()
        };
        window.localStorage.setItem('character-creation-progress', JSON.stringify(savedData));

        if (savedData.currentStep === 1) {
          window.localStorage.removeItem('character-creation-progress');
          cleanupState();
          saveGame();
        }
      } catch { // Add error parameter
        // Intentionally empty: Error handling for saving game state in mock is not needed
      }
    }
  };

  return { handleSubmit };
}

// Mock useCharacterCreation hook with proper state management
export const useCharacterCreationMock = () => {
  const [character, setCharacter] = React.useState<Character>(initialCharacter);
  const [isGeneratingCharacter, setIsGeneratingCharacter] = React.useState(false);

  // Store the setState function for use in tests
  mockCharacterState.setCharacter = setCharacter;

  const generateCharacter = React.useCallback(async () => {
    setIsGeneratingCharacter(true);
    try {
      const mockCharacter = await createMockCharacter();
      setCharacter(mockCharacter); // Update the character state

      // Store in localStorage
      const savedData = {
        character: mockCharacter,
        currentStep: 0,
        lastUpdated: Date.now()
      };
      window.localStorage.setItem('character-creation-progress', JSON.stringify(savedData));
    } finally {
      setIsGeneratingCharacter(false);
    }
  }, []);

  const handleFieldChange = React.useCallback((field: CharacterFieldKey, value: string | number) => {
    setCharacter(prev => {
      if (field === 'name') {
        return { ...prev, name: value.toString() };
      }
      if (field in prev.attributes) {
        return {
          ...prev,
          attributes: {
            ...prev.attributes,
            [field]: Number(value)
          }
        };
      }
      return {
        ...prev
      };
    });
  }, []);

  return {
    character,
    showSummary: false,
    isGeneratingCharacter,
    isGeneratingField: false,
    isProcessingStep: false,
    characterSummary: 'Test summary',
    error: '',
    handleSubmit: useCharacterCreationHandler().handleSubmit,
    handleFieldChange,
    generateCharacter,
    generateFieldValue: jest.fn().mockImplementation(async () => {
      return 10;
    }),
  };
};

export { mockCharacterState, useCharacterCreationHandler };
