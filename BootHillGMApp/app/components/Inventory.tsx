import React, { useCallback } from 'react';
import { InventoryList } from './InventoryList';
import ErrorBoundary from './ErrorBoundary';
import { useGameSession } from '../hooks/useGameSession';
// Import from the correct context provider file
import { useInventoryItems } from '../context/GameStateProvider';
import { InventoryItem } from '../types/item.types';

/**
 * Props for the Inventory component.
 * @template T - A string type representing item IDs.
 */
interface InventoryProps<T extends string> {
  /**
   * Callback function triggered when a weapon is equipped.
   * @param itemId The ID of the weapon being equipped.
   */
  handleEquipWeapon?: (itemId: T) => void;
  /**
   * Callback function triggered when a weapon is unequipped.
   * @param itemId The ID of the weapon being unequipped.
   */
  handleUnequipWeapon?: (itemId: T) => void;
  /**
   * Optional array of inventory items to display. If not provided, 
   * items will be fetched from context.
   */
  items?: InventoryItem[];
}

/**
 * Inventory component to display and manage the character's inventory.
 * 
 * Updated to use state selectors pattern for better performance and clarity.
 * Can receive items directly through props or fetch them from context.
 *
 * @param props The component props.
  */
export const Inventory: React.FC<InventoryProps<string>> = ({
  handleEquipWeapon,
  handleUnequipWeapon: onUnequipWeapon,
  items: propItems,
}) => {
  // Use the game session for actions
  const { isUsingItem, isLoading, handleUseItem, error } = useGameSession();
  
  // Use the inventory selector hook to access inventory items
  // This is memoized and will only trigger re-renders when the inventory changes
  const contextItems = useInventoryItems();
  
  // Use items from props if provided, otherwise use from context
  const inventoryItems = propItems || contextItems;
  
  // Debug log

  // Callback handlers for item actions
  const handleEquipWeaponClick = useCallback((itemId: string) => {
    handleEquipWeapon?.(itemId);
  }, [handleEquipWeapon]);

  const handleItemAction = useCallback((itemId: string, action: 'use' | 'equip' | 'unequip') => {
    switch (action) {
      case 'use':
        handleUseItem(itemId);
        break;
      case 'equip':
        handleEquipWeaponClick(itemId);
        break;
      case 'unequip':
        onUnequipWeapon?.(itemId);
        break;
    }
  }, [handleUseItem, handleEquipWeaponClick, onUnequipWeapon]);

  // Filter out items with missing required properties
  const filteredInventory = Array.isArray(inventoryItems) ? 
    inventoryItems.filter(item => item && item.id && item.name && typeof item.quantity === 'number') : 
    [];

  return (
    <ErrorBoundary>
      <div id="bhgmInventory" data-testid="inventory" className="wireframe-section bhgm-inventory">
        <h2 className="wireframe-subtitle">Inventory</h2>
        
        {error && (
          <div className="text-red-600 mb-2" role="alert" data-testid="error-display">
            <span>{typeof error === 'string' ? error : (error as { reason?: string })?.reason || 'Unknown error'}</span>
          </div>
        )}
        
        {filteredInventory.length === 0 ? (
          <p className="wireframe-text mt-2">Your inventory is empty.</p>
        ) : (
          <InventoryList 
            id="bhgmInventoryList" 
            data-testid="inventory-list" 
            items={filteredInventory} 
            onItemAction={handleItemAction} 
            isUsingItem={isUsingItem} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </ErrorBoundary>
  );
};
