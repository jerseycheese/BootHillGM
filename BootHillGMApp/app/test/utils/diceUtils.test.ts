import { rollDice, DiceRoll } from '../../utils/diceUtils';

describe('rollDice', () => {
  it('should roll the correct number of dice', () => {
    const roll: DiceRoll = { count: 3, sides: 6 };
    const result = rollDice(roll);
    expect(result).toBeGreaterThanOrEqual(3);
    expect(result).toBeLessThanOrEqual(18);
  });

  it('should handle different numbers of sides', () => {
    const roll: DiceRoll = { count: 2, sides: 10 };
    const result = rollDice(roll);
    expect(result).toBeGreaterThanOrEqual(2);
    expect(result).toBeLessThanOrEqual(20);
  });

  it('should apply positive modifiers', () => {
    const roll: DiceRoll = { count: 1, sides: 6, modifier: 2 };
    const result = rollDice(roll);
    expect(result).toBeGreaterThanOrEqual(3);
    expect(result).toBeLessThanOrEqual(8);
  });

  it('should apply negative modifiers', () => {
    const roll: DiceRoll = { count: 1, sides: 6, modifier: -2 };
    const result = rollDice(roll);
    expect(result).toBeGreaterThanOrEqual(-1);
    expect(result).toBeLessThanOrEqual(4);
  });

  it('should handle advantage correctly', () => {
    const roll: DiceRoll = { count: 2, sides: 6, advantage: true };
    const results = Array.from({ length: 100 }, () => rollDice(roll));
    const average = results.reduce((a, b) => a + b, 0) / results.length;
    expect(average).toBeGreaterThan(7); // Theoretical average for 2d6 with advantage is ~8.33
  });

  it('should handle disadvantage correctly', () => {
    const roll: DiceRoll = { count: 2, sides: 6, disadvantage: true };
    const results = Array.from({ length: 100 }, () => rollDice(roll));
    const average = results.reduce((a, b) => a + b, 0) / results.length;
    expect(average).toBeLessThan(7); // Theoretical average for 2d6 with disadvantage is ~5.67
  });

  it('should cancel advantage and disadvantage when both are true', () => {
    const roll: DiceRoll = { count: 2, sides: 6, advantage: true, disadvantage: true };
    const result = rollDice(roll);
    expect(result).toBeGreaterThanOrEqual(2);
    expect(result).toBeLessThanOrEqual(12);
  });

  it('should handle 0 dice', () => {
    const roll: DiceRoll = { count: 0, sides: 6 };
    const result = rollDice(roll);
    expect(result).toBe(0);
  });

  it('should handle 0 sides', () => {
    const roll: DiceRoll = { count: 3, sides: 0 };
    const result = rollDice(roll);
    expect(result).toBe(0);
  });
});