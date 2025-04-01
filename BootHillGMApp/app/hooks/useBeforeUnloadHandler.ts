import { useEffect } from 'react';
import { GameState } from '../types/gameState';

/**
 * Hook for handling the beforeunload event to ensure combat state is saved.
 * Ensures that active combat states are not lost when the page is closed or refreshed.
 * 
 * @param {React.MutableRefObject<GameState | null>} stateRef - Reference to the current game state
 */
export const useBeforeUnloadHandler = (stateRef: React.MutableRefObject<GameState | null>) => {
  // Add beforeunload handler for combat state
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentState = stateRef.current;
      if (currentState?.combat?.isActive) {
        // Ensure state is in the new format before saving
        // State is already in the new format, no adaptation needed
        const normalizedState = currentState;
        
        localStorage.setItem('campaignState', JSON.stringify({
          ...normalizedState,
          savedTimestamp: Date.now(),
          isClient: true // Ensure isClient is set to true
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [stateRef]);
};
