import type { Weapon } from './inventory';
export type { Weapon } from './inventory';
import type { Wound } from './wound';
export type { Wound } from './wound';
 
export type CombatType = 'brawling' | 'weapon' | null;

/**
 * Represents a single entry in the combat log
 */
export interface LogEntry {
  text: string;
  type: 'hit' | 'miss' | 'critical' | 'info';
  timestamp: number;
}

/**
 * Represents the final summary of a combat encounter
 * Includes the winner, results narrative, and combat statistics
 */
export interface CombatSummary {
  /** The victor of the combat ('player' or 'opponent') */
  winner: 'player' | 'opponent';
  /** Narrative description of the combat results */
  results: string;
  /** Combat statistics tracking */
  stats: {
    /** Total number of rounds in the combat */
    rounds: number;
    /** Total damage dealt to opponent */
    damageDealt: number;
    /** Total damage taken by player */
    damageTaken: number;
  }
}

export interface BrawlingState {
  round: 1 | 2;
  playerModifier: number;
  opponentModifier: number;
  playerCharacterId: string; // Reference to player Character
  opponentCharacterId: string; // Reference to opponent Character
  
  // No more strength values here
  // playerStrength: number;
  // playerBaseStrength: number;
  // opponentStrength: number;
  // opponentBaseStrength: number;
  roundLog: LogEntry[];
}

export interface WeaponModifiers {
  accuracy: number;     // Base accuracy modifier
  range: number;       // Effective range in yards
  reliability: number; // Chance of malfunction (1-100)
  damage: string;      // Damage dice (e.g. "1d6+1")
  speed: number;       // Initiative modifier
  ammunition?: number;  // Current ammunition
  maxAmmunition?: number; // Maximum ammunition capacity
}

// Constants for base weapons
export const WEAPON_STATS: Record<string, WeaponModifiers> = {
  'Colt Revolver': {
    accuracy: 2,
    range: 20,
    reliability: 95,
    damage: '1d6',
    speed: 0,
    ammunition: 6,
    maxAmmunition: 6
  },
  'Winchester Rifle': {
    accuracy: 3,
    range: 40,
    reliability: 90,
    damage: '1d8',
    speed: -1,
    ammunition: 15,
    maxAmmunition: 15
  },
  'Shotgun': {
    accuracy: 1,
    range: 10,
    reliability: 85,
    damage: '2d6',
    speed: -2,
    ammunition: 2,
    maxAmmunition: 2
  }
};

export interface WeaponCombatState {
  round: number;
  playerWeapon: Weapon | null;
  opponentWeapon: Weapon | null;
  currentRange: number;
  playerCharacterId: string; // Reference to player Character
  opponentCharacterId: string; // Reference to opponent Character
  // No more strength values here
  // playerStrength: number;
  // playerBaseStrength: number;
  // opponentStrength: number;
  // opponentBaseStrength: number;
  roundLog: LogEntry[];
  lastAction?: 'aim' | 'fire' | 'reload' | 'move' | 'malfunction';
}

export interface WeaponCombatAction {
  type: 'aim' | 'fire' | 'reload' | 'move' | 'malfunction';
  targetRange?: number;  // For move actions
  modifier?: number;     // For fire/move actions
  damage?: number;       // For fire actions
}

export type WeaponCombatResult = {
  type: 'aim' | 'fire' | 'reload' | 'move' | 'malfunction';
  targetRange?: number;  // For move actions
  hit: boolean;
  damage?: number;
  critical?: boolean;
  weaponMalfunction?: boolean;
  roll: number;
  modifiedRoll: number;
  targetNumber: number;
  message: string;
  newStrength?: number;
};

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
  cleanedState?: CombatState;
}

export interface ValidationError {
  code: 'INVALID_STATE' | 'MISSING_PROPERTY' | 'INVALID_VALUE';
  message: string;
  property?: string;
  expected?: string | number | boolean | string[] | number[] | boolean[];
  actual?: string | number | boolean | string[] | number[] | boolean[];
}

export interface CombatState {
  isActive: boolean;
  combatType: CombatType;
  winner: string | null;
  selection?: CombatSelectionState;
  brawling?: BrawlingState;
  weapon?: WeaponCombatState;
  participants: CombatParticipant[];
  rounds: number;
  
  // Additional properties for state restoration and tracking
  currentTurn?: 'player' | 'opponent';
  combatLog?: LogEntry[];
  summary?: CombatSummary;
}

export interface CombatSelectionState {
  isSelectingType: boolean;
  availableTypes: CombatType[];
}

export interface CombatSummary {
  winner: 'player' | 'opponent';
  results: string;
  stats: {
    rounds: number;
    damageDealt: number;
    damageTaken: number;
  };
}

// Utility type to ensure non-null properties
// Helper functions for weapon combat
export const calculateWeaponModifier = (
  weapon: Weapon | null,
  range: number,
  isAiming: boolean
): number => {
  if (!weapon) return 0;
  
  const rangePenalty = Math.max(-30, -Math.floor((range / weapon.modifiers.range) * 20));
  const aimBonus = isAiming ? 10 : 0;
  
  return weapon.modifiers.accuracy + rangePenalty + aimBonus;
};

export const rollForMalfunction = (weapon: Weapon): boolean => {
  const roll = Math.floor(Math.random() * 100) + 1;
  return roll > weapon.modifiers.reliability;
};

export const parseWeaponDamage = (damageString: string): number => {
  // Handle empty or invalid input
  if (!damageString) {
    return 0;
  }

  // Split into dice and modifier parts
  const [diceCount, rest] = damageString.split('d');
  
  // If no 'd' found in string, return 0. This is incorrect.
  if (!rest) {
    return parseInt(damageString) || 0;
  }

  // Split the rest into base dice and modifier if it exists
  const [baseDice, modifierStr] = rest.includes('+') ? rest.split('+') : [rest, '0'];
  
  let total = 0;
  const count = parseInt(diceCount) || 0;
  const sides = parseInt(baseDice) || 0;
  const modifier = parseInt(modifierStr) || 0;
  
  // Roll the dice
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  
  // Add modifier
  total += modifier;
  
  return total;
};

export function ensureCombatState(state?: Partial<CombatState>): CombatState {
  return {
    isActive: state?.isActive ?? false,
    combatType: state?.combatType ?? null,
    winner: state?.winner ?? null,
    selection: state?.selection,
    brawling: state?.brawling ? {
      round: state.brawling.round,
      playerModifier: state.brawling.playerModifier ?? 0,
      opponentModifier: state.brawling.opponentModifier ?? 0,
      playerCharacterId: state.brawling.playerCharacterId,
      opponentCharacterId: state.brawling.opponentCharacterId,
      roundLog: state.brawling.roundLog ?? []
    } : undefined,
    weapon: state?.weapon ? {
      round: state.weapon.round,
      playerWeapon: state.weapon.playerWeapon,
      opponentWeapon: state.weapon.opponentWeapon,
      currentRange: state.weapon.currentRange ?? 0,
      playerCharacterId: state.weapon.playerCharacterId,
      opponentCharacterId: state.weapon.opponentCharacterId,
      roundLog: state.weapon.roundLog ?? [],
      lastAction: state.weapon.lastAction
    } : undefined,
    participants: state?.participants ?? [],
    rounds: state?.rounds ?? 0,
    currentTurn: state?.currentTurn,
    combatLog: state?.combatLog ?? []
  };
}

import { Character } from './character';

// Simplified NPC type for combat
export interface NPC {
  id: string;
  name: string;
  isNPC: true;
  isPlayer: boolean;
  weapon?: Weapon;
  strength: number;
  initialStrength: number;
  wounds: Wound[];
  isUnconscious: boolean;
}

// CombatParticipant can now be either a Character or an NPC
export type CombatParticipant = Character | NPC;
