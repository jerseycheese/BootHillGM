/**
 * AI Decision Service
 * 
 * Main entry point for the decision service.
 * Orchestrates the detection, generation, and tracking of game decisions.
 * Features enhanced context handling for more relevant decisions.
 */

import { DEFAULT_API_CONFIG, DEFAULT_DECISION_THRESHOLD, MAX_OPTIONS_PER_DECISION, MIN_DECISION_INTERVAL } from '../../../constants/decision-service.constants';
import { DecisionDetectionResult, DecisionResponse } from '../../../types/ai-service.types';
import { DecisionServiceConfig } from '../../../types/decision-service/decision-service.types';
import { NarrativeState, PlayerDecision } from '../../../types/narrative.types';
import { Character } from '../../../types/character';
import { LocationType } from '../../locationService';

// Import specialized modules
import NarrativeDecisionDetector from './decision-detector';
import AIDecisionGenerator from './decision-generator';
import DecisionHistoryService from './decision-history';
import AIServiceClient from './ai-client';

/**
 * Service for AI-driven contextual decision generation
 * with enhanced context tracking and refreshing
 */
export class DecisionService {
  private detector: NarrativeDecisionDetector;
  private generator: AIDecisionGenerator;
  private historyManager: DecisionHistoryService;
  private aiClient: AIServiceClient;
  private config: DecisionServiceConfig;
  
  /**
   * Initialize the decision service
   * @param config Service configuration
   */
  constructor(config?: Partial<DecisionServiceConfig>) {
    // Merge provided config with defaults
    this.config = {
      minDecisionInterval: MIN_DECISION_INTERVAL,
      relevanceThreshold: DEFAULT_DECISION_THRESHOLD,
      maxOptionsPerDecision: MAX_OPTIONS_PER_DECISION,
      apiConfig: DEFAULT_API_CONFIG,
      ...config
    };
    
    // Initialize the specialized modules
    this.aiClient = new AIServiceClient(this.config.apiConfig);
    this.historyManager = new DecisionHistoryService();
    this.detector = new NarrativeDecisionDetector(
      this.config.relevanceThreshold,
      this.config.minDecisionInterval
    );
    this.generator = new AIDecisionGenerator(
      this.aiClient,
      this.historyManager,
      this.config.maxOptionsPerDecision
    );
  }
  
  /**
   * Detects if a decision point should be presented
   * @param narrativeState Current narrative state
   * @param character Player character data
   * @returns Decision detection result
   */
  public detectDecisionPoint(
    narrativeState: NarrativeState,
    character: Character
  ): DecisionDetectionResult {
    return this.detector.detectDecisionPoint(narrativeState, character);
  }
  
  /**
   * Generates a decision based on the current narrative state
   * Uses enhanced context extraction and refreshing for more relevant decisions
   * 
   * @param narrativeState Current narrative state
   * @param character Player character information
   * @returns Promise resolving to a decision response
   */
  public async generateDecision(
    narrativeState: NarrativeState,
    character: Character
  ): Promise<DecisionResponse> {
    // Update the last decision time
    this.detector.updateLastDecisionTime();
    
    // Generate the decision with enhanced context awareness
    return this.generator.generateDecision(narrativeState, character);
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
    this.historyManager.recordDecision(decisionId, optionId, outcome);
  }
  
  /**
   * Convert a decision response to a player decision format
   * @param decision The decision response
   * @param location Current location
   * @returns Player decision format for the narrative context
   */
  public toPlayerDecision(
    decision: DecisionResponse, 
    location?: LocationType
  ): PlayerDecision {
    return {
      id: decision.decisionId,
      prompt: decision.prompt,
      timestamp: Date.now(),
      location,
      options: decision.options.map(option => ({
        id: option.id,
        text: option.text,
        impact: option.impact,
        tags: option.traits // Use traits as tags
      })),
      context: 'Generated based on narrative context',
      importance: decision.metadata.importance,
      aiGenerated: true
    };
  }
}

// Export the service and its components correctly
export { NarrativeDecisionDetector, AIDecisionGenerator, DecisionHistoryService, AIServiceClient };
export default DecisionService;