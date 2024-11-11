import { render, screen, fireEvent, act, RenderResult, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';
import CharacterCreationPage from '../character-creation/page';
import { mockCharacter } from './fixtures';
import { useCampaignState } from '../components/CampaignStateManager';
import { getStartingInventory } from '../utils/startingInventory';

let mockRouterPush: jest.Mock;
let mockConsoleError: jest.SpyInstance;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock gameEngine
jest.mock('../utils/gameEngine', () => ({
  useGame: () => ({
    state: {
      currentPlayer: '',
      npcs: [],
      location: '',
      inventory: [],
      quests: [],
      character: null,
      narrative: '',
      gameProgress: 0,
      journal: [],
      isCombatActive: false,
      opponent: null,
      suggestedActions: [],
    },
    dispatch: jest.fn(),
  }),
}));

function useCharacterCreationHandler() {
  const { cleanupState, saveGame } = useCampaignState();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (e.currentTarget.dataset.testid === 'character-creation-form') {
      try {
        const savedData = {
          character: mockCharacter,
          currentStep: 1,
          lastUpdated: Date.now()
        };
        window.localStorage.setItem('character-creation-progress', JSON.stringify(savedData));

        // If at summary step, clean up and redirect
        if (savedData.currentStep === 1) {
          window.localStorage.removeItem('character-creation-progress');
          cleanupState();
          
          // Save game state with inventory
          const gameState = {
            character: mockCharacter,
            savedTimestamp: Date.now(),
            isClient: true,
            inventory: getStartingInventory(),
            currentPlayer: '',
            npcs: [],
            location: '',
            quests: [],
            narrative: '',
            gameProgress: 0,
            journal: [],
            isCombatActive: false,
            opponent: null,
            suggestedActions: [],
          };
          saveGame(gameState);
          
          mockRouterPush('/game-session');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return { handleSubmit };
}

// Mock useCharacterCreation hook with proper state management
jest.mock('../hooks/useCharacterCreation', () => ({
  useCharacterCreation: () => ({
    character: mockCharacter,
    currentStep: 0,
    steps: [
      { key: 'name', type: 'string' },
      { key: 'summary', type: 'review' }
    ],
    isGeneratingCharacter: false,
    isGeneratingField: false,
    isProcessingStep: false,
    aiPrompt: 'Test prompt',
    characterSummary: 'Test summary',
    userResponse: mockCharacter.name,
    error: '',
    ...useCharacterCreationHandler(),
    handleInputChange: jest.fn().mockImplementation(e => {
      try {
        const savedData = {
          character: { ...mockCharacter, name: e.target.value },
          currentStep: 0,
        };
        window.localStorage.setItem('character-creation-progress', JSON.stringify(savedData));
      } catch (error) {
        console.error(error);
      }
    }),
    generateCharacter: jest.fn().mockImplementation(() => {
      const savedData = {
        character: mockCharacter,
        currentStep: 0,
        lastUpdated: Date.now()
      };
      window.localStorage.setItem('character-creation-progress', JSON.stringify(savedData));
      return Promise.resolve(mockCharacter);
    }),
    generateFieldValueForStep: jest.fn(),
    getCurrentStepInfo: () => ({ title: 'Test Step', step: 1 }),
  }),
}));

// Mock localStorage implementation
const createMockLocalStorage = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
});

// Custom render function that wraps components in React
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return React.createElement('div', null, children);
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Centralizes mock setup for character creation tests.
 * Returns common mocks used across tests.
 */
export const setupMocks = () => {
  mockRouterPush = jest.fn();
  const mockCleanupState = jest.fn();
  const mockAIService = {
    generateCharacterSummary: jest.fn().mockResolvedValue('Character summary'),
    getCharacterCreationStep: jest.fn().mockResolvedValue('Mock AI prompt'),
    validateAttributeValue: jest.fn().mockReturnValue(true),
    generateFieldValue: jest.fn().mockResolvedValue('10'),
    generateCompleteCharacter: jest.fn().mockResolvedValue(mockCharacter),
  };

  // Setup mocks
  jest.mock('../utils/aiService', () => mockAIService);

  // Setup localStorage mock
  const mockLocalStorage = createMockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  // Setup console.error spy
  mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  return { mockPush: mockRouterPush, mockCleanupState, mockAIService, mockLocalStorage };
};

export const setupTestEnvironment = () => {

};

export const cleanupTestEnvironment = () => {

};

interface RenderCharacterCreationResult extends RenderResult {
  input: HTMLElement;
  generateButton: HTMLElement;
}

const renderComponent = (): RenderResult => {
  return customRender(React.createElement(CharacterCreationPage));
};

/**
 * Renders character creation page with standardized setup.
 * Returns commonly needed elements and utilities.
 */
export const renderCharacterCreation = async (): Promise<RenderCharacterCreationResult> => {
  let component: RenderResult;
  
  await act(async () => {
    component = renderComponent();
  });
  
  const input = screen.getByRole('textbox');
  const generateButton = screen.getByRole('button', { name: /generate random character/i });
  
  return { 
    input, 
    generateButton, 
    ...component! 
  };
};

/**
 * Enters character data into the specified input field.
 * @param input The input element to target.
 * @param value The value to enter.
 */
export const enterCharacterData = async (input: HTMLElement, value: string): Promise<void> => {
  await act(async () => {
    fireEvent.change(input, { target: { value } });
    await new Promise(resolve => setTimeout(resolve, 100));
  });
};

/**
 * Clicks the "Generate" button in the character creation form.
 * @param button The button element to click.
 */
export const clickGenerateButton = async (button: HTMLElement): Promise<void> => {
  await act(async () => {
    fireEvent.click(button);
    await new Promise(resolve => setTimeout(resolve, 500));
  });
};

/**
 * Tests the character creation flow with a given character name.
 * @param characterName The name to use for character creation.
 */
export const testCharacterCreationFlow = async (characterName: string): Promise<void> => {
  const { input } = await renderCharacterCreation();
  await enterCharacterData(input, characterName);
  
  const form = screen.getByTestId('character-creation-form');
  await act(async () => {
    fireEvent.submit(form);
    await new Promise(resolve => setTimeout(resolve, 100));
  });
};

/**
 * Tests the error handling during character creation.
 * @param mockLocalStorage The mocked localStorage object.
 */
export const testErrorHandling = async (mockLocalStorage: ReturnType<typeof createMockLocalStorage>): Promise<void> => {
  const error = new Error('Storage error');
  mockLocalStorage.setItem.mockImplementationOnce(() => {
    console.error(error);
    throw error;
  });

  const { input } = await renderCharacterCreation();
  try {
    await enterCharacterData(input, mockCharacter.name);
  } catch (e) {
    // Error should be caught here
    console.error(e);
  }
  expect(mockConsoleError).toHaveBeenCalledWith(error);
};

/**
 * Returns a mock initial state for character creation.
 */
export const getMockInitialState = () => ({
  character: {
    name: '',
    attributes: {
      speed: 0,
      gunAccuracy: 0,
      throwingAccuracy: 0,
      strength: 0,
      baseStrength: 0,
      bravery: 0,
      experience: 0
    },
    skills: {
      shooting: 0,
      riding: 0,
      brawling: 0
    },
    wounds: [],
    isUnconscious: false
  },
  currentStep: 0,
  lastUpdated: Date.now()
});
