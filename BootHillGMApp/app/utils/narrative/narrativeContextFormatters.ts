/**
 * Narrative Context Formatters
 * 
 * Utility functions for formatting narrative context elements
 * into structured, readable text for AI consumption.
 */

import { PlayerDecisionRecord, NarrativeContext } from '../../types/narrative.types';

/**
 * Format decision record for inclusion in context
 * 
 * @param decision - The decision record to format
 * @returns Formatted decision text
 */
export function formatDecisionForContext(decision: PlayerDecisionRecord): string {
  return `Decision: ${decision.impactDescription}
Context: ${decision.narrative}`;
}

/**
 * Format character info for context
 * 
 * @param character - Character name
 * @param relationshipValue - Numeric value of relationship with player
 * @param context - Narrative context containing character history
 * @returns Formatted character information
 */
export function formatCharacterForContext(
  character: string, 
  relationshipValue: number,
  context: NarrativeContext
): string {
  let result = `${character}: `;
  
  // Add relationship description
  if (relationshipValue !== 0) {
    const relationship = relationshipValue > 0 
      ? `Friendly (${relationshipValue})` 
      : `Hostile (${relationshipValue})`;
    result += relationship;
  } else {
    result += 'Neutral';
  }
  
  // Add relevant events if available
  const relevantEvents = context.importantEvents
    ?.filter(event => event.includes(character));
  
  if (relevantEvents && relevantEvents.length > 0) {
    result += `\nHistory: ${relevantEvents.join('. ')}`;
  }
  
  return result;
}

/**
 * Format story progression for context
 * 
 * @param context - Narrative context containing story points and arcs
 * @returns Formatted story progression text
 */
export function formatStoryProgressionForContext(context: NarrativeContext): string {
  if (!context.storyPoints || Object.keys(context.storyPoints).length === 0) {
    return '';
  }
  
  const parts: string[] = ['Current Story Points:'];
  
  // Filter for significant story points based on the tag
  const significantPoints = Object.values(context.storyPoints)
    .filter(point => point.tags?.includes('major') || point.type === 'revelation');
  
  significantPoints.forEach(point => {
    parts.push(`- ${point.title}: ${point.content}`);
  });
  
  // Include current narrative arc if available
  if (context.currentArcId && context.narrativeArcs && context.narrativeArcs[context.currentArcId]) {
    const currentArc = context.narrativeArcs[context.currentArcId];
    parts.push(`\nCurrent Arc: ${currentArc.title || context.currentArcId}`);
    
    if (currentArc.description) {
      parts.push(currentArc.description);
    }
  }
  
  return parts.join('\n');
}