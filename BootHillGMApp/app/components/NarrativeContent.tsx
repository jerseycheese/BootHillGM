/**
 * Renders individual narrative items with appropriate styling and behavior.
 * Handles:
 * - Player actions with visual emphasis
 * - GM responses and general narrative
 * - Item update notifications with deduplication
 * - Empty line spacing for narrative pacing
 * 
 * @param item - The narrative item to render
 * @param processedUpdates - Set of already processed item updates to prevent duplicates
 */
import React from 'react';
import { NarrativeItem } from './NarrativeDisplay';
import { cleanText } from '../utils/textCleaningUtils';

interface StyleConfig {
  className: string;
  testId?: string;
}

const STYLE_CONFIGS: Record<NarrativeItem['type'], StyleConfig> = {
  'player-action': {
    className: 'narrative-player-action border-l-4 pl-4 bg-opacity-5',
    testId: 'narrative-item-player-action'
  },
  'gm-response': {
    className: 'narrative-gm-response',
    testId: 'narrative-item-gm-response'
  },
  'narrative': {
    className: 'narrative-text font-western-text leading-relaxed',
    testId: 'narrative-item-narrative'
  },
  'item-update': {
    className: 'narrative-item-update',
    testId: 'item-update'
  }
};

const ItemUpdate: React.FC<{
  metadata: NonNullable<NarrativeItem['metadata']>;
  processedUpdates: Set<string>;
}> = ({ metadata, processedUpdates }) => {
  if (!metadata.items?.length || metadata.items.includes('SUGGESTED_ACTIONS')) {
    return null;
  }

  const normalizedItems = metadata.items
    .map(item => item.toLowerCase().trim().replace(/\s+/g, ' '))
    .sort();
  
  const updateKey = `${metadata.updateType}-${normalizedItems.join(',')}`;
  if (processedUpdates.has(updateKey)) return null;
  
  processedUpdates.add(updateKey);
  
  const isAcquired = metadata.updateType === 'acquired';
  const className = `
    narrative-item-update
    ${isAcquired ? 'narrative-item-acquired' : 'narrative-item-used'}
    rounded-sm my-2
  `;

  return (
    <div
      data-testid={`item-update-${metadata.updateType}`}
      className={className}
    >
      {`${isAcquired ? 'Acquired' : 'Used/Removed'} Items: ${normalizedItems.join(', ')}`}
    </div>
  );
};

/**
 * Checks if content contains STORY_POINT JSON or system metadata
 * Used to filter out system metadata that shouldn't be displayed to users
 */
const isStoryPointMetadata = (content: string): boolean => {
  // FIXED: Add check for duplicate "Game Event:" prefixes and other system messages
  const systemPrefixes = [
    'STORY_POINT:',
    'Game Event:',
    'Context:'
  ];
  
  // Check for prefixes
  if (systemPrefixes.some(prefix => content.includes(prefix))) {
    return true;
  }
  
  // Check for duplicate content with Game Event prefix
  if (content.trim().startsWith('Game Event:')) {
    return true;
  }
  
  // Check for JSON component parts
  return (
    content.trim() === 'STORY_POINT: {' ||
    content.trim().startsWith('"title":') ||
    content.trim().startsWith('"description":') ||
    content.trim().startsWith('"significance":') ||
    content.trim().startsWith('"characters":') ||
    content.trim().startsWith('"isMilestone":') ||
    content.trim() === '}'
  );
};

export const NarrativeContent: React.FC<{
  item: NarrativeItem;
  processedUpdates: Set<string>;
  isKeyStoryPoint?: boolean;
  "data-testid"?: string;
}> = ({ item, processedUpdates, isKeyStoryPoint, "data-testid": testId }) => {
  if (item.type === 'item-update' && item.metadata) {
    return <ItemUpdate metadata={item.metadata} processedUpdates={processedUpdates} />;
  }

  const config = STYLE_CONFIGS[item.type];
  
  // Filter out story point metadata JSON and system messages that shouldn't be visible to users
  if (!item.content || 
      item.content.includes('undefined') || 
      isStoryPointMetadata(item.content)) {
    return null;
  }

  const className = `my-2 ${config.className} ${isKeyStoryPoint ? 'story-point-highlight' : ''}`.trim();

  return (
    <div
      className={className}
      data-testid={testId || config.testId}
      role={item.type === 'player-action' ? 'log' : undefined}
    >
      {isKeyStoryPoint && (
        <div className="story-point-marker">📌 Key Story Point</div>
      )}
      {cleanText(item.content)}
    </div>
  );
};
