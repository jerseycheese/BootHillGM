import { Character } from '../../../types/character';

/**
 * Validates the character attributes from parsed data
 * 
 * @param attributes - Character attributes to validate
 * @returns Boolean indicating whether the attributes are valid
 */
function validateCharacterAttributes(attributes: Record<string, unknown>): boolean {
  const requiredAttributes = [
    'speed', 
    'gunAccuracy', 
    'throwingAccuracy', 
    'strength', 
    'baseStrength', 
    'bravery', 
    'experience'
  ];
  
  return requiredAttributes.every(attr => 
    attr in attributes && 
    typeof attributes[attr] === 'number' && 
    !isNaN(attributes[attr] as number)
  );
}

/**
 * Attempts to parse raw JSON data as a Character object
 * 
 * @param text - Raw text that might contain JSON character data
 * @returns Character object if valid, null otherwise
 */
export function parseCharacterFromJSON(text: string): Character | null {
  try {
    const characterData = JSON.parse(text);
    
    // Validate the character data has required properties
    if (!characterData.name || typeof characterData.name !== 'string') {
      return null;
    }
    
    // Validate the attributes object exists and has required properties
    if (!characterData.attributes || 
        typeof characterData.attributes !== 'object' || 
        !validateCharacterAttributes(characterData.attributes)) {
      return null;
    }
    
    // Create the character object with validated data
    return {
      id: `character_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: characterData.name,
      attributes: {
        speed: characterData.attributes.speed,
        gunAccuracy: characterData.attributes.gunAccuracy,
        throwingAccuracy: characterData.attributes.throwingAccuracy,
        strength: characterData.attributes.strength,
        baseStrength: characterData.attributes.baseStrength,
        bravery: characterData.attributes.bravery,
        experience: characterData.attributes.experience
      },
      minAttributes: {
        speed: 0,
        gunAccuracy: 0,
        throwingAccuracy: 0,
        strength: 0,
        baseStrength: 0,
        bravery: 0,
        experience: 0
      },
      maxAttributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 20,
        baseStrength: 20,
        bravery: 20,
        experience: 20
      },
      wounds: [],
      isUnconscious: false,
      inventory: { items: [] },
      isNPC: true,
      isPlayer: false
    };
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      console.error('Unexpected error in character data parsing:', error);
    }
    return null;
  }
}

/**
 * Creates a basic opponent character with default attributes
 * 
 * @param name - Name of the opponent
 * @returns Character object for the opponent
 */
export function createOpponentCharacter(name: string): Character {
  return {
    id: `character_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5
    },
    minAttributes: {
      speed: 0,
      gunAccuracy: 0,
      throwingAccuracy: 0,
      strength: 0,
      baseStrength: 0,
      bravery: 0,
      experience: 0
    },
    maxAttributes: {
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      strength: 20,
      baseStrength: 20,
      bravery: 20,
      experience: 20
    },
    wounds: [],
    isUnconscious: false,
    inventory: { items: [] },
    isNPC: true,
    isPlayer: false
  };
}
