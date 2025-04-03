import { useCampaignStateRestoration } from '../../hooks/useCampaignStateRestoration';
import { initialCharacterState } from '../../types/state';

describe('useCampaignStateRestoration', () => {
  it('should initialize state correctly for new games', () => {
    const result = useCampaignStateRestoration({
      isInitializing: true,
      savedStateJSON: null
    });
    
    // Verify character property is properly structured
    expect(result.character).not.toBeNull();
    expect(result.character).toEqual(initialCharacterState);
    expect(result.character).toHaveProperty('player', null);
    expect(result.character).toHaveProperty('opponent', null);
  });
  
  it('should handle null savedStateJSON correctly', () => {
    const result = useCampaignStateRestoration({
      isInitializing: false,
      savedStateJSON: null
    });
    
    // Verify character property is properly structured
    expect(result.character).not.toBeNull();
    expect(result.character).toEqual(initialCharacterState);
    expect(result.character).toHaveProperty('player', null);
    expect(result.character).toHaveProperty('opponent', null);
  });
  
  it('should restore saved state with proper structure', () => {
    const savedState = {
      character: {
        player: { 
          id: 'test', 
          name: 'Test',
          attributes: {
            strength: 10,
            baseStrength: 10,
            speed: 5,
            gunAccuracy: 5,
            throwingAccuracy: 5,
            bravery: 5,
            experience: 0
          },
          wounds: []
        },
        opponent: null
      }
    };
    
    const result = useCampaignStateRestoration({
      isInitializing: false,
      savedStateJSON: JSON.stringify(savedState)
    });
    
    // Verify character property maintains structure
    expect(result.character).not.toBeNull();
    expect(result.character).toHaveProperty('player');
    expect(result.character?.player).toHaveProperty('id', 'test');
    expect(result.character).toHaveProperty('opponent', null);
  });
  
  it('should handle corrupt JSON gracefully', () => {
    const result = useCampaignStateRestoration({
      isInitializing: false,
      savedStateJSON: '{corrupt json'
    });
    
    // Verify character is still properly structured
    expect(result.character).not.toBeNull();
    expect(result.character).toEqual(initialCharacterState);
    expect(result.character).toHaveProperty('player', null);
    expect(result.character).toHaveProperty('opponent', null);
  });
});