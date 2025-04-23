/**
 * Utilities for creating and managing inventory journal entries
 * 
 * This module provides specialized functions for handling inventory-related
 * journal entries, including item tracking, summary generation, and
 * integration with the inventory system.
 */
import { InventoryJournalEntry } from '../../types/journal';
import { cleanText } from '../textCleaningUtils';
import { generateUUID } from '../uuidGenerator';

/**
 * Generates a summary of inventory changes
 * 
 * Creates a human-readable description of items gained and lost,
 * formatted for consistency with other journal entry summaries.
 * 
 * The function handles empty arrays gracefully and ensures
 * proper punctuation in the final summary.
 * 
 * @param acquired - Array of acquired item names
 * @param removed - Array of removed item names
 * @returns Formatted summary string
 */
export const generateInventorySummary = (acquired: string[], removed: string[]): string => {
  const parts: string[] = [];
  if (acquired && acquired.length) {
    parts.push(`Acquired: ${acquired.join(', ')}`);
  }
  if (removed && removed.length) {
    parts.push(`Used/Lost: ${removed.join(', ')}`);
  }
  
  // Ensure consistent punctuation
  const summary = parts.join('. ');
  return summary.endsWith('.') ? summary : summary + '.';
};

/**
 * Creates an inventory journal entry
 * 
 * This function handles the specialized process of inventory entry creation:
 * 1. Structures acquired and removed items in appropriate format
 * 2. Cleans contextual text to remove metadata
 * 3. Generates a narrative summary of inventory changes
 * 4. Sets appropriate entry type and timestamp
 * 
 * The generated entry provides both detailed inventory tracking and
 * a narrative-friendly summary suitable for the journal timeline.
 * 
 * @param acquiredItems - Array of item names that were acquired
 * @param removedItems - Array of item names that were removed
 * @param context - Context for the inventory change
 * @returns A new inventory journal entry
 */
export const createInventoryEntry = (
  acquiredItems: string[],
  removedItems: string[],
  context: string
): InventoryJournalEntry => {
  return {
    id: generateUUID(),
    title: 'Inventory Update',
    type: 'inventory',
    timestamp: Date.now(),
    content: cleanText(context || ''),
    items: {
      acquired: acquiredItems || [],
      removed: removedItems || []
    },
    narrativeSummary: generateInventorySummary(acquiredItems || [], removedItems || []) // Now defined before call
  };
};