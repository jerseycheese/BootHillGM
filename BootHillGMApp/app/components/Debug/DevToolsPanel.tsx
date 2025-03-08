import React, { useState } from "react";
import { GameEngineAction } from "../../types/gameActions";
import { initializeTestCombat, resetGame } from "../../utils/debugActions";
import { useCampaignState } from "../CampaignStateManager";
import { GameState } from "../../types/gameState";

/**
 * DevTools panel for game debugging and testing.
 * Provides functionality to reset the game state and initialize test combat scenarios.
 * Displays the current game state for inspection.
 *
 * @param {GameState} gameState - The current game state.
 * @param {React.Dispatch<GameEngineAction>} dispatch - Dispatch function to trigger game actions.
 */
interface DevToolsPanelProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
  id?: string;
  "data-testid"?: string;
}

const DevToolsPanel: React.FC<DevToolsPanelProps> = ({
  gameState,
  dispatch,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {  } = useCampaignState();

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
    <div className="bg-gray-800 text-white p-4 mt-4">
      <h2 className="text-xl font-bold mb-2">DevTools</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
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
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Game State</h3>
        <ErrorBoundary>
          <pre className="text-xs">{JSON.stringify(gameState, null, 2)}</pre>
        </ErrorBoundary>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in state display:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <p className="text-red-500">Error displaying game state.</p>;
    }
    return this.props.children;
  }
}

export default DevToolsPanel;
