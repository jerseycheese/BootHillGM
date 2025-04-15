/**
 * BackwardCompatibility.ts
 * 
 * Handles backward compatibility with legacy storage formats.
 * Ensures data is saved in multiple locations for older versions.
 * Contains utility functions for converting between storage formats.
 * 
 * @module BackwardCompatibility
 */

import { CharacterState } from '../../types/state/characterState';
import { NarrativeState } from '../../types/narrative.types';
import { SuggestedAction } from '../../types/campaign';
import { storageKeys } from './storageKeys';
import { storageUtils } from './storageUtils';

/**
 * Debug console function for internal logging.
 * Only outputs when in development environment.
 * 
 * @param args - Arguments to log to console
 */
const debug = (...args: Array<unknown>): void => {
  console.log('[DEBUG BackwardCompatibility]', ...args);
};

/**
 * Save individual components for backward compatibility with older versions.
 * Extracts and saves specific game components to their dedicated storage keys.
 * 
 * @param gameState - The game state to extract components from
 */
const saveBackwardsCompatibleData = (gameState: Record<string, unknown>): void => {
  // Save character data if present
  if ('character' in gameState) {
    const characterData = gameState.character && typeof gameState.character === 'object' 
      ? (gameState.character as CharacterState).player 
      : gameState.character;
      
    if (characterData) {
      debug('Saving character data for backwards compatibility');
      
      storageUtils.setItem(
        storageKeys.CHARACTER_PROGRESS, 
        { character: characterData }
      );
      
      storageUtils.setItem(
        storageKeys.COMPLETED_CHARACTER,
        characterData
      );
    }
  }
  
  // Save narrative history if present
  if ('narrative' in gameState && gameState.narrative && typeof gameState.narrative === 'object') {
    const narrativeHistory = 'narrativeHistory' in (gameState.narrative as NarrativeState) 
      ? (gameState.narrative as NarrativeState).narrativeHistory 
      : [];
      
    if (narrativeHistory && Array.isArray(narrativeHistory)) {
      debug('Saving narrative history for backwards compatibility');
      
      storageUtils.setItem(
        storageKeys.NARRATIVE_STATE, 
        narrativeHistory
      );
    }
  }
  
  // Save inventory if present
  if (gameState.inventory && typeof gameState.inventory === 'object') {
    debug('Saving inventory for backwards compatibility');
    
    storageUtils.setItem(
      storageKeys.INVENTORY_STATE,
      gameState.inventory
    );
  }
};

/**
 * Save individual game components to separate storage keys for backward compatibility.
 * Ensures all components are properly stored in their dedicated locations.
 * Used during initialization to make game state available in all formats.
 * 
 * @param characterState - Character state to save
 * @param narrativeState - Narrative state to save
 * @param suggestedActions - Suggested actions to save
 * @param inventoryItems - Inventory items to save
 */
const saveIndividualComponents = (
  characterState: CharacterState, 
  narrativeState: NarrativeState,
  suggestedActions: SuggestedAction[],
  inventoryItems: unknown
): void => {
  // Save character component
  if (characterState.player) {
    storageUtils.setItem(
      storageKeys.CHARACTER_PROGRESS, 
      { character: characterState.player }
    );
    
    storageUtils.setItem(
      storageKeys.COMPLETED_CHARACTER,
      characterState.player
    );
    
    debug('Saved character to multiple storage locations');
  }
  
  // Save narrative component
  if (narrativeState.narrativeHistory?.length > 0) {
    storageUtils.setItem(
      storageKeys.NARRATIVE_STATE, 
      narrativeState.narrativeHistory
    );
    
    // Save first narrative entry for future resets
    storageUtils.setItem(
      storageKeys.INITIAL_NARRATIVE, 
      { narrative: narrativeState.narrativeHistory[0] }
    );
    
    debug('Saved narrative data to storage');
  }
  
  // Save inventory component
  if (inventoryItems) {
    storageUtils.setItem(
      storageKeys.INVENTORY_STATE,
      { items: inventoryItems }
    );
    
    debug('Saved inventory items to storage');
  }
  
  // Save complete state for campaign
  storageUtils.setItem(
    storageKeys.CAMPAIGN_STATE,
    {
      character: characterState,
      narrative: narrativeState,
      suggestedActions: suggestedActions,
      inventory: { items: inventoryItems, equippedWeaponId: null }
    }
  );
  
  debug('Saved complete state to campaign state');
};

/**
 * Public API for backward compatibility functions.
 * Provides access to functions that handle legacy storage formats.
 */
export const backwardCompatibility = {
  saveBackwardsCompatibleData,
  saveIndividualComponents
};