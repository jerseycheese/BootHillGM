// /app/hooks/initialization/useInitializationTimeout.ts
import { useEffect, useRef } from "react";
import { GameState } from "../../types/gameState";
import { GameEngineAction } from "../../types/gameActions";
import { MAX_INITIALIZATION_TIME, createEmergencyState } from "../../utils/gameInitializationUtils";
import { ActionTypes } from '../../types/actionTypes';

/**
 * Hook to handle initialization timeout and provide emergency recovery
 * Prevents UI from being stuck in loading state indefinitely
 * 
 * @param isInitializing - Boolean flag indicating if initialization is in progress
 * @param initProcessingRef - Reference tracking whether initialization is currently processing
 * @param dispatch - Game state dispatch function
 * @param saveGame - Function to save the game state
 * @returns Object containing timeout reference
 */
export const useInitializationTimeout = (
  isInitializing: boolean,
  initProcessingRef: React.MutableRefObject<boolean>,
  dispatch: React.Dispatch<GameEngineAction> | null,
  saveGame: ((state: GameState) => void) | undefined
): { timeoutIdRef: React.MutableRefObject<NodeJS.Timeout | null> } => {
  // Reference to store the timeout ID for cleanup
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Add a timeout mechanism to prevent infinite loading
  useEffect(() => {
    if (isInitializing && !initProcessingRef.current) {
      initProcessingRef.current = true;

      // Store the timeout ID in the ref so we can clear it if needed
      timeoutIdRef.current = setTimeout(async () => {
        console.error("Game initialization timeout - forcing completion");
        initProcessingRef.current = false;

        // If state is available, dispatch emergency recovery state
        if (dispatch) {
          try {
            // Wait for the emergency state to be created
            const emergencyState = await createEmergencyState();
            
            // Now we have a proper GameState, not a Promise<GameState>
            dispatch({ type: ActionTypes.SET_STATE, payload: emergencyState }); // Use ActionTypes constant

            // Try to save this state
            if (saveGame) {
              saveGame(emergencyState);
            }
          } catch (error) {
            console.error("Failed to apply emergency state:", error);
          }
        }
      }, MAX_INITIALIZATION_TIME);

      return () => {
        // Clear the timeout if the component unmounts or if dependencies change
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        initProcessingRef.current = false;
      };
    }
    
    // No cleanup needed if we're not initializing
    return undefined;
  }, [isInitializing, dispatch, saveGame, initProcessingRef]);

  // Return the timeout ref for external management if needed
  return { timeoutIdRef };
};
