import { GameServiceResponse } from '../types/gameService.types';
import { LocationType } from '../../locationService';
import { ActionType } from '../../../types/campaign';

/**
 * Creates a mock AI response for testing
 * Only used in test environments, not in development or production
 * 
 * @param prompt Base prompt for content generation
 * @param context Context information about the journal
 * @returns Mock GameServiceResponse for testing
 */
export function createMockResponse(prompt: string, context: string): GameServiceResponse {
  // Extract character name from context if available
  const nameMatch = context.match(/character ([^ ]+)/);
  const characterName = nameMatch ? nameMatch[1] : 'the stranger';
  
  // Create a narrative that's obviously a mock/test narrative
  const narrative = `[MOCK AI NARRATIVE] ${characterName} arrives in Boot Hill after a long journey. 
  The frontier town is bustling with activity as gold prospectors, cowboys, and outlaws mingle in 
  the dusty streets. The saloon doors swing open as a group of rough-looking men exit, eyeing 
  ${characterName} with suspicion. This narrative was generated for testing at ${new Date().toISOString()}.`;
  
  return {
    narrative,
    location: { 
      type: 'town',
      name: 'Boot Hill'
    } as LocationType,
    acquiredItems: [],
    removedItems: [],
    suggestedActions: [
      {
        id: `mock_action_${Date.now()}_1`,
        title: 'Enter the saloon',
        description: `[MOCK] Step into the rowdy saloon to gather information and perhaps find work.`,
        type: 'optional' as ActionType
      },
      {
        id: `mock_action_${Date.now()}_2`,
        title: 'Visit the general store',
        description: `[MOCK] Browse the supplies and equipment available for purchase.`,
        type: 'optional' as ActionType
      },
      {
        id: `mock_action_${Date.now()}_3`,
        title: 'Talk to the sheriff',
        description: `[MOCK] Seek out the local law enforcement to learn about troubles in the area.`,
        type: 'optional' as ActionType
      }
    ],
    opponent: null
  };
}

/**
 * Creates a mock summary for testing
 * 
 * @param characterName Character name to include in summary
 * @returns Mock summary string for testing
 */
export function createMockSummary(characterName: string): string {
  return `[MOCK SUMMARY] ${characterName} embarks on a new adventure in Boot Hill, facing uncertainty and danger in the frontier town.`;
}
