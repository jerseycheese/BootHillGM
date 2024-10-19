// BootHillGMApp/app/__tests__/game-session/GameSession.test.tsx

import React, { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import GameSession from '../../components/GameSession';
import { getAIResponse } from '../../utils/aiService';
import { getJournalContext } from '../../utils/JournalManager';
import { Character } from '../../types/character';
import { CampaignState } from '../../types/campaign';
import { CampaignStateContext, useCampaignState } from '../../components/CampaignStateManager';

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the AI service
jest.mock('../../utils/aiService', () => ({
  getAIResponse: jest.fn(),
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
}));

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
    inventory: [],
    journal: [],
    gameProgress: 0,
    isCombatActive: false,
    opponent: null,
    savedTimestamp: null,
    ...initialState
  };
  
  const mockContextValue = {
    state: mockState,
    dispatch: mockDispatch,
    saveGame: mockSaveGame,
    loadGame: jest.fn(),
  };
  
  (useCampaignState as jest.Mock).mockReturnValue(mockContextValue);
  
  return render(
    <CampaignStateContext.Provider value={mockContextValue}>
      {ui}
    </CampaignStateContext.Provider>
  );
};

describe('GameSession', () => {
  // Reset all mocks before each test
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

  // Test case: Handling user input and updating the narrative
  test('handles user input and updates narrative', async () => {
    // Render the GameSession component
    renderWithProviders(<GameSession />);
  
    // Wait for the component to finish initializing
    await waitFor(() => {
      expect(screen.queryByText('Loading game session...')).not.toBeInTheDocument();
    });

    // Get the input field and submit button
    const input = screen.getByPlaceholderText('What would you like to do?');
    const submitButton = screen.getByText('Take Action');
  
    // Simulate user input and form submission
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Look around' } });
      fireEvent.click(submitButton);
    });

    // Ensure getJournalContext is called before checking
    expect(getJournalContext).toHaveBeenCalled();
  
    // Wait for and check if the necessary functions were called
    await waitFor(() => {
      expect(getJournalContext).toHaveBeenCalled();
      expect(getAIResponse).toHaveBeenCalledWith('Look around', 'Journal context', expect.any(Array));
    });
  
    // Check if the dispatch function was called with the expected action
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

  // New test case: Handling user input, updating narrative, and managing combat
  test('handles user input, updates narrative, and manages combat', async () => {
    renderWithProviders(<GameSession />);

    // Wait for the component to finish initializing
    await waitFor(() => {
      expect(screen.queryByText('Loading game session...')).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What would you like to do?');
    const submitButton = screen.getByText('Take Action');

    // Simulate user input and form submission
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Look around' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(getJournalContext).toHaveBeenCalled();
      expect(getAIResponse).toHaveBeenCalledWith('Look around', 'Journal context', []);
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

  // New test case: Handling inventory updates
  test('handles inventory updates correctly', async () => {
    renderWithProviders(<GameSession />, {
      inventory: [
        { id: 'potion-1', name: 'Health Potion', quantity: 1, description: 'Restores health' },
      ]
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading game session...')).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What would you like to do?');
    const submitButton = screen.getByText('Take Action');

    // Simulate acquiring an item
    (getAIResponse as jest.Mock).mockResolvedValueOnce({
      narrative: 'You found a sword!',
      acquiredItems: ['Sword'],
      removedItems: [],
    });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Search for items' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      const { dispatch } = useCampaignState();
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ADD_ITEM',
          payload: expect.objectContaining({
            name: 'Sword',
            quantity: 1,
          })
        })
      );
    });

    // Simulate using an item
    (getAIResponse as jest.Mock).mockResolvedValueOnce({
      narrative: 'You used a health potion.',
      acquiredItems: [],
      removedItems: ['Health Potion'],
    });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Use health potion' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      const { dispatch } = useCampaignState();
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'REMOVE_ITEM',
          payload: 'potion-1'
        })
      );
    });
  });

  // Updated test case: Handling invalid inventory items
  test('does not render invalid inventory items', async () => {
    const initialInventory = [
      { id: 'potion-1', name: 'Health Potion', quantity: 1, description: 'Restores health' },
      { id: 'invalid-1', name: 'Invalid Item', quantity: 0, description: 'Should not be rendered' },
      { id: 'invalid-2', name: 'Invalid Quantity Item', quantity: NaN, description: 'Invalid quantity type'},
    ];
    
    renderWithProviders(<GameSession />, {
      inventory: initialInventory
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading game session...')).not.toBeInTheDocument();
    });

    // Check for the valid item
    const validItem = screen.getByText(/Health Potion/);
    expect(validItem).toBeInTheDocument();
    
    // Check for invalid items
    const invalidItem = screen.queryByText('Invalid Item (x0)');
    expect(invalidItem).not.toBeInTheDocument();

    const invalidQuantityItem = screen.queryByText('Invalid Quantity Item (xNaN)');
    expect(invalidQuantityItem).not.toBeInTheDocument();

    // Check that only one item is rendered
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(1);
  });
});
