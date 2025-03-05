import React from 'react';
import { InventoryItem } from './InventoryItem';
import { InventoryItem as InventoryItemType } from '../types/item.types';

interface InventoryListProps {
  items: InventoryItemType[];
  onItemAction: (itemId: string, action: 'use' | 'equip' | 'unequip') => void;
  isUsingItem: (itemId: string) => boolean;
  isLoading: boolean;
}

export const InventoryList: React.FC<InventoryListProps> = ({ items, onItemAction, isUsingItem }) => {
  if (!items || items.length === 0) {
    return <p className="wireframe-text">Your inventory is empty.</p>;
  }

  return (
    <ul className="wireframe-list">
      {items.map((item) => (
        <InventoryItem key={item.id} item={item} onAction={(itemId, action) => onItemAction(itemId, action)} isUsing={isUsingItem(item.id)} />
      ))}
    </ul>
  );
};
