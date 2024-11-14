import React from 'react';
import { Character } from '../types/character';

// StatusPanel displays the current character's status information
// and maintains consistency with the wireframe styling theme.

interface StatusPanelProps {
  character: Character;
  location: string | null;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ 
  character, 
  location 
}) => {
  return (
    // Wireframe-styled section with grid layout for organized status display
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Character Status</h2>
      <div>
        <p className="font-medium">Name: {character.name}</p>
        <p className="font-medium">Location: {location || 'Unknown'}</p>
      </div>
    </div>
  );
};

// Exported for use in GameSession component and for testing
export default StatusPanel;
