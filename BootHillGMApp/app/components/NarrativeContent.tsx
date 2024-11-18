import { NarrativeItem } from './NarrativeDisplay';

interface NarrativeContentProps {
  item: NarrativeItem;
  processedUpdates: Set<string>;
}

export const NarrativeContent: React.FC<NarrativeContentProps> = ({ 
  item
}) => {
  const baseClasses = 'my-2 py-1';
  
  if (item.type === 'item-update' && item.metadata?.items) {
    
    // Skip if content contains SUGGESTED_ACTIONS
    if (item.content.includes('SUGGESTED_ACTIONS')) {
      return null;
    }
    
    // Normalize items (case and spacing)
    const normalizedItems = item.metadata.items.map(item => 
      item.toLowerCase().trim()
    ).sort();
    
    // Create normalized content for display
    const displayContent = `${item.metadata.updateType === 'acquired' ? 'Acquired' : 'Used/Removed'} Items: ${normalizedItems.join(', ')}`;
    
    return (
      <div
        data-testid={`item-update-${item.metadata.updateType}`}
        className={`${baseClasses} item-update p-2 px-4 rounded border-l-4 ${
          item.metadata.updateType === 'acquired'
            ? 'bg-amber-50 border-amber-400'
            : 'bg-gray-50 border-gray-400'
        }`}
      >
        {displayContent}
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
