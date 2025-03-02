import { checkKnockout } from '../../utils/combatUtils';
import { Character } from '../../types/character';

describe('checkKnockout', () => {
  const baseCharacter: Character = {
    id: 'test',
    name: 'Test Character',
    isNPC: false,
    isPlayer: false,
    attributes: {
      strength: 10,
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      baseStrength: 10,
      bravery: 5,
      experience: 0,
    },
    wounds: [],
    inventory: [],
    isUnconscious: false,
    strengthHistory: {
      changes: [],
      baseStrength: 10
    },
    weapon: undefined
  };

  const playerCharacter: Character = { ...baseCharacter, id: 'player', name: 'Player', isPlayer: true };
  const opponent: Character = { ...baseCharacter, id: 'opponent', name: 'Opponent' };

  it('should return isKnockout: true and the correct winner when the player knocks out the opponent', () => {
    const result = checkKnockout({
      isPlayer: true,
      playerCharacter,
      opponent,
      newStrength: 0,
      damage: 5,
      isPunching: true,
      location: 'head',
    });

    expect(result.isKnockout).toBe(true);
    expect(result.winner).toBe('player');
    expect(result.summary).toBe('Player knocked out Opponent with a punch to the head!');
  });

  it('should return isKnockout: true and the correct winner when the opponent knocks out the player', () => {
    const result = checkKnockout({
      isPlayer: false,
      playerCharacter,
      opponent,
      newStrength: 0,
      damage: 5,
      isPunching: false,
      location: 'abdomen',
    });

    expect(result.isKnockout).toBe(true);
    expect(result.winner).toBe('opponent');
    expect(result.summary).toBe('Opponent knocked out Player with a grapple to the abdomen!');
  });

  it('should return isKnockout: false when there is no knockout', () => {
    const result = checkKnockout({
      isPlayer: true,
      playerCharacter,
      opponent,
      newStrength: 5,
      damage: 5,
      isPunching: true,
      location: 'arm',
    });

    expect(result.isKnockout).toBe(false);
    expect(result.winner).toBeUndefined();
    expect(result.summary).toBeUndefined();
  });
});
