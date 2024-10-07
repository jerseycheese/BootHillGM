// BootHillGMApp/app/components/Inventory.tsx
import React from 'react';
import { useGame } from '../utils/gameEngine';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
}

const Inventory: React.FC = () => {
  // Access the game state and dispatch function
  const { state, dispatch } = useGame();
  const { inventory } = state;

  return (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Inventory</h2>
      {inventory.length === 0 ? (
        <p>Your inventory is empty.</p>
      ) : (
        <ul className="wireframe-list">
          {inventory.map((item: InventoryItem) => (
            <li key={item.id} className="wireframe-text">
              {item.name} (x{item.quantity})
              {/* Button to use the item, dispatches USE_ITEM action */}
              <button 
                onClick={() => dispatch({ type: 'USE_ITEM', payload: item.id })}
                className="wireframe-button ml-2"
              >
                Use
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Inventory;