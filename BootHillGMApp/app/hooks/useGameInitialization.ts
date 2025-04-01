import { useCallback, useEffect, useState, useRef } from "react";
import { useGameState } from "../context/GameStateProvider"; // Updated import
import { initialGameState } from "../types/gameState";
import { getAIResponse } from "../services/ai/gameService";
import { StoryPointType, NarrativeDisplayMode, NarrativeState } from "../types/narrative.types";
import { InventoryState } from "../types/state/inventoryState";
import { InventoryItem } from "../types/item.types";
import { GameState } from "../types/gameState";
import { GameEngineAction } from '../types/gameActions';
import { getStartingInventory } from "../utils/startingInventory";
import { LocationType } from "../services/locationService";

import { useCampaignStatePersistence } from './useCampaignStatePersistence';
// Helper function to extract items from inventory state or return as-is if it's an array
const getItemsFromInventory = (inventory: InventoryState | InventoryItem[] | undefined): InventoryItem[] => {
  if (!inventory) return [];
  if (Array.isArray(inventory)) return inventory;
  return inventory.items || [];
};

// Helper function to create an inventory state from items
const createInventoryState = (items: InventoryItem[]): InventoryState => {
  return { items };
};

// Helper function to create a properly typed location object
const createLocation = (type: string, name: string): LocationType => {
  // Handle known location types
  if (type === 'town') {
    return { type: 'town' as const, name };
  } else if (type === 'wilderness') {
    return { type: 'wilderness' as const, description: name };
  } else if (type === 'landmark') {
    return { type: 'landmark' as const, name };
  } else {
    // Default to unknown if type doesn't match known types
    return { type: 'unknown' as const };
  }
};

// Helper function to process location from AI response
const processLocation = (location: unknown): LocationType => {
  if (!location) return { type: 'unknown' as const };

  if (typeof location === 'object' && location !== null) {
    // Check if 'type' exists and is a string
    const typeValue = 'type' in location && typeof location.type === 'string' ? location.type : '';
    const locationType = typeValue.toLowerCase();

    // Check if 'name' exists and is a string
    const name = 'name' in location && typeof location.name === 'string' ? location.name : 'Unknown';

    return createLocation(locationType, name);
  }

  return { type: 'unknown' as const };
};

// Maximum time to wait for initialization before forcing completion
const MAX_INITIALIZATION_TIME = 10000; // 10 seconds

// Hook to handle game session initialization and state management
export const useGameInitialization = () => {
  const { state, dispatch } = useGameState(); // Use correct hook
  const [isInitializing, setIsInitializing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [initializationAttempts, setInitializationAttempts] = useState(0);

  // Use refs to prevent infinite re-renders
  const lastSavedTimestampRef = useRef<number | undefined>(state?.savedTimestamp);
  const initProcessingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  // Use the persistence hook to get the saveGame function
  const { saveGame } = useCampaignStatePersistence(isInitializing, hasInitializedRef, dispatch as React.Dispatch<GameEngineAction>); // Cast dispatch type
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Handle initial client-side setup and cleanup
  useEffect(() => {
    setIsClient(true);

    // Cleanup function
    return () => {
      // Clear any pending timeouts when component unmounts
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, []);

  // Create a function to generate emergency recovery state
  const createEmergencyState = useCallback(() => {
    console.warn("Creating emergency recovery state"); // Keep warn

    // Removed normalizeState call
    return {
      ...initialGameState,
      character: {
        player: {
          id: `emergency_${Date.now()}`,
          name: "Traveler",
          attributes: {
            speed: 10, gunAccuracy: 10, throwingAccuracy: 10,
            strength: 10, baseStrength: 10, bravery: 10, experience: 5
          },
          minAttributes: {
            speed: 1, gunAccuracy: 1, throwingAccuracy: 1,
            strength: 1, baseStrength: 1, bravery: 1, experience: 0
          },
          maxAttributes: {
            speed: 20, gunAccuracy: 20, throwingAccuracy: 20,
            strength: 20, baseStrength: 20, bravery: 20, experience: 10
          },
          isNPC: false,
          isPlayer: true,
          wounds: [],
          isUnconscious: false,
          inventory: { items: [] }
        },
        opponent: null
      },
      narrative: {
        currentStoryPoint: {
          id: 'emergency',
          type: 'exposition' as StoryPointType,
          title: 'Emergency Start',
          content: "You find yourself in Boothill with a fresh start ahead of you.",
          choices: [],
        },
        availableChoices: [],
        visitedPoints: ['emergency'],
        narrativeHistory: ["You find yourself in Boothill with a fresh start ahead of you."],
        displayMode: 'standard' as NarrativeDisplayMode,
        context: "", // Add missing context property
      },
      inventory: createInventoryState(getStartingInventory()),
      location: { type: 'town' as const, name: 'Boothill' },
      savedTimestamp: Date.now(),
      isClient: true,
      suggestedActions: [
        { id: 'emergency-1', title: "Look around", description: "Get your bearings", type: 'optional' },
        { id: 'emergency-2', title: "Find the sheriff", description: "Learn about the town", type: 'optional' },
        { id: 'emergency-3', title: "Visit the general store", description: "Buy supplies", type: 'optional' }
      ]
    } as GameState; // Add closing brace and type assertion
  }, []); // Removed initialGameState dependency

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
      setInitializationAttempts(prev => prev + 1);

      try {
        // Fail-safe: If we've made too many attempts, use emergency state
        if (initializationAttempts > 2) {
          console.warn("Too many initialization attempts, using emergency state"); // Keep warn
          return createEmergencyState();
        }

        const lastCharacterJSON = localStorage.getItem(
          "character-creation-progress"
        );

        let characterData = null;


        if (lastCharacterJSON) {
          try {
            const parsedData = JSON.parse(lastCharacterJSON);
            characterData = parsedData.character;
          } catch (e) {
            console.error("Failed to parse character data:", e); // Keep error log
          }
        }

        // New character initialization
        if (sessionStorage.getItem("initializing_new_character")) {
          sessionStorage.removeItem("initializing_new_character");

          const startingInventory = getStartingInventory();

          try {
            // Generate initial narrative and actions considering character background
            const response = await getAIResponse(
              `Initialize a new game session for ${characterData?.name || 'the player'}.
            Describe their current situation and location in detail.
            Consider the character's background.
            Include suggestions for what they might do next.`,
              "",
              startingInventory // Pass starting inventory items to AI for context
            );

            // Save the initial narrative to localStorage for reset functionality
            localStorage.setItem("initial-narrative", JSON.stringify({ narrative: response.narrative }));

            // Save the initial suggested actions for reset functionality
            if (response.suggestedActions && response.suggestedActions.length > 0) {
              const savedGameState = localStorage.getItem("saved-game-state");
              const gameState = savedGameState ? JSON.parse(savedGameState) : {};
              gameState.suggestedActions = response.suggestedActions;
              localStorage.setItem("saved-game-state", JSON.stringify(gameState));
            }

            // Process the location to ensure it has the correct type
            const processedLocation = processLocation(response.location);

            const initialState = {
              ...initialGameState,
              currentPlayer: characterData?.name || "", // Set currentPlayer to character's name
              character: {
                player: characterData,
                opponent: null
              },
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
              location: processedLocation, // Use the processed location with proper type
              inventory: createInventoryState(startingInventory),
              savedTimestamp: Date.now(),
              isClient: true,
              suggestedActions: response.suggestedActions || [],
            };

            // Removed normalizeState call
            return initialState;
          } catch (error) {
            console.error("Error in new character initialization:", error); // Keep error log

            // Fallback for new character if AI fails
            const fallbackNarrative = `${characterData?.name || 'You'} arrive in the dusty town of Boothill, ready to make your mark on the frontier.`;

            // Save fallback narrative for reset
            localStorage.setItem("initial-narrative", JSON.stringify({ narrative: fallbackNarrative }));

            const fallbackInitialState = {
              ...initialGameState,
              currentPlayer: characterData?.name || "",
              character: {
                player: characterData,
                opponent: null
              },
              narrative: {
                currentStoryPoint: {
                  id: 'intro_fallback',
                  type: 'exposition' as StoryPointType,
                  title: 'Introduction',
                  content: fallbackNarrative,
                  choices: [],
                },
                availableChoices: [],
                visitedPoints: ['intro_fallback'],
                narrativeHistory: [fallbackNarrative],
                displayMode: 'standard' as NarrativeDisplayMode,
              },
              location: { type: 'town' as const, name: 'Boothill' },
              inventory: createInventoryState(getStartingInventory()),
              savedTimestamp: Date.now(),
              isClient: true,
              suggestedActions: [
                { id: 'fallback-init-1', title: "Explore the town", description: "Get to know Boothill", type: 'optional' },
                { id: 'fallback-init-2', title: "Visit the saloon", description: "Find information and refreshment", type: 'optional' },
                { id: 'fallback-init-3', title: "Look for work", description: "Earn some money", type: 'optional' }
              ]
            };

            // Removed normalizeState call
            return fallbackInitialState;
          }
        }

        // Use existing state if available
        if (state.narrative && state.narrative.currentStoryPoint !== null) {

          if (!state.suggestedActions?.length) {
            // If we need to generate new suggestions for existing state
            try {
              const currentContent = state.narrative.currentStoryPoint?.content ||
                                    (state.narrative.narrativeHistory && state.narrative.narrativeHistory.length > 0
                                     ? state.narrative.narrativeHistory[state.narrative.narrativeHistory.length - 1]
                                     : "");

              const response = await getAIResponse(
                `Based on the current situation, what are some actions ${
                  state.character?.player?.name || "the player"
                } might take?`,
                currentContent,
                getItemsFromInventory(state.inventory) // Extract items from inventory
              );

              // Removed normalizeState call
              return {
                ...state,
                suggestedActions: response.suggestedActions || [],
              } as GameState; // Add closing brace and type assertion
            } catch (error) {
              console.error("Error generating suggestions for existing state:", error); // Keep error log

              // Fallback suggestions
              // Removed normalizeState call
              return {
                ...state,
                suggestedActions: [
                  { id: 'fallback-existing-1', title: "Look around", description: "Survey your surroundings", type: 'optional' },
                  { id: 'fallback-existing-2', title: "Continue forward", description: "Proceed with your journey", type: 'optional' },
                  { id: 'fallback-existing-3', title: "Check your inventory", description: "See what you're carrying", type: 'optional' }
                ]
              } as GameState; // Add closing brace and type assertion
            }
          }
          return state;
        }

        // Initialize state for existing character
        try {
          const response = await getAIResponse(
            `Initialize a new game session for ${
              state.character?.player?.name || "Unknown"
            }.
          Provide a detailed introduction to the character's current situation.
          Consider their background, and circumstances.
          Include clear suggestions for what they might do next.
          Ensure to explicitly state their current location.`,
            "",
            getItemsFromInventory(state.inventory) // Extract items from inventory
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
            context: "", // Add missing context property
          };

          // Process the location to ensure it has the correct type
          const processedLocation = processLocation(response.location);

          // Removed normalizeState call
          return {
            ...state,
            narrative: existingCharacterNarrative,
            location: processedLocation, // Use the processed location with proper type
            inventory: createInventoryState(getStartingInventory()),
            savedTimestamp: Date.now(),
            isClient: true,
            suggestedActions: response.suggestedActions || [],
          } as GameState; // Add closing brace and type assertion
        } catch (error) {
          console.error("Error initializing existing character state:", error); // Keep error log

          // Fallback for existing character
          const fallbackNarrative = `${state.character?.player?.name || 'You'} continue your journey through the western frontier.`;

          const fallbackNarrativeState: NarrativeState = {
            currentStoryPoint: {
              id: 'resume_fallback',
              type: 'exposition' as StoryPointType,
              title: 'Resuming Game',
              content: fallbackNarrative,
              choices: [],
            },
            availableChoices: [],
            visitedPoints: ['resume_fallback'],
            narrativeHistory: [fallbackNarrative],
            displayMode: 'standard' as NarrativeDisplayMode,
            context: "", // Add missing context property
          };

          // Removed normalizeState call
          return {
            ...state,
            narrative: fallbackNarrativeState,
            location: { type: 'town' as const, name: 'Boothill' },
            inventory: createInventoryState(getStartingInventory()),
            savedTimestamp: Date.now(),
            isClient: true,
            suggestedActions: [
              { id: 'fallback-existing-char-1', title: "Look around", description: "Survey your surroundings", type: 'optional' },
              { id: 'fallback-existing-char-2', title: "Visit the saloon", description: "Find information and refreshment", type: 'optional' },
              { id: 'fallback-existing-char-3', title: "Check your inventory", description: "See what you're carrying", type: 'optional' }
            ]
          } as GameState; // Add closing brace and type assertion
        }
      } catch (error) {
        // Handle errors gracefully with fallback suggestions
        console.error("Error initializing game session:", error); // Keep error log
        try {
          // Make sure we have a valid character
          if (!state.character ||
              (!('player' in state.character) && !('attributes' in state.character))) {

            // Try to get character from localStorage
            const lastCharacterJSON = localStorage.getItem("character-creation-progress");
            let characterData = null;

            if (lastCharacterJSON) {
              try {
                if (lastCharacterJSON) { // Add null check
                  characterData = JSON.parse(lastCharacterJSON).character;
                }
              } catch (e) {
                console.error("Failed to parse character data:", e); // Keep error log
              }
            }

            // If we still don't have a character, create default one
            if (!characterData) {
              characterData = {
                isNPC: false,
                isPlayer: true,
                id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: "Default Character",
                inventory: { items: [] },
                attributes: {
                  speed: 10,
                  gunAccuracy: 10,
                  throwingAccuracy: 10,
                  strength: 10,
                  baseStrength: 10,
                  bravery: 10,
                  experience: 5,
                },
                minAttributes: {
                  speed: 1,
                  gunAccuracy: 1,
                  throwingAccuracy: 1,
                  strength: 1,
                  baseStrength: 1,
                  bravery: 1,
                  experience: 0
                },
                maxAttributes: {
                  speed: 20,
                  gunAccuracy: 20,
                  throwingAccuracy: 20,
                  strength: 20,
                  baseStrength: 20,
                  bravery: 20,
                  experience: 10
                },
                wounds: [],
                isUnconscious: false,
              };
            }

            // Create a basic state with the character
            // Removed normalizeState call
            return {
              ...initialGameState,
              character: {
                player: characterData,
                opponent: null
              },
              inventory: createInventoryState(getStartingInventory()),
              narrative: {
                currentStoryPoint: {
                  id: 'error_recovery',
                  type: 'exposition' as StoryPointType,
                  title: 'Game Recovery',
                  content: `You find yourself in a dusty saloon, trying to remember how you got here. The bartender nods as you approach.`,
                  choices: [],
                },
                availableChoices: [],
                visitedPoints: ['error_recovery'],
                narrativeHistory: [`You find yourself in a dusty saloon, trying to remember how you got here. The bartender nods as you approach.`],
                displayMode: 'standard' as NarrativeDisplayMode,
                context: "", // Add missing context property
              },
              location: { type: 'town' as const, name: 'Recovery Town' },
              savedTimestamp: Date.now(),
              isClient: true,
              suggestedActions: [
                { id: 'error-recovery-1', title: "Talk to the bartender", description: "Ask about the town", type: 'optional' },
                { id: 'error-recovery-2', title: "Order a drink", description: "Quench your thirst", type: 'optional' },
                { id: 'error-recovery-3', title: "Leave the saloon", description: "Explore elsewhere", type: 'optional' }
              ],
            } as GameState; // Add closing brace and type assertion
          }

          // If we have a character but need suggestions, generate fallback ones
          // Removed normalizeState call
          return {
            ...state,
            suggestedActions: [
              { id: 'final-fallback-1', title: "Look around", description: "Survey your surroundings", type: 'optional' },
              { id: 'final-fallback-2', title: "Check your inventory", description: "See what you're carrying", type: 'optional' },
              { id: 'final-fallback-3', title: "Ask for directions", description: "Find out where to go", type: 'optional' }
            ],
          } as GameState; // Add closing brace and type assertion
        } catch (finalError) {
          // Last resort fallback
          console.error("Final error recovery attempt failed:", finalError); // Keep error log
          return createEmergencyState();
        }
      } finally {
        setIsInitializing(false);
      }
    },
    // Add missing dependencies
    [state, dispatch, initializationAttempts, setInitializationAttempts, createEmergencyState] // Removed initialGameState dependency
  );

  // Add a timeout mechanism to prevent infinite loading
  useEffect(() => {
    if (isInitializing && !initProcessingRef.current) {
      // Removed logging
      initProcessingRef.current = true;

      // Store the timeout ID in the ref so we can clear it if needed
      timeoutIdRef.current = setTimeout(() => {
        console.error("Game initialization timeout - forcing completion"); // Keep error log
        setIsInitializing(false);
        initProcessingRef.current = false;

        // If state is available, dispatch emergency recovery state
        if (dispatch) {
          try {
            const emergencyState = createEmergencyState();
            dispatch({ type: 'SET_STATE', payload: emergencyState as GameState });

            // Try to save this state
            if (saveGame) {
              saveGame(emergencyState as GameState);
            }
          } catch (error) {
            console.error("Failed to apply emergency state:", error); // Keep error log
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
  // Add missing dependencies
  }, [isInitializing, dispatch, createEmergencyState, saveGame]); // Removed initialGameState dependency

  // Manage game initialization lifecycle
  useEffect(() => {
    const initGame = async () => {
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
          // Removed logging
          // Update the timestamp ref before dispatching the state update
          lastSavedTimestampRef.current = initializedState.savedTimestamp;
          hasInitializedRef.current = true;

          // Wrap dispatch in requestAnimationFrame to avoid render phase updates
          requestAnimationFrame(() => {
            try {
              // We know initializedState is a proper GameState at this point
              dispatch({ type: 'SET_STATE', payload: initializedState as GameState });

              // Add safety check before saving
              if (saveGame) {
                saveGame(initializedState as GameState);
              }
            } catch (dispatchError) {
              console.error("Error dispatching initialized state:", dispatchError); // Keep error log
            } finally {
              initProcessingRef.current = false;
            }
          });
        } else {
          console.error("Game initialization failed - no state returned"); // Keep error log
          initProcessingRef.current = false;
        }
      } catch (initError) {
        console.error("Error during initGame execution:", initError); // Keep error log
        initProcessingRef.current = false;
      }
    };

    initGame();
  // Add missing dependencies
  }, [isClient, isInitializing, state, dispatch, saveGame, initializeGameSession, lastSavedTimestampRef, hasInitializedRef, initProcessingRef]);
  // The above dependencies are carefully considered to prevent unnecessary re-renders

  return { isInitializing, isClient };
};
