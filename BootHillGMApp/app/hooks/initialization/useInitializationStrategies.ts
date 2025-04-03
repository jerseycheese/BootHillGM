// /app/hooks/initialization/useInitializationStrategies.ts
import { useCallback } from "react";
import { GameState, initialGameState } from "../../types/gameState";
import { StoryPointType, NarrativeDisplayMode, NarrativeState } from "../../types/narrative.types";
import { getAIResponse } from "../../services/ai/gameService";
import { getStartingInventory } from "../../utils/startingInventory";
import { Character } from "../../types/character"; // Added import
import {
  createInventoryState,
  getItemsFromInventory,
  processLocation,
  createFallbackNewCharacterState,
  createFallbackExistingCharacterState,
  createBasicRecoveryState,
  createFinalFallbackState,
  createEmergencyState
} from "../../utils/gameInitializationUtils";

/**
 * Hook that provides different game initialization strategies
 * @returns Object containing strategy functions for different initialization scenarios
 */
export const useInitializationStrategies = () => {
  /**
   * Strategy for new character initialization
   * @param characterData - Character data from character creation
   * @returns Initialized game state for a new character
   */
  const initializeNewCharacter = useCallback(async (characterData: Character | null): Promise<GameState> => {
    try {
      const startingInventory = getStartingInventory();

      // Generate initial narrative and actions considering character background
      const response = await getAIResponse({
        prompt: `Initialize a new game session for ${characterData?.name || 'the player'}.
        Describe their current situation and location in detail.
        Consider the character's background.
        Include suggestions for what they might do next.`,
        journalContext: "",
        inventory: startingInventory // Pass starting inventory items to AI for context
      });

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

      return {
        ...initialGameState,
        currentPlayer: characterData?.name || "", 
        character: {
          player: characterData,
          opponent: null
        },
        narrative: {
          currentStoryPoint: {
            id: 'intro',
            type: 'exposition' as StoryPointType,
            title: 'Introduction',
            content: response.narrative,
            choices: [],
          },
          availableChoices: [],
          visitedPoints: ['intro'],
          narrativeHistory: [response.narrative],
          displayMode: 'standard' as NarrativeDisplayMode,
          context: "",
        },
        location: processedLocation,
        inventory: createInventoryState(startingInventory),
        savedTimestamp: Date.now(),
        isClient: true,
        suggestedActions: response.suggestedActions || [],
      } as GameState;
    } catch (error) {
      console.error("Error in new character initialization:", error);
      return createFallbackNewCharacterState(characterData);
    }
  }, []);

  /**
   * Strategy for generating new suggestions for an existing state
   * @param state - Current game state
   * @returns Updated game state with new suggestions
   */
  const generateNewSuggestions = useCallback(async (state: GameState): Promise<GameState> => {
    try {
      const currentContent = state.narrative.currentStoryPoint?.content ||
                            (state.narrative.narrativeHistory && state.narrative.narrativeHistory.length > 0
                             ? state.narrative.narrativeHistory[state.narrative.narrativeHistory.length - 1]
                             : "");

      const response = await getAIResponse({
        prompt: `Based on the current situation, what are some actions ${
          state.character?.player?.name || "the player"
        } might take?`,
        journalContext: currentContent,
        inventory: getItemsFromInventory(state.inventory)
      });

      return {
        ...state,
        suggestedActions: response.suggestedActions || [],
      } as GameState;
    } catch (error) {
      console.error("Error generating suggestions for existing state:", error);
      return {
        ...state,
        suggestedActions: [
          { id: 'fallback-existing-1', title: "Look around", description: "Survey your surroundings", type: 'optional' },
          { id: 'fallback-existing-2', title: "Continue forward", description: "Proceed with your journey", type: 'optional' },
          { id: 'fallback-existing-3', title: "Check your inventory", description: "See what you're carrying", type: 'optional' }
        ]
      } as GameState;
    }
  }, []);

  /**
   * Strategy for initializing an existing character
   * @param state - Current game state
   * @returns Updated game state with new narrative and suggestions
   */
  const initializeExistingCharacter = useCallback(async (state: GameState): Promise<GameState> => {
    try {
      const response = await getAIResponse({
        prompt: `Initialize a new game session for ${
          state.character?.player?.name || "Unknown"
        }.
        Provide a detailed introduction to the character's current situation.
        Consider their background, and circumstances.
        Include clear suggestions for what they might do next.
        Ensure to explicitly state their current location.`,
        journalContext: "",
        inventory: getItemsFromInventory(state.inventory)
      });

      const existingCharacterNarrative: NarrativeState = {
        currentStoryPoint: {
          id: 'resume',
          type: 'exposition' as StoryPointType,
          title: 'Resuming Game',
          content: response.narrative,
          choices: [],
        },
        availableChoices: [],
        visitedPoints: [],
        narrativeHistory: [response.narrative],
        displayMode: 'standard' as NarrativeDisplayMode,
        context: "",
      };

      // Process the location to ensure it has the correct type
      const processedLocation = processLocation(response.location);

      return {
        ...state,
        narrative: existingCharacterNarrative,
        location: processedLocation,
        inventory: createInventoryState(getStartingInventory()),
        savedTimestamp: Date.now(),
        isClient: true,
        suggestedActions: response.suggestedActions || [],
      } as GameState;
    } catch (error) {
      console.error("Error initializing existing character state:", error);
      return createFallbackExistingCharacterState(state);
    }
  }, []);

  /**
   * Strategy for handling error recovery during initialization
   * @param state - Current game state, possibly incomplete or invalid
   * @returns A valid game state for recovery
   */
  const handleErrorRecovery = useCallback((state: GameState): GameState => {
    // Removed log
    try {
      // Make sure we have a valid character
      if (!state.character ||
          (!('player' in state.character) && !('attributes' in state.character))) {

        // Try to get character from localStorage
        // Removed log
        const lastCharacterJSON = localStorage.getItem("character-creation-progress");
        let characterData = null;

        if (lastCharacterJSON) {
          try {
            characterData = JSON.parse(lastCharacterJSON).character;
          } catch (e) {
            // Removed log
            console.error("Failed to parse character data:", e);
          }
        }

        // If we still don't have a character, use basic recovery state
        if (!characterData) {
          // Removed log
          return createBasicRecoveryState();
        }

        // Create a basic state with the character
        // Removed log
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
            context: "",
          },
          location: { type: 'town' as const, name: 'Recovery Town' },
          savedTimestamp: Date.now(),
          isClient: true,
          suggestedActions: [
            { id: 'error-recovery-1', title: "Talk to the bartender", description: "Ask about the town", type: 'optional' },
            { id: 'error-recovery-2', title: "Order a drink", description: "Quench your thirst", type: 'optional' },
            { id: 'error-recovery-3', title: "Leave the saloon", description: "Explore elsewhere", type: 'optional' }
          ],
        } as GameState;
      }

      // If we have a character but need suggestions, generate fallback ones
      // Removed log
      return createFinalFallbackState(state);
    } catch (finalError) {
      // Last resort fallback
      console.error("Final error recovery attempt failed:", finalError);
      return createEmergencyState();
    }
  }, []);

  // Return all strategies
  return {
    initializeNewCharacter,
    generateNewSuggestions,
    initializeExistingCharacter,
    handleErrorRecovery,
    createEmergencyState
  };
};
