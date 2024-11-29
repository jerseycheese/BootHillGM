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
    className: 'player-action border-l-4 border-saddle-brown pl-4 bg-opacity-5 hover:bg-opacity-10 transition-colors duration-300',
    testId: 'player-action'
  },
  'gm-response': {
    className: 'gm-response border-l-4 border-dusty-red pl-4',
    testId: 'gm-response'
  },
  'narrative': {
    className: 'narrative-line font-western-text leading-relaxed',
    testId: 'narrative-line'
  },
  'item-update': {
    className: '',
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
    item-update 
    ${isAcquired ? 'item-update-acquired' : 'item-update-used'}
    rounded-sm my-2 py-1 px-4
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

export const NarrativeContent: React.FC<{
  item: NarrativeItem;
  processedUpdates: Set<string>;
}> = ({ item, processedUpdates }) => {
  if (item.type === 'item-update' && item.metadata) {
    return <ItemUpdate metadata={item.metadata} processedUpdates={processedUpdates} />;
  }

  const config = STYLE_CONFIGS[item.type];
  
  // Only render spacer if it's an empty narrative item
  if (item.metadata?.isEmpty) {
    return <div className="h-4" data-testid="empty-spacer" role="separator" aria-hidden="true" />;
  }
  
  if (!item.content || item.content.includes('undefined')) {
    return null;
  }

  const animationClass = item.type === 'player-action' ? 'animate-highlight' : '';
  const className = `my-2 ${config.className} ${animationClass}`.trim();

  return (
    <div 
      className={className}
      data-testid={config.testId}
      role={item.type === 'player-action' ? 'log' : undefined}
    >
      {cleanText(item.content)}
    </div>
  );
};
