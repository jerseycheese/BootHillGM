import { Character } from '../character';
import { InventoryItem } from '../inventory';

/**
 * Defines the possible types of actions in weapon combat.
 */
export type WeaponCombatActionType = 'aim' | 'fire' | 'reload' | 'move' | 'malfunction';

/**
 * Represents the overall state of a combat encounter.
 */
export interface CombatState {
  isActive: boolean;
  combatType: 'brawling' | 'weapon' | null;
  currentTurn?: 'player' | 'opponent';
  winner: 'player' | 'opponent' | null;
  brawling?: BrawlingCombatState;
  weapon?: WeaponCombatState;
  summary?: CombatSummary;
  participants: CombatParticipant[];
  rounds: number;
  combatLog: LogEntry[];
}

/**
 * Represents a summary of the combat results.
 */
export interface CombatSummary {
    winner: 'player' | 'opponent';
    results: string;
    stats: {
        rounds: number;
        damageDealt: number;
        damageTaken: number;
    };
}

/**
 * Represents the state of a brawling combat encounter.
 */
export interface BrawlingCombatState {
  round: 1 | 2;
  playerModifier: number;
  opponentModifier: number;
  playerCharacterId: string;
  opponentCharacterId: string;
  roundLog: LogEntry[];
}

/**
 * Represents the state of a weapon combat encounter.
 */
export interface WeaponCombatState {
  round: number;
  playerWeapon: Weapon | null;
  opponentWeapon: Weapon | null;
  currentRange: number;
  playerCharacterId: string; // Reference to Character
  opponentCharacterId: string; // Reference to Character
  roundLog: LogEntry[];
  lastAction?: WeaponCombatActionType;
}

/**
 * Represents a weapon with its attributes.
 */
export interface Weapon {
  id: string;
  name: string;
  modifiers: {
    accuracy: number;
    reliability: number;
    speed: number;
    range: number;
    damage: string;
    ammunition?: number;
    maxAmmunition?: number;
  };
}

/**
 * Represents an entry in the combat log.
 */
export interface CombatLogEntry {
    timestamp: number;
    message: string;
}

import { CombatParticipant } from '../combat';

/**
 * Represents a Non-Player Character (NPC) in combat.
 */
export interface NPC extends Character {
    isNPC: true;
    isPlayer: false;
    weapon?: Weapon;
    inventory: InventoryItem[];
    attributes: {
        speed: number;
        gunAccuracy: number;
        throwingAccuracy: number;
        strength: number;
        baseStrength: number;
        bravery: number;
        experience: number;
    };
}

export type { CombatParticipant };

export interface WeaponCombatAction {
  type: WeaponCombatActionType;
  targetRange?: number;
}

export type WeaponCombatResult = unknown;

/**
 * Represents a log entry with details about a combat action.
 */
export interface LogEntry {
  text: string;
  type: 'hit' | 'miss' | 'info' | 'critical';
  timestamp: number;
}

/**
 * Defines the statistics for various weapons.
 */
export const WEAPON_STATS: Record<string, Weapon['modifiers']> = {
    'Colt Revolver': { accuracy: 70, reliability: 85, speed: 5, range: 20, damage: '1d6', ammunition: 6, maxAmmunition: 6 },
    'Shotgun': { accuracy: 50, reliability: 85, speed: 1, range: 15, damage: '2d6', ammunition: 2, maxAmmunition: 2 },
    'Knife': { accuracy: 80, reliability: 95, speed: 5, range: 1, damage: '1d4', ammunition: 1, maxAmmunition: 1 },
    'Fists': { accuracy: 70, reliability: 100, speed: 4, range: 1, damage: '1d3', ammunition: 0, maxAmmunition: 0 },
};

/**
 * Represents an error that occurred during validation.
 */
export interface ValidationError {
  code: string;
  message: string;
  property?: string;
  expected?: string;
  actual?: string;
}

/**
 * Represents the result of a validation check.
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  cleanedState?: CombatState;
}

/**
 * Ensures that a partial combat state is a valid CombatState.
 * @param state - The partial combat state to validate.
 * @returns A complete and valid CombatState.
 */
export function ensureCombatState(state: Partial<CombatState>): CombatState {
    return {
        isActive: state.isActive !== undefined ? state.isActive : false,
        combatType: state.combatType !== undefined ? state.combatType : null,
        winner: state.winner !== undefined ? state.winner : null,
        participants: state.participants !== undefined ? state.participants : [],
        rounds: state.rounds !== undefined ? state.rounds : 0,
        combatLog: state.combatLog !== undefined ? state.combatLog : [],
        brawling: state.brawling,
        weapon: state.weapon,
        summary: state.summary,
    };
}
