import {
  validateStrength,
  MIN_STRENGTH,
  MAX_STRENGTH,
} from '../../utils/combat/strengthUtils';

describe('validateStrength', () => {
  test('handles normal values unchanged', () => {
    expect(validateStrength(50)).toEqual({
      value: 50,
      wasAdjusted: false,
      reason: null,
    });
  });

  test('handles Infinity', () => {
    expect(validateStrength(Infinity)).toEqual({
      value: MIN_STRENGTH,
      wasAdjusted: true,
      reason: 'non-finite-value',
    });
  });

  test('handles negative Infinity', () => {
    expect(validateStrength(-Infinity)).toEqual({
      value: MIN_STRENGTH,
      wasAdjusted: true,
      reason: 'non-finite-value',
    });
  });

  test('handles NaN', () => {
    expect(validateStrength(NaN)).toEqual({
      value: MIN_STRENGTH,
      wasAdjusted: true,
      reason: 'non-finite-value',
    });
  });

  test('handles negative values', () => {
    expect(validateStrength(-10)).toEqual({
      value: MIN_STRENGTH,
      wasAdjusted: true,
      reason: 'below-minimum',
    });
  });

  test('handles above maximum', () => {
    expect(validateStrength(MAX_STRENGTH + 1)).toEqual({
      value: MAX_STRENGTH,
      wasAdjusted: true,
      reason: 'above-maximum',
    });
  });
});