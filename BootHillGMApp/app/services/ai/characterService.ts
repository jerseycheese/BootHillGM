import { Character, ValidationError } from '../../types/character';
import { getAIModel } from '../../utils/aiService';
import { retryWithExponentialBackoff } from '../../utils/retry';
import { generateName } from './nameGenerator';
import { generateRandomAttributes } from '../character/attributeGenerator';
import { CharacterLogger } from '../../utils/characterLogging';
import { validateCharacter } from '../../utils/characterValidation';

/**
 * Generates a complete character for the Boot Hill RPG.
 * Uses AI to generate character attributes and a summary.
 * 
 * @returns A Promise that resolves to a Character object
 */
export async function generateCompleteCharacter(): Promise<Character> {
  const logger = new CharacterLogger('generation');
  
  try {
    const prompt = `
      Generate a complete character for the Boot Hill RPG. Provide values for the following attributes:
      - Name
      - Speed (1-20)
      - GunAccuracy (1-20)
      - ThrowingAccuracy (1-20)
      - Strength (8-20)
      - BaseStrength (8-20)
      - Bravery (1-20)
      - Experience (0-11)

      Respond with a valid JSON object. No additional text or formatting.
    `;

    const model = getAIModel();
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    const cleanedResponse = (await response.text()).trim();

    logger.log('aiResponse', cleanedResponse);

    const characterData = parseCharacterData(cleanedResponse);
    logger.log('parsed', characterData);

    try {
      const validationResult = validateCharacter(characterData);
      if (!validationResult.isValid) {
        throw new CharacterGenerationError(validationResult.errors || []);
      }
    } catch (error) {
      // If the error message contains 'validation', re-throw it
      if (error instanceof Error && error.message.includes('validation')) {
        throw error;
      }
      // Otherwise, let it propagate to the outer catch block
      throw error;
    }

    const character = createCharacterFromData(characterData);
    logger.complete(character);
    return character;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error);
    } else {
      logger.error(new Error(String(error)));
    }
    
    // Re-throw validation errors, fall back for other errors
    if (error instanceof Error && error.message.includes('validation')) {
      throw error;
    }
    
    // For other errors, fall back to random generation
    const randomCharacter = await createRandomCharacter();
    logger.log('fallback', 'Using randomly generated character');
    return randomCharacter;
  }
}

class CharacterGenerationError extends Error {
  constructor(public errors: ValidationError[]) {
    super('Character generation failed validation');
  }
}

function parseCharacterData(response: string): Character {
  // Remove any leading/trailing backticks and the word "json"
  const cleanedResponse = response.replace(/^```json|```$/g, '').trim();

  try {
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error parsing character data:', error);
    console.error('Cleaned response:', cleanedResponse);
    throw new Error('Unable to parse character data');
  }
}

function createCharacterFromData(data: Character): Character {
  const character: Character = {
    id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name || data.name || 'Unknown',
    attributes: {
      speed: Number(data.attributes.speed) || 10,
      gunAccuracy: Number(data.attributes.gunAccuracy) || 10,
      throwingAccuracy: Number(data.attributes.throwingAccuracy) || 10,
      strength: Number(data.attributes.strength) || 10,
      baseStrength: Number(data.attributes.baseStrength) || 10,
      bravery: Number(data.attributes.bravery) || 10,
      experience: Number(data.attributes.experience) || 5
    },
    minAttributes: {
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 8,
      baseStrength: 8,
      bravery: 1,
      experience: 0
    },
    maxAttributes: {
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      strength: 20,
      baseStrength: 20,
      bravery: 20,
      experience: 11
    },
    wounds: [],
    isUnconscious: false,
    inventory: { items: [] },
    isNPC: false,
    isPlayer: true
  };

  validateCharacterData(character);
  return character;
}

function validateCharacterData(character: Character): void {
  const isValid = (
    character.name !== 'Unknown' &&
    !isNaN(character.attributes.speed) &&
    !isNaN(character.attributes.gunAccuracy) &&
    !isNaN(character.attributes.throwingAccuracy) &&
    !isNaN(character.attributes.strength) &&
    !isNaN(character.attributes.baseStrength) &&
    !isNaN(character.attributes.bravery) &&
    !isNaN(character.attributes.experience)
  );

  if (!isValid) {
    throw new Error('Invalid character data: some attributes are missing or not numbers');
  }
}

async function createRandomCharacter(): Promise<Character> {
  return {
    id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: await generateName(),
    attributes: generateRandomAttributes(),
    minAttributes: {
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 8,
      baseStrength: 8,
      bravery: 1,
      experience: 0
    },
    maxAttributes: {
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      strength: 20,
      baseStrength: 20,
      bravery: 20,
      experience: 11
    },
    wounds: [],
    isUnconscious: false,
    inventory: { items: [] },
    isNPC: false,
    isPlayer: true
  };
}

// Export the generateCharacterSummary function from summaryGenerator
export { generateCharacterSummary } from './summaryGenerator';
