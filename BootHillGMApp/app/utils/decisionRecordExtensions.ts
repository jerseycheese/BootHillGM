/**
 * Extensions to the decision record system to support impact metadata
 */
import { 
  PlayerDecision, 
  PlayerDecisionRecord,
  PlayerDecisionRecordWithImpact,
  DecisionImpact
} from '../types/narrative.types';
import { createDecisionRecord } from './decisionUtils';
import { createDecisionImpacts } from './decisionImpactUtils';

/**
 * Creates a decision record with impact metadata
 * 
 * @param decision The original decision presented to the player
 * @param selectedOptionId The ID of the option the player selected
 * @param narrative The narrative response after the decision
 * @returns A new PlayerDecisionRecordWithImpact object
 */
export function createDecisionRecordWithImpact(
  decision: PlayerDecision,
  selectedOptionId: string,
  narrative: string
): PlayerDecisionRecordWithImpact {
  // First create the standard decision record
  const baseRecord = createDecisionRecord(
    decision,
    selectedOptionId,
    narrative
  );
  
  // Then create impacts based on the decision and selected option
  const impacts = createDecisionImpacts(decision, selectedOptionId);
  
  // Return the extended record with impact metadata
  return {
    ...baseRecord,
    impacts,
    processedForImpact: false,
    lastImpactUpdate: Date.now()
  };
}

/**
 * Checks if a decision record has impact metadata
 * 
 * @param record The decision record to check
 * @returns True if the record has impact metadata, false otherwise
 */
export function hasImpactMetadata(
  record: PlayerDecisionRecord | PlayerDecisionRecordWithImpact
): record is PlayerDecisionRecordWithImpact {
  return (
    'impacts' in record &&
    'processedForImpact' in record &&
    'lastImpactUpdate' in record
  );
}

/**
 * Calculates the total impact value for a specific type and target
 * 
 * @param records Array of decision records with impact metadata
 * @param type The type of impact to calculate
 * @param target The target entity to calculate impact for
 * @returns The total impact value
 */
export function calculateTotalImpact(
  records: PlayerDecisionRecordWithImpact[],
  type: string,
  target: string
): number {
  return records.reduce((total, record) => {
    const matchingImpacts = record.impacts.filter(
      impact => impact.type === type && impact.target === target
    );
    
    return total + matchingImpacts.reduce((sum, impact) => sum + impact.value, 0);
  }, 0);
}

/**
 * Gets the most significant impacts from a collection of decision records
 * 
 * @param records Array of decision records with impact metadata
 * @param maxImpacts Maximum number of impacts to return
 * @returns Array of the most significant impacts
 */
export function getMostSignificantImpacts(
  records: PlayerDecisionRecordWithImpact[],
  maxImpacts: number = 5
): DecisionImpact[] {
  // Collect all impacts from all records
  const allImpacts: DecisionImpact[] = [];
  records.forEach(record => {
    allImpacts.push(...record.impacts);
  });
  
  // Sort by absolute value (descending)
  return [...allImpacts]
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, maxImpacts);
}