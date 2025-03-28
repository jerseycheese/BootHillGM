import { GameState } from '../types/gameState';
import { initialState } from '../types/initialState';
import { migrationAdapter, LegacyState } from './stateAdapters';
import { initialNarrativeState } from '../types/narrative/utils';
import { isObject, isNumber } from './typeGuards';

/**
 * State version constants
 */
const STATE_VERSIONS = {
  INITIAL: 0,
  WITH_NARRATIVE: 1,
  DOMAIN_SLICES: 2
};

// Current state version
const CURRENT_STATE_VERSION = STATE_VERSIONS.DOMAIN_SLICES;

/**
 * Extended version of GameState that includes version for migration purposes
 */
interface VersionedState extends Partial<GameState> {
  version?: number;
}

/**
 * Helper function to get the state version
 */
function getStateVersion(state: unknown): number {
  if (isObject(state) && 'version' in state && isNumber((state as VersionedState).version)) {
    return (state as VersionedState).version as number;
  }
  return 0; // Default version for states without a version
}

/**
 * Migrates the game state from an older version to the current version
 * 
 * This function handles migration between different state formats and versions,
 * ensuring backward compatibility with previous state structures.
 * 
 * @param oldState The state to migrate, can be undefined
 * @returns The migrated state in the current format
 */
export const migrateGameState = (oldState: GameState | undefined): GameState => {
  if (!oldState) {
    return initialState;
  }

  // Get state version
  const version = getStateVersion(oldState);
  
  // If already at current version, ensure it's in the correct format
  if (version === CURRENT_STATE_VERSION) {
    return migrationAdapter.oldToNew(oldState as unknown as LegacyState) as GameState;
  }
  
  // Apply migrations in sequence based on version
  let migratedState = oldState as VersionedState;
  
  if (version < STATE_VERSIONS.WITH_NARRATIVE) {
    migratedState = migrateToV1(migratedState);
  }
  
  if (version < STATE_VERSIONS.DOMAIN_SLICES) {
    migratedState = migrateToV2(migratedState);
  }
  
  // Ensure the final state is in the correct format
  // Create a new object with the migrated state and remove the version property
  const { version: _, ...finalState } = {
    ...migrationAdapter.oldToNew(migratedState as LegacyState),
    version: CURRENT_STATE_VERSION
  };
  
  return finalState as GameState;
};

/**
 * Migrates a state from v0 to v1 (with narrative)
 */
function migrateToV1(state: VersionedState): VersionedState {
  // Use the imported initialNarrativeState to ensure consistent structure
  return {
    ...state,
    version: STATE_VERSIONS.WITH_NARRATIVE,
    narrative: state.narrative || initialNarrativeState
  };
}

/**
 * Migrates a state from v1 to v2 (domain slices)
 */
function migrateToV2(state: VersionedState): VersionedState {
  // Use migration adapter to convert to domain slice format
  const newState = migrationAdapter.oldToNew(state as LegacyState);
  
  // Add the version property to the new state
  return {
    ...newState,
    version: STATE_VERSIONS.DOMAIN_SLICES
  } as VersionedState;
}

/**
 * Type guard to check if a value is a valid state object
 */
function isGameState(value: unknown): value is Partial<GameState> {
  if (!isObject(value)) {
    return false;
  }
  
  // Check for presence of key state properties
  const state = value as Record<string, unknown>;
  
  // Check for domain slices structure
  const hasSliceStructure = isObject(state.character) && 
                            isObject(state.inventory) && 
                            isObject(state.combat);
  
  // Check for legacy flat structure
  const hasLegacyStructure = state.player !== undefined && 
                             state.inventory !== undefined;
  
  return hasSliceStructure || hasLegacyStructure;
}

/**
 * Checks if the state needs migration
 * 
 * @param state The state to check
 * @returns Whether migration is needed
 */
export const needsMigration = (state: unknown): boolean => {
  if (!isGameState(state)) {
    return true;
  }
  
  // Get the version
  const version = getStateVersion(state);
  
  return version < CURRENT_STATE_VERSION;
};

/**
 * Validates that the state has a valid structure
 * 
 * @param state The state to validate
 * @returns Whether the state has a valid structure
 */
export const validateStateStructure = (state: unknown): boolean => {
  return isGameState(state);
};