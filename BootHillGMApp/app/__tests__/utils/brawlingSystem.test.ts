import { resolveBrawlingRound, PUNCHING_TABLE, GRAPPLING_TABLE } from '../../utils/brawlingSystem';

describe('resolveBrawlingRound', () => {
  it('should return valid result for punching with no modifier', () => {
    const result = resolveBrawlingRound(0, true);
    expect(result.roll).toBeGreaterThanOrEqual(2);
    expect(result.roll).toBeLessThanOrEqual(6);
    expect(PUNCHING_TABLE[result.roll]).toBeDefined();
  });

  it('should return valid result for grappling with no modifier', () => {
    const result = resolveBrawlingRound(0, false);
    expect(result.roll).toBeGreaterThanOrEqual(2);
    expect(result.roll).toBeLessThanOrEqual(6);
    expect(GRAPPLING_TABLE[result.roll]).toBeDefined();
  });

  it('should apply positive modifier correctly', () => {
    const result = resolveBrawlingRound(2, true);
    expect(result.roll).toBeGreaterThanOrEqual(4);
    expect(result.roll).toBeLessThanOrEqual(6);
  });

  it('should apply negative modifier correctly', () => {
    const result = resolveBrawlingRound(-2, true);
    expect(result.roll).toBeGreaterThanOrEqual(2);
    expect(result.roll).toBeLessThanOrEqual(4);
  });

  it('should clamp roll results between 2 and 6', () => {
    const highModifierResult = resolveBrawlingRound(10, true);
    expect(highModifierResult.roll).toBe(6);

    const lowModifierResult = resolveBrawlingRound(-10, true);
    expect(lowModifierResult.roll).toBe(2);
  });

  it('should return valid result structure', () => {
    const result = resolveBrawlingRound(0, true);
    expect(result).toMatchObject({
      roll: expect.any(Number),
      result: expect.any(String),
      damage: expect.any(Number),
      location: expect.stringMatching(/head|chest|abdomen|leftArm|rightArm|leftLeg|rightLeg/),
      nextRoundModifier: expect.any(Number)
    });
  });

  // Test specific table entries for punching
  describe('Punching Table Results', () => {
    const testCases = [
      { roll: 2, expected: PUNCHING_TABLE[2] },
      { roll: 3, expected: PUNCHING_TABLE[3] },
      { roll: 4, expected: PUNCHING_TABLE[4] },
      { roll: 5, expected: PUNCHING_TABLE[5] },
      { roll: 6, expected: PUNCHING_TABLE[6] }
    ];

    testCases.forEach(({ roll, expected }) => {
      it(`should return correct result for roll ${roll}`, () => {
        const result = resolveBrawlingRound(0, true, roll); // Force specific roll
        expect(result).toMatchObject(expected);
      });
    });
  });

  // Test specific table entries for grappling
  describe('Grappling Table Results', () => {
    const testCases = [
      { roll: 2, expected: GRAPPLING_TABLE[2] },
      { roll: 3, expected: GRAPPLING_TABLE[3] },
      { roll: 4, expected: GRAPPLING_TABLE[4] },
      { roll: 5, expected: GRAPPLING_TABLE[5] },
      { roll: 6, expected: GRAPPLING_TABLE[6] }
    ];

    testCases.forEach(({ roll, expected }) => {
      it(`should return correct result for roll ${roll}`, () => {
        const result = resolveBrawlingRound(0, false, roll); // Force specific roll
        expect(result).toMatchObject(expected);
      });
    });
  });

  // Test dice rolling integration edge cases
  describe('Dice Rolling Integration', () => {
    it('should handle minimum dice roll correctly', () => {
      const result = resolveBrawlingRound(-10, true);
      expect(result.roll).toBe(2);
      expect(result).toMatchObject(PUNCHING_TABLE[2]);
    });

    it('should handle maximum dice roll correctly', () => {
      const result = resolveBrawlingRound(10, true);
      expect(result.roll).toBe(6);
      expect(result).toMatchObject(PUNCHING_TABLE[6]);
    });
  });
});
