import { CombatLogEntry } from '../../types/state/combatState';
/**
 * Combat System
 * 
 * Handles combat-related logic and state updates.
 */

import { GameState } from '../../types/state/state';
import { GameEngineAction } from '../../types/gameActions';
import { 
  isObject,
  isString,
  isNumber,
  isActionDomain,
  hasCharacterState,
  hasInventoryState 
} from '../typeGuards';
import { ActionTypes } from '../../types/actionTypes'; // Import ActionTypes

// Type for character in combat
interface CombatCharacter {
  id?: string;
  name?: string;
  strength?: number;
  health?: number;
  maxHealth?: number;
  [key: string]: unknown;
}

// Type for weapon in combat
interface CombatWeapon {
  id?: string;
  name?: string;
  type?: string;
  damage?: number;
  [key: string]: unknown;
}

// Define our simplified combat log entry type that matches the state.ts definition
interface StateCombatLogEntry {
  text: string;
  timestamp: number;
  type?: 'action' | 'result' | 'system';
  data?: Record<string, unknown>;
}

// Helper function to map from CombatLogEntry type to StateCombatLogEntry type
function mapToStateLogType(type: CombatLogEntry['type']): StateCombatLogEntry['type'] {
  switch (type) {
    case 'hit':
    case 'miss':
    case 'critical':
      return 'result';
    case 'info':
      return 'system';
    case 'action':
      return 'action';
    case 'system':
      return 'system';
    case 'result':
      return 'result';
    default:
      return 'system';
  }
}

// Helper function to safely get character
function getCharacter(state: GameState, characterId: string): CombatCharacter | null {
  if (!hasCharacterState(state)) {
    return null;
  }
  
  if (state.character.player && state.character.player.id === characterId) {
    return state.character.player as CombatCharacter;
  }
  
  if (state.character.opponent && state.character.opponent.id === characterId) {
    return state.character.opponent as CombatCharacter;
  }
  
  return null;
}

// Helper function to safely update character
function updateCharacter(
  state: GameState, 
  characterId: string, 
  updates: Partial<CombatCharacter>
): GameState {
  if (!hasCharacterState(state)) {
    return state;
  }
  
  if (state.character.player && state.character.player.id === characterId) {
    return {
      ...state,
      character: {
        ...state.character,
        player: {
          ...state.character.player,
          ...updates
        }
      }
    };
  }
  
  if (state.character.opponent && state.character.opponent.id === characterId) {
    return {
      ...state,
      character: {
        ...state.character,
        opponent: {
          ...state.character.opponent,
          ...updates
        }
      }
    };
  }
  
  return state;
}

export const combatSystem = {
  /**
   * Handles actions related to the combat system
   */
  handleAction: (state: GameState, action: GameEngineAction): GameState => {
    // Check if action is intended for this system using our type guards
    if (!isActionDomain(action, 'combat') && !action.type.includes('COMBAT')) {
      return state;
    }

    switch (action.type) {
      // Standardized on slice-based action types with backward compatibility
      case 'combat/SET_ACTIVE':
      case 'START_COMBAT': // Legacy support
        if (isObject(action.payload) && action.payload.isActive === true) {
          return {
            ...state,
            combat: {
              ...state.combat,
              isActive: true,
              rounds: 0,
              currentTurn: {
                playerId: state.character?.player?.id || '',
                actions: []
              }
            },
            // For backward compatibility
            isCombatActive: true
          };
        } else {
          return {
            ...state,
            combat: {
              ...state.combat,
              isActive: false,
              currentTurn: null
            },
            // For backward compatibility
            isCombatActive: false
          };
        }

      case ActionTypes.END_COMBAT: // Using ActionTypes constant
        return {
          ...state,
          combat: {
            ...state.combat,
            isActive: false,
            currentTurn: null
          },
          // For backward compatibility
          isCombatActive: false
        };

      case 'PERFORM_ATTACK': // Legacy support
      {
        // Safely access payload properties
        if (!isObject(action.payload)) {
          return state;
        }
        
        const payload = action.payload as Record<string, unknown>;
        
        // Use isString type guard for string values
        const weaponId = isString(payload.weaponId) ? payload.weaponId : '';
        const targetId = isString(payload.targetId) ? payload.targetId : '';
        
        if (!weaponId || !targetId) {
          return state;
        }
        
        // Find weapon using the inventory State type guard 
        if (!hasInventoryState(state)) {
          return state;
        }
        
        const weapon = state.inventory.items.find(item => item.id === weaponId);
        if (!weapon) {
          return state;
        }

        // Get and update target character
        const targetCharacter = getCharacter(state, targetId);
        if (!targetCharacter) {
          return state;
        }
        
        const damage = isNumber(weapon.damage) ? weapon.damage : 1;
        const newHealth = Math.max(0, (targetCharacter.health || 0) - damage);
        
        return updateCharacter(state, targetId, { health: newHealth });
      }

      case ActionTypes.USE_ITEM: // Using ActionTypes constant
      {
        // Safely access payload properties
        if (!isObject(action.payload)) {
          return state;
        }
        
        const payload = action.payload as Record<string, unknown>;
        const itemId = isString(payload.itemId) ? payload.itemId : '';
        const targetId = isString(payload.targetId) ? payload.targetId : '';
        
        if (!itemId || !targetId) {
          return state;
        }
        
        // Find item using the inventory State type guard
        if (!hasInventoryState(state)) {
          return state;
        }
        
        const item = state.inventory.items.find(item => item.id === itemId);
        if (!item || item.type !== 'healing') {
          return state;
        }

        // Get and update target character
        const targetCharacter = getCharacter(state, targetId);
        if (!targetCharacter) {
          return state;
        }
        
        const healAmount = isNumber(item.amount) ? item.amount : 1;
        const maxHealth = isNumber(targetCharacter.maxHealth) ? targetCharacter.maxHealth : 100;
        const newHealth = Math.min(maxHealth, (targetCharacter.health || 0) + healAmount);
        
        return updateCharacter(state, targetId, { health: newHealth });
      }

      case ActionTypes.TOGGLE_TURN: // Using ActionTypes constant
      case 'NEXT_COMBAT_TURN': // Legacy support
      {
        const currentTurn = state.combat.currentTurn;
        const isPlayerTurn = currentTurn && currentTurn.playerId === state.character?.player?.id;
        
        // Next player's turn
        const nextTurn = {
          playerId: isPlayerTurn 
            ? (state.character?.opponent?.id || '') 
            : (state.character?.player?.id || ''),
          actions: []
        };
        
        // Increment rounds when player's turn comes again
        const incrementRound = !isPlayerTurn;
        
        return {
          ...state,
          combat: {
            ...state.combat,
            currentTurn: nextTurn,
            playerTurn: !isPlayerTurn,
            rounds: incrementRound ? state.combat.rounds + 1 : state.combat.rounds
          }
        };
      }

      case ActionTypes.NEXT_ROUND: // Using ActionTypes constant
      {
        return {
          ...state,
          combat: {
            ...state.combat,
            rounds: state.combat.rounds + 1,
            playerTurn: true,
            currentTurn: {
              playerId: state.character?.player?.id || '',
              actions: []
            }
          }
        };
      }

      case ActionTypes.ADD_LOG_ENTRY: // Using ActionTypes constant
      {
        if (!isObject(action.payload)) {
          return state;
        }
        
        let logEntryType: StateCombatLogEntry['type'] = 'system';
        
        // Handle different input types
        if (isString(action.payload.type)) {
          // If it's one of our target types, use it directly
          if (['action', 'result', 'system'].includes(action.payload.type)) {
            logEntryType = action.payload.type as StateCombatLogEntry['type'];
          } else {
            // Map from CombatLogEntry type to our target type
            logEntryType = mapToStateLogType(action.payload.type as CombatLogEntry['type']);
          }
        }
        
        // Create an entry that matches the expected type in state.ts
        const stateLogEntry: StateCombatLogEntry = {
          text: isString(action.payload.text) ? action.payload.text : 'Combat action',
          timestamp: isNumber(action.payload.timestamp) ? action.payload.timestamp : Date.now(),
          type: logEntryType,
          data: action.payload.data as Record<string, unknown> || {
            originalPayload: { ...action.payload }
          }
        };

        return {
          ...state,
          combat: {
            ...state.combat,
            combatLog: [
              ...(state.combat.combatLog || []),
              stateLogEntry
            ]
          }
        };
      }

      case ActionTypes.RESET_COMBAT: // Using ActionTypes constant
      {
        return {
          ...state,
          combat: {
            ...state.combat,
            isActive: false,
            rounds: 0,
            currentTurn: null,
            combatLog: [],
            roundStartTime: 0
          },
          // For backward compatibility
          isCombatActive: false
        };
      }

      default:
        return state;
    }
  },

  /**
   * Utility functions for combat
   */
  hasWeapon: (state: GameState): boolean => {
    if (!hasInventoryState(state)) {
      return false;
    }
    return state.inventory.items.some(item => item.type === 'weapon');
  },

  hasHealingItems: (state: GameState): boolean => {
    if (!hasInventoryState(state)) {
      return false;
    }
    return state.inventory.items.some(item => item.type === 'healing');
  },
  
  /**
   * Calculate combat stats
   */
  calculateDamage: (attacker: CombatCharacter, weapon: CombatWeapon): number => {
    const baseDamage = isNumber(weapon?.damage) ? weapon.damage : 1;
    const strength = isNumber(attacker?.strength) ? attacker.strength : 0;
    const strengthBonus = Math.floor(strength / 3);
    
    return baseDamage + strengthBonus;
  },
  
  /**
   * Determine if an attack hits
   */
  attackHits: (): boolean => {
    // Random roll (1-20)
    const roll = Math.floor(Math.random() * 20) + 1;
    
    // Hit if roll > 10
    return roll > 10;
  }
};