/**
 * Narrative Storage Module
 * 
 * Handles retrieval and parsing of narrative data from localStorage.
 * Provides fallback mechanisms for different narrative data formats.
 * Supports multiple narrative structure types and backward compatibility.
 */

// Module constants
const MODULE_NAME = 'GameStorage:Narrative';
const DEFAULT_NARRATIVE = 'Your adventure begins in the rugged frontier town of Boot Hill...';

// Storage keys for narrative-related data, in order of priority
const STORAGE_KEYS = {
  NARRATIVE_STATE: 'narrativeState',
  INITIAL_NARRATIVE: 'initial-narrative',
  GAME_STATE: 'saved-game-state',
  CAMPAIGN_STATE: 'campaignState'
};

/**
 * Interface for possible narrative data structures
 */
interface NarrativeData {
  text?: string;
  narrative?: string | string[];
  narrativeHistory?: string[];
  initialNarrative?: string;
  [key: string]: unknown;
}

/**
 * Extract narrative text from parsed data based on source.
 * Handles different narrative structures based on storage source.
 * 
 * @param parsed Parsed JSON data
 * @param source Source key
 * @returns Narrative text if found, null otherwise
 */
const extractNarrativeText = (parsed: Record<string, unknown> | NarrativeData | string[] | string, source: string): string | null => {
  // Handle NARRATIVE_STATE source
  if (source === STORAGE_KEYS.NARRATIVE_STATE) {
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((entry: Record<string, unknown> | string) => {
        if (typeof entry === 'string') return entry;
        return (entry.text as string) || '';
      }).join('\n');
    }
    
    if (!Array.isArray(parsed) && typeof parsed === 'object') {
      const narrativeData = parsed as NarrativeData;
      if (narrativeData.narrative || narrativeData.narrativeHistory) {
        const narrativeArray = narrativeData.narrativeHistory || 
                              narrativeData.narrative || 
                              [];
        if (Array.isArray(narrativeArray)) {
          return narrativeArray.join('\n');
        }
      }
    }
  } 
  
  // Handle INITIAL_NARRATIVE source
  else if (source === STORAGE_KEYS.INITIAL_NARRATIVE) {
    if (typeof parsed === 'string') {
      return parsed;
    }
    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      const narrativeData = parsed as NarrativeData;
      if (narrativeData.narrative && typeof narrativeData.narrative === 'string') {
        return narrativeData.narrative;
      }
    }
  } 
  
  // Handle GAME_STATE or CAMPAIGN_STATE source
  else if (source === STORAGE_KEYS.GAME_STATE || 
           source === STORAGE_KEYS.CAMPAIGN_STATE) {
    
    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      const gameData = parsed as Record<string, unknown>;
      if (gameData.narrative) {
        if (typeof gameData.narrative === 'string') {
          return gameData.narrative;
        }
        
        // Check for nested narrative structures
        if (typeof gameData.narrative === 'object' && gameData.narrative !== null) {
          const narrativeData = gameData.narrative as NarrativeData;
          if (narrativeData.narrativeHistory && 
              Array.isArray(narrativeData.narrativeHistory)) {
            return narrativeData.narrativeHistory.join('\n');
          }
          
          if (narrativeData.initialNarrative && 
              typeof narrativeData.initialNarrative === 'string') {
            return narrativeData.initialNarrative;
          }
        }
      }
    }
  }
  
  return null;
};

/**
 * Get narrative text from any available source.
 * Tries sources in this priority order:
 * 1. NARRATIVE_STATE - dedicated narrative storage
 * 2. INITIAL_NARRATIVE - initial narrative storage
 * 3. GAME_STATE or CAMPAIGN_STATE - complete game state
 * 
 * @returns Narrative text string or default if not found
 */
const getNarrativeText = (): string => {
  if (typeof window === 'undefined') return DEFAULT_NARRATIVE;
  
  // Try all possible sources for narrative data
  const sources = [
    STORAGE_KEYS.NARRATIVE_STATE,
    STORAGE_KEYS.INITIAL_NARRATIVE,
    STORAGE_KEYS.GAME_STATE,
    STORAGE_KEYS.CAMPAIGN_STATE
  ];
  
  for (const source of sources) {
    const data = localStorage.getItem(source);
    if (!data) continue;
    
    try {
      const parsed = JSON.parse(data);
      const narrativeText = extractNarrativeText(parsed, source); // Now defined before call
      if (narrativeText) return narrativeText;
    } catch (e) {
      console.error(`${MODULE_NAME} - Error parsing ${source} for narrative:`, e);
    }
  }
  
  // Return default narrative if nothing found
  return DEFAULT_NARRATIVE;
};


export const narrativeStorage = {
  getNarrativeText
};
