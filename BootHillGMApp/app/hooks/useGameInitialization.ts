import { useCallback, useEffect, useState } from "react";
import { useCampaignState } from "../components/CampaignStateManager";
import { initialGameState } from "../types/gameState";
import { getAIResponse } from "../services/ai/gameService";
import { INITIAL_INVENTORY } from "../utils/constants";
import { StoryPointType, NarrativeDisplayMode, NarrativeState } from "../types/narrative.types";

// Hook to handle game session initialization and state management
export const useGameInitialization = () => {
  const { state, dispatch, saveGame } = useCampaignState();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Handle initial client-side setup and cleanup
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * Initializes or restores a game session with AI-generated suggested actions.
   * Handles three scenarios:
   * 1. New character initialization
   * 2. Existing state restoration
   * 3. Continuing an active session
   */
  const initializeGameSession = useCallback(
    async () => {
      if (!state || !dispatch) return null;

      setIsInitializing(true);

      try {
        const lastCharacterJSON = localStorage.getItem(
          "character-creation-progress"
        );
        const characterData = lastCharacterJSON
          ? JSON.parse(lastCharacterJSON).character
          : null;

        // New character initialization
        if (sessionStorage.getItem("initializing_new_character")) {
          sessionStorage.removeItem("initializing_new_character");

          const startingInventory = INITIAL_INVENTORY;

          // Generate initial narrative and actions considering character background
          const response = await getAIResponse(
            `Initialize a new game session for ${characterData?.name}. 
          Describe their current situation and location in detail.
          Consider the character's background.
          Include suggestions for what they might do next.`,
            "",
            startingInventory // Pass starting inventory to AI for context
          );

          const initialState = {
            ...initialGameState,
            currentPlayer: characterData?.name || "", // Set currentPlayer to character's name
            character: characterData,
            narrative: {
              currentStoryPoint: {
                id: 'intro', // A unique ID for the initial story point
                type: 'exposition' as StoryPointType, // Use the StoryPointType
                title: 'Introduction', // A title
                content: response.narrative, // The narrative text from the AI
                choices: [], // No choices initially
              },
              availableChoices: [],
              visitedPoints: ['intro'],
              narrativeHistory: [response.narrative],
              displayMode: 'standard' as NarrativeDisplayMode, // Assuming a default display mode, with type assertion
            },
            location: response.location || { type: 'unknown' }, // Use a default LocationType object
            inventory: startingInventory,
            savedTimestamp: Date.now(),
            isClient: true,
            suggestedActions: response.suggestedActions || [],
          };

          return initialState;
        }

        // Use existing state if available
        if (state.narrative && state.narrative.currentStoryPoint !== null) {
          if (!state.suggestedActions?.length) {
            // If we need to generate new suggestions for existing state
            const response = await getAIResponse(
              `Based on the current situation, what are some actions ${
                state.character?.name || "the player"
              } might take?`,
              state.narrative.currentStoryPoint?.content || "",
              state.inventory || []
            );

            return {
              ...state,
              suggestedActions: response.suggestedActions || [],
            };
          }
          return state;
        }

        // Initialize state for existing character
        const response = await getAIResponse(
          `Initialize a new game session for ${
            state.character?.name || "Unknown"
          }. 
        Provide a detailed introduction to the character's current situation.
        Consider their background, and circumstances.
        Include clear suggestions for what they might do next.
        Ensure to explicitly state their current location.`,
          "",
          state.inventory || []
        );
        const existingCharacterNarrative: NarrativeState = {
          currentStoryPoint: {
            id: 'resume', // A unique ID for the resume story point
            type: 'exposition' as StoryPointType,
            title: 'Resuming Game',
            content: response.narrative,
            choices: [],
          },
          availableChoices: [],
          visitedPoints: [], // We don't know the visited points here
          narrativeHistory: [response.narrative], // Add to history
          displayMode: 'standard' as NarrativeDisplayMode,
        }

        return {
          ...state,
          narrative: existingCharacterNarrative,
          location: response.location || { type: 'unknown' }, // Use a default LocationType object
          inventory: INITIAL_INVENTORY,
          savedTimestamp: Date.now(),
          isClient: true,
          suggestedActions: response.suggestedActions || [],
        };
      } catch {
        // Handle errors gracefully with fallback suggestions
        try {
          const fallbackResponse = await getAIResponse(
            "What are some basic actions the player could take right now?",
            state.narrative.currentStoryPoint?.content || "",
            state.inventory || []
          );
          return {
            ...state,
            suggestedActions: fallbackResponse.suggestedActions || [],
          };
        } catch {
          return state;
        }
      } finally {
        setIsInitializing(false);
      }
    },
    [state, dispatch]
  );

    // Manage game initialization lifecycle
    useEffect(() => {
        let lastSavedTimestamp = state?.savedTimestamp;

        const initGame = async () => {
            if (!isClient || !state || !dispatch) {
                return;
            }

            // Prevent re-entrant calls
            if (isInitializing) {
                return;
            }

            // Only initialize if there's no character yet or the timestamp has changed
            if (!state.character || state.savedTimestamp !== lastSavedTimestamp) {
                const initializedState = await initializeGameSession();
                if (initializedState) {
                    // Update the timestamp *before* dispatching the state update
                    lastSavedTimestamp = initializedState.savedTimestamp;
                    dispatch({ type: 'SET_STATE', payload: initializedState });
                    saveGame(initializedState);
                }
            }
        };

        initGame();
    }, [isClient, isInitializing, state, dispatch, saveGame, initializeGameSession, ]);
    // The above dependencies are carefully considered.  `initializeGameSession` is included
    // because it's a useCallback that depends on `state` and `dispatch`. `state` is *not*
    // included directly to prevent unnecessary re-renders. `isClient`, `dispatch`, and
    // `saveGame` are stable and won't cause unnecessary re-renders.

    return { isInitializing, isClient };
};
