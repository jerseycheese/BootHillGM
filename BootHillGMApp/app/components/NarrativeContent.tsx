import { NarrativeItem } from './NarrativeDisplay';

interface StyleConfig {
  className: string;
  testId?: string;
}

const STYLE_CONFIGS: Record<NarrativeItem['type'], StyleConfig> = {
  'player-action': {
    className: 'player-action border-l-4 border-green-500 pl-4',
    testId: 'player-action'
  },
  'gm-response': {
    className: 'gm-response border-l-4 border-blue-500 pl-4',
    testId: 'gm-response'
  },
  'narrative': {
    className: 'narrative-line'
  },
  'item-update': {
    className: '',
    testId: 'item-update'
  }
};

const ItemUpdate: React.FC<{
  metadata: NonNullable<NarrativeItem['metadata']>,
  processedUpdates: Set<string>
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
  const className = `bg-${isAcquired ? 'amber' : 'gray'}-50 border-${isAcquired ? 'amber' : 'gray'}-400`;

  return (
    <div
      data-testid={`item-update-${metadata.updateType}`}
      className={`my-2 py-1 p-2 px-4 rounded border-l-4 ${className}`}
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
  // Skip rendering if content is undefined or empty
  if (item.metadata?.isEmpty) {
    return <div className="h-2" />;
  }
  
  if (!item.content || item.content.includes('undefined')) {
    return null;
  }

  return (
    <div 
      className={`my-2 py-1 ${config.className}`}
      data-testid={config.testId}
    >
      {item.content}
    </div>
  );
};
