import { Character } from '../../types/character';
import { getAIModel } from '../../utils/aiService';
import { retryWithExponentialBackoff } from '../../utils/retry';
import { generateName } from './nameGenerator';
import { generateRandomAttributes } from '../character/attributeGenerator';

/**
 * Generates a complete character for the Boot Hill RPG.
 * Uses AI to generate character attributes and a summary.
 * 
 * @returns A Promise that resolves to a Character object
 */
export async function generateCompleteCharacter(): Promise<Character> {
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

  try {
    const model = getAIModel();
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    const cleanedResponse = response.text().trim();

    console.log('AI Response:', cleanedResponse); // Log the AI's raw response

    const characterData = parseCharacterData(cleanedResponse);

    console.log('Parsed Character Data:', characterData); // Log the parsed data

    return createCharacterFromData(characterData);
  } catch (error) {
    console.error('Error generating character:', error);
    return createRandomCharacter();
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
    wounds: [],
    isUnconscious: false,
    inventory: [],
    isNPC: false,
    isPlayer: true
  };

  validateCharacter(character);
  return character;
}

function validateCharacter(character: Character): void {
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
    wounds: [],
    isUnconscious: false,
    inventory: [],
    isNPC: false,
    isPlayer: true
  };
}

// Export the generateCharacterSummary function from summaryGenerator
export { generateCharacterSummary } from './summaryGenerator';
