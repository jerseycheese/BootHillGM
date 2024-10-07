import React from 'react';
import { useGame } from '../utils/gameEngine';

const Inventory: React.FC = () => {
  const { state, dispatch } = useGame();
  const { inventory } = state;

  return (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Inventory</h2>
      {inventory && inventory.length === 0 ? (
        <p>Your inventory is empty.</p>
      ) : (
        <ul className="wireframe-list">
          {inventory && inventory.map((item) => (
            <li key={item.id} className="wireframe-text">
              {item.name} (x{item.quantity})
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