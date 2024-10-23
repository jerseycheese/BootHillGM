import React from 'react';
import { render, screen, fireEvent, waitFor, act, RenderResult } from '@testing-library/react';
import GameSession from '../../components/GameSession';
import { CampaignStateContext, useCampaignState } from '../../components/CampaignStateManager';
import { useAIInteractions } from '../../hooks/useAIInteractions';
import { getAIResponse } from '../../services/ai';
import { generateNarrativeSummary } from '../../utils/aiService';
import { getJournalContext } from '../../utils/JournalManager';
import { CampaignState } from '../../types/campaign';
import { Character } from '../../types/character';

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the AI service and related functions
jest.mock('../../services/ai', () => ({
  getAIResponse: jest.fn(),
}));

jest.mock('../../utils/aiService', () => ({
  generateNarrativeSummary: jest.fn(),
}));

jest.mock('../../utils/JournalManager', () => ({
  getJournalContext: jest.fn(),
}));

// Mock the useAIInteractions hook
jest.mock('../../hooks/useAIInteractions', () => ({
  useAIInteractions: jest.fn(),
}));

// Mock the CampaignStateManager
jest.mock('../../components/CampaignStateManager', () => {
  const actual = jest.requireActual('../../components/CampaignStateManager');
  return {
    ...actual,
    useCampaignState: jest.fn(),
  };
});

const mockHandleUserInput = jest.fn();
const mockDispatch = jest.fn();

interface RenderWithProvidersResult extends RenderResult {
  mockDispatch: jest.Mock;
}

const renderWithProviders = (ui: React.ReactElement, initialState?: Partial<CampaignState>): RenderWithProvidersResult => {
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
    inventory: [{ id: 'health-potion-1', name: 'Health Potion', quantity: 1, description: 'Restores health' }],
    journal: [],
    isClient: true,
    savedTimestamp: null,
    gameProgress: 0,
    isCombatActive: false,
    opponent: null,
    ...initialState,
  };

  const mockContextValue = {
    state: mockState,
    dispatch: mockDispatch,
    saveGame: jest.fn(),
    loadGame: jest.fn(),
  };

  (useCampaignState as jest.Mock).mockReturnValue(mockContextValue);
  (useAIInteractions as jest.Mock).mockReturnValue({
    isLoading: false,
    handleUserInput: mockHandleUserInput,
  });

  return {
    ...render(
      <CampaignStateContext.Provider value={mockContextValue}>
        {ui}
      </CampaignStateContext.Provider>
    ),
    mockDispatch,
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
    (generateNarrativeSummary as jest.Mock).mockResolvedValue('Test summary');
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
      expect(mockHandleUserInput).toHaveBeenCalledWith('Look around');
    });

    // Simulate AI response
    const mockAIResponse = {
      narrative: 'You see a bustling town square.',
      location: 'Town Square',
      acquiredItems: [],
      removedItems: [],
    };
    await act(async () => {
      await mockHandleUserInput.mock.calls[0][0];
      mockDispatch({ type: 'SET_NARRATIVE', payload: mockAIResponse.narrative });
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_NARRATIVE',
          payload: expect.stringContaining('You see a bustling town square.')
        })
      );
    });
  });

  test('handles inventory updates correctly', async () => {
    renderWithProviders(<GameSession />);

    // Mock AI response for inventory update
    const mockAIResponse = {
      narrative: 'You found a sword!',
      acquiredItems: ['Sword'],
      removedItems: [],
    };
    mockHandleUserInput.mockImplementation(() => {
      mockDispatch({ type: 'SET_NARRATIVE', payload: mockAIResponse.narrative });
      mockDispatch({ type: 'ADD_ITEM', payload: { name: 'Sword', quantity: 1 } });
    });

    // Simulate user input
    const input = screen.getByPlaceholderText('What would you like to do?');
    const submitButton = screen.getByText('Take Action');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Search for items' } });
      fireEvent.click(submitButton);
    });

    // Check for narrative update
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_NARRATIVE',
          payload: expect.stringContaining('You found a sword!')
        })
      );
    });

    // Check for inventory update
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
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
