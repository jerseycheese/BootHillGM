import { rollDice } from '../../utils/diceUtils';

// Test suite for the dice rolling utility function
describe('rollDice', () => {
  // Test edge case for 0-sided dice
  it('should return 0 for 0-sided dice', () => {
    const result = rollDice({ count: 1, sides: 0 });
    expect(result).toBe(0);
  });

  // Test basic single die roll functionality
  it('should return correct value for single die roll', () => {
    const result = rollDice({ count: 1, sides: 6 });
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(6);
  });

  // Test multiple dice roll functionality
  it('should return correct value for multiple dice', () => {
    const result = rollDice({ count: 3, sides: 6 });
    expect(result).toBeGreaterThanOrEqual(3);
    expect(result).toBeLessThanOrEqual(18);
  });

  // Test modifier application
  it('should apply modifier correctly', () => {
    const result = rollDice({ count: 1, sides: 6, modifier: 2 });
    expect(result).toBeGreaterThanOrEqual(3);
    expect(result).toBeLessThanOrEqual(8);
  });

  // Test advantage mechanic
  it('should handle advantage correctly', () => {
    const result = rollDice({ count: 1, sides: 6, advantage: true });
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(6);
  });

  // Test disadvantage mechanic
  it('should handle disadvantage correctly', () => {
    const result = rollDice({ count: 1, sides: 6, disadvantage: true });
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(6);
  });

  // Test edge case where both advantage and disadvantage are true
  it('should ignore both advantage and disadvantage when both are true', () => {
    const result = rollDice({ count: 1, sides: 6, advantage: true, disadvantage: true });
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(6);
  });
});
