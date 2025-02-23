import { calculateUpdatedStrength } from '../../utils/strengthSystem';
import { Character } from '../../types/character';
  
describe('strengthSystem', () => {
    describe('calculateUpdatedStrength', () => {
      it('should reduce strength by damage amount', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 10,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [],
          strengthHistory: {baseStrength: 15, changes: []}
        };
        expect(calculateUpdatedStrength(character, 3).newStrength).toBe(7);
      });

      it('should not allow strength to go below 0', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 2,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [],
          strengthHistory: {baseStrength: 15, changes: []}
        };
        expect(calculateUpdatedStrength(character, 5).newStrength).toBe(0);
      });

      it('should not allow strength to increase', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 10,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [],
          strengthHistory: {baseStrength: 15, changes: []}
        };
        expect(calculateUpdatedStrength(character, -2).newStrength).toBe(10);
      });
    });
});
