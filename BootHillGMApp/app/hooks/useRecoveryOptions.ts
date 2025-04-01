import { useCallback } from 'react';
import { Character } from '../types/character';
import { GameEngineAction } from '../types/gameActions';
import { Dispatch } from 'react';
import { StoryPointType, NarrativeDisplayMode } from '../types/narrative.types';
import { getStartingInventory } from '../utils/startingInventory';

/**
 * Custom hook to provide game recovery functionality
 * 
 * @param dispatch - State dispatch function
 * @param playerCharacter - Current player character
 * @param recoveryInProgress - Ref tracking recovery state
 * @returns Object containing recovery handler functions
 */
export function useRecoveryOptions(
  dispatch: Dispatch<GameEngineAction> | undefined,
  playerCharacter: Character | null,
  recoveryInProgress: React.MutableRefObject<boolean>
) {
  
  const handleRecoverGame = useCallback(() => {
    // Prevent recursive calls
    if (recoveryInProgress.current) {
      console.log("Recovery already in progress, skipping");
      return;
    }
    
    console.log("User initiated game recovery");
    recoveryInProgress.current = true;
    
    // Wrap in requestAnimationFrame to avoid state updates during render
    window.requestAnimationFrame(() => {
      try {
        localStorage.removeItem("campaignState");
        localStorage.removeItem("saved-game-state");
        // Keep character-creation-progress to preserve the character
        
        // Create a basic emergency state
        const emergencyNarrative = "After a moment of confusion, you find yourself back in Boothill town. Your adventure continues...";
        
        // Try to extract character data from localStorage
        let playerData = null;
        try {
          if (localStorage.getItem("character-creation-progress")) {
            const parsed = JSON.parse(localStorage.getItem("character-creation-progress") || '{}');
            if (parsed && parsed.character) {
              playerData = parsed.character;
            }
          }
        } catch (e) {
          console.error("Failed to parse character data:", e);
        }
        
        // Create a minimal working state
        const emergencyState = {
          character: playerData 
            ? { player: playerData, opponent: null } 
            : { 
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
              id: 'recovery_point',
              type: 'exposition' as StoryPointType,
              title: 'Emergency Recovery',
              content: emergencyNarrative,
              choices: [],
            },
            availableChoices: [],
            visitedPoints: ['recovery_point'],
            narrativeHistory: [emergencyNarrative],
            displayMode: 'standard' as NarrativeDisplayMode
          },
          inventory: { items: getStartingInventory() },
          location: { type: 'town' as const, name: 'Boothill' },
          savedTimestamp: Date.now(),
          isClient: true,
          suggestedActions: [
            { text: "Look around", type: 'basic' as const, context: "Survey your surroundings" },
            { text: "Visit the saloon", type: 'basic' as const, context: "Find a drink and information" },
            { text: "Check your gear", type: 'inventory' as const, context: "Make sure you have everything" }
          ]
        };
        
        // Save this narrative for future resets
        localStorage.setItem("initial-narrative", JSON.stringify({ narrative: emergencyNarrative }));
        
        // Dispatch the emergency state
        if (dispatch) {
          dispatch({ type: 'SET_STATE', payload: emergencyState });
        }
        
        // Clear recovered flag to allow future recoveries if needed
        setTimeout(() => {
          recoveryInProgress.current = false;
        }, 100);
      } catch (error) {
        console.error("Failed to recover game:", error);
        recoveryInProgress.current = false;
      }
    });
  }, [dispatch, recoveryInProgress]);
  
  const handleRestartGame = useCallback(() => {
    console.log("User initiated full game restart");
    
    // Clear all game state from localStorage
    try {
      localStorage.removeItem("campaignState");
      localStorage.removeItem("saved-game-state");
      localStorage.removeItem("initial-narrative");
      localStorage.removeItem("character-creation-progress");
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to restart game:", error);
    }
  }, []);

  return {
    handleRecoverGame,
    handleRestartGame
  };
}
