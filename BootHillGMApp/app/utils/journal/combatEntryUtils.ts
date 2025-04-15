/**
 * Utilities for creating and managing combat journal entries
 * 
 * This module provides specialized functions for handling combat-related
 * journal entries, including formatting, summarization, and integration
 * with the combat system.
 */
import { CombatJournalEntry } from '../../types/journal';
import { cleanCombatLogEntry } from '../textCleaningUtils';
import { generateUUID } from '../uuidGenerator';

/**
 * Creates a combat journal entry
 * 
 * This function handles the specialized process of combat entry creation:
 * 1. Cleans combat log text to remove metadata and formatting artifacts
 * 2. Generates appropriate narrative summaries based on combat outcome
 * 3. Structures the entry with proper combatant information
 * 4. Sets appropriate title and content formatting
 * 
 * The generated entry provides both detailed combat information and
 * a narrative-friendly summary suitable for the journal timeline.
 * 
 * @param playerName - Name of the player character
 * @param opponentName - Name of the opponent
 * @param outcome - Result of the combat encounter
 * @param summary - Text summary of the combat
 * @returns A new combat journal entry
 */
export const createCombatEntry = (
  playerName: string,
  opponentName: string,
  outcome: CombatJournalEntry['outcome'],
  summary: string
): CombatJournalEntry => {
  // Clean the summary and remove metadata
  const cleanedSummary = cleanCombatLogEntry(summary);
  
  // Create a more readable summary based on the combat outcome
  let narrativeSummary = '';
  switch(outcome) {
    case 'victory':
      narrativeSummary = `${playerName} defeated ${opponentName} in combat.`;
      break;
    case 'defeat':
      narrativeSummary = `${playerName} was defeated by ${opponentName} in combat.`;
      break;
    case 'draw':
      narrativeSummary = `${playerName} and ${opponentName} fought to a draw.`;
      break;
    case 'escape':
      narrativeSummary = `${playerName} escaped from combat with ${opponentName}.`;
      break;
    default:
      narrativeSummary = `${playerName} and ${opponentName} engaged in combat.`;
  }
  
  // Create a new combat journal entry
  return {
    id: generateUUID(),
    title: `Combat: ${playerName} vs ${opponentName}`,
    type: 'combat',
    timestamp: Date.now(),
    content: cleanedSummary,
    combatants: {
      player: playerName,
      opponent: opponentName
    },
    outcome,
    narrativeSummary
  };
};