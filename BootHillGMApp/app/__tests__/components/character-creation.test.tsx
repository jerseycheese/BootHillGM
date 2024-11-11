import '@testing-library/jest-dom';
import { screen, act, fireEvent } from '@testing-library/react';
import { getStartingInventory } from '../../utils/startingInventory';
import { useCampaignState } from '../../components/CampaignStateManager';
import {
  setupMocks,
  setupTestEnvironment,
  cleanupTestEnvironment,
  renderCharacterCreation,
  getMockInitialState
} from '../../test/testUtils';
import { InventoryItem } from '../../types/inventory';


// Mock CampaignStateManager
jest.mock('../../components/CampaignStateManager', () => ({
  useCampaignState: jest.fn(),
}));

/**
 * Character Creation Component Tests
 * Tests the character creation flow including:
 * - Basic character creation process
 * - Progress saving
 * - Error handling
 * - Random character generation
 */
describe('Character Creation', () => {
  const { mockPush, mockLocalStorage } = setupMocks();

  beforeEach(() => {
    jest.clearAllMocks();
    setupTestEnvironment();
    const mockSaveGame = jest.fn((state) => {
      mockLocalStorage.setItem('campaignState', JSON.stringify(state));
    });
    (useCampaignState as jest.Mock).mockImplementation(() => ({
      cleanupState: jest.fn(),
      saveGame: mockSaveGame
    }));
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Basic Creation Flow', () => {
    it('handles character creation process with inventory initialization', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(getMockInitialState()));

      const { input } = await renderCharacterCreation();
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'Test Character' } });
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const form = screen.getByTestId('character-creation-form');
      await act(async () => {
        fireEvent.submit(form);
      });

      // Find the campaign state save
      const campaignStateSave = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === 'campaignState'
      );
      expect(campaignStateSave).toBeTruthy();
      
      const finalState = JSON.parse(campaignStateSave[1]);
      expect(finalState).toHaveProperty('inventory');
      expect(Array.isArray(finalState.inventory)).toBe(true);
      expect(finalState.inventory.length).toBeGreaterThanOrEqual(3);
      expect(finalState.inventory.length).toBeLessThanOrEqual(5);
      
      // Verify inventory items are properly structured
      finalState.inventory.forEach((item: InventoryItem) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('description');
      });
    });

    it('initializes non-combat starting items', async () => {
      const startingInventory = getStartingInventory();
      const combatItems = ['gun', 'knife', 'rifle', 'ammunition', 'weapon'];
      
      startingInventory.forEach((item: InventoryItem) => {
        const isNonCombat = !combatItems.some(combat => 
          item.name.toLowerCase().includes(combat)
        );
        expect(isNonCombat).toBe(true);
      });
    });

    it('cleans up state on completion', async () => {
      const mockCleanup = jest.fn();
      const mockSaveGame = jest.fn();
      (useCampaignState as jest.Mock).mockImplementation(() => ({
        cleanupState: mockCleanup,
        saveGame: mockSaveGame
      }));

      const { input } = await renderCharacterCreation();
      
      // Enter character name
      await act(async () => {
        fireEvent.change(input, { target: { value: 'Test Character' } });
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Submit the form
      const form = screen.getByTestId('character-creation-form');
      await act(async () => {
        fireEvent.submit(form);
      });

      expect(mockCleanup).toHaveBeenCalled();
      expect(mockSaveGame).toHaveBeenCalledTimes(1); // Only one save with complete state
      expect(mockPush).toHaveBeenCalledWith('/game-session');
    });
  });
});
