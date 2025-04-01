import { Dispatch, useMemo } from 'react';
import { GameAction } from '../types/actions'; // Corrected GameAction import path
// Removed unused import: SuggestedAction
// Removed obsolete CampaignState import
// Removed unused import: GameEngineAction
// Removed unused import: Character
import { GameState } from '../types/gameState';
// Removed unused imports: CombatType, StoryPointType, NarrativeDisplayMode, NarrativeState
import { LocationService } from '../services/locationService';

// Define extended state interface for additional properties
// Removed unused interface ExtendedState
/**
 * Custom hook that provides a dispatch adapter, primarily for handling
 * location string-to-object conversion for the SET_LOCATION action.
 *
 * @param dispatch - Original dispatch function from useReducer
 * @param _state - Current game state (unused in this adapter)
 * @returns Object containing the adapted dispatch function (`dispatchAdapter`)
 */
export function useCampaignStateAdapter(
  dispatch: Dispatch<GameAction> | undefined, // Expect GameAction
  _state: GameState | null | undefined, // Prefixed unused state parameter
  // Removed unused playerCharacter parameter
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
      // Action should already be GameAction, no cast needed
      dispatch(action);
    };
  }, [dispatch, locationService]);
  
  // Create campaign state for DevTools
  // Removed obsolete campaignState reconstruction logic

  return {
    dispatchAdapter,
    // Removed campaignState from return value
  };
}
