import { resolveWeaponAction } from '../../utils/weaponCombatResolver';
import { Character } from '../../types/character';
import { Weapon } from '../../types/combat';

describe('resolveWeaponAction', () => {
  const mockCharacter: Character = {
    name: 'Test Character',
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 50,
      experience: 5
    },
    wounds: [],
    isUnconscious: false,
    inventory: [],
    weapon: {
        id: 'colt-revolver',
        name: 'Colt Revolver',
        modifiers: {
          damage: '2d6',
          range: 20,
          accuracy: 2,
          reliability: 95,
          speed: 1
        }
      }
  };

  const mockOpponent: Character = {
    ...mockCharacter,
    name: 'Opponent',
    attributes: {
      ...mockCharacter.attributes,
      strength: 10  // Start with full strength
    },
    weapon: {
        id: 'winchester-rifle',
        name: 'Winchester Rifle',
        modifiers: {
          damage: '2d8',
          range: 50,
          accuracy: 3,
          reliability: 90,
          speed: 0
        }
      }
  };

  const mockWeapon: Weapon = {
    id: 'colt-revolver',
    name: 'Colt Revolver',
    modifiers: {
      damage: '2d6',
      range: 20,
      accuracy: 2,
      reliability: 95,
      speed: 1
    }
  };

  test('resolves aim action correctly', async () => {
    const result = await resolveWeaponAction({
      action: { type: 'aim' },
      attacker: mockCharacter,
      defender: mockOpponent,
      weapon: mockWeapon,
      currentRange: 10,
      aimBonus: 0,
      debugMode: true
    });

    expect(result?.type).toBe('aim');
    expect(result?.message).toContain('takes aim carefully');
  });

  test('resolves move action correctly', async () => {
    const result = await resolveWeaponAction({
        action: { type: 'move', targetRange: 20 },
        attacker: mockCharacter,
        defender: mockOpponent,
        weapon: mockWeapon,
        currentRange: 10,
        aimBonus: 0,
        debugMode: true
      });

    expect(result?.type).toBe('move');
    expect(result?.message).toContain('moves to 20 yards distance');
  });

  test('resolves reload action correctly', async () => {
    const result = await resolveWeaponAction({
        action: { type: 'reload' },
        attacker: mockCharacter,
        defender: mockOpponent,
        weapon: mockWeapon,
        currentRange: 10,
        aimBonus: 0,
        debugMode: true
      });

    expect(result?.type).toBe('reload');
    expect(result?.message).toContain('reloads Colt Revolver');
  });

  test('resolves fire action correctly', async () => {
    const result = await resolveWeaponAction({
        action: { type: 'fire' },
        attacker: mockCharacter,
        defender: mockOpponent,
        weapon: mockWeapon,
        currentRange: 10,
        aimBonus: 0,
        debugMode: true
      });

    expect(result?.type).toBe('fire');
  });

  test('resolves malfunction action correctly', async () => {
    const result = await resolveWeaponAction({
        action: { type: 'malfunction' },
        attacker: mockCharacter,
        defender: mockOpponent,
        weapon: mockWeapon,
        currentRange: 10,
        aimBonus: 0,
        debugMode: true
      });

    expect(result?.type).toBe('malfunction');
    expect(result?.message).toContain('malfunctions');
  });
});