/**
 * Narrative Context Prioritization
 * 
 * Utilities for prioritizing narrative context elements based on
 * relevance and recency to ensure most important content is included.
 */

import { ScoredContextElement } from '../../types/narrative/context.types';

/**
 * Prioritizes context elements based on relevance and recency
 * 
 * @param elements - Array of scored context elements to prioritize
 * @param recencyBoost - Whether to boost recently created elements
 * @returns Prioritized array of context elements
 */
export function prioritizeContextElements(
  elements: ScoredContextElement[],
  recencyBoost: boolean = false
): ScoredContextElement[] {
  if (elements.length === 0) {
    return [];
  }
  
  // Clone the array to avoid modifying the original
  const result = [...elements];
  
  // Apply recency boost if specified
  if (recencyBoost) {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    
    // Adjust relevance based on recency
    result.forEach(element => {
      const hoursAgo = (now - element.timestamp) / ONE_HOUR;
      
      // Boost recent elements (within last hour)
      if (hoursAgo < 1) {
        element.relevance += (1 - hoursAgo) * 3; // Up to +3 points for very recent items
      }
      // Slightly boost elements from last 24 hours
      else if (hoursAgo < 24) {
        element.relevance += (24 - hoursAgo) / 24; // Up to +1 point for recent items
      }
    });
  }
  
  // Sort by relevance (descending)
  return result.sort((a, b) => {
    // Primary sort by relevance
    if (b.relevance !== a.relevance) {
      return b.relevance - a.relevance;
    }
    
    // Secondary sort by recency
    return b.timestamp - a.timestamp;
  });
}