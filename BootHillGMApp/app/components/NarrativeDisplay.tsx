/**
 * Displays game narrative with visual emphasis on player actions and automated item tracking.
 * Features:
 * - Distinct styling for player actions vs GM responses
 * - Automatic item acquisition/removal tracking
 * - Smart deduplication of item updates
 * - Accessibility support for screen readers
 * - Decision point detection and triggering
 */

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { NarrativeContent } from './NarrativeContent';
import { cleanText } from '../utils/textCleaningUtils';
import { useStoryProgression } from '../hooks/useStoryProgression';
import { useNarrativeContext } from '../hooks/useNarrativeContext';
import '../styles/narrative.css';

export interface NarrativeDisplayProps {
  narrative: string;
  error?: string | null;
  onRetry?: () => void;
  id?: string;
  "data-testid"?: string;
}

export interface NarrativeItem {
  type: 'player-action' | 'gm-response' | 'narrative' | 'item-update';
  content: string;
  metadata?: {
    items?: string[];
    updateType?: 'acquired' | 'used';
    timestamp?: number;
    isEmpty?: boolean;
  };
}

export const NarrativeDisplay: React.FC<NarrativeDisplayProps> = ({
  narrative,
  error,
  onRetry,
  id,
  "data-testid": dataTestId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabled = useRef<boolean>(true);
  const processedUpdatesRef = useRef<Set<string>>(new Set());
  const lastNarrativeRef = useRef<string>('');
  
  // Add hooks for story progression and narrative context
  const { mainStoryline, storyProgression } = useStoryProgression();
  const { checkForDecisionTriggers, hasActiveDecision } = useNarrativeContext();

  // Determine if a narrative item is a key story point
  const isKeyStoryPoint = useCallback((content: string) => {
    if (!mainStoryline.length) return false;

    // Check if the content matches any story point description or title
    return mainStoryline.some((pointId: string) => {
      const point = storyProgression.progressionPoints[pointId];
      return point && (content.includes(point.description) || content.includes(point.title));
    });
  }, [mainStoryline, storyProgression.progressionPoints]);

  // Use useMemo unconditionally at the top level, and handle the conditional logic inside
  const narrativeItems = useMemo(() => {
    // If no narrative, return empty array
    if (!narrative) {
      return [] as NarrativeItem[];
    }
    
    processedUpdatesRef.current.clear();

    const lines = narrative.split('\n');
    
    const items = lines.reduce<NarrativeItem[]>((items, line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) return items;
  
      // Check for player actions
      if (trimmedLine.startsWith('Player Action:') || trimmedLine.startsWith('Player:') || trimmedLine.startsWith('You:')) {
        const content = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim(); // Extract content after the colon and trim
        if (content) {
          items.push({
            type: 'player-action',
            content: content,
            metadata: {
              timestamp: Date.now()
            }
          });
        }
        return items;
      }
    
      if (trimmedLine.startsWith('GM Response: ')) {
        const cleanedResponse = cleanText(trimmedLine.substring('GM Response: '.length));
        if (cleanedResponse) {
          items.push({
            type: 'gm-response',
            content: cleanedResponse,
            metadata: {
              timestamp: Date.now()
            }
          });
        }
        return items;
      }
    
      if (trimmedLine.startsWith('GM:') || trimmedLine.startsWith('Game Master:')) {
        const content = trimmedLine.substring(trimmedLine.indexOf(':') + 1);
        const cleanedResponse = cleanText(content);
        if (cleanedResponse) {
          items.push({
            type: 'gm-response',
            content: cleanedResponse,
            metadata: {
              timestamp: Date.now()
            }
          });
        }
        return items;
      }
    
      // Process item updates
      if (trimmedLine.startsWith('ACQUIRED_ITEMS:') ||
          trimmedLine.startsWith('REMOVED_ITEMS:')) {
        const updateType = trimmedLine.startsWith('ACQUIRED_ITEMS:') ? 'acquired' : 'used';
        const itemsMatch = trimmedLine.match(/:\s*(?:\[(.*?)\]|(.*))/);
        const itemsList = itemsMatch && (itemsMatch[1] || itemsMatch[2]) ?
          (itemsMatch[1] || itemsMatch[2])
            .split(',')
            .map(item => item.trim())
            .filter(Boolean) :
          [];
    
        if (itemsList.length) {
          items.push({
            type: 'item-update',
            content: '',
            metadata: {
              updateType,
              items: itemsList,
              timestamp: Date.now()
            }
          });
          return items;
        }
      }

      // Handle regular narrative
      if (!trimmedLine.startsWith('SUGGESTED_ACTIONS:')) {
        const cleanedContent = cleanText(trimmedLine);
        if (cleanedContent) {
          items.push({
            type: 'narrative',
            content: cleanedContent,
            metadata: {
              timestamp: Date.now()
            }
          });
        }
      }
      
      return items;
    }, []);
    
    return items; // Return the processed items array
  }, [narrative]);

  // Update auto-scroll state based on user interaction
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    isAutoScrollEnabled.current = scrollHeight - scrollTop - clientHeight < 50;
  }, []);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (containerRef.current && isAutoScrollEnabled.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [narrative]);
  
  // Check for decision triggers when narrative changes
  useEffect(() => {
    // Only check for decision triggers if the narrative has changed
    // and there's no active decision already
    if (narrative !== lastNarrativeRef.current && !hasActiveDecision) {
      
      // Only analyze the new part of the narrative
      const newContent = narrative.replace(lastNarrativeRef.current, '').trim();
      if (newContent.length > 20) { // Only check if there's substantial new content
        checkForDecisionTriggers(newContent);
      }
      
      // Update the last narrative ref
      lastNarrativeRef.current = narrative;
    }
  }, [narrative, hasActiveDecision, checkForDecisionTriggers]);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="narrative-container overflow-y-auto flex-1 max-h-[60vh] px-4 bhgm-narrative-display"
      data-testid={dataTestId || "narrative-display"}
      id={id || "bhgmNarrativeDisplayContainer"}
    >
      <div className="narrative-content py-4 2">
        {narrativeItems.map((item, index) => {
          let testId = `narrative-item-${item.type}`;

          
          if (item.type === 'item-update' && item.metadata?.updateType) {
            testId += `-${item.metadata.updateType}`;
          }
          // Check if this is a key story point
          const isStoryPoint = item.type === 'narrative' && isKeyStoryPoint(item.content);

          const element = (
            <NarrativeContent
              key={`${item.type}-${index}`}
              item={item}
              processedUpdates={processedUpdatesRef.current}
              isKeyStoryPoint={isStoryPoint}
              data-testid={testId}
            />
          );
          return element;
        })}
      </div>

      {error && (
        <div
          className="wireframe-section text-red-500 flex items-center gap-2 mt-4 p-2"
          role="alert"
          data-testid="narrative-error"
        >
          <span>{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="wireframe-button px-3 py-1"
              data-testid="narrative-retry-button"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};