import { Dispatch, useMemo } from 'react';
import { GameAction, CampaignState, SuggestedAction } from '../types/campaign';
import { GameEngineAction } from '../types/gameActions';
import { Character } from '../types/character';
import { GameState } from '../types/gameState';
import { CombatType } from '../types/combat';
import { StoryPointType, NarrativeDisplayMode, NarrativeState } from '../types/narrative.types';
import { LocationService } from '../services/locationService';

// Define extended state interface for additional properties
interface ExtendedState {
  suggestedActions?: SuggestedAction[];
  error?: string;
}

/**
 * Custom hook that adapts the game state for the campaign state format
 * and provides a dispatch adapter for type conversions
 * 
 * @param dispatch - Original dispatch function
 * @param state - Current game state
 * @param playerCharacter - Extracted player character
 * @returns Object with adapted dispatch and campaign state
 */
export function useCampaignStateAdapter(
  dispatch: Dispatch<GameEngineAction> | undefined,
  state: GameState | null | undefined,
  playerCharacter: Character | null
) {
  // Create a location service instance
  const locationService = useMemo(() => LocationService.getInstance(), []);
  
  // Create the dispatch adapter for handling type conversions
  const dispatchAdapter = useMemo<Dispatch<GameAction>>(() => {
    return (action) => {
      if (!dispatch) return;
      
      // Handle any necessary type conversions
      if (action.type === 'SET_LOCATION' && typeof action.payload === 'string') {
        // Convert string locations to LocationType using the LocationService
        const locationObject = locationService.parseLocation(action.payload);
        
        // Dispatch with properly typed location object
        dispatch({
          type: 'SET_LOCATION',
          payload: locationObject
        });
        return;
      }
      
      // For all other actions, pass through
      dispatch(action as unknown as GameEngineAction);
    };
  }, [dispatch, locationService]);
  
  // Create campaign state for DevTools
  const campaignState = useMemo<CampaignState>(() => {
    // Create default state if state is not available
    if (!state) {
      return {
        currentPlayer: '',
        npcs: [],
        character: null,
        location: null,
        gameProgress: 0,
        journal: [],
        narrative: {
          currentStoryPoint: {
            id: 'default',
            type: 'exposition' as StoryPointType,
            title: 'Default',
            content: '',
            choices: [],
          },
          availableChoices: [],
          visitedPoints: [],
          narrativeHistory: [],
          displayMode: 'standard' as NarrativeDisplayMode,
        },
        inventory: [],
        quests: [],
        isCombatActive: false,
        opponent: null,
        isClient: true,
        suggestedActions: [],
        combatState: {
          winner: null,
          participants: [],
          isActive: false,
          combatType: 'melee' as CombatType,
          rounds: 0
        },
        error: undefined,
        get player() {
          return this.character;
        }
      };
    }
    
    // If state is available, use it to build the campaign state
    const extendedState = state as ExtendedState;
    const characterToUse = playerCharacter || 
                          (state.character && 'player' in state.character ? state.character.player : null);
    
    return {
      currentPlayer: state.currentPlayer || '',
      npcs: state.npcs || [],
      character: characterToUse,
      location: state.location,
      gameProgress: state.gameProgress || 0,
      
      // Safely extract journal entries
      journal: state.journal 
        ? ('entries' in state.journal && Array.isArray(state.journal.entries)
          ? state.journal.entries 
          : [])
        : [],
        
      narrative: state.narrative as NarrativeState,
      
      // Add quests property that's required by CampaignState
      quests: Array.isArray(state.quests) ? state.quests : [],
      
      // Safely extract inventory items
      inventory: state.inventory
        ? ('items' in state.inventory && Array.isArray(state.inventory.items)
          ? state.inventory.items
          : (Array.isArray(state.inventory) ? state.inventory : []))
        : [],
      combatState: state.combat 
        ? {
            winner: state.combat.winner !== undefined ? state.combat.winner : null,
            participants: Array.isArray(state.combat.participants) ? state.combat.participants : [],
            isActive: state.combat.isActive !== undefined ? state.combat.isActive : false,
            combatType: state.combat.combatType || 'melee' as CombatType,
            rounds: Array.isArray(state.combat.rounds) ? state.combat.rounds.length : 0,
            // Convert currentTurn to expected type format
            currentTurn: state.combat.currentTurn === "player" ? "player" :
                        state.combat.currentTurn === "opponent" ? "opponent" : undefined
          }
        : {
            winner: null,
            participants: [],
            isActive: false,
            combatType: 'melee' as CombatType,
            rounds: 0,
            currentTurn: undefined
          },
      error: extendedState.error,
      suggestedActions: Array.isArray(extendedState.suggestedActions) ? extendedState.suggestedActions : [],
      isCombatActive: state.isCombatActive === true,
      opponent: state.character && 'opponent' in state.character ? state.character.opponent : null,
      isClient: true,
      
      // Define the player getter
      get player() {
        return this.character;
      }
    };
  }, [state, playerCharacter]);

  return {
    dispatchAdapter,
    campaignState
  };
}
