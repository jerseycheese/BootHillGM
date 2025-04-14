export type LocationType =
  | { type: 'town'; name: string }
  | { type: 'wilderness'; description: string }
  | { type: 'landmark'; name: string; description?: string }
  | { type: 'unknown' };

export interface LocationState {
  currentLocation: LocationType;
  history: LocationType[];
}

export class LocationService {
  private static instance: LocationService;

  /**
   * Get the singleton instance of LocationService.
   * @returns The LocationService instance.
   */
  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Parses a location string and returns a LocationType object.
   * @param locationString The string to parse.
   * @returns The parsed LocationType.
   */
  parseLocation(locationString: string): LocationType {
    // Basic parsing logic (can be expanded with more sophisticated NLP)
    const townMatch = locationString.match(/town of (.*)/i);
    if (townMatch) {
      return { type: 'town', name: townMatch[1] };
    }

    const wildernessMatch = locationString.match(/wilderness.*?:(.*)/i);
    if (wildernessMatch) {
      return { type: 'wilderness', description: wildernessMatch[1].trim() };
    }

    const landmarkMatch = locationString.match(/landmark.*?:(.*)/i);
    if (landmarkMatch) {
      const landmarkName = landmarkMatch[1].trim();
      return { type: 'landmark', name: landmarkName };
    }

    if (locationString.toLowerCase().includes('town')) {
      return { type: 'town', name: 'Unknown Town' };
    }
    if (locationString.toLowerCase().includes('wilderness')) {
      return { type: 'wilderness', description: 'Unknown Wilderness' };
    }
    if (locationString.toLowerCase().includes('landmark')) {
      return { type: 'landmark', name: 'Unknown Landmark' };
    }

    return { type: 'unknown' };
  }

  /**
   * Validates a LocationType object.
   * @param location The LocationType to validate.
   * @returns True if the location is valid, false otherwise.
   */
  validateLocation(location: LocationType): boolean {
    if (location.type === 'unknown') {
      return false;
    }
    if (location.type === 'town' && !location.name) {
      return false;
    }
    if (location.type === 'wilderness' && !location.description) {
      return false;
    }
    // Landmark can be valid with just a name
    return true;
  }

  /**
   * Updates the location history with a new location.
   * @param history The current location history.
   * @param newLocation The new location to add.
   * @returns The updated location history.
   */
  updateLocationHistory(
    history: LocationType[] = [],
    newLocation: LocationType
  ): LocationType[] {
    // Keep a maximum of 5 locations in history
    const MAX_HISTORY = 5;
    const updatedHistory = [...history, newLocation];
    
    // Return only the most recent MAX_HISTORY locations
    return updatedHistory.slice(-MAX_HISTORY);
  }

  /**
   * Converts an AI generation location result to standard LocationType
   * Ensures locations have required properties for persistence
   * @param location Location object from AI generation
   * @returns A properly formatted LocationType
   */
  convertAIGeneratedLocation(location: {
    type?: string;
    name?: string;
    description?: string;
  } | undefined): LocationType {
    if (!location) {
      return { type: 'town', name: 'Boot Hill' };
    }
    
    // Handle wilderness locations that have description instead of name
    if (location.type === 'wilderness' && location.description) {
      return { 
        type: 'wilderness', 
        description: location.description 
      };
    }
    
    // Handle landmarks with descriptions
    if (location.type === 'landmark' && location.name) {
      return {
        type: 'landmark',
        name: location.name,
        ...(location.description ? { description: location.description } : {})
      };
    }
    
    // For town or other location types, ensure name exists
    if (location.type === 'town' || !location.type) {
      return {
        type: 'town',
        name: location.name || 'Boot Hill'
      };
    }
    
    return { type: 'unknown' };
  }
}
