import { useGameInitialization } from '../hooks/useGameInitialization';
import { useGameSession } from '../hooks/useGameSession';
import { useCombatStateRestoration } from '../hooks/useCombatStateRestoration';
import { LoadingScreen } from './GameArea/LoadingScreen';
import { MainGameArea } from './GameArea/MainGameArea';
import { SidePanel } from './GameArea/SidePanel';

export default function GameSession() {
  const { isInitializing, isClient } = useGameInitialization();
  const gameSession = useGameSession();
  const { state } = gameSession;

  useCombatStateRestoration(state, gameSession);

  if (!isClient || !gameSession || !state || !state.character || isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div className="wireframe-container">
      <h1 className="wireframe-title">Game Session</h1>
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <MainGameArea {...gameSession} />
        <SidePanel {...gameSession} />
      </div>
      {process.env.NODE_ENV === 'development' && (
        <button 
          onClick={() => console.log('Game State:', state)} 
          className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded"
        >
          Debug State
        </button>
      )}
    </div>
  );
}
