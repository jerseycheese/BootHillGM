// Mock aiService before imports
jest.mock('../utils/aiService', () => ({
  generateFieldValue: jest.fn().mockImplementation(async (key: string) => {
    if (key === 'name') {
      // Ensure we return a random name that isn't "John Doe"
      const names = ['Billy the Kid', 'Wyatt Earp', 'Annie Oakley', 'Doc Holliday', 'Jesse James'];
      return names[Math.floor(Math.random() * names.length)];
    }
    const ranges: Record<string, [number, number]> = {
      name: [0, 0],
      speed: [1, 20],
      gunAccuracy: [1, 20],
      throwingAccuracy: [1, 20],
      strength: [8, 20],
      baseStrength: [8, 20],
      bravery: [1, 20],
      experience: [0, 11],
      shooting: [1, 100],
      riding: [1, 100],
      brawling: [1, 100]
    };
    const [min, max] = ranges[key] || [1, 100];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }),
  generateCharacterSummary: jest.fn().mockResolvedValue('Character summary'),
  getCharacterCreationStep: jest.fn().mockResolvedValue('Mock AI prompt'),
  validateAttributeValue: jest.fn().mockReturnValue(true)
}));

import { render, screen, act, RenderResult, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';
import CharacterCreationPage from '../character-creation/page';
import { getStartingInventory } from '../utils/startingInventory';
import { useCampaignState } from '../components/CampaignStateManager';
import { Character } from '../types/character';

type CharacterFieldKey = keyof Character['attributes'] | keyof Character['skills'] | 'name';

let mockRouterPush: jest.Mock;

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

// Initial character state for testing
const initialCharacter: Character = {
  name: '',
  attributes: {
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 0,
    baseStrength: 0,
    bravery: 0,
    experience: 0,
  },
  skills: {
    shooting: 0,
    riding: 0,
    brawling: 0,
  },
  wounds: [],
  isUnconscious: false
};

// Dynamically generate mock character with AI-generated name
async function createMockCharacter(): Promise<Character> {
  const names = ['Billy the Kid', 'Wyatt Earp', 'Annie Oakley', 'Doc Holliday', 'Jesse James'];
  const randomName = names[Math.floor(Math.random() * names.length)];
  
  return {
    name: randomName,
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5
    },
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    },
    wounds: [],
    isUnconscious: false
  };
}

function useCharacterCreationHandler() {
  const { cleanupState, saveGame } = useCampaignState();

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
jest.mock('../hooks/useCharacterCreation', () => {                                                                                              
  const originalModule = jest.requireActual('../hooks/useCharacterCreation');                                                                   
  return {                                                                                                                                      
    ...originalModule,                                                                                                                          
    useCharacterCreation: () => {                                                                                                               
      const [character, setCharacter] = React.useState<Character>(initialCharacter);                                                            
      const [isGeneratingCharacter, setIsGeneratingCharacter] = React.useState(false);                                                          
                                                                                                                                                
      const generateCharacter = React.useCallback(async () => {                                                                                 
        setIsGeneratingCharacter(true);                                                                                                         
        try {                                                                                                                                   
          const mockCharacter = await createMockCharacter();                                                                                    
          // Ensure we're updating the state with the mock character                                                                            
          await act(async () => {                                                                                                               
            setCharacter(mockCharacter);                                                                                                        
          });                                                                                                                                   
                                                                                                                                                
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
            ...prev,                                                                                                                            
            skills: {                                                                                                                           
              ...prev.skills,                                                                                                                   
              [field]: Number(value)                                                                                                            
            }                                                                                                                                   
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
        generateFieldValue: jest.fn().mockImplementation(async (field: CharacterFieldKey) => {                                                  
          const value = await originalModule.generateFieldValue(field);                                                                         
          handleFieldChange(field, value);                                                                                                      
          return value;                                                                                                                         
        }),                                                                                                                                     
      };                                                                                                                                        
    },                                                                                                                                          
    STEP_DESCRIPTIONS: originalModule.STEP_DESCRIPTIONS                                                                                         
  };                                                                                                                                            
});   

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

export const setupMocks = () => {
  mockRouterPush = jest.fn();
  const mockCleanupState = jest.fn();

  const mockLocalStorage = createMockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  return { mockPush: mockRouterPush, mockCleanupState, mockLocalStorage };
};

export const setupTestEnvironment = () => {
  // Setup any necessary environment for tests
};

export const cleanupTestEnvironment = () => {
  // Cleanup any environment setup for tests
};

interface RenderCharacterCreationResult extends RenderResult {
  input: HTMLElement;
  generateButton: HTMLElement;
}

const renderComponent = (): RenderResult => {
  return customRender(React.createElement(CharacterCreationPage));
};

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

export const getMockInitialState = () => ({
  character: initialCharacter,
  currentStep: 0,
  lastUpdated: Date.now()
});

export { createMockLocalStorage };
