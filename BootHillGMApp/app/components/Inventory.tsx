import React, { useState } from 'react';
import { useGame } from '../utils/gameEngine';

const Inventory: React.FC = () => {
  const { state } = useGame();
  const { inventory } = state;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Inventory</h2>
      {inventory && inventory.length === 0 ? (
        <p>Your inventory is empty.</p>
      ) : (
        <ul className="wireframe-list">
          {inventory && inventory.map((item) => (
            <li 
              key={item.id} 
              className="wireframe-text relative"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span>{item.name} (x{item.quantity})</span>
              {hoveredItem === item.id && <div className="item-description">{item.description}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Inventory;
