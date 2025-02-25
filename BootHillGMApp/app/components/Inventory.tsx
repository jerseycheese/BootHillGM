import { useState, useCallback, useEffect, useMemo } from 'react';
import { InventoryManager } from '../utils/inventoryManager';
import { useCampaignState } from './CampaignStateManager';
import { ErrorDisplay } from './ErrorDisplay';
import { InventoryList } from './InventoryList';
import { LocationType } from '../services/locationService';
import ErrorBoundary from './ErrorBoundary';

/**
 * Props for the Inventory component.
 * @template T - A string type representing item IDs.
 */
interface InventoryProps<T extends string> {
  /**
   * Callback function triggered when an item is used.
   * @param itemId The ID of the item being used.
   * @param action The action performed on the item (e.g., 'use').
   */
  onUseItem?: (itemId: T, action: string) => void;
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

const ERROR_TIMEOUT = 3000; // milliseconds

/**
 * Inventory component to display and manage the character's inventory.
 *
 * @param props The component props.
 */
export const Inventory: React.FC<InventoryProps<string>> = ({
  onUseItem,
  handleEquipWeapon,
  handleUnequipWeapon: onUnequipWeapon
}) => {
  const { state } = useCampaignState();
  const [error, setError] = useState<string | null>(null);

  /**
   * Standardized error messages for consistent error handling.
   * @type {{ noCharacter: string; unableToUse: string; cannotUse: string }}
   */
  const ERROR_MESSAGES = {
    noCharacter: 'No character available',
    unableToUse: 'Unable to use item',
    cannotUse: 'Cannot use item',
  };

  useEffect(() => {
    if (!state.character) {
      setError(ERROR_MESSAGES.noCharacter);
    }
  }, [state.character, ERROR_MESSAGES.noCharacter]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleUseItem = useCallback((itemId: string) => {
    const item = state.inventory.find(i => i.id === itemId);

    // Use standardized error message
    if (!item || !state.character || state.currentPlayer === null) {
      setError(ERROR_MESSAGES.unableToUse);
      return;
    }

    // Memoize campaignState to avoid unnecessary recalculations.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const campaignState = useMemo(() => {
      // Improved type safety and readability for location
      // If state.location is an object with 'type' and 'name', use it as LocationType.
      // Otherwise, default to { type: 'unknown' }.
      const location: LocationType | { type: 'unknown' } =
        typeof state.location === 'object' && state.location !== null && 'type' in state.location && 'name' in state.location
          ? state.location as LocationType
          : { type: 'unknown' };

      return {
        ...state,
        currentPlayer: state.currentPlayer as string, // Type assertion is safe here as we check for null above
        location: location,
        isCombatActive: Boolean(state.isCombatActive)
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.location, state.currentPlayer, state.isCombatActive]);

    const validation = InventoryManager.validateItemUse(
      item,
      state.character,
      campaignState
    );

    if (!validation.valid) {
      // Use standardized error message or validation reason
      setError(validation.reason || ERROR_MESSAGES.cannotUse);
      setTimeout(clearError, ERROR_TIMEOUT);
      return;
    }

    if (onUseItem) {
      onUseItem(itemId, 'use');
    }
    clearError();
  }, [state, onUseItem, clearError, ERROR_MESSAGES.unableToUse, ERROR_MESSAGES.cannotUse]);

  const handleEquipWeaponClick = useCallback((itemId: string) => {
    if (!state.character) {
      setError(ERROR_MESSAGES.noCharacter);
      return;
    }
    handleEquipWeapon?.(itemId)
  }, [state.character, handleEquipWeapon, ERROR_MESSAGES.noCharacter]);

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

    // Memoize the filtered inventory items
    const filteredInventory = useMemo(() => {
      return state.inventory?.filter(item => item.id && item.name && typeof item.quantity === 'number') || [];
    }, [state.inventory]);

  return (
    <ErrorBoundary>
      <div className="wireframe-section">
        <h2 className="wireframe-subtitle">Inventory</h2>
        <ErrorDisplay error={error} onClear={clearError} />
        <InventoryList items={filteredInventory} onItemAction={handleItemAction} />
      </div>
    </ErrorBoundary>
  );
};
