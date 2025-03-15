// components/Debug/GameStateDisplay.tsx
import React from "react";
import { GameStateDisplayProps } from "../../types/debug.types";
import ErrorBoundary from "../Common/ErrorBoundary";

/**
 * Displays the current game state for debugging purposes
 * Wrapped in an ErrorBoundary to prevent rendering errors from crashing the app
 */
const GameStateDisplay: React.FC<GameStateDisplayProps> = ({ gameState }) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Game State</h3>
      <ErrorBoundary>
        <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(gameState, null, 2)}</pre>
      </ErrorBoundary>
    </div>
  );
};

export default GameStateDisplay;