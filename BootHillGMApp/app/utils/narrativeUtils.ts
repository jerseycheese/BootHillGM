/**
 * Utility functions for narrative processing
 */

/**
 * Detect player character name from narrative text
 * 
 * @param narrativeText - Recent narrative text to analyze
 * @returns The player character name if found
 */
export const detectPlayerNameFromText = (narrativeText: string): string | null => {
  // Simple detection of "You, {Name}" pattern only
  const match = narrativeText.match(/You,\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  return match?.[1] || null;
};

/**
 * Check if a narrative entry is a player action
 * 
 * @param entry - The narrative entry to check
 * @returns Boolean indicating if the entry is a player action
 */
export const isPlayerAction = (entry: string): boolean => {
  if (!entry || typeof entry !== 'string') {
    return false;
  }
  return entry.includes('player-action') || entry.startsWith('Player:');
};

/**
 * Check for decision trigger keywords in text
 * 
 * @param text - The text to check for triggers
 * @returns Boolean indicating if a trigger was found
 */
export const hasDecisionTriggers = (text: string): boolean => {
  const keywords = [
    'decide', 'choice', 'choose', 'option', 'what will you do', 
    'what do you do', 'your move', 'your turn'
  ];
  
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
};
