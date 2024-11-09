import { NarrativeItem } from './NarrativeDisplay';

export const NarrativeContent: React.FC<{ item: NarrativeItem }> = ({ item }) => {
  const baseClasses = 'my-2 py-1';
  
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