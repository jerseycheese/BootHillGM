import { useCallback, useEffect, useState } from 'react';
import { LocationService, LocationType, LocationState } from '../services/locationService';
import { useGameState } from '../context/GameStateProvider';
import { setLocation } from '../actions/locationActions';

// Default location type when none is specified
const DEFAULT_LOCATION: LocationType = { type: 'unknown' };

/**
 * Helper function to map string to LocationType
 * Handles various location type format conversions
 */
const getLocationTypeFromString = (locationString?: string): LocationType => {
  if (!locationString) return DEFAULT_LOCATION;
  
  switch (locationString) {
    case 'town':
      return { type: 'town', name: 'Unknown Town' };
    case 'wilderness':
      return { type: 'wilderness', description: 'Unknown Wilderness' };
    case 'landmark':
      return { type: 'landmark', name: 'Unknown Landmark' };
    default:
      return { type: 'unknown' };
  }
};

/**
 * Helper to safely extract a LocationType from various data formats.
 *
 * This function handles different possible location formats:
 * - Object with LocationState structure (currentLocation property)
 * - Direct LocationType object with type property
 * - String representation of location type
 *
 * @param locationData - The location data to extract from (can be string, object, or LocationState)
 * @returns A properly formatted LocationType object with required properties
 */
const extractLocationType = (locationData: unknown): LocationType => {
  if (!locationData) return DEFAULT_LOCATION;
  
  // Handle object-based location format
  if (typeof locationData === 'object' && locationData !== null) {
    if ('currentLocation' in locationData && locationData.currentLocation) {
      // For structured LocationState format
      return locationData.currentLocation as LocationType;
    } else if ('type' in locationData) {
      const typeProperty = (locationData as { type: unknown }).type;
      // Confirm it's a valid LocationType
      if (typeof typeProperty === 'string') {
        const type = typeProperty as 'town' | 'wilderness' | 'landmark' | 'unknown';
        switch (type) {
          case 'town':
            return { 
              type: 'town', 
              name: 'name' in locationData ? String(locationData.name || 'Unknown Town') : 'Unknown Town' 
            };
          case 'wilderness':
            return { 
              type: 'wilderness', 
              description: 'description' in locationData ? String(locationData.description || 'Unknown Area') : 'Unknown Area'
            };
          case 'landmark':
            return { 
              type: 'landmark', 
              name: 'name' in locationData ? String(locationData.name || 'Unknown Landmark') : 'Unknown Landmark',
              ...(('description' in locationData && locationData.description) 
                ? { description: String(locationData.description) } 
                : { /* Intentionally empty */ })
            };
          default:
            return { type: 'unknown' };
        }
      }
    }
  } else if (typeof locationData === 'string') {
    // Handle string-based location format
    return getLocationTypeFromString(locationData);
  }
  
  return DEFAULT_LOCATION;
};

/**
 * React hook for location-related functionality that safely handles state
 * and provides location updates, history tracking, and persistence.
 */
export const useLocation = () => {
  // Use the correct state hook
  const { state, dispatch } = useGameState();
  const locationService = LocationService.getInstance();
  
  // Initialize location state with current location and empty history
  const [locationState, setLocationState] = useState<LocationState>(() => {
    // Extract location from state using the helper
    const currentLocation = extractLocationType(state?.location);
    
    // Create a proper LocationState
    return {
      currentLocation,
      history: [] // Always initialize with empty array for consistency
    };
  });

  // Sync state.location with local state
  useEffect(() => {
    if (!state?.location) return;
    
    // Extract location from state using the helper
    const newLocation = extractLocationType(state.location);
    
    // Get history from existing state or location data
    let currentHistory: LocationType[] = locationState.history || [];
    
    // Try to extract history if this is a LocationState object
    if (typeof state.location === 'object' && state.location !== null && 
        'history' in state.location && Array.isArray(state.location.history)) {
      currentHistory = state.location.history;
    }

    const newHistory = locationService.updateLocationHistory(currentHistory, newLocation);

    // Only update state if location or history content has actually changed
    if (JSON.stringify(newLocation) !== JSON.stringify(locationState.currentLocation) ||
        JSON.stringify(newHistory) !== JSON.stringify(locationState.history)) {
      setLocationState({
        currentLocation: newLocation,
        history: newHistory
      });
    }
  }, [state?.location, locationService, locationState.history, locationState.currentLocation]);

  /**
   * Updates the current location and adds it to history
   * Only dispatches if the location has changed
   */
  const updateLocation = useCallback((newLocation: LocationType) => {
    // Guard against null or undefined
    if (!newLocation) return;
    
    // Skip update if the location hasn't changed (deep comparison)
    if (locationState.currentLocation && 
        JSON.stringify(newLocation) === JSON.stringify(locationState.currentLocation)) {
      return;
    }

    // Dispatch with the action creator
    dispatch(setLocation(newLocation));

    // Local state is updated via the useEffect above
  }, [dispatch, locationState]); // Remove unnecessary locationState.currentLocation dependency

  return {
    locationState,
    updateLocation
  };
};
