import { useCallback } from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import { InventoryList } from './InventoryList';
import ErrorBoundary from './ErrorBoundary';
import { useGameSession } from '../hooks/useGameSession';
// Import from the correct context provider file
import { useInventoryItems } from '../context/GameStateProvider';
// Removed import { useInventoryItems } from '../hooks/stateSelectors';

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
}

/**
 * Inventory component to display and manage the character's inventory.
 * 
 * Updated to use state selectors pattern for better performance and clarity.
 *
 * @param props The component props.
  */
export const Inventory: React.FC<InventoryProps<string>> = ({
  handleEquipWeapon,
  handleUnequipWeapon: onUnequipWeapon,
}) => {
  // Use the game session for actions
  const { retryLastAction, isUsingItem, isLoading, handleUseItem, error } = useGameSession();
  
  // Use the inventory selector hook to access inventory items
  // This is memoized and will only trigger re-renders when the inventory changes
  const inventoryItems = useInventoryItems();

  // Removed log
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
  const filteredInventory = inventoryItems.filter(item => 
    item.id && item.name && typeof item.quantity === 'number'
  );

  return (
    <ErrorBoundary>
      <div id="bhgmInventory" data-testid="inventory" className="wireframe-section bhgm-inventory">
        <h2 className="wireframe-subtitle">Inventory</h2>
        <ErrorDisplay error={error ? { reason: error } : null} onRetry={retryLastAction} />
        <InventoryList 
          id="bhgmInventoryList" 
          data-testid="inventory-list" 
          items={filteredInventory} 
          onItemAction={handleItemAction} 
          isUsingItem={isUsingItem} 
          isLoading={isLoading} 
        />
      </div>
    </ErrorBoundary>
  );
};
