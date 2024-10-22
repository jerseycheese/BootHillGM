// BootHillGMApp/app/__tests__/game-session/GameSession.test.tsx

import React, { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import GameSession from '../../components/GameSession';
import { getAIResponse } from '../../utils/aiService';
import { getJournalContext } from '../../utils/JournalManager';
import { Character } from '../../types/character';
import { CampaignState } from '../../types/campaign';
import { CampaignStateContext, useCampaignState } from '../../components/CampaignStateManager';
import { generateNarrativeSummary } from '../../utils/aiService';

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the AI service
jest.mock('../../utils/aiService', () => ({
  getAIResponse: jest.fn(),
  generateNarrativeSummary: jest.fn()
}));

// Mock the CampaignStateManager
jest.mock('../../components/CampaignStateManager', () => {
  const actual = jest.requireActual('../../components/CampaignStateManager');
  return {
    ...actual,
    useCampaignState: jest.fn(),
  };
});

// Mock the JournalManager
jest.mock('../../utils/JournalManager', () => ({
  getJournalContext: jest.fn(() => 'Journal context'),
  addJournalEntry: jest.fn(() => [{ timestamp: Date.now(), content: 'Test journal entry' }]),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (getAIResponse as jest.Mock).mockResolvedValue({
    narrative: 'Test narrative',
    acquiredItems: [],
    removedItems: []
  });
  (generateNarrativeSummary as jest.Mock).mockResolvedValue('Test summary');
});

const renderWithProviders = (ui: ReactElement, initialState?: Partial<CampaignState>) => {
  const mockDispatch = jest.fn();
  const mockSaveGame = jest.fn();
  const mockCharacter: Character = {
    name: 'Test Character',
    health: 100,
    attributes: {
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      strength: 5,
      bravery: 5,
      experience: 0
    },
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    }
  };
  const mockState: CampaignState = {
    character: mockCharacter,
    location: 'Test Town',
    narrative: 'Initial narrative',
    inventory: [
      { id: 'health-potion-1', name: 'Health Potion', quantity: 1, description: 'Restores health' },
    ],
    journal: [],
    gameProgress: 0,
    isCombatActive: false,
    opponent: null,
    savedTimestamp: null,
    isClient: true, // Set isClient to true
    ...initialState, // Allow overriding the default value
  };
  
  const mockContextValue = {
    state: mockState,
    dispatch: mockDispatch,
    saveGame: mockSaveGame,
    loadGame: jest.fn(),
  };
  
  (useCampaignState as jest.Mock).mockReturnValue(mockContextValue);

  return {
    ...render(
      <CampaignStateContext.Provider value={mockContextValue}>
        {ui}
      </CampaignStateContext.Provider>
    ),
    mockDispatch,
    mockState
  };
};

describe('GameSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock return values for the AI response
    (getAIResponse as jest.Mock).mockResolvedValue({
      narrative: 'AI response',
      location: 'Test Town',
      acquiredItems: [],
      removedItems: [],
    });
    
    // Set up mock return value for the journal context
    (getJournalContext as jest.Mock).mockReturnValue('Journal context');
  });

  test('handles user input and updates narrative', async () => {
    renderWithProviders(<GameSession />);
  
    await waitFor(() => {
      expect(screen.queryByText('Loading game session...')).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What would you like to do?');
    const submitButton = screen.getByText('Take Action');
  
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Look around' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(getJournalContext).toHaveBeenCalled();
      expect(getAIResponse).toHaveBeenCalledWith('Look around', 'Journal context', expect.any(Array));
    });
  
    await waitFor(() => {
      const { dispatch } = useCampaignState();
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_NARRATIVE',
          payload: expect.stringContaining('AI response')
        })
      );
    });
  });

  test('handles user input, updates narrative, and manages combat', async () => {
    renderWithProviders(<GameSession />);

    await waitFor(() => {
      expect(screen.queryByText('Loading game session...')).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What would you like to do?');
    const submitButton = screen.getByText('Take Action');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Look around' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(getJournalContext).toHaveBeenCalled();
      expect(getAIResponse).toHaveBeenCalledWith('Look around', 'Journal context', expect.any(Array));
    });

    // Simulate combat initiation
    (getAIResponse as jest.Mock).mockResolvedValue({
      narrative: 'A bandit appears!',
      combatInitiated: true,
      opponent: { name: 'Bandit', health: 50 },
      acquiredItems: [],
      removedItems: [],
    });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Look around' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      const { dispatch } = useCampaignState();
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_NARRATIVE',
          payload: expect.stringContaining('A bandit appears!')
        })
      );
    });
  });

  test('handles inventory updates correctly', async () => {
    const { mockDispatch } = renderWithProviders(<GameSession />);

    // Mock AI response for inventory update
    (getAIResponse as jest.Mock).mockResolvedValueOnce({
      narrative: 'You found a sword!',
      acquiredItems: ['Sword'],
      removedItems: [],
    });

    // Simulate user input
    const input = screen.getByPlaceholderText('What would you like to do?');
    const submitButton = screen.getByText('Take Action');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Search for items' } });
      fireEvent.click(submitButton);
    });

    // First, check for narrative update
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_NARRATIVE',
          payload: expect.stringContaining('You found a sword!')
        })
      );
    });

    // Then, check for inventory update
    await waitFor(() => {
      const calls = mockDispatch.mock.calls;
      const addItemCall = calls.find(call => call[0].type === 'ADD_ITEM');
      expect(addItemCall).toBeTruthy();
      expect(addItemCall[0]).toEqual(
        expect.objectContaining({
          type: 'ADD_ITEM',
          payload: expect.objectContaining({
            name: 'Sword',
            quantity: 1,
          })
        })
      );
    });
  });

  test('renders inventory items correctly', async () => {
    const initialInventory = [
      { id: 'potion-1', name: 'Health Potion', quantity: 1, description: 'Restores health' },
      { id: 'sword-1', name: 'Sword', quantity: 1, description: 'A sharp sword' },
    ];
    
    renderWithProviders(<GameSession />, {
      inventory: initialInventory,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading game session...')).not.toBeInTheDocument();
    });

    // Check for the valid items
    expect(screen.getByText('Health Potion (x1)')).toBeInTheDocument();
    expect(screen.getByText('Sword (x1)')).toBeInTheDocument();
    
    // Check that only two items are rendered
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(2);
  });
});
