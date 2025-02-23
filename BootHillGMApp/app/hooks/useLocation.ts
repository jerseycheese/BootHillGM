import { useCallback, useEffect, useRef, useState } from 'react';
import { LocationService, LocationType } from '../services/locationService';
import { useCampaignState } from '../components/CampaignStateManager';

const locationService = LocationService.getInstance();
const LOCATION_HISTORY_KEY = 'locationHistory';

// Helper function to map string to LocationType
const getLocationTypeFromString = (locationString?: string): LocationType => {
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

export const useLocation = () => {
  const { state, dispatch } = useCampaignState();
  const historyRef = useRef<LocationType[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationType>(() => 
    state.location && typeof state.location === 'object' && 'type' in state.location
      ? state.location
      : getLocationTypeFromString(state.location != null ? state.location : undefined)
  );

  // Initialize history from localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem(LOCATION_HISTORY_KEY);
    if (storedHistory) {
      historyRef.current = JSON.parse(storedHistory);
    }
  }, []);

  // Update history in localStorage when it changes
  useEffect(() => {
    localStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(historyRef.current));
  }, []);

  // Sync state.location with local state and history
  useEffect(() => {
    if (state.location) {
      const newLocation = typeof state.location === 'object' && 'type' in state.location
        ? state.location
        : getLocationTypeFromString(state.location);
      
      setCurrentLocation(newLocation);
      historyRef.current = locationService.updateLocationHistory(historyRef.current, newLocation);
    }
  }, [state.location]);

  const updateLocation = useCallback((newLocation: LocationType) => {
    if (!newLocation || JSON.stringify(newLocation) === JSON.stringify(currentLocation)) {
      return;
    }

    // Update global state
    dispatch({
      type: 'SET_LOCATION',
      payload: newLocation
    });

    // Local state and history will be updated via the useEffect above
  }, [dispatch, currentLocation]);

  return {
    locationState: {
      currentLocation,
      history: historyRef.current
    },
    updateLocation
  };
};
