/**
 * Main game session container that orchestrates the game's UI components.
 * Uses a two-column layout with the main game area and side panel.
 * Handles initialization checks and loading states before rendering the game interface.
 */
import { useGameInitialization } from '../hooks/useGameInitialization';
import { useGameSession } from '../hooks/useGameSession';
import { MainGameArea } from './GameArea/MainGameArea';
import { SidePanel } from './GameArea/SidePanel';
import { LoadingScreen } from './GameArea/LoadingScreen';

export default function GameSession() {
  const { isInitializing, isClient } = useGameInitialization();
  const gameSession = useGameSession();
  const { state } = gameSession;

  // Show loading screen until game state is fully initialized
  if (!isClient || !state || !state.character || isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div className="wireframe-container">
      <div className="h-full grid grid-cols-[1fr_300px] gap-4">
        <MainGameArea {...gameSession} />
        <SidePanel {...gameSession} />
      </div>
    </div>
  );
}
