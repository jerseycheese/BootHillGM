import { NarrativeItem } from './NarrativeDisplay';
import { useRef, useEffect } from 'react';

export const NarrativeContent: React.FC<{ item: NarrativeItem }> = ({ item }) => {
  const baseClasses = 'my-2 py-1';
  const processedRef = useRef<Set<string>>(new Set());
  
  if (item.type === 'item-update') {
    // Skip if content contains SUGGESTED_ACTIONS
    if (item.content.includes('SUGGESTED_ACTIONS')) {
      return null;
    }
    
    // Create a unique key for this update
    const updateKey = `${item.type}-${JSON.stringify(item.metadata)}`; // Use metadata instead of content
    
    // Check if we've already processed this exact update
    if (processedRef.current.has(updateKey)) {
      console.log('Skipping duplicate update:', updateKey);
      return null;
    }
    
    // Store this update key
    processedRef.current.add(updateKey);
    
    console.log('Rendering item update:', item.content);
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
      
    default:
      return item.content ? (
        <div className={`${baseClasses} narrative-line`}>{item.content}</div>
      ) : (
        <div className="h-2" />
      );
  }
};
