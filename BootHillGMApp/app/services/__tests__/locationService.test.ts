import { LocationService, LocationType } from '../locationService';

// Test type for invalid locations
type InvalidLocation = {
  type: 'town' | 'wilderness' | 'landmark' | 'unknown';
};

describe('LocationService', () => {
    it('should return a singleton instance', () => {
        const instance1 = LocationService.getInstance();
        const instance2 = LocationService.getInstance();
        expect(instance1).toBe(instance2);
    });

    describe('parseLocation', () => {
        it('should return unknown location for empty or unknown string', () => {
            const service = LocationService.getInstance();
            expect(service.parseLocation('')).toEqual({ type: 'unknown' });
            expect(service.parseLocation('some invalid string')).toEqual({ type: 'unknown' });
        });

        it('should return town location for "town" string', () => {
            const service = LocationService.getInstance();
            expect(service.parseLocation('town')).toEqual({ type: 'town', name: 'Unknown Town' });
        });

        it('should return wilderness location for "wilderness" string', () => {
            const service = LocationService.getInstance();
            expect(service.parseLocation('wilderness')).toEqual({ type: 'wilderness', description: 'Unknown Wilderness' });
        });

        it('should return landmark location for "landmark" string', () => {
            const service = LocationService.getInstance();
            expect(service.parseLocation('landmark')).toEqual({ type: 'landmark', name: 'Unknown Landmark' });
        });
    });

    describe('validateLocation', () => {
        it('should return false for unknown location', () => {
            const service = LocationService.getInstance();
            expect(service.validateLocation({ type: 'unknown' })).toBe(false);
        });

        it('should return true for valid location types', () => {
            const service = LocationService.getInstance();
            expect(service.validateLocation({ type: 'town', name: 'Test Town' })).toBe(true);
            expect(service.validateLocation({ type: 'wilderness', description: 'Test Wilderness' })).toBe(true);
            expect(service.validateLocation({ type: 'landmark', name: 'Test Landmark' })).toBe(true);
        });

        it('should return false for invalid town location', () => {
            const service = LocationService.getInstance();
            expect(service.validateLocation({ type: 'town' } as InvalidLocation as LocationType)).toBe(false); // Missing name
        });

        it('should return false for invalid wilderness location', () => {
            const service = LocationService.getInstance();
            expect(service.validateLocation({ type: 'wilderness' } as InvalidLocation as LocationType)).toBe(false); // Missing description
        });
    });

    describe('updateLocationHistory', () => {
        it('should add new location to history', () => {
            const service = LocationService.getInstance();
            const initialHistory: LocationType[] = [];
            const newLocation: LocationType = { type: 'town', name: 'Dusty Gulch' };
            const updatedHistory = service.updateLocationHistory(initialHistory, newLocation);
            expect(updatedHistory).toEqual([newLocation]);
        });

        it('should limit history length', () => {
            const service = LocationService.getInstance();
            const initialHistory: LocationType[] = [
                { type: 'town', name: 'Town1' },
                { type: 'town', name: 'Town2' },
                { type: 'town', name: 'Town3' },
                { type: 'town', name: 'Town4' },
                { type: 'town', name: 'Town5' },
            ];
            const newLocation: LocationType = { type: 'town', name: 'Town6' };
            const updatedHistory = service.updateLocationHistory(initialHistory, newLocation);
            expect(updatedHistory.length).toBe(5);
            expect(updatedHistory).toEqual([
                { type: 'town', name: 'Town2' },
                { type: 'town', name: 'Town3' },
                { type: 'town', name: 'Town4' },
                { type: 'town', name: 'Town5' },
                { type: 'town', name: 'Town6' },
            ]);
        });
    });
});
