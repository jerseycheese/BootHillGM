/**
 * Decision Generator Types
 * 
 * Centralized type definitions for the decision generation system.
 */

import { 
  NarrativeContext,
  PlayerDecision
} from '../types/narrative.types';
import { GameState } from '../types/gameState';
import { LocationType, LocationService } from '../services/locationService';
import { DecisionTemplate } from './decisionTemplates';

// Decision generation modes
export type DecisionGenerationMode = 'template' | 'ai' | 'hybrid';

/**
 * Convert a decision template to a PlayerDecision object
 *
 * @param template Decision template to convert
 * @param context Current narrative context
 * @returns PlayerDecision object ready for presentation
 */
export const templateToDecision = (
  template: DecisionTemplate,
  context?: Partial<NarrativeContext>
): PlayerDecision => {
  let location: LocationType;
  if (typeof template.locationType === 'string') {
    if (template.locationType === 'any') {
      location = { type: 'unknown' };
    } else {
      // This should not happen if templates are correctly defined, but handle it just in case.
      console.warn(`Unexpected string locationType in template: ${template.locationType}`);
      location = { type: 'unknown' };
    }
  } else {
    location = template.locationType;
  }

  return {
    id: `gen-${template.id}-${Date.now()}`,
    prompt: template.prompt,
    timestamp: Date.now(),
    location: location,
    options: template.options.map((option) => ({
      id: option.id,
      text: option.text,
      impact: option.impact,
      tags: option.tags,
    })),
    context: template.contextDescription,
    importance: template.importance,
    characters: context?.characterFocus || [],
    aiGenerated: false,
  };
};

/**
 * Extract relevant context from game state to inform decision generation
 *
 * @param gameState Current game state
 * @returns Extracted context information
 */
export const extractContextFromGameState = (
  gameState: GameState
): {
  locationType: LocationType;
  characters: string[];
  themes: string[];
} => {
  let locationType: LocationType;

  if (!gameState.location) {
    console.warn('gameState.location is undefined. Defaulting to town.');
    locationType = { type: 'town', name: 'Unknown Town' };
  } else if (!gameState.location.type) {
    console.warn('gameState.location.type is undefined. Defaulting to town.');
    locationType = { type: 'town', name: 'Unknown Town' };
  } else {
    // Check if gameState.location is already a LocationType object
    if (typeof gameState.location === 'string') {
        const locationService = LocationService.getInstance();
        locationType = locationService.parseLocation(gameState.location);
    }
    else {
        locationType = gameState.location
    }
  }

  // Get characters - use any NPCs in the current scene or default to an empty array
  const characters = gameState.npcs || [];

  // Get themes - in a real implementation this would be more sophisticated
  const themes = gameState.narrative.narrativeContext?.themes || [];

  return {
    locationType,
    characters,
    themes,
  };
};

/**
 * Find the best matching template based on context
 *
 * @param templates Available templates
 * @param characters Characters in the current context
 * @param themes Themes in the current context
 * @returns Best matching template or a random one if no good match
 */
export const findBestTemplateMatch = (
  templates: DecisionTemplate[],
  characters: string[],
  themes: string[]
): DecisionTemplate | null => {
  if (templates.length === 0) return null;

  // Score each template based on how well it matches our context
  const scoredTemplates = templates.map((template) => {
    let score = 0;

    // Check if template requires specific characters that are present
    if (template.characterRequirements) {
      const characterMatches = template.characterRequirements.filter((char) =>
        characters.includes(char)
      );
      score += characterMatches.length;
    }

    // Check if template requires specific themes that are present
    if (template.themeRequirements) {
      const themeMatches = template.themeRequirements.filter((theme) =>
        themes.includes(theme)
      );
      score += themeMatches.length;
    }

    return { template, score };
  });

  // Sort by score, descending
  scoredTemplates.sort((a, b) => b.score - a.score);

  // Return the best match, or if no good matches (score > 0), return a random template
  if (scoredTemplates[0].score > 0) {
    return scoredTemplates[0].template;
  } else {
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }
};
