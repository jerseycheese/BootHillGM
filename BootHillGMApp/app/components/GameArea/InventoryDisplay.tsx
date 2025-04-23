/**
 * InventoryDisplay Component
 * 
 * Displays and manages the player's inventory items.
 */

import React, { useState } from 'react';
import type { InventoryItem } from '../../types/item.types';
import { ActionTypes } from '../../types/actionTypes';
import type { GameEngineAction } from '../../types/gameActions';

interface InventoryDisplayProps {
  items: InventoryItem[];
  dispatch?: React.Dispatch<GameEngineAction>;
}

/**
 * InventoryDisplay component - shows player inventory and item interactions
 */
export const InventoryDisplay: React.FC<InventoryDisplayProps> = ({
  items,
  dispatch
}) => {
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  
  // Group items by category for organization
  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || 'general';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, InventoryItem[]>);
  
  // Handle item selection
  const selectItem = (item: InventoryItem) => {
    setActiveItem(item);
  };
  
  // Handle item usage
  const handleUseItem = (item: InventoryItem) => { // Renamed function
    if (dispatch) {
      dispatch({
        type: ActionTypes.USE_ITEM,
        payload: item.id
      });
    }
  };
  
  // Handle equipping a weapon
  const equipWeapon = (item: InventoryItem) => {
    if (dispatch && item.category === 'weapon') {
      dispatch({
        type: ActionTypes.EQUIP_WEAPON,
        payload: item.id
      });
    }
  };
  
  // Format display name with quantity
  const getItemDisplayName = (item: InventoryItem) => {
    if (item.quantity && item.quantity > 1) {
      return `${item.name} (${item.quantity})`;
    }
    return item.name;
  };
  
  // Display categories in a specific order
  const categoryOrder = ['weapon', 'consumable', 'key', 'general'];
  const sortedCategories = Object.keys(groupedItems).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );
  
  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1) + 's';
  };
  
  return (
    <div className="inventory-display">
      <h3 className="text-xl font-bold mb-3">Inventory</h3>
      
      {/* Empty inventory state */}
      {items.length === 0 && (
        <div className="text-gray-500 text-center p-4">
          Your inventory is empty
        </div>
      )}
      
      {/* Items organized by category */}
      <div className="inventory-categories">
        {sortedCategories.map(category => (
          <div key={category} className="category-section mb-4">
            <h4 className="font-semibold border-b pb-1 mb-2">
              {formatCategoryName(category)}
            </h4>
            <ul className="item-list" role="list">
              {groupedItems[category].map((item: InventoryItem) => (
                <li 
                  key={item.id}
                  className={`
                    item-entry p-2 mb-1 cursor-pointer rounded hover:bg-gray-100
                    ${activeItem?.id === item.id ? 'bg-blue-50 border border-blue-200' : ''}
                  `}
                  onClick={() => selectItem(item)}
                  data-testid={`inventory-item-${item.id}`}
                  role="listitem"
                >
                  <div className="font-medium">
                    {getItemDisplayName(item)}
                    {item.isEquipped && (
                      <span className="ml-2 text-green-600 text-sm">(Equipped)</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      {/* Item details panel */}
      {activeItem && (
        <div className="item-details mt-4 p-3 bg-gray-50 rounded border">
          <h4 className="font-bold">{activeItem.name}</h4>
          <p className="text-sm my-2">{activeItem.description}</p>
          
          {/* Item actions */}
          <div className="item-actions mt-3 flex gap-2">
            {activeItem.category === 'consumable' && (
              <button
                onClick={() => handleUseItem(activeItem)} // Call renamed function
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                data-testid={`use-item-${activeItem.id}`}
              >
                Use
              </button>
            )}
            
            {activeItem.category === 'weapon' && !activeItem.isEquipped && (
              <button 
                onClick={() => equipWeapon(activeItem)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                data-testid={`equip-item-${activeItem.id}`}
              >
                Equip
              </button>
            )}
            
            {activeItem.category === 'weapon' && activeItem.isEquipped && (
              <button 
                onClick={() => dispatch && dispatch({
                  type: ActionTypes.UNEQUIP_WEAPON,
                  payload: activeItem.id
                })}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                data-testid={`unequip-item-${activeItem.id}`}
              >
                Unequip
              </button>
            )}
            
            <button 
              onClick={() => setActiveItem(null)}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDisplay;
