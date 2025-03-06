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
  onRetry
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabled = useRef<boolean>(true);
  const processedUpdatesRef = useRef<Set<string>>(new Set());


  const narrativeItems = useMemo(() => {
    processedUpdatesRef.current.clear();
    
    return narrative.split('\n').reduce<NarrativeItem[]>((items, line) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) return items;

      // First check for explicit markers
      if (trimmedLine.startsWith('Player Action: ')) {
        const cleanedAction = cleanText(trimmedLine.substring('Player Action: '.length));
        if (cleanedAction) {
          items.push({
            type: 'player-action',
            content: cleanedAction,
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

      // Fallback to checking for less explicit markers
      if (trimmedLine.startsWith('Player:') || trimmedLine.startsWith('You:')) {
        const content = trimmedLine.substring(trimmedLine.indexOf(':') + 1);
        const cleanedAction = cleanText(content);
        if (cleanedAction) {
          items.push({
            type: 'player-action',
            content: cleanedAction,
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
        }
        return items;
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
      className="narrative-container overflow-y-auto flex-1 max-h-[60vh] px-4 bhgm-narrative-display"
      data-testid="narrative-display"
      id="bhgmNarrativeDisplayContainer"
    >
      <div className="narrative-content py-4 2">
        {narrativeItems.map((item, index) => {
          let testId = `narrative-item-${item.type}`;

          
          if (item.type === 'item-update' && item.metadata?.updateType) {
            testId += `-${item.metadata.updateType}`;
          }
          const element = (
            <NarrativeContent
              key={`${item.type}-${index}`}
              item={item}
              processedUpdates={processedUpdatesRef.current}
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
