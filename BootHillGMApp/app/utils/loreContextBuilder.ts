/**
 * Lore Context Builder
 * 
 * This file contains utilities for integrating lore into the AI context.
 */

import { LoreStore, LoreFact, initialLoreState } from '../types/narrative/lore.types';
import { NarrativeContext } from '../types/narrative/context.types';
import { estimateTokenCount } from './narrative/narrativeCompression';

/**
 * Selects the most relevant lore facts for a given context, 
 * respecting token budget constraints.
 * 
 * @param loreStore - The lore store to select facts from
 * @param context - The current narrative context
 * @param tokenBudget - Maximum number of tokens to use for lore
 * @returns A formatted string containing the selected lore facts
 */
export function selectLoreForContext(
  loreStore: LoreStore,
  context: NarrativeContext,
  tokenBudget: number
): string {
  // If token budget is zero or store is empty, return empty string
  if (tokenBudget <= 0 || Object.keys(loreStore.facts).length === 0) {
    return '';
  }

  // Select only valid facts
  const validFacts = Object.values(loreStore.facts).filter(fact => fact.isValid);
  
  if (validFacts.length === 0) {
    return '';
  }

  // Score and prioritize facts
  const scoredFacts = validFacts.map(fact => {
    return {
      fact,
      score: calculateFactRelevance(fact, context)
    };
  });

  // Sort by relevance score (highest first)
  scoredFacts.sort((a, b) => b.score - a.score);

  // Build lore context string, respecting token budget
  let loreContext = '';
  let currentTokens = 0;

  for (const { fact } of scoredFacts) {
    // Format the fact with its category
    const factText = `${fact.content} (${fact.category})\n`;
    
    // Estimate tokens
    const factTokens = estimateTokenCount(factText);
    
    // Check if adding this fact would exceed the budget
    if (currentTokens + factTokens > tokenBudget) {
      // Skip if it would exceed the budget
      continue;
    }
    
    // Add fact to context
    loreContext += factText;
    currentTokens += factTokens;
  }

  return loreContext;
}

/**
 * Calculates a relevance score for a fact in the current context.
 * 
 * @param fact - The fact to calculate relevance for
 * @param context - The current narrative context
 * @returns A numeric score where higher means more relevant
 */
function calculateFactRelevance(
  fact: LoreFact,
  context: NarrativeContext
): number {
  // Base score from fact importance
  let score = fact.importance;
  
  // Recency boost (newer facts are more relevant)
  // This is a proxy calculation - more recent facts have higher IDs
  const ageInDays = (Date.now() - fact.createdAt) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 3 - ageInDays / 10); // Boost decreases over time
  
  // Location relevance
  if (context.location) {
    // Extract location name safely with a default empty string
    const locationName = (context.location.type === 'town' || context.location.type === 'landmark') 
      ? (context.location.name || '')
      : '';
    
    // Only check tags if locationName is not empty
    if (locationName) {
      // Check if fact is related to current location
      if (fact.category === 'location' && fact.tags.includes(locationName.toLowerCase())) {
        score += 3; // Significant boost for location-related facts
      }
      
      // More modest boost for any fact tagged with current location
      if (fact.tags.includes(locationName.toLowerCase())) {
        score += 1;
      }
    }
  }
  
  // Character relevance
  if (context.characterFocus && context.characterFocus.length > 0) {
    // Check for character-related facts
    context.characterFocus.forEach(character => {
      const characterLower = character.toLowerCase();
      
      // Strong boost for character facts about focused characters
      if (fact.category === 'character' && fact.tags.includes(characterLower)) {
        score += 3;
      }
      
      // Modest boost for any fact tagged with focused character
      if (fact.tags.includes(characterLower)) {
        score += 1;
      }
    });
  }
  
  // Theme relevance
  if (context.themes && context.themes.length > 0) {
    // Check for theme-related facts
    context.themes.forEach(theme => {
      if (fact.tags.includes(theme.toLowerCase())) {
        score += 1; // Modest boost for theme-related facts
      }
    });
  }
  
  // Confidence factor - higher confidence facts are more relevant
  score *= (0.5 + fact.confidence / 10); // Scale from 0.6 to 1.5
  
  return score;
}

/**
 * Builds a lore context extension for an AI prompt.
 * 
 * @param loreStore - The lore store to build context from
 * @param context - The current narrative context
 * @param options - Configuration options
 * @returns A formatted string for inclusion in AI prompts
 */
export function buildLoreContextPrompt(
  loreStore: LoreStore,
  context: NarrativeContext,
  options: {
    tokenBudget?: number; // Maximum tokens to use for lore context
    header?: string; // Optional custom header
    format?: 'detailed' | 'concise'; // Format style
  } = {}
): string {
  // Default options
  const tokenBudget = options.tokenBudget || 500;
  const header = options.header || 'Established World Facts:';
  const format = options.format || 'detailed';
  
  // Select relevant lore
  const loreContext = selectLoreForContext(loreStore, context, tokenBudget);
  
  // If no lore was selected, return empty string
  if (!loreContext || loreContext.trim() === '') {
    return '';
  }
  
  // Build the prompt extension
  if (format === 'detailed') {
    return `
${header}
${loreContext}

Please maintain consistency with these established facts in your response.
`;
  } else {
    // Concise format
    return `
${header} ${loreContext.replace(/\n/g, ' ')}
`;
  }
}

/**
 * Checks if a lore store is empty or contains no valid lore
 * 
 * @param loreStore - The lore store to check
 * @returns True if the store is empty or has no valid facts
 */
function isEmptyLoreStore(loreStore: LoreStore | undefined): boolean {
  if (!loreStore || loreStore === initialLoreState) {
    return true;
  }
  
  if (!loreStore.facts || Object.keys(loreStore.facts).length === 0) {
    return true;
  }
  
  // Check if there are any valid facts
  const validFacts = Object.values(loreStore.facts).filter(fact => fact.isValid);
  return validFacts.length === 0;
}

/**
 * Calculates the appropriate lore allocation ratio based on context length
 * 
 * @param contextTokenCount - Number of tokens in original context
 * @returns A ratio to multiply by context token count for lore budget
 */
function calculateLoreAllocationRatio(contextTokenCount: number): number {
  if (contextTokenCount < 50) return 8.0;  // Very short context
  if (contextTokenCount < 100) return 4.0; // Short context
  if (contextTokenCount < 500) return 1.0; // Medium context
  return 0.3; // Long context
}

/**
 * Integrates lore context into the existing narrative context.
 * 
 * @param context - The existing context string to extend
 * @param loreStore - The lore store to use
 * @param narrativeContext - The narrative context object
 * @returns The extended context string with lore included
 */
export function extendContextWithLore(
  context: string,
  loreStore: LoreStore,
  narrativeContext: NarrativeContext
): string {
  // Check if lore store is empty
  if (isEmptyLoreStore(loreStore)) {
    return context;
  }
  
  // Calculate token budget based on context length
  const estimatedExistingTokens = estimateTokenCount(context);
  
  // Determine appropriate allocation ratio based on context length
  const loreAllocationRatio = calculateLoreAllocationRatio(estimatedExistingTokens);
  
  // Calculate lore token budget
  const loreBudget = Math.floor(estimatedExistingTokens * loreAllocationRatio);
  
  // Build lore context
  const loreSection = buildLoreContextPrompt(loreStore, narrativeContext, {
    tokenBudget: loreBudget,
    format: 'concise' // Use concise format for context extension
  });
  
  // Only append if there's actual lore content
  if (loreSection && loreSection.trim() !== '') {
    return `${context}${loreSection}`;
  }
  
  return context;
}
