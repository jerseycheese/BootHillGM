/**
 * Campaign State Manager
 * 
 * Manages the game state for a campaign using the unified GameState model.
 */

import { GameState } from '../types/gameState';
import { initialState } from '../types/initialState';

export class CampaignStateManager {
  private state: GameState;
  
  /**
   * Initialize the campaign state manager
   */
  constructor() {
    this.state = this.loadInitialState();
  }
  
  /**
   * Gets the current game state.
   */
  public getState(): GameState {
    // Return raw state, no adaptation needed
    return this.state;
  }
  
  /**
   * Gets the player character directly from the state's character slice.
   * to maintain backward compatibility with tests expecting null character
   */
  public getCharacter() {
    // Access player directly from character slice
    return this.state.character?.player || null;
  }
  
  /**
   * Gets the opponent character directly from the state's character slice.
   */
  public getOpponent() {
    // Access opponent directly from character slice
    return this.state.character?.opponent || null;
  }
  
  /**
   * Gets the inventory items directly from the state's inventory slice.
   */
  public getInventory() {
    // Access items directly from inventory slice
    return this.state.inventory?.items || [];
  }
  
  /**
   * Gets journal entries directly from the state's journal slice.
   */
  public getJournalEntries() {
    // Access entries directly from journal slice
    return this.state.journal?.entries || [];
  }
  
  /**
   * Checks if combat is active directly from the state's combat slice.
   */
  public isCombatActive() {
    // Access isActive directly from combat slice
    return this.state.combat?.isActive || false;
  }
  
  /**
   * Gets narrative context directly from the state's narrative slice.
   */
  public getNarrativeContext() {
    // Access narrativeContext directly from narrative slice
    return this.state.narrative?.narrativeContext || undefined;
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
        // Migration logic removed due to clean break approach
        
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
  
}