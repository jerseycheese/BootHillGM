import { v4 as uuidv4 } from 'uuid';
import { 
  PlayerDecision, 
  DecisionImpact, 
  PlayerDecisionRecordWithImpact, 
  PlayerDecisionRecord, 
  ImpactState,
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

/**
 * Updates a decision record with impact information
 * 
 * @param record The original decision record
 * @param impacts Array of impact objects
 * @returns Extended decision record with impact metadata
 */
export function addImpactsToDecisionRecord(
  record: PlayerDecisionRecord,
  impacts: DecisionImpact[]
): PlayerDecisionRecordWithImpact {
  return { 
    ...record, 
    impacts, 
    processedForImpact: false, 
    lastImpactUpdate: Date.now() 
  };
}

/**
 * Processes decision impacts and updates the impact state
 * 
 * @param impactState Current impact state
 * @param decisionRecord Decision record with impacts to process
 * @returns Updated impact state
 */
export function processDecisionImpacts(
  impactState: ImpactState,
  decisionRecord: PlayerDecisionRecordWithImpact
): ImpactState {
  if (decisionRecord.processedForImpact) {
    return impactState;
  }
  
  const newImpactState = { ...impactState };
  
  // Process each impact and update the impact state
  for (const impact of decisionRecord.impacts) {
    switch (impact.type) {
      case 'reputation': {
        const reputationImpacts = { ...newImpactState.reputationImpacts };
        const currentValue = reputationImpacts[impact.target] || 0;
        reputationImpacts[impact.target] = Math.max(-10, Math.min(10, currentValue + impact.value));
        newImpactState.reputationImpacts = reputationImpacts;
        break;
      }
      
      case 'relationship': {
        const relationshipImpacts = { ...newImpactState.relationshipImpacts };
        
        // Extract character and target from impact target (format: "character:target")
        let character = 'player';
        let target = impact.target;
        
        if (impact.target.includes(':')) {
          const parts = impact.target.split(':');
          character = parts[0];
          target = parts[1];
        }
        
        // Initialize character's relationships if not present
        if (!relationshipImpacts[character]) {
          relationshipImpacts[character] = {};
        }
        
        const currentValue = relationshipImpacts[character][target] || 0;
        relationshipImpacts[character][target] = Math.max(-10, Math.min(10, currentValue + impact.value));
        newImpactState.relationshipImpacts = relationshipImpacts;
        break;
      }
      
      case 'world-state': {
        const worldStateImpacts = { ...newImpactState.worldStateImpacts };
        worldStateImpacts[impact.target] = impact.value;
        newImpactState.worldStateImpacts = worldStateImpacts;
        break;
      }
      
      case 'story-arc': {
        const storyArcImpacts = { ...newImpactState.storyArcImpacts };
        const currentValue = storyArcImpacts[impact.target] || 0;
        storyArcImpacts[impact.target] = Math.max(0, Math.min(100, currentValue + impact.value));
        newImpactState.storyArcImpacts = storyArcImpacts;
        break;
      }
      
      // Other impact types can be handled similarly
    }
  }
  
  return {
    ...newImpactState,
    lastUpdated: Date.now()
  };
}

/**
 * Updates impact values based on time passed and other factors
 * 
 * @param impactState Current impact state
 * @param decisionRecords Array of decision records with impacts
 * @param currentTimestamp Current timestamp
 * @returns Updated impact state
 */
export function evolveImpactsOverTime(
  impactState: ImpactState,
  decisionRecords: PlayerDecisionRecordWithImpact[],
  currentTimestamp: number
): ImpactState {
  const newImpactState = { ...impactState };
  
  // Process each decision record to evolve its impacts
  for (const record of decisionRecords) {
    // Skip records that haven't been processed yet
    if (!record.processedForImpact) {
      continue;
    }
    
    // Calculate time elapsed since last update
    const timeElapsed = currentTimestamp - record.lastImpactUpdate;
    
    // Evolve each impact based on time elapsed
    for (const impact of record.impacts) {
      // Skip impacts without duration (permanent impacts)
      if (!impact.duration) {
        continue;
      }
      
      // Check if the impact has expired
      if (timeElapsed >= impact.duration) {
        // Remove expired impacts
        switch (impact.type) {
          case 'reputation': {
            const reputationImpacts = { ...newImpactState.reputationImpacts };
            if (reputationImpacts[impact.target]) {
              // Reduce the impact by half instead of removing completely
              reputationImpacts[impact.target] = Math.round(reputationImpacts[impact.target] * 0.5);
            }
            newImpactState.reputationImpacts = reputationImpacts;
            break;
          }
          
          case 'relationship': {
            const relationshipImpacts = { ...newImpactState.relationshipImpacts };
            let character = 'player';
            let target = impact.target;
            
            if (impact.target.includes(':')) {
              const parts = impact.target.split(':');
              character = parts[0];
              target = parts[1];
            }
            
            if (relationshipImpacts[character] && relationshipImpacts[character][target]) {
              // Reduce the impact by half instead of removing completely
              relationshipImpacts[character][target] = Math.round(relationshipImpacts[character][target] * 0.5);
            }
            newImpactState.relationshipImpacts = relationshipImpacts;
            break;
          }
          
          // Handle other impact types similarly
        }
      } else {
        // For non-expired impacts, we could implement gradual decay or other evolution
        // This is a simple implementation that doesn't modify non-expired impacts
      }
    }
  }
  
  return {
    ...newImpactState,
    lastUpdated: currentTimestamp
  };
}

/**
 * Resolves conflicts between impacts affecting the same target
 * 
 * @param impacts Array of impacts to reconcile
 * @returns Reconciled array of impacts
 */
export function reconcileConflictingImpacts(
  impacts: DecisionImpact[]
): DecisionImpact[] {
  // Group impacts by type and target
  const impactGroups: Record<string, DecisionImpact[]> = {};
  
  for (const impact of impacts) {
    const key = `${impact.type}:${impact.target}`;
    if (!impactGroups[key]) {
      impactGroups[key] = [];
    }
    impactGroups[key].push(impact);
  }
  
  // Process each group to resolve conflicts
  const reconciledImpacts: DecisionImpact[] = [];
  
  for (const key in impactGroups) {
    const group = impactGroups[key];
    
    if (group.length === 1) {
      // No conflict for single impacts
      reconciledImpacts.push(group[0]);
    } else {
      // For multiple impacts on the same target, we need to reconcile
      
      // Sort by severity (major first)
      group.sort((a, b) => {
        const severityOrder = { major: 3, moderate: 2, minor: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
      
      // Take the most severe impact as the base
      const baseImpact = { ...group[0] };
      
      // Combine values from all impacts, but with diminishing returns
      let combinedValue = baseImpact.value;
      for (let i = 1; i < group.length; i++) {
        // Each subsequent impact has less effect (diminishing returns)
        combinedValue += group[i].value * (0.5 / i);
      }
      
      // Ensure the value stays within bounds
      baseImpact.value = Math.max(-10, Math.min(10, combinedValue));
      
      // Combine related decision IDs
      const relatedIds = new Set<string>();
      group.forEach(impact => {
        if (impact.relatedDecisionIds) {
          impact.relatedDecisionIds.forEach(id => relatedIds.add(id));
        }
      });
      baseImpact.relatedDecisionIds = Array.from(relatedIds);
      
      // Add the reconciled impact
      reconciledImpacts.push(baseImpact);
    }
  }
  
  return reconciledImpacts;
}

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