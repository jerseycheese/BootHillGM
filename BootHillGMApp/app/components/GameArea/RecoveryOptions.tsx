import React from 'react';

interface RecoveryOptionsProps {
  onRecover: () => void;
  onRestart: () => void;
  isRecovering: boolean;
}

/**
 * RecoveryOptions Component
 * 
 * Displays recovery buttons for when the game state needs to be reset or restarted.
 * 
 * @param onRecover - Function to recover the game to a working state
 * @param onRestart - Function to completely restart the game
 * @param isRecovering - Whether recovery is in progress
 */
export function RecoveryOptions({
  onRecover,
  onRestart,
  isRecovering
}: RecoveryOptionsProps) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <p className="text-yellow-500">Recovery options:</p>
      <div className="flex gap-4">
        <button 
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          onClick={onRecover}
          disabled={isRecovering}
        >
          {isRecovering ? "Recovering..." : "Recover Game"}
        </button>
        <button 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={onRestart}
          disabled={isRecovering}
        >
          Start New Game
        </button>
      </div>
    </div>
  );
}
