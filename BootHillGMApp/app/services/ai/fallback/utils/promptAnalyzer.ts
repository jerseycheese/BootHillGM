/**
 * Prompt Analysis Utilities
 * 
 * Tools for analyzing user prompts to determine the appropriate response context type.
 * These utilities help categorize player input to generate context-appropriate fallback responses.
 * 
 * @module services/ai/fallback/utils
 */

import { ResponseContextType } from '../constants';

/**
 * Analyzes a prompt string to determine the appropriate response context type
 * based on action words and intent recognition.
 * 
 * @param prompt The user's input prompt
 * @returns The detected response context type
 */
export function analyzePrompt(prompt?: string): ResponseContextType {
  // Handle undefined prompt gracefully
  const safePrompt = prompt || '';
  const promptLower = safePrompt.toLowerCase();
  
  // Extract action words from the prompt to determine response type
  const isLookingAction = /\b(look|see|view|observe|check)\b/.test(promptLower);
  const isMovementAction = /\b(go|walk|move|travel|head|run)\b/.test(promptLower);
  const isTalkingAction = /\b(talk|speak|ask|tell|say)\b/.test(promptLower);
  const isInventoryAction = /\b(inventory|items|gear|equip)\b/.test(promptLower);
  const isInitializing = /\b(initialize|init|start|begin|new|create)\b/.test(promptLower);
  
  if (isInitializing) return ResponseContextType.INITIALIZING;
  if (isLookingAction) return ResponseContextType.LOOKING;
  if (isMovementAction) return ResponseContextType.MOVEMENT;
  if (isTalkingAction) return ResponseContextType.TALKING;
  if (isInventoryAction) return ResponseContextType.INVENTORY;
  
  return ResponseContextType.GENERIC;
}
