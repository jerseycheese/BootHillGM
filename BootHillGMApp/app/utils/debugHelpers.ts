import { GameState } from './gameEngine';

export const monitorCombatState = () => {
  let lastState: GameState | null = null;
  
  const checkState = () => {
    const saved = localStorage.getItem('campaignState');
    if (saved) {
      const current = JSON.parse(saved) as GameState;
      if (lastState?.combatState && current.combatState) {
        if (lastState.combatState.playerHealth !== current.combatState.playerHealth) {
          console.log('Combat State Change Detected:', {
            previousHealth: lastState.combatState.playerHealth,
            newHealth: current.combatState.playerHealth,
            timestamp: new Date().toISOString(),
            saved: Boolean(current.savedTimestamp)
          });
        }
      }
      lastState = current;
    }
  };

  const interval = setInterval(checkState, 1000);
  console.log('Combat state monitoring started');
  
  return () => {
    clearInterval(interval);
    console.log('Combat state monitoring stopped');
  };
};
