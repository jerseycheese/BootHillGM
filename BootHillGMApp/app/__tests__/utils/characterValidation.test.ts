import { validateCharacter } from '../../utils/characterValidation';
import { Character } from '../../types/character';

describe('utils/characterValidation', () => {
  const validCharacter: Character = {
    id: 'test-id',
    name: 'Test Character',
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5
    },
    wounds: [],
    isUnconscious: false,
    inventory: [],
    isNPC: false,
    isPlayer: true
  };

  it('should validate a complete character', () => {
    const result = validateCharacter(validCharacter);
    expect(result.isValid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should invalidate missing name', () => {
    const character = { ...validCharacter, name: '' };
    const result = validateCharacter(character);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'name',
      message: 'Character name is required',
      code: 'NAME_REQUIRED'
    });
  });

  it('should invalidate missing attributes', () => {
    const character = { ...validCharacter, attributes: null as unknown as Character['attributes'] };
    const result = validateCharacter(character);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'attributes',
      message: 'Attributes are required',
      code: 'ATTRIBUTES_REQUIRED'
    });
  });

  it('should invalidate out-of-range speed', () => {
    const character = { 
      ...validCharacter,
      attributes: { ...validCharacter.attributes, speed: 0 }
    };
    const result = validateCharacter(character);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'speed',
      message: 'Speed must be between 1 and 10',
      code: 'INVALID_SPEED'
    });
  });

  // Additional tests for other attribute validations...
});