/**
 * Master Adapter Tests
 * 
 * Tests for the adaptStateForTests function that applies all adapters
 * to provide backward compatibility for tests.
 */

import { adaptStateForTests } from '../../../utils/stateAdapters';
import { GameState } from '../../../types/gameState';
import { CharacterState } from '../../../types/state/characterState';
import { CombatState } from '../../../types/state/combatState';
import { JournalState } from '../../../types/state/journalState';
import { NarrativeState } from '../../../types/state/narrativeState';
import { UIState } from '../../../types/state/uiState';
import { JournalEntry } from '../../../types/journal';
import { isFullyAdapted } from './testHelpers';

describe('adaptStateForTests', () => {
  test('should apply all adapters to the state', () => {
    // Create full game state with proper types
    const state: Partial<GameState> = {
      character: {
        player: { 
          id: 'player1', 
          name: 'Test Player', 
          health: 100, 
          maxHealth: 100 
        },
        opponent: null
      } as unknown as CharacterState,
      inventory: {
        items: [{ 
          id: 'item1', 
          name: 'Test Item',
          description: 'A test item',
          quantity: 1,
          category: 'general' 
        }]
      },
      journal: {
        entries: [{ 
          id: 'entry1', 
          title: 'Test Entry',
          type: 'quest',
          questTitle: 'Main Quest',
          status: 'started',
          content: 'Test content',
          timestamp: Date.now()
        } as JournalEntry]
      } as unknown as JournalState,
      combat: {
        isActive: true,
        rounds: 2,
        combatType: 'brawling',
        playerTurn: true,
        playerCharacterId: 'player1',
        opponentCharacterId: 'opponent1',
        combatLog: [],
        roundStartTime: Date.now(),
        modifiers: {
          player: 0,
          opponent: 0
        },
        winner: null,
        participants: []
      } as unknown as CombatState,
      narrative: {
        currentStoryPoint: null,
        visitedPoints: [],
        availableChoices: [],
        narrativeHistory: [],
        displayMode: 'default',
        narrativeContext: { location: 'Saloon' }
      } as unknown as NarrativeState,
      ui: {
        activeTab: 'inventory',
        isMenuOpen: true,
        notifications: [],
        isLoading: false,
        modalOpen: null
      } as unknown as UIState
    };
    
    // Use type assertion to handle the conversion and expected properties
    const adapted = adaptStateForTests(state as unknown as GameState);
    
    // Check full state is properly adapted
    expect(isFullyAdapted(adapted)).toBe(true);
    
    if (isFullyAdapted(adapted)) {
      // Check character adapter
      expect(adapted.player).toEqual((state.character as { player: unknown }).player);
      
      // Check inventory adapter
      expect(adapted.inventory.length).toBe(1);
      expect(adapted.inventory.items[0].name).toBe('Test Item');
      
      // Check journal adapter
      expect(adapted.entries.length).toBe(1);
      expect(adapted.entries[0].title).toBe('Test Entry');
      
      // Check combat adapter
      expect(adapted.isCombatActive).toBe(true);
      expect(adapted.combatRounds).toBe(2);
      
      // Check narrative adapter - use safer property access
      expect(adapted.narrativeContext).toBeDefined();
      expect(adapted.currentScene).toBeDefined();
      
      // Check UI adapter
      expect(adapted.activeTab).toBe('inventory');
      expect(adapted.isMenuOpen).toBe(true);
      
      // All slices should still be accessible
      expect(adapted.journal).toBeDefined();
    }
  });
  
  test('should handle null state', () => {
    expect(adaptStateForTests(null as unknown as GameState)).toBeNull();
  });
});