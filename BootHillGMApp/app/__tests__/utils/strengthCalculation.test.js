import { calculateStrengthReduction } from '../../utils/strengthCalculation';

describe('calculateStrengthReduction', () => {
  test('normal reduction', () => {
    expect(calculateStrengthReduction(100, 20)).toEqual({
      newStrength: 80,
      reduction: 20,
      wasAdjusted: false,
    });
  });

  test('reduction below zero', () => {
    expect(calculateStrengthReduction(10, 20)).toEqual({
      newStrength: 1,
      reduction: 9,
      wasAdjusted: true,
    });
  });

  test('large damage values', () => {
    expect(calculateStrengthReduction(50, 1000)).toEqual({
      newStrength: 1,
      reduction: 49,
      wasAdjusted: true,
    });
  });

  test('reduction to exactly MIN_STRENGTH', () => {
    expect(calculateStrengthReduction(10, 9)).toEqual({
      newStrength: 1,
      reduction: 9,
      wasAdjusted: true,
    });
  });

  test('reduction of exactly MAX_STRENGTH', () => {
    expect(calculateStrengthReduction(100, 50)).toEqual({
      newStrength: 50,
      reduction: 50,
      wasAdjusted: false,
    });
  });

  test('zero damage', () => {
    expect(calculateStrengthReduction(50, 0)).toEqual({
      newStrength: 50,
      reduction: 0,
      wasAdjusted: false,
    });
  });

  test('negative damage values', () => {
    expect(calculateStrengthReduction(50, -10)).toEqual({
      newStrength: 50,
      reduction: 0,
      wasAdjusted: false,
    });
  });
});