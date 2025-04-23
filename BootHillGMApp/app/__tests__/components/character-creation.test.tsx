// Mock Next.js navigation at the top level, before any imports
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: { /* Intentionally empty */ },
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock character service
jest.mock('../../services/ai/characterService', () => ({
  generateCompleteCharacter: jest.fn().mockResolvedValue({
    name: 'Test Character',
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5,
    },
    minAttributes: {
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 8,
      baseStrength: 8,
      bravery: 1,
      experience: 0,
    },
    maxAttributes: {
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      strength: 20,
      baseStrength: 20,
      bravery: 20,
      experience: 11,
    },
    wounds: [],
    isUnconscious: false,
    isNPC: false,
    isPlayer: true,
    inventory: [],
  }),
  generateCharacterSummary: jest.fn().mockResolvedValue('Test character summary'),
}));

// Mock CampaignStateManager
jest.mock('../../components/CampaignStateManager', () => ({
  useCampaignState: jest.fn(),
}));

import '@testing-library/jest-dom';
import { screen, act, fireEvent } from '@testing-library/react';
import { useCampaignState } from '../../components/CampaignStateManager';
import { setupMocks } from '../../test/setup/mockSetup';
import { renderCharacterForm } from '../../test/utils/characterTestUtils';

describe('Character Form', () => {
  const { mockLocalStorage } = setupMocks();
  let mockSaveGame: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveGame = jest.fn((state) => {
      mockLocalStorage.setItem('campaignState', JSON.stringify(state));
    });
    
    (useCampaignState as jest.Mock).mockImplementation(() => ({
      cleanupState: jest.fn(),
      saveGame: mockSaveGame,
      state: { /* Intentionally empty */ }, // Add empty state to prevent undefined state errors
      dispatch: jest.fn()
    }));

    // Clear any stored character creation progress
    mockLocalStorage.removeItem('character-creation-progress');
  });

  it('renders the character form with initial values', () => {
    const { generateButton } = renderCharacterForm();
    
    // Check that the button exists
    expect(generateButton).toBeInTheDocument();
    
    // Check for name input
    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe('Test Character');
    
    // Check for attribute inputs
    const speedInput = screen.getByTestId('speed-input') as HTMLInputElement;
    expect(speedInput).toBeInTheDocument();
    expect(speedInput.value).toBe('10');
    
    const strengthInput = screen.getByTestId('strength-input') as HTMLInputElement;
    expect(strengthInput).toBeInTheDocument();
    expect(strengthInput.value).toBe('10');
  });

  it('calls generateCharacter when the button is clicked', async () => {
    const generateCharacter = jest.fn().mockResolvedValue(undefined);
    const { generateButton } = renderCharacterForm({ generateCharacter });
    
    await act(async () => {
      fireEvent.click(generateButton);
    });
    
    expect(generateCharacter).toHaveBeenCalledTimes(1);
  });

  it('updates field value when changed', () => {
    const onFieldChange = jest.fn();
    renderCharacterForm({ onFieldChange });
    
    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'New Character Name' } });
    });
    
    expect(onFieldChange).toHaveBeenCalledWith('name', 'New Character Name');
  });

  it('generates a specific field when its generate button is clicked', async () => {
    const onGenerateField = jest.fn().mockResolvedValue(undefined);
    renderCharacterForm({ onGenerateField });
    
    const generateNameButton = screen.getByTestId('generate-name-button');
    
    await act(async () => {
      fireEvent.click(generateNameButton);
    });
    
    expect(onGenerateField).toHaveBeenCalledWith('name');
  });

  it('submits the form when view summary button is clicked', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderCharacterForm({ onSubmit });
    
    const viewSummaryButton = screen.getByTestId('view-summary-button');
    
    await act(async () => {
      fireEvent.click(viewSummaryButton);
    });
    
    expect(onSubmit).toHaveBeenCalled();
  });
});
