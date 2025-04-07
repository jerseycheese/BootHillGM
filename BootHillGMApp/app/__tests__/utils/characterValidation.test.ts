import { validateCharacter } from '../../utils/characterValidation';
import { Character } from '../../types/character';

// Helper to create a minimal valid character structure
const createBaseCharacter = (): Partial<Character> => ({
  name: 'Test Character',
  attributes: {
    speed: 10,
    gunAccuracy: 10,
    throwingAccuracy: 10,
    strength: 15,
    baseStrength: 15,
    bravery: 10,
    experience: 5,
  },
});

describe('validateCharacter', () => {
  it('should return isValid: true for a character with valid attributes', () => {
    const character = createBaseCharacter() as Character;
    const result = validateCharacter(character);
    expect(result.isValid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should return isValid: true for attributes at boundary limits', () => {
    const character = {
      name: 'Boundary Bill',
      attributes: {
        speed: 1,
        gunAccuracy: 20,
        throwingAccuracy: 1,
        strength: 8,
        baseStrength: 8,
        bravery: 20,
        experience: 0,
      },
    } as Character;
    const result = validateCharacter(character);
    expect(result.isValid).toBe(true);
    expect(result.errors).toBeUndefined();
  });
  
  it('should return isValid: true for max attributes', () => {
     const character = {
      name: 'Maximus',
      attributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 20,
        baseStrength: 20,
        bravery: 20,
        experience: 11,
      },
    } as Character;
    const result = validateCharacter(character);
    expect(result.isValid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should return isValid: false if name is missing', () => {
    const character = { ...createBaseCharacter(), name: '' } as Character;
    const result = validateCharacter(character);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([{ field: 'name', message: 'Character name is required', code: 'NAME_REQUIRED' }]);
  });

  it('should return isValid: false if attributes are missing', () => {
    const character = { name: 'No Attributes' } as Character; // Missing attributes object
    const result = validateCharacter(character);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([{ field: 'attributes', message: 'Attributes are required', code: 'ATTRIBUTES_REQUIRED' }]);
  });

  // Test cases for invalid ranges
  test.each([
    ['speed', 0, 'INVALID_SPEED', 'Speed must be a number between 1 and 20'],
    ['speed', 21, 'INVALID_SPEED', 'Speed must be a number between 1 and 20'],
    ['gunAccuracy', 0, 'INVALID_GUN_ACCURACY', 'Gun accuracy must be a number between 1 and 20'],
    ['gunAccuracy', 21, 'INVALID_GUN_ACCURACY', 'Gun accuracy must be a number between 1 and 20'],
    ['throwingAccuracy', 0, 'INVALID_THROWING_ACCURACY', 'Throwing accuracy must be a number between 1 and 20'],
    ['throwingAccuracy', 21, 'INVALID_THROWING_ACCURACY', 'Throwing accuracy must be a number between 1 and 20'],
    ['strength', 7, 'INVALID_STRENGTH', 'Strength must be a number between 8 and 20'],
    ['strength', 21, 'INVALID_STRENGTH', 'Strength must be a number between 8 and 20'],
    ['baseStrength', 7, 'INVALID_BASE_STRENGTH', 'Base Strength must be a number between 8 and 20'],
    ['baseStrength', 21, 'INVALID_BASE_STRENGTH', 'Base Strength must be a number between 8 and 20'],
    ['bravery', 0, 'INVALID_BRAVERY', 'Bravery must be a number between 1 and 20'],
    ['bravery', 21, 'INVALID_BRAVERY', 'Bravery must be a number between 1 and 20'],
    ['experience', -1, 'INVALID_EXPERIENCE', 'Experience must be a number between 0 and 11'],
    ['experience', 12, 'INVALID_EXPERIENCE', 'Experience must be a number between 0 and 11'],
  ])('should return isValid: false for invalid %s value %p', (field, value, code, message) => {
    const character = createBaseCharacter() as Character;
    character.attributes[field as keyof Character['attributes']] = value;
    const result = validateCharacter(character);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({ field, message, code });
  });
  
   // Test cases for non-numeric types
  test.each([
    ['speed', 'fast', 'INVALID_SPEED', 'Speed must be a number between 1 and 20'],
    ['gunAccuracy', null, 'INVALID_GUN_ACCURACY', 'Gun accuracy must be a number between 1 and 20'],
    ['strength', undefined, 'INVALID_STRENGTH', 'Strength must be a number between 8 and 20'],
    ['experience', 'veteran', 'INVALID_EXPERIENCE', 'Experience must be a number between 0 and 11'],
  ])('should return isValid: false for non-numeric %s value %p', (field, value, code, message) => {
    const character = createBaseCharacter() as Character;
    // @ts-expect-error - Intentionally testing invalid type
    character.attributes[field as keyof Character['attributes']] = value; 
    const result = validateCharacter(character);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({ field, message, code });
  });
});