import { 
  DecisionImpact, 
  PlayerDecisionRecordWithImpact, 
  PlayerDecisionRecord, 
  ImpactState
} from '../types/narrative.types';
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
