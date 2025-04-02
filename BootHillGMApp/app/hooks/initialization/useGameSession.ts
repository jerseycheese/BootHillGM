// /app/hooks/initialization/useGameSession.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { GameState } from "../../types/gameState";
import { useGameState } from "../../context/GameStateProvider";
import { useCampaignStatePersistence } from "../useCampaignStatePersistence";
import { useInitializationTimeout } from "./useInitializationTimeout";
import { useInitializationStrategies } from "./useInitializationStrategies";
import { GameEngineAction } from "../../types/gameActions";

/**
 * Hook for handling game session initialization
 * Responsible for initializing or restoring a game session based on current state
 * 
 * @returns Object containing initialization state flags
 */
export const useGameSession = (): { isInitializing: boolean; isClient: boolean } => {
  const { state, dispatch } = useGameState();
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [initializationAttempts, setInitializationAttempts] = useState<number>(0);

  // Use refs to prevent infinite re-renders
  const lastSavedTimestampRef = useRef<number | undefined>(state?.savedTimestamp);
  const initProcessingRef = useRef<boolean>(false);
  const hasInitializedRef = useRef<boolean>(false);

  // Use the persistence hook to get the saveGame function
  const { saveGame } = useCampaignStatePersistence(
    isInitializing,
    hasInitializedRef,
    dispatch as React.Dispatch<GameEngineAction>
  );

  // Get initialization strategies
  const {
    initializeNewCharacter,
    generateNewSuggestions,
    initializeExistingCharacter,
    handleErrorRecovery,
    createEmergencyState
  } = useInitializationStrategies();

  // Setup timeout handling
  useInitializationTimeout(isInitializing, initProcessingRef, dispatch as React.Dispatch<GameEngineAction>, saveGame);

  // Handle initial client-side setup
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * Main function to initialize or restore a game session
   * Handles different initialization scenarios and applies appropriate strategies
   * 
   * @returns Initialized or restored game state, or null if initialization cannot proceed
   */
  const initializeGameSession = useCallback(
    async (): Promise<GameState | null> => {
      if (!state || !dispatch) return null;

      setIsInitializing(true);
      setInitializationAttempts(prev => prev + 1);

      try {
        // Fail-safe: If we've made too many attempts, use emergency state
        if (initializationAttempts > 2) {
          console.warn("Too many initialization attempts, using emergency state");
          return createEmergencyState();
        }

        const lastCharacterJSON = localStorage.getItem("character-creation-progress");
        let characterData = null;

        if (lastCharacterJSON) {
          try {
            const parsedData = JSON.parse(lastCharacterJSON);
            characterData = parsedData.character;
          } catch (e) {
            console.error("Failed to parse character data:", e);
          }
        }

        // New character initialization
        if (sessionStorage.getItem("initializing_new_character")) {
          sessionStorage.removeItem("initializing_new_character");
          return await initializeNewCharacter(characterData);
        }

        // Use existing state if available (just needs suggestions)
        if (state.narrative && state.narrative.currentStoryPoint !== null) {
          if (!state.suggestedActions?.length) {
            // If we need to generate new suggestions for existing state
            return await generateNewSuggestions(state);
          }
          return state;
        }

        // Initialize state for existing character
        return await initializeExistingCharacter(state);
      } catch (error) {
        // Handle errors gracefully with fallback suggestions
        console.error("Error initializing game session:", error);
        return handleErrorRecovery(state);
      } finally {
        setIsInitializing(false);
      }
    },
    [
      state,
      dispatch,
      initializationAttempts,
      setInitializationAttempts,
      createEmergencyState,
      initializeNewCharacter,
      generateNewSuggestions,
      initializeExistingCharacter,
      handleErrorRecovery
    ]
  );

  /**
   * Effect to manage game initialization lifecycle
   * Detects when initialization is needed and executes the initialization process
   */
  useEffect(() => {
    const initGame = async (): Promise<void> => {
      // Skip if already processing, not client-ready, or missing dependencies
      if (initProcessingRef.current || !isClient || !state || !dispatch || hasInitializedRef.current) {
        return;
      }

      // Prevent re-entrant calls
      if (isInitializing) {
        return;
      }

      // Check if we need to initialize
      const needsInit = !state.character?.player || state.savedTimestamp !== lastSavedTimestampRef.current;
      if (!needsInit) {
        return;
      }

      initProcessingRef.current = true;

      try {
        const initializedState = await initializeGameSession();
        if (initializedState) {
          // Update the timestamp ref before dispatching the state update
          lastSavedTimestampRef.current = initializedState.savedTimestamp;
          hasInitializedRef.current = true;

          // Wrap dispatch in requestAnimationFrame to avoid render phase updates
          requestAnimationFrame(() => {
            try {
              // We know initializedState is a proper GameState at this point
              dispatch({ type: 'SET_STATE', payload: initializedState });

              // Add safety check before saving
              if (saveGame) {
                saveGame(initializedState);
              }
            } catch (dispatchError) {
              console.error("Error dispatching initialized state:", dispatchError);
            } finally {
              initProcessingRef.current = false;
            }
          });
        } else {
          console.error("Game initialization failed - no state returned");
          initProcessingRef.current = false;
        }
      } catch (initError) {
        console.error("Error during initGame execution:", initError);
        initProcessingRef.current = false;
      }
    };

    initGame();
  }, [
    isClient,
    isInitializing,
    state,
    dispatch,
    saveGame,
    initializeGameSession,
    lastSavedTimestampRef,
    hasInitializedRef,
    initProcessingRef
  ]);

  return { isInitializing, isClient };
};
