/**
 * Utilities for creating and managing narrative journal entries
 * 
 * This module provides specialized functions for handling narrative-type
 * journal entries, including AI-powered summary generation, context extraction,
 * and entry formatting.
 */
import { AIService } from '../../services/ai/aiService';
import { NarrativeJournalEntry, JournalEntry } from '../../types/journal';
import { cleanText } from '../textCleaningUtils';
import { generateUUID } from '../uuidGenerator';
import { createFallbackSummary } from './journalUtils';

/**
 * Creates a narrative journal entry with AI-generated summary
 * 
 * This function handles the complete process of narrative entry creation:
 * 1. Cleans and formats the entry content
 * 2. Builds appropriate context for the AI summary
 * 3. Extracts character information when available
 * 4. Generates a narrative summary using AI
 * 5. Ensures proper formatting and punctuation
 * 
 * The function gracefully handles all error cases and ensures
 * a valid entry is always returned.
 * 
 * @param content - Text content of the narrative entry
 * @param context - Optional context for AI summary generation
 * @param prevEntry - Optional previous journal entry for context
 * @param aiService - AIService instance for generating summaries
 * @returns A new narrative journal entry
 */
export const createNarrativeEntry = async (
  content: string,
  context?: string,
  prevEntry?: JournalEntry,
  aiService?: AIService
): Promise<NarrativeJournalEntry> => {
  const cleanedContent = cleanText(content);
  
  // Generate AI summary with enhanced context about the character
  let summaryContext = context || '';
  if (!summaryContext && prevEntry) {
    summaryContext = `Previous journal entry: ${prevEntry.content}`;
  }
  
  // Extract character name from content if available to enhance summary
  const characterNameMatch = cleanedContent.match(/([A-Z][a-z]+)(?:\s+steps|\s+walks|\s+enters|\s+arrives)/);
  if (characterNameMatch && !summaryContext.includes('character')) {
    summaryContext = `Character ${characterNameMatch[1]}. ${summaryContext}`;
  }
  
  // Ensure we generate a proper summary rather than using truncated text
  const narrativeSummary = await aiService?.generateNarrativeSummary(
    cleanedContent,
    summaryContext
  );
  
  // Make sure the summary is a complete sentence with proper punctuation
  let finalSummary = narrativeSummary || '';
  if (finalSummary && !finalSummary.endsWith('.') && 
      !finalSummary.endsWith('!') && 
      !finalSummary.endsWith('?')) {
    finalSummary += '.';
  }
  
  // Create a new narrative journal entry
  return {
    id: generateUUID(),
    title: 'New Adventure',
    type: 'narrative',
    timestamp: Date.now(),
    content: cleanedContent,
    narrativeSummary: finalSummary || createFallbackSummary(cleanedContent)
  };
};