/**
 * Decision Prompt Builder
 * 
 * This file contains utilities for building AI prompt extensions
 * focused on player decisions and their impact on the narrative.
 * It works together with decisionRelevanceUtils.ts to create
 * context-aware AI prompts.
 */

import { 
  NarrativeContext,
  ImpactState
} from '../types/narrative.types';
import { createDecisionHistoryContext } from './decisionRelevanceUtils';
import { formatImpactsForAIContext } from './decisionImpactFormatter';

/**
 * Constant for max tokens to allocate to decision history
 */
export const DECISION_HISTORY_TOKEN_LIMIT = 800;

/**
 * Generates a prompt extension for decision history context
 * 
 * @param narrativeContext The current narrative context containing decision history
 * @returns A formatted string to include in AI prompts
 */
export function buildDecisionHistoryExtension(
  narrativeContext: NarrativeContext
): string {
  if (!narrativeContext || !narrativeContext.decisionHistory || narrativeContext.decisionHistory.length === 0) {
    return '';
  }

  // Extract necessary context info
  const locationInfo = narrativeContext.currentBranchId 
    ? { type: 'town' as const, name: narrativeContext.currentBranchId } 
    : undefined;
  
  // Create decision history context
  return createDecisionHistoryContext(
    narrativeContext.decisionHistory,
    locationInfo,
    narrativeContext.characterFocus || [],
    narrativeContext.themes || []
  );
}

/**
 * Generates an impact state prompt extension
 * 
 * @param impactState The current impact state
 * @returns A formatted string describing impacts for AI context
 */
export function buildImpactStateExtension(
  impactState: ImpactState
): string {
  if (!impactState || impactState.lastUpdated === 0) {
    return '';
  }

  return formatImpactsForAIContext(impactState);
}

/**
 * Creates a comprehensive context extension for the AI prompt
 * combining decision history and impact state information.
 * 
 * @param narrativeContext The current narrative context
 * @returns A formatted string to include in AI prompts
 */
export function buildComprehensiveContextExtension(
  narrativeContext?: NarrativeContext
): string {
  if (!narrativeContext) {
    return '';
  }

  const parts: string[] = [];

  // Add decision history if available
  const decisionHistoryExtension = buildDecisionHistoryExtension(narrativeContext);
  if (decisionHistoryExtension) {
    parts.push(decisionHistoryExtension);
  }

  // Add impact state if available
  if (narrativeContext.impactState) {
    const impactStateExtension = buildImpactStateExtension(narrativeContext.impactState);
    if (impactStateExtension) {
      parts.push(impactStateExtension);
    }
  }

  // Combine parts with appropriate spacing
  return parts.length > 0 ? `\n${parts.join('\n\n')}\n` : '';
}

/**
 * Adds guidelines for AI to use when presenting new decisions
 * 
 * @returns A string with instructions for the AI about decisions
 */
export function buildDecisionGuidanceExtension(): string {
  return `
Player Decision Guidelines:
- When presenting the player with decisions, consider their previous choices
- Connect new decisions to past choices where relevant 
- Present decisions with varying levels of importance
- Include appropriate contextual tags with each decision option
- Ensure decisions have meaningful impacts on the narrative
`.trim();
}

/**
 * Creates a full decision-focused prompt extension
 * combining all relevant decision context components
 * 
 * @param narrativeContext The current narrative context
 * @returns A complete prompt extension for decisions
 */
export function buildDecisionPromptExtension(
  narrativeContext?: NarrativeContext
): string {
  const parts: string[] = [];

  // Add comprehensive context if available
  if (narrativeContext) {
    const contextExtension = buildComprehensiveContextExtension(narrativeContext);
    if (contextExtension) {
      parts.push(contextExtension);
    }
  }

  // Always add decision guidance
  parts.push(buildDecisionGuidanceExtension());

  // Combine all parts
  return parts.join('\n\n');
}
