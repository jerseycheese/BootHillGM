import { useState, useCallback } from 'react';
import { NarrativeSegment, UseNarrativeProcessorResult } from '../types/narrative.types';
import { useStoryProgression } from './useStoryProgression';
import { LocationType } from '../services/locationService';

/**
 * Hook for processing narrative text into segments and integrating with story progression
 * 
 * This hook provides functionality to:
 * - Process narrative text into player actions, GM responses, and other segments
 * - Extract and track story points
 * - Manage narrative segments for display
 * 
 * @returns Methods for processing and managing narrative segments
 */
export function useNarrativeProcessor(): UseNarrativeProcessorResult {
  const [processedSegments, setProcessedSegments] = useState<NarrativeSegment[]>([]);
  const storyProgressionResult = useStoryProgression();
  const { processNarrativeForStoryPoints } = storyProgressionResult;

  /**
   * Process a narrative string into segments
   * 
   * @param narrative - The narrative text to process
   * @param location - Optional location context
   */
  const processNarrative = useCallback((narrative: string, location?: LocationType) => {
    if (!narrative) return;

    const lines = narrative.split('\n');
    const newSegments: NarrativeSegment[] = [];
    let currentText = '';
    let currentType: NarrativeSegment['type'] | null = null;

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;

      // Check for player actions
      if (line.startsWith('Player:') || line.startsWith('Player Action:') || line.startsWith('You:')) {
        // If we have accumulated text, add it as a segment
        if (currentText && currentType) {
          newSegments.push({
            type: currentType,
            content: currentText.trim()
          });
          currentText = '';
        }

        // Extract player action content
        const content = line.substring(line.indexOf(':') + 1).trim();
        if (content) {
          currentType = 'player-action';
          currentText = content;
        }
        continue;
      }

      // Check for GM responses
      if (line.startsWith('GM:') || line.startsWith('Game Master:') || line.startsWith('GM Response:')) {
        // If we have accumulated text, add it as a segment
        if (currentText && currentType) {
          newSegments.push({
            type: currentType,
            content: currentText.trim()
          });
          currentText = '';
        }

        // Extract GM response content
        const content = line.substring(line.indexOf(':') + 1).trim();
        if (content) {
          currentType = 'gm-response';
          currentText = content;
          
          // Process for story points
          processNarrativeForStoryPoints(content, location);
        }
        continue;
      }

      // Check for item updates
      if (line.startsWith('ACQUIRED_ITEMS:') || line.startsWith('REMOVED_ITEMS:')) {
        // If we have accumulated text, add it as a segment
        if (currentText && currentType) {
          newSegments.push({
            type: currentType,
            content: currentText.trim()
          });
          currentText = '';
        }

        const updateType = line.startsWith('ACQUIRED_ITEMS:') ? 'acquired' : 'used';
        const itemsMatch = line.match(/:\s*(?:\[(.*?)\]|(.*))/);
        const itemsList = itemsMatch && (itemsMatch[1] || itemsMatch[2]) ?
          (itemsMatch[1] || itemsMatch[2])
            .split(',')
            .map(item => item.trim())
            .filter(Boolean) :
          [];

        if (itemsList.length) {
          newSegments.push({
            type: 'item-update',
            content: '',
            metadata: {
              updateType,
              items: itemsList,
              timestamp: Date.now()
            }
          });
        }
        continue;
      }

      // Skip metadata markers
      if (line.startsWith('SUGGESTED_ACTIONS:') || line.startsWith('STORY_POINT:')) {
        continue;
      }

      // Handle regular narrative text
      if (currentType === null) {
        currentType = 'narrative';
        currentText = line;
      } else if (currentType === 'narrative') {
        currentText += '\n' + line;
      } else {
        // If we have accumulated text, add it as a segment
        if (currentText) {
          newSegments.push({
            type: currentType,
            content: currentText.trim()
          });
        }
        currentType = 'narrative';
        currentText = line;
      }
    }

    // Add any remaining text as a segment
    if (currentText && currentType) {
      newSegments.push({
        type: currentType,
        content: currentText.trim()
      });
    }

    // Update the processed segments
    setProcessedSegments(prevSegments => [...prevSegments, ...newSegments]);
  }, [processNarrativeForStoryPoints]);

  /**
   * Add a player action segment
   * 
   * @param action - The player action text
   */
  const addPlayerAction = useCallback((action: string) => {
    if (!action.trim()) return;
    
    setProcessedSegments(prevSegments => [
      ...prevSegments,
      {
        type: 'player-action',
        content: action.trim(),
        metadata: {
          timestamp: Date.now()
        }
      }
    ]);
  }, []);

  /**
   * Add a GM response segment and process for story points
   * 
   * @param response - The GM response text
   * @param location - Optional location context
   */
  const addGMResponse = useCallback((response: string, location?: LocationType) => {
    if (!response.trim()) return;
    
    // Process for story points
    processNarrativeForStoryPoints(response, location);
    
    setProcessedSegments(prevSegments => [
      ...prevSegments,
      {
        type: 'gm-response',
        content: response.trim(),
        metadata: {
          timestamp: Date.now()
        }
      }
    ]);
  }, [processNarrativeForStoryPoints]);

  /**
   * Add a narrative segment directly
   * 
   * @param segment - The narrative segment to add
   */
  const addNarrativeSegment = useCallback((segment: NarrativeSegment) => {
    if (!segment.content.trim() && !segment.metadata?.items?.length) return;
    
    setProcessedSegments(prevSegments => [...prevSegments, segment]);
  }, []);

  /**
   * Clear all processed segments
   */
  const clearSegments = useCallback(() => {
    setProcessedSegments([]);
  }, []);

  return {
    processedSegments,
    addPlayerAction,
    addGMResponse,
    addNarrativeSegment,
    clearSegments,
    processNarrative
  };
}