import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useCallback } from 'react';
import { Character } from '../types/character';
import { InventoryItem } from '../types/inventory';
import { JournalEntry } from '../types/journal';
import { SuggestedAction } from '../types/campaign';
import { CombatType, CombatState, ensureCombatState } from '../types/combat';
import { determineIfWeapon } from '../services/ai';
import { InventoryManager } from './inventoryManager';
import { WEAPONS } from './weaponDefinitions';
import { Weapon } from '../types/combat';

// Define the structure of the game state
export interface GameState {
  currentPlayer: string;
  npcs: string[];
  location: string;
  inventory: InventoryItem[];
  quests: string[];
  character: Character | null;
  narrative: string;
  gameProgress: number;
  journal: JournalEntry[];
  isCombatActive: boolean;
  opponent: Character | null;
  savedTimestamp?: number;
  isClient?: boolean;
  suggestedActions: SuggestedAction[];
  combatState?: CombatState;
}

// Define all possible actions that can be dispatched to update the game state
export type GameEngineAction =
  | { type: 'SET_PLAYER'; payload: string }
  | { type: 'ADD_NPC'; payload: string }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'USE_ITEM'; payload: string }
  | { type: 'ADD_QUEST'; payload: string }
  | { type: 'SET_CHARACTER'; payload: Character | null }
  | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> }
  | { type: 'SET_NARRATIVE'; payload: string }
  | { type: 'SET_GAME_PROGRESS'; payload: number }
  | { type: 'UPDATE_JOURNAL'; payload: JournalEntry | JournalEntry[] }
  | { type: 'SET_COMBAT_ACTIVE'; payload: boolean }
  | { type: 'SET_OPPONENT'; payload: Partial<Character> }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAN_INVENTORY' }
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] }
  | { type: 'SET_SAVED_TIMESTAMP'; payload: number }
  | { type: 'SET_STATE'; payload: Partial<GameState> }
  | { type: 'SET_SUGGESTED_ACTIONS'; payload: SuggestedAction[] }
  | { type: 'UPDATE_COMBAT_STATE'; payload: Partial<CombatState> }
  | { type: 'SET_COMBAT_TYPE'; payload: CombatType }
  | { type: 'UPDATE_OPPONENT'; payload: Character }
  | { type: 'EQUIP_WEAPON'; payload: string }
  | { type: 'UNEQUIP_WEAPON'; payload: string };

// Initial state of the game
export const initialState: GameState = {
  currentPlayer: '',
  npcs: [],
  location: '',
  inventory: [],
  quests: [],
  character: null,
  narrative: '',
  gameProgress: 0,
  journal: [],
  isCombatActive: false,
  opponent: null,
  savedTimestamp: undefined,
  isClient: false,
  suggestedActions: [],
  combatState: undefined
};

// Function to determine if a weapon is melee based on its stats
function isMeleeWeapon(weapon: Weapon): boolean {
  return weapon.modifiers.range === 1;
}

// Function to find the closest matching weapon
export function findClosestWeapon(weaponName: string): Weapon {
  const weaponNameLower = weaponName.toLowerCase();
  const weaponKeys = Object.keys(WEAPONS);

  // Check for exact match
  const exactMatch = WEAPONS[weaponName];
  if (exactMatch) {
    console.debug(`[findClosestWeapon] Exact match found for ${weaponName}:`, exactMatch);
    return exactMatch;
  }

  // Determine if the weapon is likely a melee weapon
  const isWeaponMelee = weaponNameLower.includes('knife') || weaponNameLower.includes('tomahawk') || weaponNameLower.includes('lance') || weaponNameLower.includes('hammer');

  // Determine if the weapon is a shotgun
  const isWeaponShotgun = weaponNameLower.includes('shotgun');

  // Initialize closestMatch and weaponsToCheck
  let closestMatch: Weapon;
  let closestMatchScore = -1;
  let weaponsToCheck: string[];

  if (isWeaponShotgun) {
    weaponsToCheck = weaponKeys.filter(key => key.toLowerCase().includes('shotgun'));
    closestMatch = WEAPONS['Shotgun'] as Weapon; // Default to Shotgun if no better match is found
  } else if (isWeaponMelee) {
    weaponsToCheck = weaponKeys.filter(key => isMeleeWeapon(WEAPONS[key]));
    closestMatch = WEAPONS['Other Melee Weapon'] as Weapon; // Default to Other Melee Weapon if no better match is found
  } else {
    weaponsToCheck = weaponKeys.filter(key => !isMeleeWeapon(WEAPONS[key]) && !key.toLowerCase().includes('shotgun'));
    closestMatch = WEAPONS['Other Carbines'] as Weapon; // Default to Other Carbines if no better match is found
  }

  // Check for closest match in the appropriate category
  for (const key of weaponsToCheck) {
    const keyLower = key.toLowerCase();
    const score = similarityScore(weaponNameLower, keyLower);
    if (score > closestMatchScore) {
      closestMatchScore = score;
      closestMatch = WEAPONS[key] as Weapon;
    }
  }

  console.debug(`[findClosestWeapon] Closest match found for ${weaponName}: ${closestMatch.name}`, closestMatch);
  return closestMatch;
}

// Function to calculate similarity score between two strings
function similarityScore(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;

  const maxLength = Math.max(str1.length, str2.length);
  const commonLength = Array.from(str1).reduce((acc, char) => acc + (str2.includes(char) ? 1 : 0), 0);

  return commonLength / maxLength;
}

// Reducer function to handle state updates based on dispatched actions
export function gameReducer(state: GameState, action: GameEngineAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'ADD_NPC':
      return { ...state, npcs: [...state.npcs, action.payload] };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'ADD_ITEM': {
      const existingItem = state.inventory.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          inventory: state.inventory.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        const newItem = { ...action.payload };
        if (!newItem.category) {
          newItem.category = 'general';
        }
        determineIfWeapon(newItem.name, newItem.description)
          .then((isWeapon: boolean) => {
            if (isWeapon) {
              newItem.category = 'weapon';
              const closestWeapon = findClosestWeapon(newItem.name); // Call findClosestWeapon only if it's a weapon
              if (closestWeapon) { // Check if a closest weapon was found
                newItem.weapon = closestWeapon;
                console.log(`[Inventory] Added weapon: ${newItem.name} with stats:`, newItem.weapon);
              } else {
                console.debug(`[Inventory] No matching weapon found for ${newItem.name}.`);
              }
            } else {
              console.debug(`[Inventory] Item ${newItem.name} is not classified as a weapon.`);
            }
          })
          .catch((error: Error) => {
            console.error(`[Inventory] Error during weapon determination for "${newItem.name}":`, error);
          });
        return { ...state, inventory: [...state.inventory, newItem] };
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload)
      };
    case 'USE_ITEM': {
      const updatedInventory = state.inventory.map(item => {
        if (item.id === action.payload) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0);

      return {
        ...state,
        inventory: updatedInventory
      };
    }
    case 'ADD_QUEST':
      return { ...state, quests: [...state.quests, action.payload] };
    case 'SET_CHARACTER':
      return { ...state, character: action.payload };
    case 'UPDATE_CHARACTER':
      if (!state.character) {
        return state;
      }
      return {
        ...state,
        character: {
          ...state.character,
          ...action.payload,
          attributes: {
            ...state.character.attributes,
            ...(action.payload.attributes || {})
          }
        }
      };
    case 'SET_NARRATIVE':
      return { ...state, narrative: action.payload };
    case 'SET_GAME_PROGRESS':
      return { ...state, gameProgress: action.payload };
    case 'UPDATE_JOURNAL':
      return { ...state, journal: Array.isArray(action.payload) ? action.payload : [...state.journal, action.payload] };
    
    case 'SET_OPPONENT': {
      if (!action.payload) {
        return { ...state, opponent: null };
      }

      const defaultAttributes = {
        speed: 5,
        gunAccuracy: 5,
        throwingAccuracy: 5,
        strength: 5,
        baseStrength: 5,
        bravery: 5,
        experience: 5
      };

      const opponent: Character = {
        name: action.payload.name ?? 'Unknown Opponent',
        inventory: action.payload.inventory ?? [],
        attributes: {
          ...defaultAttributes,
          ...(action.payload.attributes || {})
        },
        wounds: action.payload.wounds ?? [],
        isUnconscious: action.payload.isUnconscious ?? false
      };

      return { ...state, opponent };
    }
    
    case 'SET_COMBAT_ACTIVE':
      return {
        ...state,
        isCombatActive: action.payload,
        ...((!action.payload) && {
          opponent: null,
          combatState: undefined
        })
      };

    case 'UPDATE_COMBAT_STATE':
      return {
        ...state,
        combatState: action.payload 
          ? ensureCombatState({
              ...state.combatState,
              ...action.payload,
              isActive: true
            })
          : state.combatState
      };

    case 'SET_COMBAT_TYPE':
      return {
        ...state,
        combatState: ensureCombatState({
          ...state.combatState,
          combatType: action.payload,
          isActive: true
        })
      };

    case 'UPDATE_ITEM_QUANTITY':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ).filter(item => item.quantity > 0)
      };
    case 'CLEAN_INVENTORY':
      return {
        ...state,
        inventory: state.inventory.filter(item => 
          item.id &&
          item.name && 
          item.quantity > 0 && 
          !item.name.startsWith('REMOVED_ITEMS:')
        ),
      };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'SET_SAVED_TIMESTAMP':
      return { ...state, savedTimestamp: action.payload };

    case 'SET_STATE':
      return {
        ...state,
        ...action.payload,
        isCombatActive: Boolean(action.payload.isCombatActive),
        opponent: action.payload.opponent ? {
          ...action.payload.opponent,
          attributes: { ...action.payload.opponent.attributes },
          wounds: [...action.payload.opponent.wounds],
          isUnconscious: Boolean(action.payload.opponent.isUnconscious)
        } : null,
        combatState: action.payload.combatState 
          ? ensureCombatState(action.payload.combatState)
          : undefined,
        isClient: true
      };
    case 'SET_SUGGESTED_ACTIONS':
      return { ...state, suggestedActions: action.payload };
    case 'EQUIP_WEAPON': {
      const weaponItem = state.inventory.find(item => item.id === action.payload);
      if (!weaponItem || weaponItem.category !== 'weapon') {
        console.error('Invalid item to equip');
        return state;
      }

      const updatedInventory = state.inventory.map(item => ({
        ...item,
        isEquipped: item.id === action.payload ? true : false
      }));

      const weapon: Weapon = {
        id: weaponItem.id,
        name: weaponItem.name,
        modifiers: weaponItem.weapon?.modifiers ?? {
          accuracy: 0,
          range: 0,
          reliability: 0,
          damage: '0',
          speed: 0,
          ammunition: 0,
          maxAmmunition: 0
        },
        ammunition: weaponItem.weapon?.ammunition ?? 0,
        maxAmmunition: weaponItem.weapon?.maxAmmunition ?? 0
      };

      console.debug(`[EQUIP_WEAPON] Equipping weapon:`, weapon);

      return {
        ...state,
        inventory: updatedInventory,
        character: state.character ? {
          ...state.character,
          weapon: weapon
        } : null
      };
    }
    case 'UNEQUIP_WEAPON': {
      const updatedInventory = state.inventory.map(item => ({
        ...item,
        isEquipped: false
      }));

      console.debug(`[UNEQUIP_WEAPON] Unequipping weapon`);

      return {
        ...state,
        inventory: updatedInventory,
        character: state.character ? {
          ...state.character,
          weapon: undefined
        } : null
      };
    }
    default:
      return state;
  }
}

// Create a context for the game state and dispatch function
const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<GameEngineAction>;
} | undefined>(undefined);

// Provider component to wrap the app and provide game state and dispatch function
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use the game context
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Custom hook to use game session with additional callbacks
export function useGameSession() {
  const { state, dispatch } = useGame();

  const handleCombatEnd = useCallback((winner: 'player' | 'opponent', summary: string) => {
    dispatch({ type: 'SET_COMBAT_ACTIVE', payload: false });
    dispatch({ type: 'SET_NARRATIVE', payload: summary });
  }, [dispatch]);

  const handlePlayerHealthChange = useCallback((newStrength: number) => {
    if (!state.character) {
      console.error('No character available to change health');
      return;
    }
    
    // Keep all existing attributes and only update strength
    const updatedAttributes = {
      ...state.character.attributes,
      strength: newStrength
    };
    
    dispatch({ 
      type: 'UPDATE_CHARACTER', 
      payload: { 
        attributes: updatedAttributes
      } 
    });
  }, [state.character, dispatch]);

  const handleUseItem = useCallback((itemId: string) => {
    dispatch({ type: 'USE_ITEM', payload: itemId });
  }, [dispatch]);

  const handleEquipWeapon = useCallback((itemId: string) => {
    if (!state.character) {
      console.error('No character available to equip weapon');
      return;
    }
    const item = state.inventory.find(i => i.id === itemId);
    if (!item || item.category !== 'weapon') {
      console.error('Invalid item to equip');
      return;
    }
    InventoryManager.equipWeapon(state.character, item);
    dispatch({ type: 'EQUIP_WEAPON', payload: itemId });
  }, [state, dispatch]);

  const handleUnequipWeapon = useCallback((itemId: string) => {
    if (!state.character) {
      console.error('No character available to unequip weapon');
      return;
    }
    InventoryManager.unequipWeapon(state.character);
    dispatch({ type: 'UNEQUIP_WEAPON', payload: itemId });
  }, [state, dispatch]);

  const retryLastAction = useCallback(() => {
    // Implementation here
  }, []);

  return {
    state,
    dispatch,
    isLoading: false,
    error: null,
    isCombatActive: state.isCombatActive,
    opponent: state.opponent,
    handleUserInput: () => {
      // Implementation here
    },
    retryLastAction,
    handleCombatEnd,
    handlePlayerHealthChange,
    handleUseItem,
    onEquipWeapon: handleEquipWeapon,
    onUnequipWeapon: handleUnequipWeapon
  };
}
