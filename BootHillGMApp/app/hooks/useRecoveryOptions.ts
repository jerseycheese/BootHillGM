import { Dispatch, useCallback } from 'react';
import { GameState } from '../types/gameState';
import { GameAction } from '../types/actions'; // Use GameAction
import { StoryPointType, NarrativeDisplayMode } from '../types/narrative.types';
import { getStartingInventory } from '../utils/startingInventory';
import { ActionTypes } from '../types/actionTypes';

/**
 * Custom hook to provide game recovery functionality
 * 
 * @param dispatch - State dispatch function
 * @param recoveryInProgress - Ref tracking recovery state
 * @returns Object containing recovery handler functions
 */
export function useRecoveryOptions(
  dispatch: Dispatch<GameAction> | undefined, // Expect GameAction
  recoveryInProgress: React.MutableRefObject<boolean>
) {
  
  const handleRecoverGame = useCallback(() => {
    // Prevent recursive calls
    if (recoveryInProgress.current) {
      return;
    }
    
    recoveryInProgress.current = true;
    
    // Wrap in requestAnimationFrame to avoid state updates during render
    window.requestAnimationFrame(() => {
      try {
        localStorage.removeItem("campaignState");
        localStorage.removeItem("saved-game-state");
        // Keep character-creation-progress to preserve the character
        
        // Create a basic emergency state
        const emergencyNarrative = "After a moment of confusion, you find yourself back in Boot Hill town. Your adventure continues...";
        
        // Try to extract character data from localStorage
        let playerData = null;
        try {
          if (localStorage.getItem("character-creation-progress")) {
            const parsed = JSON.parse(localStorage.getItem("character-creation-progress") || '{ /* Intentionally empty */ }');
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
            displayMode: 'standard' as NarrativeDisplayMode,
            context: "" // Add missing context property
          },
          inventory: { items: getStartingInventory(), equippedWeaponId: null },
          location: { type: 'town' as const, name: 'Boot Hill' },
          savedTimestamp: Date.now(),
          isClient: true,
          suggestedActions: [
            { id: 'recovery-1', title: "Look around", description: "Survey your surroundings", type: 'optional' as const },
            { id: 'recovery-2', title: "Visit the saloon", description: "Find a drink and information", type: 'optional' as const },
            { id: 'recovery-3', title: "Check your gear", description: "Make sure you have everything", type: 'optional' as const }
          ]
        };
        
        // Save this narrative for future resets
        localStorage.setItem("initial-narrative", JSON.stringify({ narrative: emergencyNarrative }));
        
        // Dispatch the emergency state
        if (dispatch) {
          // Cast payload as Partial<GameState> for SET_STATE action
          dispatch({ type: ActionTypes.SET_STATE, payload: emergencyState as Partial<GameState> }); // Use ActionTypes constant
        }
        
        // Clear recovered flag to allow future recoveries if needed
        setTimeout(() => {
          recoveryInProgress.current = false;
        }, 100);
      } catch {
        recoveryInProgress.current = false;
      }
    });
  }, [dispatch, recoveryInProgress]);
  
  const handleRestartGame = useCallback(() => {
    
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
