import { NarrativeItem } from './NarrativeDisplay';
import { useRef } from 'react';

export const NarrativeContent: React.FC<{ item: NarrativeItem }> = ({ item }) => {
  const baseClasses = 'my-2 py-1';
  const processedRef = useRef<string | null>(null);
  
  // For item updates, check if this is a duplicate of the immediately previous update
  if (item.type === 'item-update' && item.metadata?.updateType) {
    const currentKey = `${item.metadata.updateType}-${item.content}`;
    
    if (processedRef.current === currentKey) {
      return null;
    }
    
    processedRef.current = currentKey;
  }
  
  switch (item.type) {
    case 'player-action':
      return (
        <div className={`${baseClasses} player-action border-l-4 border-green-500 pl-4`}>
          {item.content}
        </div>
      );
      
    case 'gm-response':
      return (
        <div className={`${baseClasses} gm-response border-l-4 border-blue-500 pl-4`}>
          {item.content}
        </div>
      );
      
    case 'item-update':
      // Skip SUGGESTED_ACTIONS
      if (item.content.includes('SUGGESTED_ACTIONS')) {
        return null;
      }
      
      console.log('Processing item-update:', {
        content: item.content,
        metadata: item.metadata,
        updateType: item.metadata?.updateType
      });
      return (
        <div
          data-testid={`item-update-${item.metadata?.updateType}`}
          className={`${baseClasses} item-update p-2 px-4 rounded border-l-4 ${
            item.metadata?.updateType === 'acquired'
              ? 'bg-amber-50 border-amber-400'
              : 'bg-gray-50 border-gray-400'
          }`}
        >
          {item.content}
        </div>
      );
      
    default:
      return item.content ? (
        <div className={`${baseClasses} narrative-line`}>{item.content}</div>
      ) : (
        <div className="h-2" />
      );
  }
};
