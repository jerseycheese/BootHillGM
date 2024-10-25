import React from 'react';
import { Character } from '../types/character';

// StatusPanel displays the current character's status information and provides
// game save functionality. It uses a two-column grid layout for better organization
// of information and maintains consistency with the wireframe styling theme.

interface StatusPanelProps {
  character: Character;
  location: string | null;
  onSave: () => void;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ 
  character, 
  location, 
  onSave 
}) => {
  return (
    // Wireframe-styled section with grid layout for organized status display
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Character Status</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-medium">Name: {character.name}</p>
          <p className="font-medium">Location: {location || 'Unknown'}</p>
        </div>
        <div>
          <p className="font-medium">Health: {character.health}</p>
          <button onClick={onSave} className="wireframe-button mt-2">Save Game</button>
        </div>
      </div>
    </div>
  );
};

// Exported for use in GameSession component and for testing
export default StatusPanel;
