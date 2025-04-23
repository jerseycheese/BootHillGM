import { Dispatch, useMemo } from 'react';
import { GameAction } from '../types/actions';
import { LocationService } from '../services/locationService';
import { ActionTypes } from '../types/actionTypes';
import { setLocation } from '../actions/locationActions';

/**
 * Custom hook that provides a dispatch adapter, primarily for handling
 * location string-to-object conversion for the SET_LOCATION action.
 *
 * @param dispatch - Original dispatch function from useReducer
 * @returns Object containing the adapted dispatch function (`dispatchAdapter`)
 */
export function useCampaignStateAdapter(
  dispatch: Dispatch<GameAction> | undefined
) {
  // Create a location service instance
  const locationService = useMemo(() => LocationService.getInstance(), []);
  
  // Create the dispatch adapter for handling type conversions
  const dispatchAdapter = useMemo<Dispatch<GameAction>>(() => {
    return (action) => {
      if (!dispatch) return;
      
      // Handle any necessary type conversions
      if (action.type === ActionTypes.SET_LOCATION && typeof action.payload === 'string') {
        // Convert string locations to LocationType using the LocationService
        const locationObject = locationService.parseLocation(action.payload);
        
        // Dispatch with properly typed location object using the action creator
        dispatch(setLocation(locationObject));
        return;
      }
      
      // For all other actions, pass through
      dispatch(action);
    };
  }, [dispatch, locationService]);

  return {
    dispatchAdapter,
  };
}