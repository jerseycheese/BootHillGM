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
    return <LoadingScreen type="session" />;
  }

  return (
    <div className="wireframe-container">
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <MainGameArea {...gameSession} />
        <SidePanel {...gameSession} />
      </div>
    </div>
  );
}
