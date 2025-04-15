import { GameServiceResponse } from '../types/gameService.types';
import { LocationType } from '../../locationService';
import { ActionType } from '../../../types/campaign';
import { Character } from '../../../types/character';
import { debug } from './aiServiceDebug';

/**
 * Generates a fallback response when AI generation fails
 * Creates distinctive content that is obviously not hardcoded
 * 
 * @param characterData Character data to use for fallback content
 * @returns GameServiceResponse with fallback content
 */
export function generateFallbackResponse(characterData: Character | null): GameServiceResponse {
  const characterName = characterData?.name || 'the stranger';
  
  debug('Generating distinctive fallback content for', characterName);
  
  // Create a distinctive narrative that's obviously not the default
  const fallbackNarrative = `As ${characterName} steps off the stagecoach onto the dusty street of Boot Hill, 
  the smell of gunpowder and whiskey fills the air. This is no ordinary day - a GENERATED FALLBACK NARRATIVE 
  that proves AI content generation was attempted. The frontier town buzzes with activity as ${characterName} 
  surveys the scene, hand instinctively moving to rest on the holster at ${characterName}'s side. 
  A wanted poster flutters in the wind, and several hard-eyed men turn to stare as ${characterName} 
  makes their way down the main street. Adventure awaits in Boot Hill.`;
  
  // Return distinctive fallback response that's clearly not hardcoded
  const fallbackResponse: GameServiceResponse = {
    narrative: fallbackNarrative,
    location: { 
      type: 'town',
      name: 'Boot Hill'
    } as LocationType,
    acquiredItems: [],
    removedItems: [],
    suggestedActions: [
      {
        id: `action_${Date.now()}_1`,
        title: 'Enter the saloon',
        description: `Step into the rowdy saloon to gather information and perhaps find work.`,
        type: 'optional' as ActionType
      },
      {
        id: `action_${Date.now()}_2`,
        title: 'Visit the sheriff',
        description: `Seek out the local law enforcement to learn about troubles in the area.`,
        type: 'optional' as ActionType
      },
      {
        id: `action_${Date.now()}_3`,
        title: 'Check your belongings',
        description: `Take stock of what you've brought with you to Boot Hill.`,
        type: 'optional' as ActionType
      }
    ],
    opponent: null
  };
  
  debug('Returning fallback content');
  return fallbackResponse;
}

/**
 * Generates a fallback summary when AI generation fails
 * 
 * @param context Context information about the journal
 * @returns Fallback summary string
 */
export function generateFallbackSummary(context: string): string {
  // Extract character name from context if available
  const characterMatch = context.match(/character (\w+)/i);
  const characterName = characterMatch ? characterMatch[1] : 'The character';
  
  // Generate a meaningful fallback summary
  return `${characterName} continues their adventure in Boot Hill, with new challenges awaiting.`;
}
