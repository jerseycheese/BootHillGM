/**
 * Context Extraction Utilities for Decision Generation
 * 
 * This module provides functions for extracting and processing narrative context
 * to support the decision generation process. It handles comprehensive context
 * building, recent event extraction, and context refreshing.
 */

import { NarrativeState, PlayerDecisionRecord } from '../../../../types/narrative.types';
import { CONTEXT_LIMITS } from '../constants/decision-constants';

/**
 * Extracts a comprehensive narrative context from multiple sources in the narrative state
 * 
 * Combines current story point, recent history, active decisions, and world context
 * to create a complete picture of the current narrative situation.
 * 
 * @param narrativeState Current narrative state with all context elements
 * @returns Combined narrative context string ready for decision generation
 */
export function extractComprehensiveContext(narrativeState: NarrativeState): string {
  const contextParts: string[] = [];
  
  // 1. Current story point (if available)
  if (narrativeState.currentStoryPoint) {
    contextParts.push(narrativeState.currentStoryPoint.content);
  }
  
  // 2. Recent narrative history (more entries)
  if (narrativeState.narrativeHistory.length > 0) {
    // Get more recent history entries (increased from 3 to 5)
    const recentHistory = narrativeState.narrativeHistory.slice(-5);
    contextParts.push(recentHistory.join('\n\n'));
  }

  // 3. Decision context (if a decision was just made)
  if (narrativeState.narrativeContext?.activeDecision) {
    contextParts.push(`Current decision: ${narrativeState.narrativeContext.activeDecision.prompt}`);
  }
  
  // 4. World context (if available)
  if (narrativeState.narrativeContext?.worldContext) {
    contextParts.push(narrativeState.narrativeContext.worldContext);
  }
  
  // Return combined context
  return contextParts.join('\n\n');
}

/**
 * Extracts recent events with more detail from the narrative state
 * 
 * Combines narrative history with important events to create a comprehensive
 * list of recent events that are relevant for decision-making.
 * 
 * @param narrativeState Current narrative state containing event history
 * @returns Array of recent event descriptions
 */
export function extractRecentEvents(narrativeState: NarrativeState): string[] {
  // Start with the narrativeHistory - preserve the full strings to fix the test
  const events = [...narrativeState.narrativeHistory.slice(-CONTEXT_LIMITS.MAX_HISTORY_ENTRIES)];
  
  // Add important events from narrative context if available
  if (narrativeState.narrativeContext?.importantEvents) {
    events.push(...narrativeState.narrativeContext.importantEvents.slice(-CONTEXT_LIMITS.MAX_IMPORTANT_EVENTS));
  }
  
  return events;
}

/**
 * Extracts decision history with more comprehensive context
 * 
 * Formats decision history entries with consistent structure to provide
 * context about past decisions to the decision generator.
 * 
 * @param decisionHistory Array of decision history entries
 * @returns Enhanced decision history objects with timestamps
 */
export function extractDecisionHistory(
  decisionHistory: Array<{prompt: string; choice: string; outcome: string; timestamp: number}>
): Array<{prompt: string; choice: string; outcome: string; timestamp: number}> {
  // Get the most recent decisions based on configured limit
  return decisionHistory.slice(-CONTEXT_LIMITS.MAX_DECISION_HISTORY).map(decision => {
    // Include timestamp property to match test expectations
    return {
      prompt: decision.prompt,
      choice: decision.choice,
      outcome: decision.outcome,
      timestamp: decision.timestamp
    };
  });
}

/**
 * Refreshes and syncs context from all relevant sources
 * 
 * Creates a comprehensive narrative context snapshot that integrates
 * current story point, recent history, decision history, and world state
 * impacts to provide a complete picture for decision generation.
 * 
 * @param narrativeState Current narrative state
 * @returns Updated formatted narrative context ready for decision generation
 */
export function refreshNarrativeContext(narrativeState: NarrativeState): string {
  // Create a snapshot of the complete current state
  const contextParts: string[] = [];
  
  // Basic narrative context
  if (narrativeState.currentStoryPoint) {
    contextParts.push(`Current scene: ${narrativeState.currentStoryPoint.content}`);
  }
  
  // Recent narrative history (more entries and more detail)
  if (narrativeState.narrativeHistory.length > 0) {
    const recentHistory = narrativeState.narrativeHistory.slice(-CONTEXT_LIMITS.MAX_HISTORY_ENTRIES);
    contextParts.push(`Recent events:\n${recentHistory.join('\n\n')}`);
  }
  
  // Decision history
  const decisionHistory = narrativeState.narrativeContext?.decisionHistory || [];
  if (decisionHistory.length > 0) {
    const recentDecisions = decisionHistory.slice(-CONTEXT_LIMITS.MAX_DECISION_HISTORY).map((d: PlayerDecisionRecord) => 
      `- Decision: "${d.decisionId}" → Selected: "${d.selectedOptionId}" → Outcome: "${d.narrative.substring(0, 100)}..."`
    );
    contextParts.push(`Recent decisions:\n${recentDecisions.join('\n')}`);
  }
  
  // World state impacts
  if (narrativeState.narrativeContext?.impactState) {
    const impactState = narrativeState.narrativeContext.impactState;
    const worldStateEntries = Object.entries(impactState.worldStateImpacts || {})
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');
    
    if (worldStateEntries) {
      contextParts.push(`World state:\n${worldStateEntries}`);
    }
  }
  
  return contextParts.join('\n\n');
}