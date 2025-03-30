/**
 * Combat Adapter Tests
 * 
 * Tests for the combat adapter that exposes combat state
 * properties at the root level for backward compatibility.
 */

import { combatAdapter } from '../../../utils/stateAdapters';
import { GameState } from '../../../types/gameState';
import { PartialGameStateWithCombat } from './testTypes';
import { hasCombatFlags } from './testHelpers';

describe('combatAdapter', () => {
  test('should add combat flags to root level', () => {
    const state: PartialGameStateWithCombat = {
      combat: {
        isActive: true,
        rounds: 3,
        currentTurn: 'player',
        combatType: 'brawling',
        playerTurn: true,
        playerCharacterId: 'player1',
        opponentCharacterId: 'opponent1',
        combatLog: [],
        roundStartTime: Date.now(),
        modifiers: {
          player: 0,
          opponent: 0
        }
      }
    };
    
    // Use a type assertion to handle the conversion
    const adapted = combatAdapter.adaptForTests(state as unknown as GameState);
    
    // Check that combat properties are adapted
    expect(hasCombatFlags(adapted)).toBe(true);
    
    if (hasCombatFlags(adapted)) {
      // Check that combat properties are accessible at the root level
      expect(adapted.isCombatActive).toBe(true);
      expect(adapted.combatRounds).toBe(3);
      expect(adapted.currentTurn).toBe('player');
      
      // Original combat slice should still be accessible
      expect(adapted.combat).toEqual(state.combat);
    }
  });
});