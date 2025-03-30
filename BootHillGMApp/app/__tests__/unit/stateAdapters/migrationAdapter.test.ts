/**
 * Migration Adapter Tests
 * 
 * Tests for the migration adapter that handles state conversions
 * between legacy and modern formats.
 */

import { migrationAdapter } from '../../../utils/stateAdapters';
import { GameState } from '../../../types/gameState';
import { LegacyState } from './testTypes';
import { CharacterState } from '../../../types/state/characterState';
import { CombatState } from '../../../types/state/combatState';
import { JournalState } from '../../../types/state/journalState';
import { NarrativeState } from '../../../types/state/narrativeState';
import { CombatType } from '../../../types/combat';

describe('migrationAdapter', () => {
  test('should convert old state to new state', () => {
    // Create a state in the old format
    const oldState: LegacyState = {
      player: { id: 'player1', name: 'Test Player' },
      opponent: { id: 'opponent1', name: 'Test Opponent' },
      inventory: [
        // Create a properly typed InventoryItem
        { 
          id: 'item1', 
          name: 'Test Item',
          description: 'A test item',
          quantity: 1,
          category: 'general'
        }
      ],
      entries: [
        { 
          id: 'entry1', 
          title: 'Test Entry', 
          content: 'Test content', 
          timestamp: Date.now() 
        }
      ],
      isCombatActive: true
    };
    
    // Migrate to new format
    const newState = migrationAdapter.oldToNew(oldState);
    
    // Verify it has the new structure
    expect(newState.character).toBeDefined();
    expect(newState.character && typeof newState.character === 'object' && 'player' in newState.character).toBe(true);
    
    const character = newState.character as { player?: unknown, opponent?: unknown };
    expect(character.player).toEqual(oldState.player);
    expect(character.opponent).toEqual(oldState.opponent);
    
    expect(newState.inventory).toBeDefined();
    const inventory = newState.inventory as { items?: unknown[] };
    expect(inventory.items).toEqual(oldState.inventory);
    
    expect(newState.journal).toBeDefined();
    const journal = newState.journal as { entries?: unknown[] };
    expect(journal.entries).toEqual(oldState.entries);
    
    expect(newState.combat).toBeDefined();
    const combat = newState.combat as { isActive?: boolean };
    expect(combat.isActive).toEqual(oldState.isCombatActive);
  });
  
  test('should handle state already in new format', () => {
    // Create a state already in the new format
    const newFormatState: Partial<GameState> = {
      character: {
        player: { id: 'player1', name: 'Test Player' },
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
          content: 'Test content',
          timestamp: Date.now()
        }]
      } as unknown as JournalState,
      combat: {
        isActive: false,
        // Add other required properties for CombatState
        combatType: 'brawling' as CombatType,
        playerTurn: false,
        playerCharacterId: '',
        opponentCharacterId: '',
        combatLog: [],
        roundStartTime: 0,
        modifiers: { player: 0, opponent: 0 },
        winner: null,
        participants: [],
        rounds: 0
      } as unknown as CombatState
    };
    
    // Call migration adapter with type assertion to handle conversion
    const result = migrationAdapter.oldToNew(newFormatState as unknown as LegacyState);
    
    // Should not modify the state (except adding any missing properties)
    expect(result.character).toBeDefined();
    expect(result.inventory).toBeDefined();
    expect(result.journal).toBeDefined();
    expect(result.combat).toBeDefined();
    
    const character = result.character as { player?: unknown, opponent?: unknown };
    const characterSource = newFormatState.character as { player?: unknown, opponent?: unknown };
    expect(character.player).toEqual(characterSource.player);
    expect(character.opponent).toEqual(characterSource.opponent);
    
    const inventory = result.inventory as { items?: unknown[] };
    const inventorySource = newFormatState.inventory as { items?: unknown[] };
    expect(inventory.items).toEqual(inventorySource.items);
    
    const journal = result.journal as { entries?: unknown[] };
    const journalSource = newFormatState.journal as { entries?: unknown[] };
    expect(journal.entries).toEqual(journalSource.entries);
    
    const combat = result.combat as { isActive?: boolean };
    const combatSource = newFormatState.combat as { isActive?: boolean };
    expect(combat.isActive).toEqual(combatSource.isActive);
  });
  
  test('should convert new state to old state', () => {
    // Create a state in the new format with proper types
    const newState: Partial<GameState> = {
      character: {
        player: { id: 'player1', name: 'Test Player' },
        opponent: { id: 'opponent1', name: 'Test Opponent' }
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
          type: 'quest', // Required for QuestJournalEntry
          questTitle: 'Main Quest',
          status: 'started',
          content: 'Test content',
          timestamp: Date.now()
        }]
      } as unknown as JournalState,
      combat: {
        isActive: true,
        rounds: 2,
        combatType: 'brawling', // Use a valid CombatType
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
      } as unknown as NarrativeState
    };
    
    // Convert to old format - use a type assertion to avoid conversion issues
    const oldState = migrationAdapter.newToOld(newState as GameState);
    
    // Verify it has the old structure
    const character = newState.character as { player?: unknown, opponent?: unknown };
    expect(oldState.player).toEqual(character.player);
    expect(oldState.opponent).toEqual(character.opponent);
    
    const inventory = newState.inventory as { items?: unknown[] };
    expect(oldState.inventory).toEqual(inventory.items);
    
    const journal = newState.journal as { entries?: unknown[] };
    expect(oldState.entries).toEqual(journal.entries);
    
    const combat = newState.combat as { isActive?: boolean, rounds?: number };
    expect(oldState.isCombatActive).toEqual(combat.isActive);
    expect(oldState.combatRounds).toEqual(combat.rounds);
    
    const narrative = newState.narrative as { narrativeContext?: unknown };
    expect(oldState.narrativeContext).toEqual(narrative.narrativeContext);
    
    // Should also keep references to new structure
    expect(oldState.character).toEqual(newState.character);
  });
});