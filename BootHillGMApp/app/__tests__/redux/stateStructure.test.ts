import { GameState, initialGameState } from '../../types/gameState';
import { initialCharacterState } from '../../types/state';
import { useCampaignStateRestoration } from '../../hooks/useCampaignStateRestoration';

/**
 * Tests to validate the structure of the state maintained across the application
 * These tests ensure that state objects maintain consistent shapes during initialization
 * and restoration processes.
 */
describe('State Structure Validation', () => {
  describe('Initial State Structure', () => {
    it('should have character property with correct structure', () => {
      expect(initialGameState).toHaveProperty('character');
      expect(initialGameState.character).toEqual(initialCharacterState);
      expect(initialGameState.character).toHaveProperty('player', null);
      expect(initialGameState.character).toHaveProperty('opponent', null);
    });

    it('should have all required state slices', () => {
      // Check for presence of all expected state properties
      expect(initialGameState).toHaveProperty('character');
      expect(initialGameState).toHaveProperty('combat');
      expect(initialGameState).toHaveProperty('inventory');
      expect(initialGameState).toHaveProperty('journal');
      expect(initialGameState).toHaveProperty('narrative');
      expect(initialGameState).toHaveProperty('ui');
    });
  });

  describe('State Restoration Structure', () => {
    it('should maintain character structure when initializing a new game', () => {
      const restoredState = useCampaignStateRestoration({
        isInitializing: true,
        savedStateJSON: null
      });
      
      expect(restoredState.character).not.toBeNull();
      expect(restoredState.character).toEqual(initialCharacterState);
    });
    
    it('should maintain character structure with null saved state', () => {
      const restoredState = useCampaignStateRestoration({
        isInitializing: false,
        savedStateJSON: null
      });
      
      expect(restoredState.character).not.toBeNull();
      expect(restoredState.character).toEqual(initialCharacterState);
    });
    
    it('should maintain character structure when restoring from partial state', () => {
      // Create a saved state that doesn't include character
      const partialState: Partial<GameState> = {
        currentPlayer: 'test-player',
        gameProgress: 10
      };
      
      const restoredState = useCampaignStateRestoration({
        isInitializing: false,
        savedStateJSON: JSON.stringify(partialState)
      });
      
      expect(restoredState.character).not.toBeNull();
      expect(restoredState.character).toEqual(initialCharacterState);
    });
    
    it('should handle malformed character data gracefully', () => {
      // Create a saved state with malformed character structure
      const badState = {
        character: "not an object"
      };
      
      const restoredState = useCampaignStateRestoration({
        isInitializing: false,
        savedStateJSON: JSON.stringify(badState)
      });
      
      expect(restoredState.character).not.toBeNull();
      expect(restoredState.character).toEqual(initialCharacterState);
    });
  });
});
