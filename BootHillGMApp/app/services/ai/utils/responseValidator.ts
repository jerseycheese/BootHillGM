import { StoryProgressionData, PlayerDecision } from '../../../types/narrative.types';
import { parsePlayerDecision } from '../responseParser';
import { GameServiceResponse } from '../types/gameService.types';

/**
 * Validates and processes the AI response JSON
 * 
 * @param jsonResponse The raw JSON response from the AI
 * @returns A validated and processed GameServiceResponse
 * @throws Error if validation fails
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateAndProcessResponse(jsonResponse: any): GameServiceResponse {
  // Convert combatInitiated to boolean if it's a string
  if (typeof jsonResponse.combatInitiated === 'string') {
    jsonResponse.combatInitiated = jsonResponse.combatInitiated.toLowerCase() === 'true';
  }

  // Validate the structure of the response
  if (
    typeof jsonResponse.narrative !== 'string' ||
    typeof jsonResponse.location !== 'object' ||
    // Add 'alley' and 'interior' to allowed location types
    !['town', 'wilderness', 'landmark', 'unknown', 'alley', 'interior'].includes(jsonResponse.location.type) ||
    typeof jsonResponse.combatInitiated !== 'boolean' ||
    !Array.isArray(jsonResponse.acquiredItems) ||
    !Array.isArray(jsonResponse.removedItems) ||
    !Array.isArray(jsonResponse.suggestedActions)
  ) {
    console.error("[AI Service] Invalid JSON structure in AI response:", jsonResponse);
    throw new Error('[AI Service] Invalid JSON structure from AI');
  }

  // Further validation for location details
  if (jsonResponse.location.type === 'town' && !jsonResponse.location.name) {
    console.warn("[AI Service] Missing location.name for type 'town'; using default.");
    jsonResponse.location.name = 'Boothill';
  }
  if (jsonResponse.location.type === 'wilderness' && !jsonResponse.location.description) {
    console.warn("[AI Service] Missing location.description for type 'wilderness'; using default.");
    jsonResponse.location.description = 'A rugged landscape in the western frontier';
  }

  // Validate opponent
  if (jsonResponse.combatInitiated === true && typeof jsonResponse.opponent !== 'object') {
    console.error("[AI Service] Missing opponent data for combat scenario");
    throw new Error('[AI Service] Opponent data expected but not provided in valid format.');
  }

  // Process storyProgression field if it exists
  let storyProgression: StoryProgressionData | undefined = undefined;

  if (jsonResponse.storyProgression && typeof jsonResponse.storyProgression === 'object') {
    // Validate and format story progression data
    const spData = jsonResponse.storyProgression;

    storyProgression = {
      title: typeof spData.title === 'string' ? spData.title : undefined,
      description: typeof spData.description === 'string' ? spData.description : undefined,
      significance: ['major', 'minor', 'background', 'character', 'milestone'].includes(spData.significance)
        ? spData.significance
        : undefined,
      characters: Array.isArray(spData.characters) ? spData.characters : undefined,
      isMilestone: typeof spData.isMilestone === 'boolean' ? spData.isMilestone : undefined,
      currentPoint: typeof spData.currentPoint === 'string' ? spData.currentPoint : undefined
    };
  }

  // Process playerDecision field if it exists
  let playerDecision: PlayerDecision | undefined = undefined;

  if (jsonResponse.playerDecision && typeof jsonResponse.playerDecision === 'object') {
    try {
      playerDecision = parsePlayerDecision(jsonResponse.playerDecision, jsonResponse.location);
    } catch (error) {
      console.warn("[AI Service] Failed to parse player decision:", error);
      // Continue without player decision
    }
  }

  // Ensure we have at least one suggested action
  if (!jsonResponse.suggestedActions || jsonResponse.suggestedActions.length === 0) {
    console.warn("[AI Service] No suggested actions provided, using defaults");
    // Add default suggested actions if none provided
    jsonResponse.suggestedActions = [
      { id: 'fallback-ai-1', title: "Look around", description: "Survey your surroundings", type: 'optional' as const },
      { id: 'fallback-ai-2', title: "Continue forward", description: "Proceed on your journey", type: 'optional' as const },
      { id: 'fallback-ai-3', title: "Check your inventory", description: "See what you're carrying", type: 'optional' as const }
    ];
  }

  // Return the structured data with optional story progression and player decision
  return {
    narrative: jsonResponse.narrative,
    location: jsonResponse.location,
    combatInitiated: jsonResponse.combatInitiated,
    opponent: jsonResponse.opponent ?? null,
    acquiredItems: jsonResponse.acquiredItems,
    removedItems: jsonResponse.removedItems,
    suggestedActions: jsonResponse.suggestedActions,
    storyProgression,
    playerDecision,
    lore: jsonResponse.lore
  };
}
