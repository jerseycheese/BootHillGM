import {
  calculateReducedStrength,
} from '../../utils/strengthCalculation';
import { Character } from '../../types/character';
import { Wound } from '../../types/wound';

describe('Strength Calculation', () => {
  // Create a complete Character that satisfies the Character interface
  const baseParticipant: Character = {
    id: 'test-char',
    name: 'Test Character',
    isNPC: false,
    isPlayer: true,
    weapon: undefined,
    wounds: [] as Wound[],
    inventory: { items: [] },
    attributes: {
      baseStrength: 10,
      strength: 10,
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      bravery: 5,
      experience: 5,
    },
    // Add required properties to fix TypeScript errors
    minAttributes: {
      baseStrength: 1,
      strength: 1,
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      bravery: 1,
      experience: 0,
    },
    maxAttributes: {
      baseStrength: 20,
      strength: 20,
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      bravery: 20,
      experience: 10,
    },
    isUnconscious: false,
  };

  test('should not reduce strength below minimum value (1)', () => {
    const participant = { ...baseParticipant };

    // Test reducing strength below minimum
    const result1 = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [
        {
          location: 'head',
          severity: 'mortal',
          strengthReduction: 15,
          damage: 15,
          turnReceived: 1,
        },
      ],
    });
    expect(result1).toBe(1);

    // Test reducing strength to exactly minimum
    const result2 = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [
        {
          location: 'head',
          severity: 'serious',
          strengthReduction: 9,
          damage: 9,
          turnReceived: 1,
        }
      ],
    });
    expect(result2).toBe(1);
  });

  test('should properly cap strength at minimum value', () => {
    const participant = { ...baseParticipant };

    // Test multiple wounds
    const woundedParticipant: Character = {
      ...participant,
      wounds: [
        {
          location: 'head',
          severity: 'light',
          strengthReduction: 2,
          damage: 2,
          turnReceived: 1,
        },
        {
          location: 'chest',
          severity: 'light',
          strengthReduction: 2,
          damage: 2,
          turnReceived: 1,
        },
        {
          location: 'leftArm',
          severity: 'light',
          strengthReduction: 2,
          damage: 2,
          turnReceived: 1,
        },
        {
          location: 'rightLeg',
          severity: 'light',
          strengthReduction: 2,
          damage: 2,
          turnReceived: 1,
        },
        {
          location: 'abdomen',
          severity: 'light',
          strengthReduction: 2,
          damage: 2,
          turnReceived: 1,
        },
        {
          location: 'abdomen',
          severity: 'light',
          strengthReduction: 2,
          damage: 2,
          turnReceived: 1,
        }
      ]
    };

    expect(calculateReducedStrength(woundedParticipant)).toBe(1);
  });

  test('should handle healing from minimum strength', () => {
    const weakenedParticipant: Character = {
      ...baseParticipant,
      isPlayer: true,
      attributes: {
        ...baseParticipant.attributes,
        baseStrength: 1,
      },
    };

    // Test healing from minimum strength
    const result = calculateReducedStrength(weakenedParticipant);
    expect(result).toBe(1);
  });

  test('should maintain other character attributes unchanged', () => {
    const participant = { ...baseParticipant };

    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
    });

    expect(result).toBe(10);

    const resultWithWounds = calculateReducedStrength({
      ...participant,
      wounds: [{
        location: 'head',
        severity: 'light',
        strengthReduction: 2,
        damage: 2,
        turnReceived: 1
      }]
    });
    expect(resultWithWounds).toEqual(8);
  });

  test('should handle mortal wounds', () => {
    const participant = { ...baseParticipant };
    
    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [{
        location: 'head',
        severity: 'mortal',
        strengthReduction: 20,
        damage: 20,
        turnReceived: 1
      }]
    });
    expect(result).toEqual(1);
  });

  test('should handle extreme damage', () => {
    const participant = { ...baseParticipant };
    
    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [{
        location: 'head',
        severity: 'mortal',
        strengthReduction: 1000,
        damage: 1000,
        turnReceived: 1
      }]
    });
    expect(result).toEqual(1);
  });

  test('should handle serious wounds', () => {
    const participant = { ...baseParticipant };
    
    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [{
        location: 'head',
        severity: 'serious',
        strengthReduction: 9,
        damage: 9,
        turnReceived: 1
      }]
    });
    expect(result).toEqual(1);
  });

  test('should handle high base strength', () => {
    const participant = {
      ...baseParticipant,
      attributes: { ...baseParticipant.attributes, baseStrength: 100 }
    };
    
    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [{
        location: 'head',
        severity: 'serious',
        strengthReduction: 50,
        damage: 50,
        turnReceived: 1
      }]
    });
    expect(result).toEqual(50);
  });

  test('should handle zero or negative damage', () => {
    const participant = {
      ...baseParticipant,
      attributes: { ...baseParticipant.attributes, baseStrength: 50 }
    };
    
    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [{
        location: 'head',
        severity: 'light',
        strengthReduction: -10,
        damage: -10,
        turnReceived: 1
      }]
    });
    expect(result).toEqual(50);
  });
});
