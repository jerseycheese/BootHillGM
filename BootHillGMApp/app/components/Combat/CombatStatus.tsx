/**
 * CombatStatus displays health information for both combatants.
 * Shows health values with visual indicators for low health (<=30).
 * Uses a grid layout for clear health status presentation.
 */
import React from 'react';

interface CombatStatusProps {
  playerHealth: number;
  opponentHealth: number;
}

export const CombatStatus: React.FC<CombatStatusProps> = ({
  playerHealth,
  opponentHealth
}) => {
  return (
    <div className="health-bars mb-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="font-medium" data-testid="player-health-label">Player Health: </span>
          <span 
            className={`${playerHealth <= 30 ? 'text-red-600' : ''}`}
            data-testid="player-health-value"
          >
            {playerHealth}
          </span>
        </div>
        <div>
          <span className="font-medium" data-testid="opponent-health-label">Opponent Health: </span>
          <span 
            className={`${opponentHealth <= 30 ? 'text-red-600' : ''}`}
            data-testid="opponent-health-value"
          >
            {opponentHealth}
          </span>
        </div>
      </div>
    </div>
  );
};
