/**
 * Entity extraction utility for narrative analysis
 * Extracts characters, locations, and items from text for context-aware action generation
 */

/**
 * Extract entities from narrative text for context-aware action generation
 * @param text The narrative text to analyze
 * @returns Object containing arrays of extracted characters, locations, and items
 */
export function extractEntitiesFromText(text: string): { 
  characters: string[], 
  locations: string[], 
  items: string[] 
} {
  // Simple extraction based on capitalized words and context
  const characters: string[] = [];
  const locations: string[] = [];
  const items: string[] = [];
  
  // Very basic extraction - a real implementation would use NLP or more sophisticated techniques
  const words = text.split(/\s+/);
  const capitalizedWords = words.filter(word => 
    /^[A-Z][a-z]{2,}/.test(word) && 
    !['The', 'A', 'An', 'In', 'On', 'At', 'From', 'To', 'With'].includes(word)
  );
  
  // Categorize based on simple heuristics
  capitalizedWords.forEach(word => {
    const cleanWord = word.replace(/[.,;:!?]$/, '');
    
    // Location indicators
    if (text.includes(`in ${cleanWord}`) || text.includes(`at ${cleanWord}`) || 
        text.includes(`to ${cleanWord}`) || /town|city|saloon|building|ranch|valley|mountain/i.test(text)) {
      if (!locations.includes(cleanWord)) locations.push(cleanWord);
    }
    // Character indicators
    else if (text.includes(`said ${cleanWord}`) || text.includes(`${cleanWord} said`) || 
            text.includes(`${cleanWord} spoke`) || /man|woman|sheriff|bartender|cowboy/i.test(text)) {
      if (!characters.includes(cleanWord)) characters.push(cleanWord);
    }
    // Item indicators
    else if (text.includes(`the ${cleanWord.toLowerCase()}`) || /gun|hat|badge|whiskey|horse|saddle|knife/i.test(text)) {
      const lowerWord = cleanWord.toLowerCase();
      if (!items.includes(lowerWord)) items.push(lowerWord);
    }
  });
  
  return { characters, locations, items };
}
