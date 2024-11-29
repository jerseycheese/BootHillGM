/**
 * Displays game narrative with visual emphasis on player actions and automated item tracking.
 * Features:
 * - Distinct styling for player actions vs GM responses
 * - Automatic item acquisition/removal tracking
 * - Smart deduplication of item updates
 * - Accessibility support for screen readers
 */

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { NarrativeContent } from './NarrativeContent';
import { cleanText } from '../utils/textCleaningUtils';

export interface NarrativeDisplayProps {
  narrative: string;
  error?: string | null;
  onRetry?: () => void;
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
  onRetry
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabled = useRef<boolean>(true);
  const processedUpdatesRef = useRef<Set<string>>(new Set());

  // Enhanced narrative processing
  const shouldAddSpacer = (currentType: string, previousItem: NarrativeItem | undefined) => {
    if (!previousItem) return false;
    
    // Add spacer between different content types
    if (currentType !== previousItem.type) return true;
    
    // Add spacer between GM responses (to separate combat results)
    if (currentType === 'gm-response' && previousItem.type === 'gm-response') return true;
    
    return false;
  };

  const narrativeItems = useMemo(() => {
    processedUpdatesRef.current.clear();
    
    return narrative.split('\n').reduce<NarrativeItem[]>((items, line, index, array) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines - we'll handle spacing differently
      if (!trimmedLine) {
        return items;
      }

      // Improved player action detection
      const playerActionMatch = trimmedLine.match(/^(?:Player:|You:?)\s*(.*)/i);
      if (playerActionMatch) {
        const cleanedAction = cleanText(playerActionMatch[1]);
        if (cleanedAction) {
          if (shouldAddSpacer('player-action', items[items.length - 1])) {
            items.push({ type: 'narrative', content: '', metadata: { isEmpty: true } });
          }
          items.push({ 
            type: 'player-action',
            content: cleanedAction,
            metadata: { timestamp: Date.now() }
          });
        }
        return items;
      }

      // Enhanced GM response detection
      const gmResponseMatch = trimmedLine.match(/^(?:GM:|Game Master:)\s*(.*)/i);
      if (gmResponseMatch) {
        const cleanedResponse = cleanText(gmResponseMatch[1]);
        if (cleanedResponse) {
          if (shouldAddSpacer('gm-response', items[items.length - 1])) {
            items.push({ type: 'narrative', content: '', metadata: { isEmpty: true } });
          }
          items.push({ 
            type: 'gm-response',
            content: cleanedResponse,
            metadata: { timestamp: Date.now() }
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
        }
        return items;
      }

      // Handle regular narrative
      if (!trimmedLine.startsWith('SUGGESTED_ACTIONS:')) {
        const cleanedContent = cleanText(trimmedLine);
        if (cleanedContent) {
          if (shouldAddSpacer('narrative', items[items.length - 1])) {
            items.push({ type: 'narrative', content: '', metadata: { isEmpty: true } });
          }
          items.push({ 
            type: 'narrative',
            content: cleanedContent,
            metadata: { timestamp: Date.now() }
          });
        }
      }
      
      return items;
    }, []);
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

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="narrative-container overflow-y-auto flex-1 max-h-[60vh] px-4"
      data-testid="narrative-display"
    >
      <div className="narrative-content py-4 space-y-1">
        {narrativeItems.map((item, index) => {
          const element = (
            <NarrativeContent 
              key={`${item.type}-${index}`}
              item={item} 
              processedUpdates={processedUpdatesRef.current}
            />
          );
          return element;
        })}
      </div>
      
      {error && (
        <div 
          className="wireframe-section text-red-500 flex items-center gap-2 mt-4 p-2"
          role="alert"
        >
          <span>{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="wireframe-button px-3 py-1"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};
