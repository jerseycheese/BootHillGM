import { useCallback, useMemo } from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import { InventoryList } from './InventoryList';
import ErrorBoundary from './ErrorBoundary';
import { useGameSession } from '../hooks/useGameSession';

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
 * @param props The component props.
  */
export const Inventory: React.FC<InventoryProps<string>> = ({
  handleEquipWeapon,
  handleUnequipWeapon: onUnequipWeapon,
}) => {
  const { state, retryLastAction, isUsingItem, isLoading, handleUseItem, error } = useGameSession();

  const handleEquipWeaponClick = useCallback((itemId: string) => {
    handleEquipWeapon?.(itemId)
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

    const filteredInventory = useMemo(() => {
      return state.inventory?.filter(item => item.id && item.name && typeof item.quantity === 'number') || [];
    }, [state.inventory]);

  return (
    <ErrorBoundary>
      <div id="bhgmInventory" data-testid="inventory" className="wireframe-section bhgm-inventory">
        <h2 className="wireframe-subtitle">Inventory</h2>
        <ErrorDisplay error={error ? { reason: error } : null} onRetry={retryLastAction} />
        <InventoryList id="bhgmInventoryList" data-testid="inventory-list" items={filteredInventory} onItemAction={handleItemAction} isUsingItem={isUsingItem} isLoading={isLoading} />
      </div>
    </ErrorBoundary>
  );
};
