/**
 * useStoryProgression Hook
 * 
 * A React hook for accessing and manipulating story progression state.
 * Provides a clean interface for components to interact with story
 * progression data without directly accessing the narrative state.
 */

import { useCallback, useMemo } from 'react';
import { useGameSession } from './useGameSession';
import { LocationType } from '../services/locationService';
import {
  StoryProgressionPoint,
  StoryProgressionState,
  StorySignificance,
  initialStoryProgressionState
} from '../types/narrative.types';
import {
  addStoryPoint as addStoryPointUtil,
  extractStoryPointFromNarrative,
  createStoryProgressionPoint,
  containsSignificantStoryAdvancement
} from '../utils/storyUtils';

/**
 * Validates and converts a string to a StorySignificance type
 * @param value - The string value to validate
 * @returns A valid StorySignificance value
 */
function validateStorySignificance(value: string): StorySignificance {
  const validValues: StorySignificance[] = ['major', 'minor', 'background', 'character', 'milestone'];
  
  if (validValues.includes(value as StorySignificance)) {
    return value as StorySignificance;
  }
  
  // Default to 'minor' if the value is not valid
  console.warn(`Invalid story significance value: "${value}". Defaulting to "minor".`);
  return 'minor';
}

/**
 * Interface for the return value of useStoryProgression.
 */
interface UseStoryProgressionResult {
  /** The current story progression state */
  storyProgression: StoryProgressionState;
  
  /** The current active story point or null if none */
  currentPoint: StoryProgressionPoint | null;
  
  /** All story progression points as a record */
  allPoints: Record<string, StoryProgressionPoint>;
  
  /** Ordered array of main storyline point IDs */
  mainStoryline: string[];
  
  /** Add a new story point to the progression */
  addStoryPoint: (point: StoryProgressionPoint) => void;
  
  /** Create and add a story point from raw data */
  createAndAddStoryPoint: (
    title: string,
    description: string,
    significance?: string,
    characters?: string[]
  ) => void;
  
  /** Jump to a specific story point */
  setCurrentPoint: (pointId: string) => void;
  
  /** Get a specific story point by ID */
  getPointById: (id: string) => StoryProgressionPoint | null;
  
  /** Generate a summary of the story progression for display */
  generateSummary: (maxPoints?: number) => string;
  
  /** Process narrative text to extract and add story points */
  processNarrativeForStoryPoints: (narrative: string, location?: LocationType) => void;
}

/**
 * A hook that provides access to story progression state and actions.
 * 
 * @example
 * ```tsx
 * const { 
 *   currentPoint, 
 *   allPoints, 
 *   mainStoryline,
 *   addStoryPoint 
 * } = useStoryProgression();
 * 
 * // Display current story point
 * return (
 *   <div>
 *     {currentPoint && (
 *       <>
 *         <h2>{currentPoint.title}</h2>
 *         <p>{currentPoint.description}</p>
 *       </>
 *     )}
 *   </div>
 * );
 * ```
 * 
 * @returns An object containing story state and manipulation functions
 */
export function useStoryProgression(): UseStoryProgressionResult {
  const { state, dispatch } = useGameSession();
  
  // Get the story progression state or use the initial state if not yet set
  const storyProgression = state.narrative?.storyProgression || initialStoryProgressionState;
  
  // Get the current story point if one exists
  const currentPoint = useMemo(() => {
    if (!storyProgression.currentPoint) return null;
    return storyProgression.progressionPoints[storyProgression.currentPoint] || null;
  }, [storyProgression.currentPoint, storyProgression.progressionPoints]);
  
  /**
   * Add a story point to the progression
   */
  const addStoryPoint = useCallback((point: StoryProgressionPoint) => {
    dispatch({
      type: 'UPDATE_NARRATIVE',
      payload: {
        storyProgression: addStoryPointUtil(storyProgression, point)
      }
    });
  }, [dispatch, storyProgression]);
  
  /**
   * Create and add a story point from raw data
   */
  const createAndAddStoryPoint = useCallback((
    title: string,
    description: string,
    significance: string = 'minor',
    characters: string[] = []
  ) => {
    const newPoint: StoryProgressionPoint = {
      id: `sp_${Date.now()}`,
      title,
      description,
      significance: validateStorySignificance(significance), // Validate and convert the string to StorySignificance
      characters,
      timestamp: Date.now(),
      aiGenerated: false, // Manually created
      tags: []
    };
    
    addStoryPoint(newPoint);
  }, [addStoryPoint]);
  
  /**
   * Set the current story point
   */
  const setCurrentPoint = useCallback((pointId: string) => {
    if (!storyProgression.progressionPoints[pointId]) {
      console.error(`Story point with ID ${pointId} does not exist`);
      return;
    }
    
    dispatch({
      type: 'UPDATE_NARRATIVE',
      payload: {
        storyProgression: {
          ...storyProgression,
          currentPoint: pointId,
          lastUpdated: Date.now()
        }
      }
    });
  }, [dispatch, storyProgression]);
  
  /**
   * Get a specific story point by ID
   */
  const getPointById = useCallback((id: string) => {
    return storyProgression.progressionPoints[id] || null;
  }, [storyProgression.progressionPoints]);
  
  /**
   * Generate a summary of the story progression for display
   */
  const generateSummary = useCallback((maxPoints = 3) => {
    const pointIds = storyProgression.mainStorylinePoints.slice(-maxPoints);
    
    if (pointIds.length === 0) {
      return "No significant story events have occurred yet.";
    }
    
    return pointIds.map(id => {
      const point = storyProgression.progressionPoints[id];
      if (!point) return '';
      
      return `• ${point.title}: ${point.description.substring(0, 100)}${point.description.length > 100 ? '...' : ''}`;
    }).join('\n\n');
  }, [storyProgression.mainStorylinePoints, storyProgression.progressionPoints]);
  
  /**
   * Process narrative text to extract and add story points
   *
   * @param narrative - The narrative text to process
   * @param location - Optional location context
   */
  const processNarrativeForStoryPoints = useCallback((narrative: string, location?: LocationType) => {
    if (!narrative) return;
    
    // Try to extract explicit story point data
    const storyPointData = extractStoryPointFromNarrative(narrative);
    
    if (storyPointData) {
      // Create a story progression point from the extracted data
      const storyPoint = createStoryProgressionPoint(
        storyPointData,
        narrative,
        location,
        storyProgression.currentPoint || undefined
      );
      
      // Add the story point to the progression
      addStoryPoint(storyPoint);
    } else if (containsSignificantStoryAdvancement(narrative)) {
      // If no explicit story point but the narrative contains significant advancement
      // Create a basic story point
      createAndAddStoryPoint(
        "Story Development",
        narrative.substring(0, 100) + (narrative.length > 100 ? '...' : ''),
        'minor'
      );
    }
  }, [addStoryPoint, createAndAddStoryPoint, storyProgression.currentPoint]);
  
  return {
    storyProgression,
    currentPoint,
    allPoints: storyProgression.progressionPoints,
    mainStoryline: storyProgression.mainStorylinePoints,
    addStoryPoint,
    createAndAddStoryPoint,
    setCurrentPoint,
    getPointById,
    generateSummary,
    processNarrativeForStoryPoints
  };
}
