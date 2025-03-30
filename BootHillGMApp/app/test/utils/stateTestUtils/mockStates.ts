/**
 * Mock state factory functions for testing
 * Central export point for all mock state functions
 */
import { createMockState } from './stateMockFactory';
import { createBasicMockState } from './baseMockState';
import { createCharacterMockState } from './characterMockState';
import { createCombatMockState } from './combatMockState';
import { createInventoryMockState } from './inventoryMockState';
import { createJournalMockState } from './journalMockState';
import { createNarrativeMockState } from './narrativeMockState';

/**
 * Creates mock state objects for various test scenarios
 * 
 * @example
 * // Create a basic empty state
 * const emptyState = mockStates.basic();
 * 
 * // Create a state with a player character
 * const characterState = mockStates.withCharacter();
 */
export const mockStates = {
  /**
   * Basic initial state with adapters applied
   * @returns {GameState} An empty state with all required properties
   */
  basic: () => createMockState(createBasicMockState()),
  
  /**
   * Mock state with player character
   * @returns {GameState} A state with a configured player character
   */
  withCharacter: () => createMockState(createCharacterMockState()),
  
  /**
   * Mock state with active combat
   * @returns {GameState} A state with active combat between player and opponent
   */
  withCombat: () => createMockState(createCombatMockState()),
  
  /**
   * Mock state with inventory items
   * @returns {GameState} A state with predefined inventory items
   */
  withInventory: () => createMockState(createInventoryMockState()),
  
  /**
   * Mock state with journal entries
   * @returns {GameState} A state with sample journal entries
   */
  withJournal: () => createMockState(createJournalMockState()),
  
  /**
   * Mock state with narrative context
   * @returns {GameState} A state with narrative elements and story points
   */
  withNarrative: () => createMockState(createNarrativeMockState())
};