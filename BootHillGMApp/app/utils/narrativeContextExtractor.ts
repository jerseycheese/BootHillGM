/**
 * Narrative Context Extractor
 * 
 * Utilities for extracting and processing narrative context from game state.
 */

import { GameState } from '../types/gameState';
import { cleanText } from './textCleaningUtils';

/**
 * Clean narrative entry text by removing prefixes and duplicate content
 * 
 * @param entry - Narrative entry text to clean
 * @returns Cleaned entry text
 */
export function cleanNarrativeEntry(entry: string): string {
  // Remove system prefixes and use general text cleaning
  return cleanText(entry)
    .replace(/^Game Event:\s*/i, '')
    .replace(/^Context:\s*/i, '')
    .replace(/^Game Master:\s*/i, '')
    .trim();
}

/**
 * Extract the most relevant recent narrative context
 * 
 * This function gathers the most recent narrative history entries
 * to provide better context for decision generation.
 * 
 * @param gameState - Current game state
 * @returns String containing the recent narrative context
 */
export function extractRecentNarrativeContext(gameState: GameState): string {
  if (!gameState.narrative || !gameState.narrative.narrativeHistory) {
    return "No narrative history available.";
  }
  
  // Get the most recent entries (prioritizing more recent narrative)
  const history = gameState.narrative.narrativeHistory;
  
  // Get the last 10 entries (or fewer if not available) for more comprehensive context
  const recentEntries = history.slice(Math.max(0, history.length - 15));
  
  // Extract player actions specifically to highlight player agency
  const playerActions = history
    .filter(entry => 
      entry.startsWith("Player:") || 
      entry.includes("player action") || 
      entry.includes("Player Action:") ||
      entry.includes("You:")
    )
    .slice(-5); // Get last 5 player actions
  
  // System prefixes to filter out
  const systemPrefixes = [
    "STORY_POINT:", 
    "Game Event:",
    "Context:"
  ];
  
  // Filter out system metadata and deduplicate entries
  const uniqueContentSet = new Set<string>();
  const cleanedEntries = recentEntries.filter(entry => {
    // Skip empty entries, JSON metadata, or system prefixes
    if (!entry.trim() || 
        entry.trim() === '{' || 
        entry.trim() === '}' ||
        entry.includes('"title":') ||
        entry.includes('"description":') ||
        entry.includes('"significance":') ||
        entry.includes('"characters":') ||
        entry.includes('"isMilestone":') ||
        systemPrefixes.some(prefix => entry.includes(prefix))) {
      return false;
    }
    
    // Clean entry and check for duplicates
    const cleanedEntry = cleanNarrativeEntry(entry);
    if (uniqueContentSet.has(cleanedEntry)) {
      return false;
    }
    
    // Add to unique set and keep entry
    uniqueContentSet.add(cleanedEntry);
    return true;
  });
  
  // Combine recent narrative with player actions for better context
  let contextText = "Recent narrative:\n";
  
  cleanedEntries.forEach(entry => {
    // Use the cleaned version for output
    contextText += `- ${cleanNarrativeEntry(entry)}\n`;
  });
  
  // Clean and deduplicate player actions
  const uniquePlayerActions = new Set<string>();
  if (playerActions.length > 0) {
    contextText += "\nRecent player actions:\n";
    playerActions.forEach(action => {
      const cleanedAction = action
        .replace("Player:", "")
        .replace("Player Action:", "")
        .replace("You:", "")
        .trim();
        
      if (cleanedAction && !uniquePlayerActions.has(cleanedAction)) {
        uniquePlayerActions.add(cleanedAction);
        contextText += `- ${cleanedAction}\n`;
      }
    });
  }
  
  // Add current location if available
  if (gameState.location) {
    contextText += "\nCurrent location: ";
    
    // Handle each location type appropriately
    if (gameState.location.type === 'town' && 'name' in gameState.location) {
      contextText += gameState.location.name;
    } 
    else if (gameState.location.type === 'wilderness' && 'description' in gameState.location) {
      contextText += `Wilderness - ${gameState.location.description}`;
    }
    else if (gameState.location.type === 'landmark' && 'name' in gameState.location) {
      contextText += gameState.location.name;
      if ('description' in gameState.location && gameState.location.description) {
        contextText += ` - ${gameState.location.description}`;
      }
    }
  }
  
  return contextText;
}
