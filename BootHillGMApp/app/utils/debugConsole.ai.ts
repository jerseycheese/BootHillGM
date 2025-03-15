/**
 * Enhanced debug console utilities for AI decision system
 * 
 * This extends the existing debugConsole.ts with AI decision functionality
 * and integrates with the Boot Hill GM debug tools.
 */

import { initializeDecisionDebugTools, generateEnhancedDecision } from './enhancedDecisionGenerator';
import { GameState } from '../types/gameState';
import { LocationType } from '../services/locationService';
// Import the global declarations
import '../types/global.d';

/**
 * Initialize the browser debug tools with AI decision capabilities
 *
 * @param getGameState Function to get the current game state
 * @param triggerDecision Function to trigger a contextual decision
 * @param clearDecision Function to clear the current decision
 */
export function initializeAIDebugTools(
  getGameState: () => GameState,
  triggerDecision: (locationType?: LocationType) => void,
  clearDecision: () => void
): void {
  // Ensure the bhgmDebug namespace exists
  if (!window.bhgmDebug) {
    window.bhgmDebug = {
      version: '1.0.0',
      triggerDecision: () => {},
      clearDecision: () => {},
      listLocations: () => [],
      sendCommand: () => {}
    };
  }
  
  // Initialize the enhanced decision debug tools
  initializeDecisionDebugTools();
  
  // Create an enhanced version of triggerDecision that uses the AI system
  window.bhgmDebug.triggerAIDecision = async (locationType?: LocationType) => {
    try {
      // Get the current game state
      const gameState = getGameState();
      
      // Clear any existing decision
      clearDecision();
      
      // Generate an enhanced decision with forceGeneration set to true
      // Fixed: Pass only 3 arguments matching the function signature
      const decision = await generateEnhancedDecision(gameState, locationType, true);
      
      if (decision) {
        console.log('AI-enhanced decision ready:', decision);
        
        // Use setTimeout to allow the UI to update after clearing
        setTimeout(() => {
          // Present the decision (using the existing function)
          triggerDecision(locationType);
        }, 100);
      } else {
        console.error('Failed to generate AI-enhanced decision');
      }
    } catch (error) {
      console.error('Error in triggerAIDecision:', error);
    }
  };
  
  // Create a function to check the AI decision system status
  window.bhgmDebug.checkAIStatus = () => {
    const hasApiKey = !!process.env.AI_SERVICE_API_KEY;
    const hasEndpoint = !!process.env.AI_SERVICE_ENDPOINT;
    return {
      available: hasApiKey && hasEndpoint,
      apiKey: hasApiKey ? 'Configured' : 'Missing',
      endpoint: hasEndpoint ? 'Configured' : 'Missing',
      mode: window.bhgmDebug?.decisions?.getMode?.() || 'unknown'
    };
  };
  
  console.log('AI debug tools initialized');
}