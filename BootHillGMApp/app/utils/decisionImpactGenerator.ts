import { v4 as uuidv4 } from 'uuid';
import {
  PlayerDecision,
  DecisionImpact,
  DecisionImpactType,
  ImpactSeverity
} from '../types/narrative.types';

/**
 * Creates impact objects for a decision record
 *
 * @param decision The original decision presented to the player
 * @param selectedOptionId The ID of the option the player selected
 * @returns Array of impact objects
 */
export function createDecisionImpacts(
  decision: PlayerDecision,
  selectedOptionId: string
): DecisionImpact[] {
  const selectedOption = decision.options.find((option) => option.id === selectedOptionId);

  if (!selectedOption) {
    throw new Error(`Option with ID ${selectedOptionId} not found in decision ${decision.id}`);
  }

  // Extract potential impact types from the option's impact description and tags
  const impactTypes: DecisionImpactType[] = [];
  const impactText = selectedOption.impact.toLowerCase();

  // Determine impact types based on text analysis
  if (impactText.includes('reputation') || impactText.includes('opinion')) {
    impactTypes.push('reputation');
  }
  if (
    impactText.includes('relationship') ||
    impactText.includes('friendship') ||
    impactText.includes('alliance')
  ) {
    impactTypes.push('relationship');
  }
  if (
    impactText.includes('story') ||
    impactText.includes('quest') ||
    impactText.includes('mission')
  ) {
    impactTypes.push('story-arc');
  }
  if (impactText.includes('town') || impactText.includes('location') || impactText.includes('world')) {
    impactTypes.push('world-state');
  }
  if (impactText.includes('skill') || impactText.includes('ability') || impactText.includes('character')) {
    impactTypes.push('character');
  }
  if (impactText.includes('item') || impactText.includes('weapon') || impactText.includes('inventory')) {
    impactTypes.push('inventory');
  }

  // If no specific types were identified, default to world-state
  if (impactTypes.length === 0) {
    impactTypes.push('world-state');
  }

  // Determine severity based on decision importance
  let severity: ImpactSeverity;
  switch (decision.importance) {
    case 'critical':
      severity = 'major';
      break;
    case 'significant':
      severity = 'moderate';
      break;
    default:
      severity = 'minor';
  }

  // Create impact objects for each identified type
  return impactTypes.map((type) => {
    // Determine target based on type
    let target = 'general';
    if (type === 'reputation') {
      // Use location name for reputation if available, otherwise use characters, otherwise general.
      if (decision.location && typeof decision.location !== 'string' && 'name' in decision.location) {
        target = decision.location.name;
      } else if (decision.characters && decision.characters.length > 0) {
        target = decision.characters[0];
      }
    } else if (type === 'relationship') {
      // Use character names if available
      target =
        decision.characters && decision.characters.length > 0 ? decision.characters[0] : 'general';
    } else if (type === 'world-state' && decision.location) {
      // Use location if available
      if (typeof decision.location === 'string') {
        target = decision.location;
      } else if ('name' in decision.location && decision.location.name) {
        target = decision.location.name;
      } else {
        target = decision.location.type || 'general';
      }
    }

    // Calculate value based on severity
    let value = 0;
    switch (severity) {
      case 'major':
        value = impactText.includes('negative') ? -8 : 8;
        break;
      case 'moderate':
        value = impactText.includes('negative') ? -5 : 5;
        break;
      case 'minor':
        value = impactText.includes('negative') ? -2 : 2;
        break;
    }

    return {
      id: uuidv4(),
      type,
      target,
      severity,
      description: selectedOption.impact,
      value,
      duration: severity === 'minor' ? 7 * 24 * 60 * 60 * 1000 : undefined, // 1 week for minor impacts
      conditions: selectedOption.tags,
      relatedDecisionIds: [],
    };
  });
}
