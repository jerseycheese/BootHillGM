/**
 * Combat UI controls for managing turn-based actions.
 * Shows current turn, handles attack actions, and displays processing states.
 * 
 * Features:
 * - Visual turn indicators
 * - Disabled states during opponent turn or processing
 * - Loading feedback during combat actions
 */
import React from 'react';

interface CombatControlsProps {
  currentTurn: 'player' | 'opponent';
  isProcessing: boolean;
  onAttack: () => void;
}

export const CombatControls: React.FC<CombatControlsProps> = ({
  currentTurn,
  isProcessing,
  onAttack
}) => {
  return (
    <div className="combat-actions">
      <div className="turn-indicator mb-2 flex">
        <div
          data-testid="player-turn-indicator"
          className={`p-2 ${currentTurn === 'player' ? 'bg-green-100 text-black font-bold' : ''}`}
        >
          Player&#39;s Turn
        </div>
        <div
          data-testid="opponent-turn-indicator"
          className={`p-2 ${currentTurn === 'opponent' ? 'bg-green-100 text-black font-bold' : ''}`}
        >
          {isProcessing ? "Processing..." : "Opponent's Turn"}
        </div>
      </div>
      <button
        data-testid="attack-button"
        className={`wireframe-button w-full ${isProcessing || currentTurn !== 'player' ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onAttack}
        disabled={isProcessing || currentTurn !== 'player'}
        aria-disabled={isProcessing || currentTurn !== 'player'}
      >
        {isProcessing ? 'Processing attack...' : 'Attack'}
      </button>
    </div>
  );
};
