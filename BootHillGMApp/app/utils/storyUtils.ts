/**
 * Story Progression Utility Functions
 * 
 * A collection of utilities for extracting, managing, and summarizing 
 * story progression points from AI responses and narrative state.
 * 
 * @module storyUtils
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  StoryProgressionPoint, 
  StorySignificance,
  StoryProgressionState,
  StoryProgressionData
} from '../types/narrative.types';
import { LocationType } from '../services/locationService';

/**
 * Extracts story progression data from AI-generated narrative text.
 * 
 * This function uses regular expressions to find specially formatted story point
 * markers within narrative text. It can handle both JSON-formatted markers and
 * simple key-value formatted markers.
 * 
 * @example
 * // Example of a marker in narrative text:
 * // STORY_POINT: { title: "Discovery", significance: "major" }
 * 
 * const narrative = "You discover a hidden map. STORY_POINT: { title: \"Hidden Map Discovery\", significance: \"major\" }";
 * const storyData = extractStoryPointFromNarrative(narrative);
 * // Returns: { title: "Hidden Map Discovery", significance: "major" }
 * 
 * @param narrative - The narrative text to parse for story point markers
 * @returns Story progression data if found, or null if not present
 */
export function extractStoryPointFromNarrative(narrative: string): StoryProgressionData | null {
  // This regex looks for STORY_POINT: followed by either:
  // 1. Content within braces {} (for JSON-like format)
  // 2. Any content up to a new line (for simple format)
  const storyPointRegex = /STORY_POINT:(?:\s*{([^}]*)}|([^}]*))/;
  const match = narrative.match(storyPointRegex);
  
  if (!match) return null;
  
  try {
    // Try to parse the matched content
    const content = match[1] || match[2];
    if (!content) return null;
    
    // If it looks like JSON (contains colons and either braces or no newlines)
    if (content.includes(':') && (content.includes('{') || !content.includes('\n'))) {
      try {
        // Clean up potential issues in the JSON string:
        // 1. Add quotes to keys (words followed by colon)
        // 2. Add quotes to simple values (after colon, not already quoted or complex)
        // 3. Remove trailing commas before closing brackets
        const cleanedContent = content
          .replace(/(\w+)(?=:)/g, '"$1"') // Add quotes to keys
          .replace(/:\s*(\[[^\]]*\]|[^",\s{}]+)/g, ': "$1"') // Add quotes to simple values, excluding arrays (Removed unnecessary escapes)
          .replace(/,\s*}/g, '}'); // Remove trailing commas
        
        // Parse the JSON
        const parsedData = JSON.parse(`{${cleanedContent}}`);
        
        // Process specific fields that need type conversion
        if (parsedData.characters && typeof parsedData.characters === 'string') {
          parsedData.characters = parsedData.characters.split(',').map((c: string) => c.trim());
        }
        
        return parsedData;
      } catch (error) {
        // JSON parsing failed, fall back to key-value parsing
        console.error('Failed to parse story point JSON', error);
      }
    }
    
    // Parse as key-value pairs (when not in JSON format)
    const lines = content.split('\n');
    // Use Record for dynamic string keys
    const data: Record<string, unknown> = {};
    
    lines.forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        // Convert to appropriate types based on the field name
        if (key === 'significance') {
          data[key] = value as StorySignificance;
        } else if (key === 'isMilestone') {
          data[key] = value.toLowerCase() === 'true';
        } else if (key === 'characters') {
          data[key] = value.split(',').map(c => c.trim());
        } else {
          data[key] = value;
        }
      }
    });
    
    // Cast the final object to StoryProgressionData
    return data as StoryProgressionData;
  } catch (error) {
    console.error('Error parsing story point from narrative:', error);
    return null;
  }
}

/**
 * Extracts a description from narrative text when not explicitly provided.
 * 
 * @param narrative - The narrative text
 * @returns A truncated description from the narrative
 * @private
 */
function extractDescriptionFromNarrative(narrative: string): string {
  // Remove any metadata markers
  const cleanNarrative = narrative
    .replace(/STORY_POINT:(?:\s*{[^}]*}|[^}]*)/g, '')
    .replace(/ACQUIRED_ITEMS:(?:\s*\[[^\]]*\]|[^\]]*)/g, '')
    .replace(/REMOVED_ITEMS:(?:\s*\[[^\]]*\]|[^\]]*)/g, '')
    .replace(/LOCATION:\s*[^\n]*/g, '')
    .replace(/COMBAT:\s*[^\n]*/g, '')
    .replace(/SUGGESTED_ACTIONS:\s*\[[^\]]*\]/g, '')
    .trim();
  
  // Return a truncated version of the clean narrative
  return cleanNarrative.length > 200 
    ? cleanNarrative.substring(0, 200) + '...'
    : cleanNarrative;
}

/**
 * Creates a new story progression point from extracted data.
 * 
 * Takes data extracted from an AI response and formats it into a complete
 * StoryProgressionPoint object with required metadata.
 * 
 * @param data - Extracted story progression data
 * @param narrative - Full narrative text for context
 * @param location - Current location where the story point occurred
 * @param previousPointId - ID of the previous story point, if any
 * @returns A complete StoryProgressionPoint object
 */
export function createStoryProgressionPoint(
  data: StoryProgressionData,
  narrative: string,
  location?: LocationType,
  previousPointId?: string
): StoryProgressionPoint {
  return {
    id: uuidv4(), // Generate a unique ID
    title: data.title || 'Untitled Story Point',
    description: data.description || extractDescriptionFromNarrative(narrative), // Now defined before call
    significance: data.significance || 'minor',
    characters: data.characters || [],
    timestamp: Date.now(),
    location,
    aiGenerated: true,
    tags: [],
    previousPoint: previousPointId
  };
}


/**
 * Adds a new story point to the progression state.
 * 
 * Updates the state with the new point, updates the main storyline if needed,
 * and sets the current point to the new point.
 * 
 * @param state - Current story progression state
 * @param point - New story point to add
 * @returns Updated story progression state
 */
export function addStoryPoint(
  state: StoryProgressionState,
  point: StoryProgressionPoint
): StoryProgressionState {
  // Add the point to the collection
  const updatedPoints = {
    ...state.progressionPoints,
    [point.id]: point
  };
  
  // Add to main storyline if it's a major point or milestone
  const mainStorylinePoints = [...state.mainStorylinePoints];
  if (point.significance === 'major' || point.significance === 'milestone') {
    mainStorylinePoints.push(point.id);
  }
  
  return {
    ...state,
    currentPoint: point.id,
    progressionPoints: updatedPoints,
    mainStorylinePoints,
    lastUpdated: Date.now()
  };
}

/**
 * Generates a summary of the story progression for AI context.
 * 
 * Creates a markdown-formatted summary of recent important story points
 * that can be included in the AI prompt to maintain narrative continuity.
 * 
 * @param state - Current story progression state
 * @param maxPoints - Maximum number of points to include in the summary
 * @returns A formatted string summary of story progression
 */
export function generateStoryProgressionSummary(
  state: StoryProgressionState,
  maxPoints: number = 5
): string {
  if (!state || !state.mainStorylinePoints.length) {
    return "No significant story events have occurred yet.";
  }
  
  // Get the most recent story points from the main storyline
  const recentPointIds = state.mainStorylinePoints.slice(-maxPoints);
  const points = recentPointIds
    .map(id => state.progressionPoints[id])
    .filter(Boolean);
  
  // Build the summary
  let summary = "## Story Progression Summary\n\n";
  
  points.forEach((point, index) => {
    summary += `${index + 1}. **${point.title}**: ${point.description.substring(0, 100)}`;
    summary += point.description.length > 100 ? '...' : '';
    summary += '\n';
  });
  
  return summary;
}

/**
 * Determines if a narrative contains a significant story advancement.
 * 
 * Uses keyword analysis to identify potential story advancements when
 * explicit story point markers are not present.
 * 
 * @param narrative - The narrative text to analyze
 * @returns Boolean indicating if this contains a significant story point
 */
export function containsSignificantStoryAdvancement(narrative: string): boolean {
  // Keywords that might indicate story advancement
  const storyAdvancementKeywords = [
    // Discovery keywords
    'revealed', 'discovered', 'learned', 'found out', 'realized', 
    
    // Achievement keywords
    'achievement', 'completed', 'accomplished', 'succeeded',
    
    // Story structure keywords
    'milestone', 'turning point', 'important moment', 'pivotal moment',
    
    // Importance keywords
    'critical', 'crucial', 'vital', 'essential', 'significant',
    
    // Quest keywords
    'mission', 'quest', 'task', 'objective', 'assignment',
    
    // Plot keywords
    'plot', 'storyline', 'narrative', 'arc', 'chapter',
    
    // Character development
    'character development', 'grew', 'changed', 'transformed'
  ];
  
  // Check if any keywords are present in the narrative
  return storyAdvancementKeywords.some(keyword => 
    narrative.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Builds a prompt extension to request story point identification.
 * 
 * Creates text that can be appended to the AI prompt to instruct the AI
 * to identify and mark significant story points.
 * 
 * @returns A string to append to the AI prompt
 */
export function buildStoryPointPromptExtension(): string {
  return `
  If this narrative contains a significant story development or milestone, please include a STORY_POINT tag with the following format:
  
  STORY_POINT: {
    title: "Brief title for this story point",
    description: "Concise description of this story development",
    significance: "major|minor|background|character|milestone",
    characters: "Character1, Character2",
    isMilestone: true|false
  }
  
  Only include this tag if there is a meaningful story development. The significance levels are:
  - major: A critical point in the main storyline
  - minor: A less significant but still noteworthy story point
  - background: Background information or world-building
  - character: Character development moment
  - milestone: Achievement or significant accomplishment
  `;
}
