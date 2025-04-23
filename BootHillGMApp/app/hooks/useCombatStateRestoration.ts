import { Character } from '../types/character';
import { CombatState } from '../types/state/combatState';
import { Weapon } from '../types/weapon.types';
import { Wound } from '../types/wound';
import { InventoryItem } from '../types/item.types';
import { useGameSession } from './useGameSession';

/**
 * Interface representing the structure we expect from state
 */
interface CombatCapableState {
  isCombatActive?: boolean;
  opponent?: OpponentLike | null;
  combatState?: CombatStateLike | null;
  combat?: CombatStateLike | null;
}

/**
 * Interface for objects that are "opponent-like" with minimal required properties
 */
interface OpponentLike {
  name?: string;
  inventory?: InventoryItem[];
  attributes?: {
    speed?: number;
    gunAccuracy?: number;
    throwingAccuracy?: number;
    strength?: number;
    baseStrength?: number;
    bravery?: number;
    experience?: number;
  };
  weapon?: WeaponLike;
  wounds?: Wound[];
  isUnconscious?: boolean;
}

/**
 * Interface for objects that are "weapon-like" with minimal required properties
 */
interface WeaponLike {
  id: string;
  name: string;
  modifiers: {
    accuracy: number;
    range: number;
    reliability: number;
    damage: string;
    speed: number;
    ammunition?: number;
    maxAmmunition?: number;
  };
}

/**
 * Interface for objects that are "combat-state-like" with minimal required properties
 */
interface CombatStateLike {
  isActive?: boolean;
  combatType?: 'brawling' | 'weapon' | null;
  winner?: string | null;
  rounds?: number;
  combatLog?: CombatState['combatLog'];
  currentTurn?: CombatState['currentTurn'];
  playerCharacterId?: string;
  opponentCharacterId?: string;
  roundStartTime?: number;
  modifiers?: CombatState['modifiers'];
  playerTurn?: CombatState['playerTurn'];
}

/**
 * Enhanced adapter function to convert character type strings to character IDs
 * This helps bridge the gap between different health change handler implementations
 */
export function adaptHealthChangeHandler(
  originalHandler: ((characterType: 'player' | 'opponent', newStrength: number) => void) | undefined,
  playerCharacterId: string,
  opponentCharacterId: string
): (characterId: string, newHealth: number) => void {
  // Return a function that adapts the parameter types
  return (characterId: string, newHealth: number) => {
    // If no original handler is provided, do nothing
    if (!originalHandler) return;
    
    // Map character ID to 'player' or 'opponent' type
    let characterType: 'player' | 'opponent';
    
    if (characterId === playerCharacterId) {
      characterType = 'player';
    } else if (characterId === opponentCharacterId) {
      characterType = 'opponent';
    } else {
      // If ID doesn't match either character, default to player
      console.warn(`Character ID ${characterId} does not match player or opponent ID`);
      characterType = 'player';
    }
    
    // Call the original handler with converted parameters
    originalHandler(characterType, newHealth);
  };
}

/**
 * Safe accessor for combat state
 * Returns default values when properties don't exist
 */
function getSafeCombatState(state: unknown): Partial<CombatStateLike> {
  if (!state) return { /* Intentionally empty */ };
  
  const typedState = state as CombatCapableState;
  return typedState.combatState || typedState.combat || { /* Intentionally empty */ };
}

/**
 * Safe accessor for opponent
 * Returns null when opponent doesn't exist
 */
function getSafeOpponent(state: unknown): OpponentLike | null {
  if (!state) return null;
  
  const typedState = state as CombatCapableState;
  return typedState.opponent || null;
}

/**
 * Function to handle combat state restoration
 * This is now a regular function, not a React hook, to avoid hook-related issues
 */
export function useCombatStateRestoration(
    state: unknown,
    gameSession: ReturnType<typeof useGameSession> | null
): void {
  // Guard clause to handle null/undefined values
  if (!state || !gameSession || typeof window === 'undefined') return;
  
  try {
    // Cast state to our expected interface to check for properties
    const typedState = state as CombatCapableState;
    
    // Use safe accessors to get values that might not exist
    const safeOpponent = getSafeOpponent(state);
    const safeCombatState = getSafeCombatState(state);
    
    if (!safeOpponent || !safeCombatState) return;
    
    const isCombatActive = typedState.isCombatActive === true;
    const shouldRestoreCombat = isCombatActive && 
                                safeOpponent !== null && 
                                safeCombatState !== null && 
                                safeCombatState.isActive === true;

    if (!shouldRestoreCombat) return;

    // Create a restored opponent with all required Character properties
    const restoredOpponent: Character = {
      isNPC: true,
      isPlayer: false,
      id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: safeOpponent?.name ?? 'Unknown Opponent',
      inventory: { 
        items: Array.isArray(safeOpponent?.inventory) ? safeOpponent.inventory : [] 
      },
      attributes: {
        speed: safeOpponent?.attributes?.speed ?? 5,
        gunAccuracy: safeOpponent?.attributes?.gunAccuracy ?? 5,
        throwingAccuracy: safeOpponent?.attributes?.throwingAccuracy ?? 5,
        strength: safeOpponent?.attributes?.strength ?? 5,
        baseStrength: safeOpponent?.attributes?.baseStrength ?? 5,
        bravery: safeOpponent?.attributes?.bravery ?? 5,
        experience: safeOpponent?.attributes?.experience ?? 5
      },
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
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 20,
        baseStrength: 20,
        bravery: 10,
        experience: 11
      },
      wounds: Array.isArray(safeOpponent?.wounds) ? safeOpponent.wounds : [],
      isUnconscious: safeOpponent?.isUnconscious ?? false,
    };
    
    // Add weapon if it exists
    if (safeOpponent?.weapon && 
        typeof safeOpponent.weapon === 'object' && 
        safeOpponent.weapon.id && 
        safeOpponent.weapon.name && 
        safeOpponent.weapon.modifiers) {
      restoredOpponent.weapon = {
        id: safeOpponent.weapon.id,
        name: safeOpponent.weapon.name,
        modifiers: {
          accuracy: safeOpponent.weapon.modifiers.accuracy,
          range: safeOpponent.weapon.modifiers.range,
          reliability: safeOpponent.weapon.modifiers.reliability,
          damage: safeOpponent.weapon.modifiers.damage,
          speed: safeOpponent.weapon.modifiers.speed,
          ammunition: safeOpponent.weapon.modifiers.ammunition,
          maxAmmunition: safeOpponent.weapon.modifiers.maxAmmunition
        },
      } as Weapon;
    }
    
    // Safely handle array properties with null checks
    const combatLog = Array.isArray(safeCombatState?.combatLog) ? safeCombatState.combatLog : [];
    
    // Construct the state to pass to initiateCombat using state/CombatState properties
    const restoredCombatState: Partial<CombatState> = {
      isActive: safeCombatState?.isActive ?? false,
      combatType: safeCombatState?.combatType ?? null,
      winner: safeCombatState?.winner ?? null,
      rounds: safeCombatState?.rounds ?? 0,
      combatLog: combatLog,
      currentTurn: safeCombatState?.currentTurn ?? null,
      playerCharacterId: safeCombatState?.playerCharacterId,
      opponentCharacterId: safeCombatState?.opponentCharacterId,
      roundStartTime: safeCombatState?.roundStartTime,
      modifiers: safeCombatState?.modifiers ?? { player: 0, opponent: 0 },
      playerTurn: safeCombatState?.playerTurn ?? true,
    };
    
    // Only run this in browser environment
    if (typeof window !== 'undefined' && gameSession && gameSession.initiateCombat) {
      // Use setTimeout to defer execution after all hooks have been processed
      setTimeout(() => {
        try {
          gameSession.initiateCombat(restoredOpponent, restoredCombatState);
        } catch (error) {
          console.error("Error in deferred combat state restoration:", error);
        }
      }, 0);
    }
  } catch (error) {
    console.error("Error in combat state restoration:", error);
    // No need to rethrow - handle gracefully
  }
}
