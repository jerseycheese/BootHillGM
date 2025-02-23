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
  private maxHistoryLength: number = 5; // Maximum location history

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
   * Updates the location history with a new location, maintaining a maximum history length.
   * @param history The current location history.
   * @param newLocation The new location to add.
   * @returns The updated location history.
   */
  updateLocationHistory(
    history: LocationType[],
    newLocation: LocationType
  ): LocationType[] {
    const updatedHistory = [...history, newLocation];
    if (updatedHistory.length > this.maxHistoryLength) {
      updatedHistory.shift(); // Remove oldest location
    }
    return updatedHistory;
  }
}
