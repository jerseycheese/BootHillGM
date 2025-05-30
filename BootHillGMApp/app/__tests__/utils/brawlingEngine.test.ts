import { BrawlingEngine } from '../../utils/brawlingEngine';
import { BrawlingResult } from '../../utils/brawlingSystem';

/**
 * BrawlingEngine tests
 * Note: Strength calculation tests are handled in strengthSystem.test.ts
 */
describe('BrawlingEngine', () => {
  describe('calculateBrawlingResult', () => {
    it('should calculate punching result correctly', () => {
      const result = BrawlingEngine.calculateBrawlingResult({
        roll: 4,
        modifier: 0,
        isPunching: true
      });

      expect(result).toEqual({
        roll: 4,
        result: 'Solid Hit',
        damage: 2,
        location: 'chest',
        nextRoundModifier: 0
      });
    });

    it('should calculate grappling result correctly', () => {
      const result = BrawlingEngine.calculateBrawlingResult({
        roll: 4,
        modifier: 0,
        isPunching: false
      });

      expect(result).toEqual({
        roll: 4,
        result: 'Firm Grip',
        damage: 2,
        location: 'chest',
        nextRoundModifier: 0
      });
    });

    it('should handle modifiers correctly', () => {
      const result = BrawlingEngine.calculateBrawlingResult({
        roll: 3,
        modifier: 1,
        isPunching: true
      });

      expect(result.roll).toBe(4);
      expect(result.result).toBe('Solid Hit');
    });

    it('should clamp roll values between 2 and 6', () => {
      const lowResult = BrawlingEngine.calculateBrawlingResult({
        roll: 1,
        modifier: -2,
        isPunching: true
      });
      expect(lowResult.roll).toBe(2);

      const highResult = BrawlingEngine.calculateBrawlingResult({
        roll: 6,
        modifier: 2,
        isPunching: true
      });
      expect(highResult.roll).toBe(6);
    });

    it('should provide fallback for invalid results', () => {
      const result = BrawlingEngine.calculateBrawlingResult({
        roll: 7, // Invalid roll
        modifier: 0,
        isPunching: true
      });

      expect(result).toEqual({
        roll: 6, // Should be clamped to 6
        result: 'Critical Hit',
        damage: 4,
        location: 'head',
        nextRoundModifier: 2
      });
    });
  });

  describe('formatCombatMessage', () => {
    it('should format punching message correctly', () => {
      const result: BrawlingResult = {
        roll: 4,
        result: 'Solid Hit',
        damage: 2,
        location: 'chest',
        nextRoundModifier: 0
      };

      const message = BrawlingEngine.formatCombatMessage('John', result, true);
      expect(message).toBe('John punches with Solid Hit (Roll: 4) dealing 2 damage to chest');
    });

    it('should format grappling message correctly', () => {
      const result: BrawlingResult = {
        roll: 4,
        result: 'Firm Grip',
        damage: 2,
        location: 'chest',
        nextRoundModifier: 0
      };

      const message = BrawlingEngine.formatCombatMessage('John', result, false);
      expect(message).toBe('John grapples with Firm Grip (Roll: 4) dealing 2 damage to chest');
    });
  });

});
