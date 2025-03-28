/**
 * Campaign State Manager
 * 
 * Manages the game state for a campaign, with backward compatibility
 * for the new state architecture.
 */

import { GameState } from '../types/gameState';
import { adaptStateForTests, legacyGetters } from './stateAdapters';
import { initialState } from '../types/initialState';
import { migrateGameState, needsMigration } from './stateMigration';

export class CampaignStateManager {
  private state: GameState;
  
  /**
   * Initialize the campaign state manager
   */
  constructor() {
    this.state = this.loadInitialState();
  }
  
  /**
   * Gets the current state with adapters applied for backward compatibility
   */
  public getState(): GameState {
    return adaptStateForTests(this.state);
  }
  
  /**
   * Gets the player character from state using character adapter
   * to maintain backward compatibility with tests expecting null character
   */
  public getCharacter() {
    return legacyGetters.getPlayer(this.state);
  }
  
  /**
   * Gets the opponent character from state using adapter
   */
  public getOpponent() {
    return legacyGetters.getOpponent(this.state);
  }
  
  /**
   * Gets the inventory items using adapter
   */
  public getInventory() {
    return legacyGetters.getItems(this.state);
  }
  
  /**
   * Gets journal entries using adapter
   */
  public getJournalEntries() {
    return legacyGetters.getEntries(this.state);
  }
  
  /**
   * Checks if combat is active using adapter
   */
  public isCombatActive() {
    return legacyGetters.isCombatActive(this.state);
  }
  
  /**
   * Gets narrative context using adapter
   */
  public getNarrativeContext() {
    return legacyGetters.getNarrativeContext(this.state);
  }
  
  /**
   * Updates the state with a new state object
   * @param newState The new state to set
   */
  public setState(newState: GameState) {
    this.state = newState;
  }
  
  /**
   * Loads the initial state from storage or returns default
   */
  private loadInitialState(): GameState {
    try {
      // Try to load from localStorage
      const savedState = localStorage.getItem('bootHillGMState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Check if state needs migration
        if (needsMigration(parsedState)) {
          const migratedState = migrateGameState(parsedState);
          // Save the migrated state back to storage
          localStorage.setItem('bootHillGMState', JSON.stringify(migratedState));
          return migratedState;
        }
        
        return parsedState;
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }
    
    // Return the default initial state
    return initialState;
  }
  
  /**
   * Saves the current state to storage
   */
  public saveState() {
    try {
      localStorage.setItem('bootHillGMState', JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }
  
  /**
   * Gets the internal raw state without adaptation
   * Used internally by the manager
   */
  private _getStateInternal(): GameState {
    return this.state;
  }
}