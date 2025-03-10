import {
  calculateReducedStrength,
} from '../../utils/strengthCalculation';
import { CombatParticipant } from '../../types/combat';
import { Wound } from '../../types/wound';

describe('Strength Calculation', () => {
  const baseParticipant = {
    id: 'test-char',
    name: 'Test Character',
    isNPC: false,
    isPlayer: true,
    weapon: undefined,
    strength: 10,
    wounds: [] as Wound[],
    inventory: [],
    attributes: {
      baseStrength: 10,
      strength: 10,
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      bravery: 5,
      experience: 5,
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
          turnReceived: 1,
        },
      ],
    });
    expect(result2).toBe(1);
  });

  test('should properly cap strength at minimum value', () => {
    const participant = { ...baseParticipant };

    // Test multiple wounds
    const woundedParticipant: CombatParticipant = {
      ...participant,
      isPlayer: true,
      wounds: [
        {
          location: 'head',
          severity: 'light',
          strengthReduction: 2,
          turnReceived: 1,
        },
        {
          location: 'chest',
          severity: 'light',
          strengthReduction: 2,
          turnReceived: 1,
        },
        {
          location: 'leftArm',
          severity: 'light',
          strengthReduction: 2,
          turnReceived: 1,
        },
        {
          location: 'rightLeg',
          severity: 'light',
          strengthReduction: 2,
          turnReceived: 1,
        },
        {
          location: 'abdomen',
          severity: 'light',
          strengthReduction: 2,
          turnReceived: 1,
        },
      ],
    };

    expect(calculateReducedStrength(woundedParticipant)).toBe(1);
  });

  test('should handle healing from minimum strength', () => {
    const weakenedParticipant: CombatParticipant = {
      ...baseParticipant,
      isPlayer: true,
      strength: 1,
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
  });

  // Merged tests from strengthCalculation.test.js
  test('normal reduction', () => {
    const participant = { ...baseParticipant };
    const result = calculateReducedStrength({
      ...participant,
      wounds: [{
        location: 'head',
        severity: 'light',
        strengthReduction: 2,
        turnReceived: 1
      }]
    });
    expect(result).toEqual(8);
  });

  test('reduction below zero', () => {
    const participant = {
      ...baseParticipant,
      attributes: { ...baseParticipant.attributes, baseStrength: 10 },
    };
    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [{
        location: 'head',
        severity: 'mortal',
        strengthReduction: 20,
        turnReceived: 1
      }]
    });
    expect(result).toEqual(1);
  });

  test('large damage values', () => {
    const participant = {
      ...baseParticipant,
      attributes: { ...baseParticipant.attributes, baseStrength: 50 },
    };
    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [{
        location: 'head',
        severity: 'mortal',
        strengthReduction: 1000,
        turnReceived: 1
      }]
    });
    expect(result).toEqual(1);
  });

  test('reduction to exactly MIN_STRENGTH', () => {
    const participant = {
      ...baseParticipant,
      attributes: { ...baseParticipant.attributes, baseStrength: 10 },
    };
    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [{
        location: 'head',
        severity: 'serious',
        strengthReduction: 9,
        turnReceived: 1
      }]
    });
    expect(result).toEqual(1);
  });

  test('reduction of exactly MAX_STRENGTH', () => {
    const participant = {
      ...baseParticipant,
      attributes: { ...baseParticipant.attributes, baseStrength: 100 },
    };
    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [{
        location: 'head',
        severity: 'serious',
        strengthReduction: 50,
        turnReceived: 1
      }]
    });
    expect(result).toEqual(50);
  });

  test('zero damage', () => {
    const participant = {
      ...baseParticipant,
      attributes: { ...baseParticipant.attributes, baseStrength: 50 },
    };
    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: []
    });
    expect(result).toEqual(50);
  });

  test('negative damage values', () => {
    const participant = {
      ...baseParticipant,
      attributes: { ...baseParticipant.attributes, baseStrength: 50 },
    };
    const result = calculateReducedStrength({
      ...participant,
      isPlayer: true,
      wounds: [{
        location: 'head',
        severity: 'light',
        strengthReduction: -10,
        turnReceived: 1
      }]
    });
    expect(result).toEqual(50);
  });
});
