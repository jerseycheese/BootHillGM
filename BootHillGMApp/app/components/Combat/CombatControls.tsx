/**
 * CombatControls manages the UI elements for combat turns and actions.
 * Shows turn indicators and attack button based on current game state.
 * Provides visual feedback for current turn and processing states.
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
          {isProcessing ? "Opponent's Turn..." : "Opponent's Turn"}
        </div>
      </div>
      {currentTurn === 'player' && !isProcessing && (
        <button
          data-testid="attack-button"
          className="wireframe-button"
          onClick={onAttack}
        >
          Attack
        </button>
      )}
    </div>
  );
};
