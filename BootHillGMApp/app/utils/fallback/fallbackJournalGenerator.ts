/**
 * Fallback Journal Generator
 * 
 * Provides emergency fallback journal entries when the AI service fails to generate content.
 * This ensures the journal is always updated even during service outages or timeouts.
 */

import { JournalEntry } from '../../types/journal';

/**
 * Generate a fallback journal entry when an action is taken but the AI service fails
 * 
 * @param action The action that was taken
 * @param actionType The type of action
 * @returns A journal entry describing the action
 */
export function generateActionFallbackEntry(action: string, actionType?: string): JournalEntry {
  const timestamp = Date.now();
  const id = `fallback_journal_${timestamp}`;
  const actionVerb = getActionVerb(actionType);
  
  // Create basic content based on the action
  const content = `You ${actionVerb} to ${action.toLowerCase()}.`;
  
  // Create a narrative summary that's even more succinct
  const narrativeSummary = `${action}`;
  
  return {
    id,
    title: action, // Use action as title
    type: 'narrative',
    timestamp,
    content,
    narrativeSummary
  };
}

/**
 * Choose an appropriate action verb based on the action type
 */
function getActionVerb(actionType?: string): string {
  switch (actionType) {
    case 'combat':
      return 'decided';
    case 'interaction':
      return 'chose';
    case 'side':
      return 'opted';
    case 'main':
      return 'decided';
    case 'basic':
      return 'chose';
    case 'chaotic':
      return 'recklessly decided';
    default:
      return 'chose';
  }
}

/**
 * Generate a fallback combat journal entry when combat occurs but the AI service fails
 * 
 * @param playerName Player name
 * @param opponentName Opponent name
 * @param outcome Combat outcome
 * @returns A combat journal entry
 */
export function generateCombatFallbackEntry(
  playerName: string,
  opponentName: string,
  outcome: 'victory' | 'defeat' | 'escape' | 'truce'
): JournalEntry {
  const timestamp = Date.now();
  const id = `fallback_combat_${timestamp}`;
  
  let content = '';
  let narrativeSummary = '';
  
  switch (outcome) {
    case 'victory':
      content = `${playerName} fought against ${opponentName} and emerged victorious.`;
      narrativeSummary = `Defeated ${opponentName}`;
      break;
    case 'defeat':
      content = `${playerName} fought against ${opponentName} but was defeated.`;
      narrativeSummary = `Lost to ${opponentName}`;
      break;
    case 'escape':
      content = `${playerName} managed to escape from a confrontation with ${opponentName}.`;
      narrativeSummary = `Escaped from ${opponentName}`;
      break;
    case 'truce':
      content = `${playerName} reached a truce with ${opponentName} after a tense standoff.`;
      narrativeSummary = `Made peace with ${opponentName}`;
      break;
  }
  
  return {
    id,
    title: `Combat: ${playerName} vs ${opponentName}`, // Add combat title
    type: 'combat',
    timestamp,
    content,
    narrativeSummary,
    combatants: {
      player: playerName,
      opponent: opponentName
    },
    outcome
  };
}

/**
 * Generate a fallback inventory journal entry when inventory changes but the AI service fails
 * 
 * @param acquiredItems Items acquired
 * @param removedItems Items removed
 * @returns An inventory journal entry
 */
export function generateInventoryFallbackEntry(
  acquiredItems: string[] = [],
  removedItems: string[] = []
): JournalEntry {
  const timestamp = Date.now();
  const id = `fallback_inventory_${timestamp}`;
  
  let content = 'Your inventory has changed.';
  
  if (acquiredItems.length > 0) {
    content += ` You acquired: ${acquiredItems.join(', ')}.`;
  }
  
  if (removedItems.length > 0) {
    content += ` You no longer have: ${removedItems.join(', ')}.`;
  }
  
  return {
    id,
    title: 'Inventory Update', // Add inventory title
    type: 'inventory',
    timestamp,
    content,
    items: {
      acquired: acquiredItems,
      removed: removedItems
    }
  };
}

/**
 * Generate fallback quest journal entry when quest status changes but the AI service fails
 * 
 * @param questTitle The quest title
 * @param status The new quest status
 * @returns A quest journal entry
 */
export function generateQuestFallbackEntry(
  questTitle: string,
  status: 'started' | 'updated' | 'completed' | 'failed'
): JournalEntry {
  const timestamp = Date.now();
  const id = `fallback_quest_${timestamp}`;
  
  let content = '';
  
  switch (status) {
    case 'started':
      content = `You have started a new quest: ${questTitle}.`;
      break;
    case 'updated':
      content = `Your quest "${questTitle}" has been updated with new information.`;
      break;
    case 'completed':
      content = `You have successfully completed the quest "${questTitle}".`;
      break;
    case 'failed':
      content = `You have failed to complete the quest "${questTitle}".`;
      break;
  }
  
  return {
    id,
    title: `Quest: ${questTitle} - ${status}`, // Add quest title
    type: 'quest',
    timestamp,
    content,
    questTitle,
    status
  };
}
