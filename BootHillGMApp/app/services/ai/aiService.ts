/**
 * AIService - Centralized service for AI content generation
 * 
 * This service provides a consistent interface for generating AI content
 * throughout the application, with enhanced reliability for reset operations.
 */

import { Character } from '../../types/character';
import { GameServiceResponse } from './types/gameService.types';
import { logDiagnostic } from '../../utils/initializationDiagnostics';
import { GameContentGenerator } from './generators/gameContentGenerator';
import { SummaryGenerator } from './generators/summaryGenerator';
import { generateFallbackResponse } from './utils/fallbackResponseGenerator';

export class AIService {
  private aiRequestInProgress: boolean = false;
  private lastRequestTimestamp: number = 0;
  
  // Class instances for the generators
  private readonly gameContentGenerator: GameContentGenerator;
  private readonly summaryGenerator: SummaryGenerator;
  
  constructor() {
    this.gameContentGenerator = new GameContentGenerator();
    this.summaryGenerator = new SummaryGenerator();
  }
  
  /**
   * Generates game content using character data
   * This is the primary entry point for AI content generation
   * 
   * @param characterData Character data to use for content generation
   * @returns Promise resolving to game content (narrative, journal entries, suggested actions)
   */
  async generateGameContent(characterData: Character | null): Promise<GameServiceResponse> {
    try {
      this.lastRequestTimestamp = Date.now();
      this.aiRequestInProgress = true;
      
      // Log for diagnostics
      logDiagnostic('AI_SERVICE', 'Starting AI content generation', {
        characterName: characterData?.name || 'Unknown',
        timestamp: this.lastRequestTimestamp,
        characterId: characterData?.id || 'none',
        hasInventory: characterData?.inventory?.items?.length ? true : false,
        inventoryItemCount: characterData?.inventory?.items?.length || 0
      });
      
      // Create a base prompt with character details
      const characterName = characterData?.name || 'the stranger';
      
      // Create a more distinct base prompt with character details but requesting shorter content
      const basePrompt = 
        `Generate a concise but atmospheric adventure narrative for ${characterName} in Boot Hill, 
        a dusty frontier town in 1876. Create a brief but vivid introduction that 
        establishes a strong sense of place and hints at potential adventures. Include specific 
        details about ${characterName}'s arrival in town and initial impressions.
        Keep it focused and around 4-6 sentences in length. Make this completely unique.`;
      
      // Get inventory items if available
      const inventoryItems = characterData?.inventory?.items || [];
      
      // Set up the journal context with info about the character
      let journalContext = `The player character ${characterName} has just arrived in Boot Hill, a frontier town in 1876.`;
      
      // Add attributes context if available
      if (characterData?.attributes) {
        journalContext += ` ${characterName} has these attributes: `;
        Object.entries(characterData.attributes).forEach(([key, value]) => {
          journalContext += `${key}: ${value}, `;
        });
        journalContext = journalContext.slice(0, -2) + '.'; // Remove last comma and add period
      }
      
      // Try to generate content with retries
      const result = await this.gameContentGenerator.generateWithRetries(
        basePrompt, 
        journalContext, 
        inventoryItems
      );

      return result;
    } catch (error) {
      logDiagnostic('AI_SERVICE', 'Error in generateGameContent', { error: String(error) });
      
      // Generate fallback content
      return generateFallbackResponse(characterData);
    } finally {
      this.aiRequestInProgress = false;
    }
  }
  
  /**
   * Checks if an AI request is currently in progress
   * 
   * @returns True if a request is in progress, false otherwise
   */
  isRequestInProgress(): boolean {
    return this.aiRequestInProgress;
  }
  
  /**
   * Gets the timestamp of the last AI request
   * 
   * @returns Timestamp of the last request or 0 if no request has been made
   */
  getLastRequestTimestamp(): number {
    return this.lastRequestTimestamp;
  }

  /**
   * Generates a narrative summary for journal entries
   *
   * @param content The content to summarize
   * @param context Additional context for the summary
   * @returns Promise resolving to the generated summary
   */
  async generateNarrativeSummary(content: string, context: string = ''): Promise<string> {
    try {
      this.lastRequestTimestamp = Date.now();
      this.aiRequestInProgress = true;
      
      // Use the summary generator to generate the summary
      return await this.summaryGenerator.generateNarrativeSummary(content, context);
    } finally {
      this.aiRequestInProgress = false;
    }
  }
}

// Create and export a singleton instance for use throughout the application
export const aiServiceInstance = new AIService();
