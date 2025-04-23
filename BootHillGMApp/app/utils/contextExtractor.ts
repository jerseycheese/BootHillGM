// BootHillGMApp/app/utils/contextExtractor.ts (Reordered)
import { NarrativeState, NarrativeContext } from '../types/narrative.types';
import { GameState } from '../types/gameState';
import { Character } from '../types/character';
import { buildComprehensiveContextExtension } from './decisionPromptBuilder';
import { LocationType } from '../services/locationService';

/**
 * Helper function to format character context
 *
 * @param character Character object
 * @returns Formatted character context string
 */
function formatCharacterContext(character: Character): string {
  const attributes = character.attributes;

  // Extract traits based on attribute values
  const traits: string[] = [];
  if (attributes.bravery >= 8) traits.push('brave');
  if (attributes.bravery <= 3) traits.push('cautious');
  if (attributes.speed >= 8) traits.push('quick');
  if (attributes.speed <= 3) traits.push('slow');
  if (attributes.gunAccuracy >= 8) traits.push('sharpshooter');
  if (attributes.gunAccuracy <= 3) traits.push('poor shot');

  // Create formatted context - removed the description property that doesn't exist in Character
  return `
Character: ${character.name}
Traits: ${traits.join(', ')}
Attributes: Speed ${attributes.speed}, Gun Accuracy ${attributes.gunAccuracy}, Bravery ${attributes.bravery}
`.trim();
}

/**
 * Helper function to extract character mentions from narrative history
 *
 * @param narrativeHistory Array of narrative entries
 * @returns Array of character names
 */
function extractCharacterMentions(narrativeHistory: string[]): string[] {
  const characterRegex = /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b/g;
  const commonWords = ['The', 'A', 'An', 'This', 'That', 'I', 'You', 'We', 'They'];

  // Extract all possible character names
  const potentialCharacters = new Set<string>();

  narrativeHistory.forEach(entry => {
    const matches = entry.match(characterRegex) || [];
    matches.forEach(match => {
      // Filter out common capitalized words
      if (!commonWords.includes(match)) {
        potentialCharacters.add(match);
      }
    });
  });

  return [...potentialCharacters];
}

/**
 * Helper function to extract important events from narrative history
 *
 * @param narrativeHistory Array of narrative entries
 * @returns Array of important event descriptions
 */
function extractImportantEvents(narrativeHistory: string[]): string[] {
  const eventIndicators = [
    /discovered/i, /found/i, /killed/i, /defeated/i,
    /acquired/i, /received/i, /learned/i, /met/i, /arrived/i
  ];

  const importantEvents: string[] = [];

  // Process each narrative entry sentence-by-sentence
  narrativeHistory.forEach(entry => {
    const sentences = entry.split(/(?<=[.!?])\s+/);

    sentences.forEach(sentence => {
      // Check if sentence contains event indicators
      if (eventIndicators.some(regex => regex.test(sentence))) {
        // Clean up sentence if needed
        const cleanedEvent = sentence.trim();
        importantEvents.push(cleanedEvent);
      }
    });
  });

  return importantEvents;
}

/**
 * Extracts comprehensive context from multiple narrative sources
 *
 * This function pulls context from narrative history, story points,
 * decision history, character relationships, and world state to create
 * a rich context representation for AI decision generation.
 *
 * @param gameState Current game state
 * @param minHistoryEntries Minimum narrative history entries required
 * @returns Comprehensive context object
 */
export function extractComprehensiveContext(
  gameState: GameState,
  minHistoryEntries: number = 3
): {
  narrativeContext: string;
  locationContext: LocationType | undefined;
  characterContext: string;
  worldContext: string;
  decisionContext: string;
  sufficientContext: boolean;
} {
  // Initialize result object
  const result = {
    narrativeContext: '',
    locationContext: undefined as LocationType | undefined,
    characterContext: '',
    worldContext: '',
    decisionContext: '',
    sufficientContext: false
  };

  // Check for minimum context
  if (!gameState || !gameState.narrative ||
      gameState.narrative.narrativeHistory.length < minHistoryEntries) {
    return result;
  }

  // Mark as having sufficient context
  result.sufficientContext = true;

  // Extract narrative history context
  const narrativeHistory = gameState.narrative.narrativeHistory;
  result.narrativeContext = narrativeHistory.slice(-minHistoryEntries).join('\n\n');

  // Extract location context
  if (gameState.narrative.currentStoryPoint?.locationChange) {
    result.locationContext = gameState.narrative.currentStoryPoint.locationChange;
  } else if (gameState.location) {
    result.locationContext = gameState.location;
  }

  // Extract character context
  if (gameState.character && gameState.character.player) {
    result.characterContext = formatCharacterContext(gameState.character.player); // Now defined above
  }

  // Extract world context
  if (gameState.narrative.narrativeContext?.worldContext) {
    result.worldContext = gameState.narrative.narrativeContext.worldContext;
  }

  // Extract decision context
  if (gameState.narrative.narrativeContext) {
    result.decisionContext = buildComprehensiveContextExtension(
      gameState.narrative.narrativeContext
    );
  }

  return result;
}

/**
 * Refreshes the narrative context to ensure it has the latest state
 *
 * This function updates the narrative context with the latest game state
 * information before generating decisions or AI responses. This solves the
 * stale context issue (issue #210) where decisions were using outdated context.
 *
 * @param narrativeState Current narrative state
 * @param gameState Optional full game state
 * @returns Updated narrative context
 */
export function refreshNarrativeContext(
  narrativeState: NarrativeState,
  gameState?: GameState
): NarrativeContext {
  // Use the existing context as a base or create a new one
  const existingContext = narrativeState.narrativeContext || {
    tone: 'serious',
    characterFocus: [],
    themes: [],
    worldContext: '',
    importantEvents: [],
    storyPoints: { /* Intentionally empty */ },
    narrativeArcs: { /* Intentionally empty */ },
    impactState: {
      reputationImpacts: { /* Intentionally empty */ },
      relationshipImpacts: { /* Intentionally empty */ },
      worldStateImpacts: { /* Intentionally empty */ },
      storyArcImpacts: { /* Intentionally empty */ },
      lastUpdated: Date.now()
    },
    narrativeBranches: { /* Intentionally empty */ },
    pendingDecisions: [],
    decisionHistory: []
  };

  // Create a copy to avoid mutating the original
  const updatedContext: NarrativeContext = {
    // Spread existing context first to capture all values
    ...existingContext,
    // Then set required properties with nullish coalescing
    importantEvents: existingContext.importantEvents ?? [],
    worldContext: existingContext.worldContext ?? '',
    characterFocus: existingContext.characterFocus ?? [],
    // Initialize impact state with proper defaults
    impactState: {
      reputationImpacts: { /* Intentionally empty */ },
      relationshipImpacts: { /* Intentionally empty */ },
      worldStateImpacts: { /* Intentionally empty */ },
      storyArcImpacts: { /* Intentionally empty */ },
      ...existingContext.impactState,
      lastUpdated: Date.now()
    }
  };

  // Update history-based fields if we have minimum context
  if (narrativeState.narrativeHistory.length >= 3) {
    // Extract important events from recent history
    const recentEvents = extractImportantEvents(narrativeState.narrativeHistory.slice(-5)); // Now defined above
    if (recentEvents.length > 0) {
      updatedContext.importantEvents = [
        ...(updatedContext.importantEvents ?? []),
        ...recentEvents.filter(event => !(updatedContext.importantEvents ?? []).includes(event))
      ];
    }

    // Update character focus based on recent mentions
    const mentionedCharacters = extractCharacterMentions(narrativeState.narrativeHistory); // Now defined above
    if (mentionedCharacters.length > 0) {
      updatedContext.characterFocus = [
        ...new Set([...(updatedContext.characterFocus ?? []), ...mentionedCharacters])
      ];
    }
  }

  // Update world context based on current location if available
  if (gameState?.location && typeof gameState.location !== 'string') {
    const locationUpdate = `Currently in ${gameState.location.type === 'town' ?
      `the town of ${gameState.location.name}` :
      gameState.location.type}`;

    if (!(updatedContext.worldContext ?? '').includes(locationUpdate)) {
      updatedContext.worldContext = updatedContext.worldContext
        ? `${updatedContext.worldContext}. ${locationUpdate}`
        : locationUpdate;
    }
  }

  return updatedContext;
}

/**
 * Enhanced context extraction for use with AI responses
 *
 * This function extends the basic context extraction with additional
 * preprocessing and organization specific to generating AI responses.
 *
 * @param gameState Current game state
 * @param additionalContext Any additional context to include
 * @returns Optimized context for AI generation
 */
export function extractAIResponseContext(
  gameState: GameState,
  additionalContext?: string
): string {
  // Get the basic comprehensive context
  const baseContext = extractComprehensiveContext(gameState);

  // If we don't have sufficient context, return minimal context
  if (!baseContext.sufficientContext) {
    return additionalContext || 'Western RPG set in Boot Hill.';
  }

  // Build structured context sections
  const sections: string[] = [];

  // Narrative context section
  if (baseContext.narrativeContext) {
    sections.push(`## Recent Events\n${baseContext.narrativeContext}`);
  }

  // Character context section
  if (baseContext.characterContext) {
    sections.push(`## Character\n${baseContext.characterContext}`);
  }

  // World context section
  if (baseContext.worldContext) {
    sections.push(`## World State\n${baseContext.worldContext}`);
  }

  // Location context
  if (baseContext.locationContext) {
    const location = baseContext.locationContext;
    const locationText = typeof location === 'string'
      ? location
      : `${location.type}${location.type === 'town' && 'name' in location ? `: ${location.name}` : ''}`;

    sections.push(`## Location\n${locationText}`);
  }

  // Decision context section
  if (baseContext.decisionContext) {
    sections.push(`## Decision History\n${baseContext.decisionContext}`);
  }

  // Additional context section
  if (additionalContext) {
    sections.push(`## Additional Context\n${additionalContext}`);
  }

  // Combine all sections
  return sections.join('\n\n');
}

/**
 * Extracts relationships from impact state with enhanced descriptors
 *
 * This function formats relationship data with natural language descriptors
 * to improve AI understanding of relationship dynamics.
 *
 * @param narrativeContext Narrative context with impact state
 * @returns Formatted relationship descriptions
 */
export function extractRelationshipsWithDescriptors(
  narrativeContext?: NarrativeContext
): string {
  if (!narrativeContext?.impactState?.relationshipImpacts) {
    return '';
  }

  const { relationshipImpacts } = narrativeContext.impactState;
  const relationships: string[] = [];

  // Process each character's relationships
  Object.entries(relationshipImpacts).forEach(([character, targets]) => {
    Object.entries(targets).forEach(([target, value]) => {
      // Skip zero-value relationships
      if (value === 0) return;

      // Create descriptor based on value
      let descriptor = '';
      if (value >= 8) descriptor = 'strong allies';
      else if (value >= 5) descriptor = 'friends';
      else if (value >= 2) descriptor = 'on good terms';
      else if (value > 0) descriptor = 'slightly favorable';
      else if (value > -2) descriptor = 'slightly unfavorable';
      else if (value > -5) descriptor = 'distrustful';
      else if (value > -8) descriptor = 'hostile';
      else descriptor = 'bitter enemies';

      relationships.push(`${character} and ${target} are ${descriptor} (${value})`);
    });
  });

  return relationships.length > 0 ? relationships.join('\n') : '';
}