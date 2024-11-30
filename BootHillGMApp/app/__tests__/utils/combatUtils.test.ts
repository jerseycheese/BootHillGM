import {
  cleanCharacterName,
  getWeaponName,
  isCritical,
  formatHitMessage,
  formatMissMessage,
  calculateCombatDamage
} from '../../utils/combatUtils';
import { Character } from '../../types/character';
import { Weapon, WEAPON_STATS } from '../../types/combat';

describe('Combat Utilities', () => {
  describe('cleanCharacterName', () => {
    it('removes metadata markers from character names', () => {
      const name = 'John ACQUIRED_ITEMS: REMOVED_ITEMS: Smith';
      expect(cleanCharacterName(name)).toBe('John Smith');
    });

    it('removes suggested actions from character names', () => {
      const name = 'John SUGGESTED_ACTIONS: [{"text": "action"}] Smith';
      expect(cleanCharacterName(name)).toBe('John Smith');
    });
  });

  describe('getWeaponName', () => {
    it('returns weapon name when present', () => {
      const character: Character = {
        name: 'Test',
        attributes: {
          speed: 5,
          gunAccuracy: 5,
          throwingAccuracy: 5,
          strength: 5,
          baseStrength: 5,
          bravery: 5,
          experience: 5
        },
        skills: {
          shooting: 50,
          riding: 50,
          brawling: 50
        },
        wounds: [],
        isUnconscious: false,
        inventory: [],
        weapon: {
          id: 'revolver',
          name: 'Revolver',
          modifiers: WEAPON_STATS['Colt Revolver'],
          ammunition: 6,
          maxAmmunition: 6
        }
      };
      expect(getWeaponName(character)).toBe('Revolver');
    });

    it('returns "fists" when no weapon present', () => {
      const character: Character = {
        name: 'Test',
        attributes: {
          speed: 5,
          gunAccuracy: 5,
          throwingAccuracy: 5,
          strength: 5,
          baseStrength: 5,
          bravery: 5,
          experience: 5
        },
        skills: {
          shooting: 50,
          riding: 50,
          brawling: 50
        },
        wounds: [],
        isUnconscious: false,
        inventory: []
      };
      expect(getWeaponName(character)).toBe('fists');
    });
  });

  describe('isCritical', () => {
    it('returns true for rolls ≤5', () => {
      expect(isCritical(5)).toBe(true);
      expect(isCritical(1)).toBe(true);
    });

    it('returns true for rolls ≥96', () => {
      expect(isCritical(96)).toBe(true);
      expect(isCritical(100)).toBe(true);
    });

    it('returns false for normal rolls', () => {
      expect(isCritical(50)).toBe(false);
    });
  });

  describe('formatHitMessage', () => {
    it('formats hit message correctly with cleaned names', () => {
      const params = {
        attackerName: 'John SUGGESTED_ACTIONS: [{"text": "action"}]',
        defenderName: 'Bandit LOCATION: Saloon',
        weaponName: 'Revolver',
        damage: 5,
        roll: 50,
        hitChance: 70
      };
      expect(formatHitMessage(params)).toBe(
        'John hits Bandit with Revolver for 5 damage! [Roll: 50/70]'
      );
    });

    it('includes critical hit notation', () => {
      const params = {
        attackerName: 'John',
        defenderName: 'Bandit',
        weaponName: 'Revolver',
        damage: 5,
        roll: 3,
        hitChance: 70
      };
      expect(formatHitMessage(params)).toBe(
        'John hits Bandit with Revolver for 5 damage! [Roll: 3/70 - Critical!]'
      );
    });
  });

  describe('formatMissMessage', () => {
    it('formats miss message correctly with cleaned names', () => {
      const attackerName = 'John SUGGESTED_ACTIONS: [{"text": "action"}]';
      const defenderName = 'Bandit LOCATION: Saloon';
      expect(formatMissMessage(attackerName, defenderName, 80, 70)).toBe(
        'John misses Bandit! [Roll: 80/70]'
      );
    });
  });

  describe('calculateCombatDamage', () => {
    it('returns a number between 1 and 6', () => {
      const damage = calculateCombatDamage();
      expect(damage).toBeGreaterThanOrEqual(1);
      expect(damage).toBeLessThanOrEqual(6);
    });

    it('calculates damage based on weapon modifiers', () => {
      const weapon: Weapon = {
        id: 'revolver',
        name: 'Colt Revolver',
        modifiers: WEAPON_STATS['Colt Revolver'],
        ammunition: 6,
        maxAmmunition: 6
      };
      const damage = calculateCombatDamage(weapon);
      expect(damage).toBeGreaterThanOrEqual(1);
      expect(damage).toBeLessThanOrEqual(7); // 1d6 can be 1 to 6, plus 1 modifier
    });
  });
});
