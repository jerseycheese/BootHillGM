/**
 * AI Service for generating narrative summaries
 * 
 * This service provides functionality to summarize narrative content for the journal.
 * Currently using a placeholder implementation that returns the context as the summary.
 * Future implementation will integrate with an AI service for dynamic summarization.
 */

/**
 * Generate a summary of narrative content for journal entries
 * 
 * @param content The narrative content to summarize
 * @param context Additional context to help with summarization
 * @returns A summary of the narrative content
 */
export async function summarizeNarrativeForJournal(
  content: string,
  context: string
): Promise<string> {
  // For now, just use the context as the summary
  // Future implementation will call an AI service to generate a proper summary
  
  // If there's significant content and minimal context, use the first sentence of content
  if (content.length > 50 && (!context || context.length < 20)) {
    const firstSentence = content.split(/[.!?]/, 1)[0];
    return firstSentence.trim() + '.';
  }
  
  return context || content.substring(0, 100);
}
