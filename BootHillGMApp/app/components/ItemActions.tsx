import React from 'react';
import { InventoryItem } from '../types/item.types';

interface ItemActionsProps<T extends string> {
  item: InventoryItem;
  onAction: (itemId: T, action: 'use' | 'equip' | 'unequip') => void;
  isUsing?: boolean;
}

export const ItemActions: React.FC<ItemActionsProps<string>> = ({ item, onAction, isUsing }) => {
  return (
    <div className="flex gap-2">
      {isUsing ? (
        <span className="px-3 py-1 text-sm">Using...</span>
      ) : (
        <>
          {item.category === 'weapon' && (
            item.isEquipped ? (
              <button
                onClick={() => onAction(item.id, 'unequip')}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                aria-label={`Unequip ${item.name}`}
                disabled={isUsing}
              >
                Unequip
              </button>
            ) : (
              <button
                onClick={() => onAction(item.id, 'equip')}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                aria-label={`Equip ${item.name}`}
                disabled={isUsing}
              >
                Equip
              </button>
            )
          )}
          <button
            onClick={() => {
              onAction(item.id, 'use');
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            aria-label={`Use ${item.name}`}
            disabled={isUsing}
          >
            Use
          </button>
        </>
      )}
    </div>
  );
};
