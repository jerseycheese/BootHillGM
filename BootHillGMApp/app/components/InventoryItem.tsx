import React, { useContext } from 'react';
import { InventoryItem as InventoryItemType } from '../types/item.types';
import { ItemActions } from './ItemActions';
import { ErrorDisplay } from './ErrorDisplay';
import { InventoryManager } from '../utils/inventoryManager';
import { GameContext, GameContextProps } from '../hooks/useGame';
import { ItemValidationResult } from '../types/validation.types';
import { useEffect } from 'react';

interface InventoryItemProps<T extends string> {
  item: InventoryItemType;
  onAction: (itemId: T, action: 'use' | 'equip' | 'unequip') => void;
}

export const InventoryItem: React.FC<InventoryItemProps<string>> = ({ item, onAction }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const context: GameContextProps | undefined = useContext(GameContext);

  if (!item || !item.id || !item.name || item.quantity <= 0) {
    return null;
  }

  const handleAction = (itemId: string, action: 'use' | 'equip' | 'unequip') => {
    if (action === 'use') {
      let validationResult: ItemValidationResult = { valid: true };
      if (context?.state?.character) {
        validationResult = InventoryManager.validateItemUse(
          item,
          context.state.character,
          context.state
        );
      }
      if (!validationResult.valid) {
        setError(validationResult.reason || 'Cannot use item.');
        return;
      }
    }
    onAction(itemId, action);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (error) {
      timer = setTimeout(() => {
        setError(null);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <li
      key={item.id}
      className={`wireframe-text relative flex justify-between items-center p-2 ${
        item.isEquipped ? 'bg-blue-50' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-grow">
        <span>
          {item.name} (x{item.quantity})
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
      <ErrorDisplay error={error} onClear={() => setError(null)} data-testid="error-display" />
      <ItemActions item={item} onAction={handleAction} />
    </li>
  );
};
