/**
 * Represents a character in the Boot Hill game world.
 * Contains all essential information about a character including
 * their attributes, skills, and equipment.
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
  { key: 'shooting', type: 'number' },
  { key: 'riding', type: 'number' },
  { key: 'brawling', type: 'number' },
  { key: 'summary', type: 'review' }
] as const;

export interface Character {
  /** Character's full name */
  name: string;

  /** Current health points (0-100) */
  health: number;

  /** Core character attributes that determine capabilities */
  attributes: {
    /** Movement and reaction capability (1-10) */
    speed: number;
    /** Accuracy with firearms (1-10) */
    gunAccuracy: number;
    /** Accuracy with thrown weapons (1-10) */
    throwingAccuracy: number;
    /** Physical power and melee damage (1-10) */
    strength: number;
    /** Courage and resistance to fear effects (1-10) */
    bravery: number;
    /** Level of expertise and knowledge (1-10) */
    experience: number;
  };

  /** Learned abilities that can improve over time */
  skills: {
    /** Proficiency with firearms (1-100) */
    shooting: number;
    /** Horse handling and mounted combat ability (1-100) */
    riding: number;
    /** Hand-to-hand combat capability (1-100) */
    brawling: number;
  };

  /**
   * Optional weapon equipped by the character.
   * If undefined, character uses fists in combat.
   */
  weapon?: {
    /** Name of the weapon (e.g., "Colt Revolver", "Winchester Rifle") */
    name: string;
    /** Damage rating in dice notation (e.g., "1d6", "2d6") */
    damage: string;
  };

  /** Optional combat state for saving/restoring combat */
  combatState?: {
    /** Current health of the player */
    playerHealth: number;
    /** Current health of the opponent */
    opponentHealth: number;
    /** Current turn in combat */
    currentTurn: 'player' | 'opponent';
    /** Combat log entries */
    combatLog: string[];
  };
}
