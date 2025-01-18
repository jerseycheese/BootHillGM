import { Character, ValidationResult, ValidationError } from '../types/character';

export function validateCharacter(character: Character): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate required fields
  if (!character.name || character.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Character name is required',
      code: 'NAME_REQUIRED'
    });
  }

  // Validate attributes
  if (!character.attributes) {
    errors.push({
      field: 'attributes',
      message: 'Attributes are required',
      code: 'ATTRIBUTES_REQUIRED'
    });
  } else {
    const { speed, gunAccuracy, throwingAccuracy, strength } = character.attributes;
    
    if (speed < 1 || speed > 10) {
      errors.push({
        field: 'speed',
        message: 'Speed must be between 1 and 10',
        code: 'INVALID_SPEED'
      });
    }
    
    if (gunAccuracy < 1 || gunAccuracy > 10) {
      errors.push({
        field: 'gunAccuracy',
        message: 'Gun accuracy must be between 1 and 10',
        code: 'INVALID_GUN_ACCURACY'
      });
    }
    
    if (throwingAccuracy < 1 || throwingAccuracy > 10) {
      errors.push({
        field: 'throwingAccuracy',
        message: 'Throwing accuracy must be between 1 and 10',
        code: 'INVALID_THROWING_ACCURACY'
      });
    }
    
    if (strength < 1 || strength > 10) {
      errors.push({
        field: 'strength',
        message: 'Strength must be between 1 and 10',
        code: 'INVALID_STRENGTH'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}