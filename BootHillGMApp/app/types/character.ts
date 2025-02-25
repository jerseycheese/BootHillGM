import { InventoryItem } from './item.types';
import { Weapon } from './weapon.types';
import { Wound } from './wound';
import { StrengthHistory } from '../utils/strengthSystem';

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

export interface Character {
  /** Whether the character is an NPC or not */
  isNPC: boolean;
  isPlayer: boolean;
  /** Unique character ID */
  id: string;

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
  equippedWeapon?: InventoryItem;

  /** Strength history */
  strengthHistory?: StrengthHistory;
}

export interface CombatLogEntry {
  text: string;
  type: 'hit' | 'miss' | 'critical' | 'info';
  timestamp: number;
}

export interface StartData {
  timestamp: string;
}

export type AIResponseData = string | {
  rawResponse: string;
};

export interface ParsedData {
  character: Partial<Character>;
}

export type CompleteData = Character;

export interface ErrorData {
  error: string;
  stack?: string;
}

export interface CharacterGenerationLog {
  timestamp: string;
  stage: 'start' | 'aiResponse' | 'parsed' | 'complete' | 'error';
  data: StartData | AIResponseData | ParsedData | CompleteData | ErrorData;
  context: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export class CharacterGenerationError extends Error {
  constructor(public errors: ValidationError[]) {
    super('Character generation failed validation');
  }
}
