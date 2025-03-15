// components/Debug/GameControlSection.tsx
import React from "react";
import { GameControlSectionProps } from "../../types/debug.types";
import { initializeTestCombat, resetGame } from "../../utils/debugActions";

/**
 * Game control section providing buttons to reset the game or initialize test combat
 */
const GameControlSection: React.FC<GameControlSectionProps> = ({
  dispatch,
  loading,
  setLoading,
  setError
}) => {

  /**
   * Handles the game reset action
   */
  const handleResetGame = () => {
    setLoading("reset");
    setError(null);
    try {
      dispatch(resetGame());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to reset game: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Initializes a test combat scenario
   */
  const handleTestCombat = async () => {
    setLoading("combat");
    setError(null);
    try {
      dispatch(initializeTestCombat());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to initialize test combat: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleResetGame}
        disabled={loading === "reset"}
      >
        {loading === "reset" ? "Resetting..." : "Reset Game"}
      </button>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleTestCombat}
        disabled={loading === "combat"}
      >
        {loading === "combat" ? "Initializing..." : "Test Combat"}
      </button>
    </div>
  );
};

export default GameControlSection;