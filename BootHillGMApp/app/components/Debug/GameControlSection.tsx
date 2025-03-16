// components/Debug/GameControlSection.tsx
import React from "react";
import { GameControlSectionProps } from "../../types/debug.types";
import { initializeTestCombat, resetGame } from "../../utils/debugActions";
import { GameAction } from "../../types/campaign";
import { GameEngineAction } from "../../types/gameActions";

/**
 * Type adapter to convert GameEngineAction to GameAction
 * This is necessary because the two action types have slightly different shapes
 */
function adaptAction(action: GameEngineAction): GameAction {
  // Handle specific type conversions here
  if (action.type === "SET_LOCATION" && typeof action.payload !== "string") {
    // Convert LocationType to string if needed
    return {
      type: "SET_LOCATION",
      payload: action.payload.type 
    };
  }
  
  // For SET_STATE actions, they should be compatible already
  if (action.type === "SET_STATE") {
    return action as unknown as GameAction;
  }
  
  // For other actions, cast as unknown and then to GameAction
  return action as unknown as GameAction;
}

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
      // Use the adapter to convert GameEngineAction to GameAction
      dispatch(adaptAction(resetGame()));
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
      // Use the adapter to convert GameEngineAction to GameAction
      dispatch(adaptAction(initializeTestCombat()));
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
