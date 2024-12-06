import { InventoryItem } from './inventory';
import { Weapon } from './combat';

/**
 * Character type definitions following Boot Hill v2 rules
 * 
 * Core mechanics:
 * - Strength-based combat system
 * - Wound tracking with locations
 * - Separate base and current strength
 * - Unconsciousness state
 */

/** Storage keys for character-related data */
export const STORAGE_KEYS = {
  CHARACTER_CREATION: 'character-creation-progress',
  LAST_CHARACTER: 'lastCreatedCharacter',
  COMPLETED_CHARACTER: 'completed-character'
} as const;

/** Steps in the character creation process */
export const CHARACTER_CREATION_STEPS = [
  { key: 'name', type: 'string' },
  { key: 'speed', type: 'number' },
  { key: 'gunAccuracy', type: 'number' },
  { key: 'throwingAccuracy', type: 'number' },
  { key: 'strength', type: 'number' },
  { key: 'bravery', type: 'number' },
  { key: 'experience', type: 'number' },
  { key: 'summary', type: 'review' }
] as const;

/** Represents a wound sustained by a character */
export interface Wound {
  /** Location of the wound on the body */
  location: 'head' | 'chest' | 'abdomen' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';
  /** Severity level of the wound */
  severity: 'light' | 'serious' | 'mortal';
  /** Amount of strength reduction caused by the wound */
  strengthReduction: number;
  /** Combat turn when the wound was received */
  turnReceived: number;
}

export interface CombatLogEntry {
  text: string;
  type: 'hit' | 'miss' | 'critical' | 'info';
  timestamp: number;
}

export interface Character {
  /** Character's full name */
  name: string;

  /** Character's inventory */
  inventory: InventoryItem[];

  /** Core character attributes */
  attributes: {
    /** Movement and reaction capability (1-10) */
    speed: number;
    /** Accuracy with firearms (1-10) */
    gunAccuracy: number;
    /** Accuracy with thrown weapons (1-10) */
    throwingAccuracy: number;
    /** Current strength after wound penalties (1-10) */
    strength: number;
    /** Maximum/starting strength value (8-20) */
    baseStrength: number;
    /** Courage under fire (1-10) */
    bravery: number;
    /** Combat experience (0-11) */
    experience: number;
  };


  /** Track active wounds and their effects */
  wounds: Wound[];

  /** Unconscious state from strength loss */
  isUnconscious: boolean;

  /** Optional weapon data */
  weapon?: Weapon;

  /** Equipped weapon */
  equippedWeapon?: Weapon;
}
