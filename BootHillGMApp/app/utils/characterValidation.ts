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
    const { speed, gunAccuracy, throwingAccuracy, strength, baseStrength, bravery, experience } = character.attributes;
    
    // Validate Speed (1-20)
    if (typeof speed !== 'number' || speed < 1 || speed > 20) {
      errors.push({
        field: 'speed',
        message: 'Speed must be a number between 1 and 20',
        code: 'INVALID_SPEED'
      });
    }
    
    // Validate Gun Accuracy (1-20)
    if (typeof gunAccuracy !== 'number' || gunAccuracy < 1 || gunAccuracy > 20) {
      errors.push({
        field: 'gunAccuracy',
        message: 'Gun accuracy must be a number between 1 and 20',
        code: 'INVALID_GUN_ACCURACY'
      });
    }
    
    // Validate Throwing Accuracy (1-20)
    if (typeof throwingAccuracy !== 'number' || throwingAccuracy < 1 || throwingAccuracy > 20) {
      errors.push({
        field: 'throwingAccuracy',
        message: 'Throwing accuracy must be a number between 1 and 20',
        code: 'INVALID_THROWING_ACCURACY'
      });
    }
    
    // Validate Strength (8-20)
    if (typeof strength !== 'number' || strength < 8 || strength > 20) {
      errors.push({
        field: 'strength',
        message: 'Strength must be a number between 8 and 20',
        code: 'INVALID_STRENGTH'
      });
    }

    // Validate Base Strength (8-20) - Should match Strength
    if (typeof baseStrength !== 'number' || baseStrength < 8 || baseStrength > 20) {
      errors.push({
        field: 'baseStrength',
        message: 'Base Strength must be a number between 8 and 20',
        code: 'INVALID_BASE_STRENGTH'
      });
    }
    
    // Validate Bravery (1-20)
    if (typeof bravery !== 'number' || bravery < 1 || bravery > 20) {
      errors.push({
        field: 'bravery',
        message: 'Bravery must be a number between 1 and 20',
        code: 'INVALID_BRAVERY'
      });
    }
    
    // Validate Experience (0-11)
    if (typeof experience !== 'number' || experience < 0 || experience > 11) {
      errors.push({
        field: 'experience',
        message: 'Experience must be a number between 0 and 11',
        code: 'INVALID_EXPERIENCE'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}