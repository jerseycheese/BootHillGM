/**
 * Decision History Service
 * 
 * Manages the history of decisions made during gameplay.
 */

import { DecisionHistoryEntry, DecisionHistoryManager } from '../../../types/decision-service/decision-service.types';

/**
 * Maximum number of decisions to store in history
 */
const MAX_HISTORY_LENGTH = 10;

/**
 * Service for managing decision history
 */
class DecisionHistoryService implements DecisionHistoryManager {
  private history: DecisionHistoryEntry[] = [];
  
  /**
   * Get the current decision history
   * @returns Array of decision history entries
   */
  public getDecisionHistory(): DecisionHistoryEntry[] {
    return [...this.history];
  }
  
  /**
   * Record a new decision
   * @param decisionId ID of the decision
   * @param optionId ID of the selected option
   * @param outcome Resulting narrative outcome
   */
  public recordDecision(
    decisionId: string, 
    optionId: string, 
    outcome: string
  ): void {
    // Extract prompt from decisionId (in practice, would be retrieved from a store)
    const prompt = this.extractPromptFromDecisionId(decisionId);
    
    // Extract choice text from optionId (in practice, would be retrieved from a store)
    const choice = this.extractChoiceFromOptionId(optionId);
    
    // Create history entry
    const entry: DecisionHistoryEntry = {
      prompt,
      choice,
      outcome,
      timestamp: Date.now()
    };
    
    // Add to history
    this.history.push(entry);
    
    // Trim history if needed
    if (this.history.length > MAX_HISTORY_LENGTH) {
      this.history = this.history.slice(-MAX_HISTORY_LENGTH);
    }
  }
  
  /**
   * Extract prompt text from a decision ID
   * @param decisionId Decision identifier
   * @returns Prompt text
   */
  private extractPromptFromDecisionId(decisionId: string): string {
    // In a real implementation, this would look up the prompt from a store
    // For now, provide a realistic mock implementation
    
    // Mock prompt map
    const promptMap: Record<string, string> = {
      'decision-1': 'How do you approach the sheriff?',
      'decision-2': 'What do you do about the suspicious stranger?',
      'decision-3': 'How do you respond to the bartender\'s offer?',
      'decision-4': 'How do you handle the confrontation?'
    };
    
    return promptMap[decisionId] || 'What do you want to do?';
  }
  
  /**
   * Extract choice text from an option ID
   * @param optionId Option identifier
   * @returns Choice text
   */
  private extractChoiceFromOptionId(optionId: string): string {
    // In a real implementation, this would look up the choice from a store
    // For now, provide a realistic mock implementation
    
    // Mock choice map
    const choiceMap: Record<string, string> = {
      'option-1': 'Approach directly and introduce yourself',
      'option-2': 'Observe from a distance first',
      'option-3': 'Ask around town about them',
      'option-4': 'Ignore them and focus on your own business',
      'option-5': 'Accept gratefully',
      'option-6': 'Decline politely',
      'option-7': 'Stand your ground',
      'option-8': 'Try to de-escalate'
    };
    
    return choiceMap[optionId] || 'Proceed cautiously';
  }
}

export default DecisionHistoryService;