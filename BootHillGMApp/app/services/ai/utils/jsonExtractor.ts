/**
 * Extract JSON from text content using multiple strategies
 * 
 * @param text - Text that may contain JSON
 * @param marker - Optional JSON marker (e.g., "playerDecision")
 * @returns Parsed JSON object or null if parsing fails
 * @throws ParsingError - When debug is enabled and JSON parsing fundamentally fails
 */
export function extractJSON(text: string, marker?: string): Record<string, unknown> | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Try parsing the whole text as JSON first
  try {
    return JSON.parse(text);
  } catch {
    // Continue to other strategies
  }

  // If marker is provided, try to find JSON with that specific marker
  if (marker) {
    try {
      // Try to find JSON with a specific marker
      const markerRegex = new RegExp(`"${marker}"\\s*:\\s*(\\{[\\s\\S]*?\\})`, 'g');
      const matches = text.match(markerRegex);
      
      if (matches && matches.length > 0) {
        // Wrap in an object to make it valid JSON
        try {
          return JSON.parse(`{${matches[0]}}`);
        } catch (parseError) {
          // Log specific error in development
          if (process.env.NODE_ENV !== 'production') {
            console.debug(`Failed to parse "${marker}" with regex match: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
          }
        }
      }
    } catch (regexError) {
      // Regex execution error, continue to next approach
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`Regex error while searching for "${marker}": ${regexError instanceof Error ? regexError.message : 'Unknown error'}`);
      }
    }
  }
  
  // Try to extract any JSON object
  try {
    const jsonRegex = /(\{[\s\S]*?\})/g;
    const matches = text.match(jsonRegex);
    
    if (matches && matches.length > 0) {
      // Try each match until one parses successfully
      for (const match of matches) {
        try {
          return JSON.parse(match);
        } catch {
          // Continue to next match
        }
      }

      // If we get here, none of the matches parsed successfully
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`Found ${matches.length} potential JSON objects, but none parsed successfully`);
      }
    }
  } catch (error) {
    // Generic regex execution error
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`Error extracting JSON objects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // No JSON found after trying all strategies
  return null;
}
