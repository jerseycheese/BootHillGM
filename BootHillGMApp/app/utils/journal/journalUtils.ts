/**
 * Utility functions for journal operations
 * 
 * These utilities provide common functionality used across journal entry types,
 * including summary generation, search capabilities, and text processing.
 */
import { JournalEntry } from '../../types/journal';

/**
 * Creates a simple fallback summary when AI generation fails
 * 
 * This function implements several fallback strategies to ensure that
 * a reasonable summary can always be generated, even when AI services
 * are unavailable or return unexpected results.
 * 
 * Fallback strategies, in order of preference:
 * 1. Extract the first complete sentence
 * 2. Use the entire content if it's short (≤50 chars)
 * 3. Truncate at the last word boundary before 50 chars
 * 
 * @param content - The text content to summarize
 * @returns A reasonable summary string with proper punctuation
 */
export const createFallbackSummary = (content: string): string => {
  if (!content) return 'New journal entry added.';
  
  // Extract first sentence if possible
  const firstSentenceMatch = content.match(/^([^.!?]+[.!?])/);
  if (firstSentenceMatch) {
    return firstSentenceMatch[0];
  }
  
  // If no clear sentence, create a summary of first 50 chars
  if (content.length <= 50) {
    // Ensure it ends with a period for consistency
    return content.endsWith('.') ? content : content + '.';
  }
  
  // Find the last space before the 50 char limit to avoid cutting words
  const truncated = content.substring(0, 50);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  const summary = lastSpaceIndex === -1 
    ? truncated + '...' 
    : truncated.substring(0, lastSpaceIndex) + '...';
    
  return summary;
};

/**
 * Checks if a journal entry matches the search text
 * 
 * Performs a case-insensitive search in both the main content
 * and the narrative summary of an entry, returning true if either
 * contains the search text.
 * 
 * @param entry - Journal entry to check
 * @param searchText - Text to search for
 * @returns True if the entry matches the search, false otherwise
 */
export const entryMatchesSearch = (entry: JournalEntry, searchText: string): boolean => {
  if (!searchText) return true;
  
  const searchLower = searchText.toLowerCase();
  return !!(
    (entry.content && entry.content.toLowerCase().includes(searchLower)) ||
    (entry.narrativeSummary && entry.narrativeSummary.toLowerCase().includes(searchLower))
  );
};