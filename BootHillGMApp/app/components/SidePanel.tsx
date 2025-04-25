// SidePanel.tsx
import React, { useState, useCallback } from 'react';
import { useGameState } from '../context/GameStateProvider';
import PlayerCharacter from './Character/PlayerCharacter';
import { getPlayerCharacter } from '../utils/characterUtils';

interface SidePanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * SidePanel component that displays character information and actions
 * Uses GameStateProvider to access game state directly
 */
const SidePanel: React.FC<SidePanelProps> = ({ isOpen = true, onClose }) => {
  const [activeTab, setActiveTab] = useState<'character' | 'inventory' | 'journal'>('character');
  const { state } = useGameState();
  
  // Get player character from state - using helper function to extract from GameState
  const playerCharacter = getPlayerCharacter(state);
  
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Return null if panel is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto z-50">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex space-x-4">
          <button
            className={`px-3 py-1 rounded-md ${
              activeTab === 'character' ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('character')}
          >
            Character
          </button>
          <button
            className={`px-3 py-1 rounded-md ${
              activeTab === 'inventory' ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button
            className={`px-3 py-1 rounded-md ${
              activeTab === 'journal' ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('journal')}
          >
            Journal
          </button>
        </div>
        <button
          className="text-gray-400 hover:text-white focus:outline-none"
          onClick={handleClose}
          aria-label="Close side panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'character' && playerCharacter && (
          <PlayerCharacter character={playerCharacter} />
        )}
        
        {activeTab === 'inventory' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Inventory</h2>
            {playerCharacter?.inventory ? (
              <ul className="space-y-2">
                {playerCharacter.inventory.map((item, index) => (
                  <li key={index} className="p-2 bg-gray-700 rounded-md flex justify-between">
                    <span>{item.name}</span>
                    <span className="text-gray-400">{item.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No items in inventory</p>
            )}
          </div>
        )}
        
        {activeTab === 'journal' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Journal</h2>
            {state.narrative?.narrativeHistory ? (
              <div className="space-y-2 text-sm">
                {state.narrative.narrativeHistory.map((entry, index) => (
                  <p key={index} className="p-2 bg-gray-700 rounded-md">
                    {entry}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No journal entries yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidePanel;