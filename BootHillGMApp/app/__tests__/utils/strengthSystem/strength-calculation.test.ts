import { mockPlayerCharacter } from '../../../test/fixtures';
import { getCharacterStrength } from '../../../utils/strengthSystem';
import { Wound } from '../../../types/wound';

describe('Strength Calculation Tests', () => {
  it('should return base strength if no wounds', () => {
    const character = {
      ...mockPlayerCharacter,
      attributes: {
        ...mockPlayerCharacter.attributes,
        strength: 15,
        baseStrength: 15,
      },
      wounds: [],
    };
    expect(getCharacterStrength(character)).toBe(15);
  });

  it('should subtract light wound penalty', () => {
    const character = {
      ...mockPlayerCharacter,
      attributes: {
        ...mockPlayerCharacter.attributes,
        strength: 15,
        baseStrength: 15,
      },
      wounds: [{ location: 'leftLeg', severity: 'light', damage: 3, strengthReduction: 3, turnReceived: 0 } as Wound],
    };
    expect(getCharacterStrength(character)).toBe(12);
  });

  it('should subtract serious wound penalty', () => {
    const character = {
      ...mockPlayerCharacter,
      attributes: {
        ...mockPlayerCharacter.attributes,
        strength: 15,
        baseStrength: 15,
      },
      wounds: [{ location: 'rightArm', severity: 'serious', damage: 7, strengthReduction: 7, turnReceived: 0 } as Wound],
    };
    expect(getCharacterStrength(character)).toBe(8);
  });

  it('should handle multiple wounds', () => {
    const character = {
      ...mockPlayerCharacter,
      attributes: {
        ...mockPlayerCharacter.attributes,
        strength: 15,
        baseStrength: 15,
      },
      wounds: [
        { location: 'leftLeg', severity: 'light', damage: 3, strengthReduction: 3, turnReceived: 0 } as Wound,
        { location: 'rightArm', severity: 'serious', damage: 7, strengthReduction: 7, turnReceived: 0 } as Wound,
      ],
    };
    expect(getCharacterStrength(character)).toBe(5);
  });

  it('should return 1 for mortal wound (not 0, due to location modifiers)', () => {
    const character = {
      ...mockPlayerCharacter,
      attributes: {
        ...mockPlayerCharacter.attributes,
        strength: 15,
        baseStrength: 15,
      },
      wounds: [{ location: 'head', severity: 'mortal', damage: Infinity, strengthReduction: Infinity, turnReceived: 0 } as Wound],
    };
    expect(getCharacterStrength(character)).toBe(1);
  });

  it('should allow strength below 1 when allowZero is true', () => {
    const character = {
      ...mockPlayerCharacter,
      attributes: {
        ...mockPlayerCharacter.attributes,
        strength: 5,
        baseStrength: 5,
      },
      wounds: [{ location: 'leftLeg', severity: 'serious', damage: 7, strengthReduction: 7, turnReceived: 0 } as Wound],
    };
    expect(getCharacterStrength(character, true)).toBe(-2);
  });
});
