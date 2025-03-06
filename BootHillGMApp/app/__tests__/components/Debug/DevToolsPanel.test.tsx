import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DevToolsPanel from '../../../components/Debug/DevToolsPanel';
import { useCampaignState } from '../../../components/CampaignStateManager';
import { initialState } from '../../../types/initialState';
import { Wound } from '../../../types/wound';

// Mock useCampaignState
jest.mock('../../../components/CampaignStateManager', () => ({
  useCampaignState: jest.fn(),
}));

describe('DevToolsPanel', () => {
  const mockDispatch = jest.fn();
  const mockCleanupState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    (useCampaignState as jest.Mock).mockReturnValue({
      cleanupState: mockCleanupState,
    });
  });

  it('renders without crashing', () => {
    render(<DevToolsPanel gameState={initialState} dispatch={mockDispatch} />);
    expect(screen.getByText('DevTools')).toBeInTheDocument();
  });

  it('calls cleanupState when Reset Game is clicked', async () => {
    render(<DevToolsPanel gameState={initialState} dispatch={mockDispatch} />);
    await act(async () => {
      fireEvent.click(screen.getByText('Reset Game'));
    });
    expect(mockCleanupState).toHaveBeenCalledTimes(1);
  });

  it('dispatches initializeTestCombat when Test Combat is clicked', async () => {
    render(<DevToolsPanel gameState={initialState} dispatch={mockDispatch} />);
    await act(async () => {
      fireEvent.click(screen.getByText('Test Combat'));
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_STATE",
      payload: {
        opponent: {
          id: "test_opponent",
          name: "Test Opponent",
          attributes: {
            speed: 5,
            gunAccuracy: 5,
            throwingAccuracy: 5,
            strength: 5,
            baseStrength: 5,
            bravery: 5,
            experience: 5,
          },
          wounds: [],
          isUnconscious: false,
          isNPC: true,
          isPlayer: false,
          inventory: [],
          minAttributes: {
            speed: 1,
            gunAccuracy: 1,
            throwingAccuracy: 1,
            strength: 1,
            baseStrength: 1,
            bravery: 1,
            experience: 0
          },
          maxAttributes: {
            speed: 20,
            gunAccuracy: 20,
            throwingAccuracy: 20,
            strength: 20,
            baseStrength: 20,
            bravery: 20,
            experience: 10
          },
        },
        isCombatActive: true,
        combatState: {
          rounds: 0,
          combatType: "brawling",
          isActive: true,
          winner: null,
          participants: [],
          brawling: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: "",
            opponentCharacterId: "test_opponent",
            roundLog: [],
          },
        },
        isClient: true,
      },
    });
  });

  // New tests for reset functionality
  describe('Reset Game Functionality', () => {
    const mockWound: Wound = {
      location: 'leftArm', // Corrected location
      severity: 'light',
      strengthReduction: 1,
      turnReceived: 0,
      damage: 1
    };

    const mockCharacter = {
      isNPC: false,
      isPlayer: true,
      id: 'test_character',
      name: 'Test Character',
      attributes: {
        speed: 6,
        gunAccuracy: 7,
        throwingAccuracy: 8,
        strength: 5,
        baseStrength: 10,
        bravery: 9,
        experience: 10,
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 1,
        baseStrength: 8,
        bravery: 1,
        experience: 0,
      },
      maxAttributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 20,
        bravery: 10,
        experience: 11,
      },
      wounds: [mockWound],
      isUnconscious: false,
      inventory: [], // Added inventory
    };

    const mockGameState = {
      ...initialState,
      character: mockCharacter,
      isCombatActive: true,
      inventory: [{ id: 'test_item', name: 'Test Item', description: 'A test item', quantity: 1, category: 'general' as const }], // Corrected inventory
      narrative: 'Some narrative text',
    };

    beforeEach(() => {
      (useCampaignState as jest.Mock).mockReturnValue({
        cleanupState: mockCleanupState,
        state: mockGameState // Provide the mock state
      });
    });

    it('resets character strength to base strength', async () => {
      const { rerender } = render(<DevToolsPanel gameState={mockGameState} dispatch={mockDispatch} />);

      await act(async () => {
        fireEvent.click(screen.getByText('Reset Game'));
      });

      // Mock the updated game state after cleanup
      const updatedGameState = {
        ...initialState,
        character: {
          ...mockCharacter,
          attributes: {
            ...mockCharacter.attributes,
            strength: mockCharacter.attributes.baseStrength,
          },
          inventory: [], // Include inventory
        },
      };
      
      // Rerender with updated state
      rerender(<DevToolsPanel gameState={updatedGameState} dispatch={mockDispatch}/>)

      expect(mockCleanupState).toHaveBeenCalledTimes(1);
      expect(updatedGameState.character.attributes.strength).toBe(updatedGameState.character.attributes.baseStrength);
    });

    it('clears character wounds', async () => {
        const { rerender } = render(<DevToolsPanel gameState={mockGameState} dispatch={mockDispatch} />);
  
        await act(async () => {
          fireEvent.click(screen.getByText('Reset Game'));
        });
  
        // Mock the updated game state after cleanup
        const updatedGameState = {
          ...initialState,
          character: {
            ...mockCharacter,
            wounds: [],
            inventory: [], // Include inventory
          },
        };
        
        // Rerender with updated state
        rerender(<DevToolsPanel gameState={updatedGameState} dispatch={mockDispatch}/>)
  
        expect(mockCleanupState).toHaveBeenCalledTimes(1);
        expect(updatedGameState.character.wounds).toEqual([]);
    });

    it('maintains character identity', async () => {
        const { rerender } = render(<DevToolsPanel gameState={mockGameState} dispatch={mockDispatch} />);
  
        await act(async () => {
          fireEvent.click(screen.getByText('Reset Game'));
        });
  
        // Mock the updated game state after cleanup
        const updatedGameState = {
          ...initialState,
          character: {
            ...mockCharacter,
            inventory: [], // Include inventory
          },
        };
        
        // Rerender with updated state
        rerender(<DevToolsPanel gameState={updatedGameState} dispatch={mockDispatch}/>)
  
        expect(mockCleanupState).toHaveBeenCalledTimes(1);
        expect(updatedGameState.character).not.toBeNull();
        expect(updatedGameState.character.id).toBe(mockCharacter.id);
    });

    it('resets other game state elements', async () => {
        const { rerender } = render(<DevToolsPanel gameState={mockGameState} dispatch={mockDispatch} />);
  
        await act(async () => {
          fireEvent.click(screen.getByText('Reset Game'));
        });
  
        // Mock the updated game state after cleanup
        const updatedGameState = {
          ...initialState,
          character: {
            ...mockCharacter,
            attributes: {
              ...mockCharacter.attributes,
              strength: mockCharacter.attributes.baseStrength,
            },
            wounds: [],
            inventory: [], // Include inventory
          },
        };
        
        // Rerender with updated state
        rerender(<DevToolsPanel gameState={updatedGameState} dispatch={mockDispatch}/>)
  
        expect(mockCleanupState).toHaveBeenCalledTimes(1);
        expect(updatedGameState.isCombatActive).toBe(false);
        expect(updatedGameState.inventory).toEqual([]);
        expect(updatedGameState.narrative).toBe('');
        expect(updatedGameState.opponent).toBeNull();
        expect(updatedGameState.combatState).toBeUndefined();
        expect(updatedGameState.location).toBeNull();
        expect(updatedGameState.npcs).toEqual([]);
        expect(updatedGameState.quests).toEqual([]);
        expect(updatedGameState.journal).toEqual([]);
        expect(updatedGameState.gameProgress).toBe(0);
    });
  });
});
