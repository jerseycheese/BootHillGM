import React, { useState } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';

/**
 * Inventory component displays and manages the player's inventory.
 * Provides direct item usage through Use buttons and item descriptions on hover.
 * Integrates with CampaignStateManager for state persistence.
 */
const Inventory: React.FC<{
  onUseItem?: (itemId: string) => void;
}> = ({ onUseItem }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { state } = useCampaignState();
  const { inventory } = state;

  /**
   * Processes item usage by dispatching the action through the AI system.
   * Creates a "use [item]" action that gets processed like a player command.
   * Ensures state persistence after item usage.
   */
  const handleUseItem = (itemId: string) => {
    if (onUseItem) {
      onUseItem(itemId);
    }
  };

  return (
    <div className="wireframe-section">
      <div data-debug="inventory-component-root">
        <h2 className="wireframe-subtitle">Inventory</h2>
        {!inventory || inventory.length === 0 ? (
          <p className="wireframe-text">Your inventory is empty.</p>
        ) : (
          <ul className="wireframe-list">
            {inventory?.map((item) => (
              item && item.id && item.name && item.quantity > 0 ? (
                <li 
                  key={item.id} 
                  className="wireframe-text relative flex justify-between items-center p-2"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex-grow">
                    <span>{item.name} (x{item.quantity})</span>
                    {hoveredItem === item.id && item.description && (
                      <div className="absolute z-10 bg-black text-white p-2 rounded shadow-lg mt-1 text-sm">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleUseItem(item.id)}
                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    aria-label={`Use ${item.name}`}
                  >
                    Use
                  </button>
                </li>
              ) : null
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Inventory;
