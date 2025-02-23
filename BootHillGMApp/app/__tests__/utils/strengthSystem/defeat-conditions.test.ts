import { mockPlayerCharacter } from '../../../test/fixtures';
import { isCharacterDefeated, isKnockout } from '../../../utils/strengthSystem';
import { Wound } from '../../../types/wound';

describe('Defeat Condition Tests', () => {
    describe('isCharacterDefeated', () => {
        it('should return true if character has a mortal wound', () => {
          const character = {
            ...mockPlayerCharacter,
            attributes: {
              ...mockPlayerCharacter.attributes,
              strength: 15,
              baseStrength: 15,
            },
            wounds: [{ location: 'head', severity: 'mortal', damage: Infinity, strengthReduction: Infinity, turnReceived: 0 } as Wound],
          };
          expect(isCharacterDefeated(character)).toBe(true);
        });
  
        it('should return true if current strength is 0', () => {
          const character = {
            ...mockPlayerCharacter,
            isUnconscious: true,
            attributes: {
              ...mockPlayerCharacter.attributes,
              strength: 15,
              baseStrength: 15,
            },
            wounds: [
              { location: 'leftLeg', severity: 'serious', damage: 7, strengthReduction: 7, turnReceived: 0} as Wound,
              { location: 'rightLeg', severity: 'serious', damage: 7, strengthReduction: 7, turnReceived: 0} as Wound,
              { location: 'leftArm', severity: 'light', damage: 3, strengthReduction: 3, turnReceived: 0} as Wound
            ],
          };
          expect(isCharacterDefeated(character)).toBe(true);
        });
  
        it('should return true if current strength is below 0', () => {
          const character = {
            ...mockPlayerCharacter,
            isUnconscious: true,
            attributes: {
              ...mockPlayerCharacter.attributes,
              strength: 15,
              baseStrength: 15,
            },
            wounds: [
              { location: 'leftLeg', severity: 'serious', damage: 10, strengthReduction: 10, turnReceived: 0} as Wound,
              { location: 'rightLeg', severity: 'serious', damage: 10, strengthReduction: 10, turnReceived: 0} as Wound
            ],
          };
          expect(isCharacterDefeated(character)).toBe(true);
        });
  
        it('should return false if character is alive and has strength', () => {
          const character = {
            ...mockPlayerCharacter,
            attributes: {
              ...mockPlayerCharacter.attributes,
              strength: 10,
              baseStrength: 15,
            },
            wounds: [],
          };
          expect(isCharacterDefeated(character)).toBe(false);
        });
      });
  
      describe('isKnockout', () => {
        it('should return true if damage reduces strength to 0', () => {
          expect(isKnockout(5, 5)).toBe(true);
        });
  
        it('should return false if damage is greater than current strength (defeat, not knockout)', () => {
          expect(isKnockout(5, 10)).toBe(false);
        });
  
        it('should return false if damage is less than current strength', () => {
          expect(isKnockout(5, 3)).toBe(false);
        });
      });
});
