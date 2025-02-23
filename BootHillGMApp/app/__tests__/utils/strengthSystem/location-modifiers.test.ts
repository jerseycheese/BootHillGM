import { mockPlayerCharacter } from '../../../test/fixtures';
import { getCharacterStrength } from '../../../utils/strengthSystem';
import { Wound } from '../../../types/wound';

describe('Location Modifier Tests', () => {
    it('should correctly apply location modifiers', () => {
        const character = {
          ...mockPlayerCharacter,
          attributes: {
            ...mockPlayerCharacter.attributes,
            strength: 10,
            baseStrength: 15
          },
          wounds: [],
        };
        // Head wound with 2 damage should reduce strength by 4
        expect(getCharacterStrength({...character, wounds: [{location: 'head', severity: 'light', damage: 2, strengthReduction: 2, turnReceived: 0} as Wound]})).toBe(6);
        // Abdomen wound with 5 damage should reduce strength by 6
        expect(getCharacterStrength({...character, wounds: [{location: 'abdomen', severity: 'light', damage: 5, strengthReduction: 5, turnReceived: 0} as Wound]})).toBe(4);
        // Chest wound with 3 damage should reduce strength by 4
        expect(getCharacterStrength({...character, wounds: [{location: 'chest', severity: 'light', damage: 3, strengthReduction: 3, turnReceived: 0} as Wound]})).toBe(6);
        // Left arm wound with 1 damage should reduce strength by 1
        expect(getCharacterStrength({...character, wounds: [{location: 'leftArm', severity: 'light', damage: 1, strengthReduction: 1, turnReceived: 0} as Wound]})).toBe(9);
        // Right leg wound with 4 damage should reduce strength by 4
        expect(getCharacterStrength({...character, wounds: [{location: 'rightLeg', severity: 'light', damage: 4, strengthReduction: 4, turnReceived: 0} as Wound]})).toBe(6);
    });
});
