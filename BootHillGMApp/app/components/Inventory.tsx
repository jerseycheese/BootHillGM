import { useState, useCallback } from 'react';
import { InventoryManager } from '../utils/inventoryManager';
import { useCampaignState } from './CampaignStateManager';

/**
 * Displays and manages the player's inventory with:
 * - Item usage validation based on character stats and game state
 * - Visual feedback for usage restrictions
 * - Hover descriptions for items
 * - Automatic error message clearing
 */
interface InventoryProps {
  onUseItem?: (itemId: string) => void;
  handleEquipWeapon?: (itemId: string) => void;
  handleUnequipWeapon?: (itemId: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ 
  onUseItem,
  handleEquipWeapon,
  handleUnequipWeapon: onUnequipWeapon
}) => {
  const { state } = useCampaignState();
  const [error, setError] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleUseItem = useCallback((itemId: string) => {
    const item = state.inventory.find(i => i.id === itemId);
    
    if (!item || !state.character) {
      setError('Unable to use item');
      return;
    }

    const validation = InventoryManager.validateItemUse(
      item,
      state.character,
      state
    );

    if (!validation.valid) {
      setError(validation.reason || 'Cannot use item');
      setTimeout(clearError, 3000);
      return;
    }

    if (onUseItem) {
      onUseItem(itemId);
    }
    clearError();
  }, [state, onUseItem, clearError]);

  const handleEquipWeaponClick = useCallback((itemId: string) => {
    if (!state.character) {
      setError('No character available');
      return;
    }
    handleEquipWeapon?.(itemId);
  }, [state.character, handleEquipWeapon]);

  return (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Inventory</h2>
      {error && (
        <div 
          className="text-red-600 mb-2" 
          role="alert" 
          data-testid="inventory-error"
        >
          {error}
        </div>
      )}
      <ul className="wireframe-list">
        {state.inventory?.map((item) => (
          item && item.id && item.name && item.quantity > 0 ? (
            <li 
              key={item.id} 
              className={`wireframe-text relative flex justify-between items-center p-2 ${
                item.isEquipped ? 'bg-blue-50' : ''
              }`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
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
                {hoveredItem === item.id && item.description && (
                  <div className="absolute z-10 bg-black text-white p-2 rounded shadow-lg mt-1 text-sm">
                    {item.description}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {item.category === 'weapon' && (
                  item.isEquipped ? (
                    <button
                      onClick={() => onUnequipWeapon?.(item.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      aria-label={`Unequip ${item.name}`}
                    >
                      Unequip
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEquipWeaponClick(item.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      aria-label={`Equip ${item.name}`}
                    >
                      Equip
                    </button>
                  )
                )}
                <button
                  onClick={() => handleUseItem(item.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  aria-label={`Use ${item.name}`}
                >
                  Use
                </button>
              </div>
            </li>
          ) : null
        ))}
      </ul>
      {(!state.inventory || state.inventory.length === 0) && (
        <p className="wireframe-text">Your inventory is empty.</p>
      )}
    </div>
  );
};
