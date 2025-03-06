import React from 'react';
import { InventoryItem as InventoryItemType } from '../types/item.types';
import { ItemActions } from './ItemActions';

interface InventoryItemProps<T extends string> {
  item: InventoryItemType;
  isUsing?: boolean;
  onAction: (itemId: T, action: 'use' | 'equip' | 'unequip') => void;
}

export const InventoryItem: React.FC<InventoryItemProps<string>> = ({ item, onAction, isUsing }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [quantity, setQuantity] = React.useState(item.quantity);
  const [isQuantityUpdated, setIsQuantityUpdated] = React.useState(false);

  React.useEffect(() => {
    if (item.quantity !== quantity) {
      setQuantity(item.quantity);
      setIsQuantityUpdated(true);
      setTimeout(() => setIsQuantityUpdated(false), 500); // Reset after 500ms
    }
  }, [item.quantity, quantity]);

  if (!item || !item.id || !item.name || item.quantity <= 0) {
    return null;
  }

  const handleAction = (itemId: string, action: 'use' | 'equip' | 'unequip') => {
    onAction(itemId, action);
  };

  return (
    <li
      key={item.id}
      id="bhgmInventoryItem"
      data-testid="inventory-item"
      className={`wireframe-text relative flex justify-between items-center p-2 bhgm-inventory-item ${
        item.isEquipped ? 'bg-blue-50' : ''
      } ${isUsing ? 'bg-gray-200' : ''}`} // Add a gray background when isUsing is true
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-grow">
        <span>
          {item.name} (x<span className={`transition-colors duration-500 ${isQuantityUpdated ? 'bg-yellow-200' : ''}`}>{quantity}</span>)
          {item.isEquipped && (
            <span className="ml-2 text-xs text-blue-600">(Equipped)</span>
          )}
          <span className="ml-2 text-xs px-2 py-0.5 bg-gray-200 rounded-full">
            {item.category}
          </span>
        </span>
        {isHovered && item.description && (
          <div className="absolute z-10 bg-black text-white p-2 rounded shadow-lg mt-1 text-sm">
            {item.description}
          </div>
        )}
      </div>
      <ItemActions item={item} onAction={handleAction} isUsing={isUsing} />
    </li>
  );
};
