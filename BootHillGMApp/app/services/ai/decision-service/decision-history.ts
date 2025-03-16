/**
 * Decision History Manager
 * 
 * Responsible for managing the history of player decisions.
 */

import { DecisionHistoryEntry, DecisionHistoryManager } from '../../../types/decision-service/decision-service.types';
import { MAX_DECISION_HISTORY_SIZE } from '../../../constants/decision-service.constants';

/**
 * Service for managing decision history
 */
export class DecisionHistoryService implements DecisionHistoryManager {
  private decisionsHistory: DecisionHistoryEntry[] = [];
  private maxHistorySize: number;
  
  /**
   * Initialize the decision history manager
   * @param maxHistorySize Maximum number of history entries to keep
   */
  constructor(maxHistorySize: number = MAX_DECISION_HISTORY_SIZE) {
    this.maxHistorySize = maxHistorySize;
  }
  
  /**
   * Get the decision history
   * @returns Array of decision history entries
   */
  public getDecisionHistory(): DecisionHistoryEntry[] {
    return [...this.decisionsHistory];
  }
  
  /**
   * Record a player's decision for future context
   * @param decisionId ID of the decision
   * @param optionId ID of the selected option
   * @param outcome Narrative outcome of the decision
   */
  public recordDecision(
    decisionId: string,
    optionId: string,
    outcome: string
  ): void {
    // Add to history
    this.decisionsHistory.push({
      prompt: decisionId, // Using decisionId as a placeholder for the prompt
      choice: optionId,
      outcome,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.decisionsHistory.length > this.maxHistorySize) {
      this.decisionsHistory.shift();
    }
  }
}

export default DecisionHistoryService;
