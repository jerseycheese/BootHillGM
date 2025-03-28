import { useEffect } from 'react';
import { Character } from '../types/character';
import { 
  ensureCombatState, 
  CombatParticipant, 
  LogEntry, 
  BrawlingState, 
  WeaponCombatState,
  CombatSummary
} from '../types/combat';
import { CombatInitiator } from '../types/combatStateAdapter';
import { Weapon } from '../types/weapon.types';
import { Wound } from '../types/wound';
import { InventoryItem } from '../types/item.types';

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
  participants?: unknown[];
  rounds?: number;
  combatLog?: LogEntry[];
  brawling?: unknown;
  weapon?: unknown;
  summary?: unknown;
  currentTurn?: 'player' | 'opponent';
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
  if (!state) return {};
  
  const typedState = state as CombatCapableState;
  return typedState.combatState || typedState.combat || {};
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
 * Hook to handle combat state restoration after page refreshes or navigation.
 * Ensures combat can resume exactly where it left off by:
 * - Restoring opponent data with proper type conversion
 * - Maintaining exact strength values and turn state
 * - Preserving combat log history and wounds
 */
export function useCombatStateRestoration(
    state: unknown,
    gameSession: CombatInitiator | null
) {
    useEffect(() => {
        if (!state || !gameSession) return;
        
        // Cast state to our expected interface to check for properties
        const typedState = state as CombatCapableState;
        
        // Use safe accessors to get values that might not exist
        const safeOpponent = getSafeOpponent(state);
        const safeCombatState = getSafeCombatState(state);
        
        const isCombatActive = typedState.isCombatActive === true;
        const shouldRestoreCombat = isCombatActive &&
            safeOpponent &&
            safeCombatState &&
            !gameSession.isCombatActive;

        if (shouldRestoreCombat) {
            // Create a restored opponent with all required Character properties
            const restoredOpponent: Character = {
                isNPC: true,
                isPlayer: false,
                id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID
                name: safeOpponent?.name ?? '',
                inventory: { items: safeOpponent?.inventory ?? [] },
                attributes: {
                    speed: safeOpponent?.attributes?.speed ?? 5,
                    gunAccuracy: safeOpponent?.attributes?.gunAccuracy ?? 5,
                    throwingAccuracy: safeOpponent?.attributes?.throwingAccuracy ?? 5,
                    strength: safeOpponent?.attributes?.strength ?? 5,
                    baseStrength: safeOpponent?.attributes?.baseStrength ?? 5,
                    bravery: safeOpponent?.attributes?.bravery ?? 5,
                    experience: safeOpponent?.attributes?.experience ?? 5
                },
                // Add required minAttributes and maxAttributes properties
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
                weapon: safeOpponent?.weapon ? {
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
                } as Weapon : undefined,
                wounds: safeOpponent?.wounds ?? [],
                isUnconscious: safeOpponent?.isUnconscious ?? false,
                // Since we're creating a Character and not an NPC,
                // we explicitly cast to Character
            };
            
            // Handle type casting for array properties to avoid TypeScript errors
            const emptyParticipantArray: CombatParticipant[] = [];
            
            console.log('safeCombatState.combatLog:', safeCombatState.combatLog); // ADDED LOG
            const ensuredCombatState = ensureCombatState({
                isActive: safeCombatState?.isActive ?? false,
                combatType: safeCombatState?.combatType ?? null,
                winner: (safeCombatState?.winner === 'player' || safeCombatState?.winner === 'opponent') 
                    ? safeCombatState.winner 
                    : null,
                participants: emptyParticipantArray, // Use properly typed empty array
                rounds: safeCombatState?.rounds ?? 0,
                combatLog: safeCombatState.combatLog !== undefined ? safeCombatState.combatLog : [], // ADDED LOGIC - USE SAFE COMBAT STATE LOG
                // Cast properties to their expected types or undefined
                brawling: safeCombatState?.brawling as BrawlingState | undefined,
                weapon: safeCombatState?.weapon as WeaponCombatState | undefined,
                summary: safeCombatState?.summary as CombatSummary | undefined,
            });
            console.log('restoredOpponent:', restoredOpponent); // ADDED LOG
            console.log('ensuredCombatState:', ensuredCombatState); // ADDED LOG
            

            gameSession.initiateCombat(restoredOpponent, ensuredCombatState);
        }
    }, [
        gameSession,
        state,
        // Only depend on the existence of state, not its properties
        // This prevents TypeScript errors about accessing properties
        // that might not exist on the state type
    ]);
}
