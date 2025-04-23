/**
 * Location Action Creators
 * 
 * This file contains action creators for location-related actions.
 */

import { ActionTypes } from '../types/actionTypes';
import { LocationType } from '../services/locationService';

/**
 * Action creator for setting the current location
 * @param location - Location data to set
 * @returns Location action object
 */
export const setLocation = (location: LocationType) => ({
  type: ActionTypes.SET_LOCATION,
  payload: location
});
