import { ImpactState } from '../types/narrative.types';

/**
 * Formats impact information for inclusion in AI context
 *
 * @param impactState Current impact state
 * @param maxEntries Maximum number of entries to include
 * @returns Formatted string for AI context
 */
export function formatImpactsForAIContext(
  impactState: ImpactState,
  maxEntries: number = 5
): string {
  const parts: string[] = [];

  // Format reputation impacts
  const reputationEntries = Object.entries(impactState.reputationImpacts)
    .filter(([, value]) => Math.abs(value) > 2) // Only include significant impacts
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a)) // Sort by absolute value
    .slice(0, maxEntries);

  if (reputationEntries.length > 0) {
    parts.push('Character Reputation:');
    reputationEntries.forEach(([target, value]) => {
      const sentiment = value > 0 ? 'positive' : 'negative';
      const intensity = Math.abs(value) >= 8 ? 'strong' : Math.abs(value) >= 4 ? 'moderate' : 'mild';
      parts.push(`- ${target}: ${intensity} ${sentiment} reputation (${value})`);
    });
  }

  // Format relationship impacts
  const relationshipPairs: [string, string, number][] = [];
  Object.entries(impactState.relationshipImpacts).forEach(([character, targets]) => {
    Object.entries(targets).forEach(([target, value]) => {
      if (Math.abs(value) > 2) { // Only include significant impacts
        relationshipPairs.push([character, target, value]);
      }
    });
  });

  relationshipPairs.sort(([, , a], [, , b]) => Math.abs(b) - Math.abs(a));
  const topRelationships = relationshipPairs.slice(0, maxEntries);

  if (topRelationships.length > 0) {
    parts.push('\nRelationships:');
    topRelationships.forEach(([character, target, value]) => {
      const relation = value > 0 ? 'friendly' : 'hostile';
      const intensity = Math.abs(value) >= 8 ? 'very' : Math.abs(value) >= 4 ? 'somewhat' : 'slightly';
      parts.push(`- ${character} is ${intensity} ${relation} toward ${target} (${value})`);
    });
  }

  // Format world state impacts
  const worldStateEntries = Object.entries(impactState.worldStateImpacts)
    .slice(0, maxEntries);

  if (worldStateEntries.length > 0) {
    parts.push('\nWorld State:');
    worldStateEntries.forEach(([target, value]) => {
      const state = value > 0 ? 'improved' : 'worsened';
      parts.push(`- ${target} has ${state} (${value})`);
    });
  }

  // Format story arc impacts
  const storyArcEntries = Object.entries(impactState.storyArcImpacts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxEntries);

  if (storyArcEntries.length > 0) {
    parts.push('\nStory Progression:');
    storyArcEntries.forEach(([arc, value]) => {
      let progressDesc = 'just beginning';
      if (value >= 75) progressDesc = 'nearing completion';
      else if (value >= 50) progressDesc = 'well underway';
      else if (value >= 25) progressDesc = 'making progress';

      parts.push(`- ${arc}: ${progressDesc} (${value}%)`);
    });
  }

  return parts.join('\n');
}
