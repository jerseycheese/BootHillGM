import { Character } from '../../types/character';
import { getAIModel } from './config';
import { retryWithExponentialBackoff } from '../../utils/retry';

export async function generateCompleteCharacter(): Promise<Character> {
  const prompt = `
    Generate a complete character for the Boot Hill RPG. Provide values for the following attributes and skills:
    - Name
    - Speed (1-20)
    - GunAccuracy (1-20)
    - ThrowingAccuracy (1-20)
    - Strength (8-20)
    - BaseStrength (8-20)
    - Bravery (1-20)
    - Experience (0-11)
    - Shooting (1-100)
    - Riding (1-100)
    - Brawling (1-100)

    Respond with a valid JSON object. No additional text or formatting.
  `;

  try {
    const model = getAIModel();
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    const cleanedResponse = response.text().trim();

    let characterData: Partial<{
      Name: string;
      name: string;
      Speed: string | number;
      GunAccuracy: string | number;
      ThrowingAccuracy: string | number;
      Strength: string | number;
      BaseStrength: string | number;
      Bravery: string | number;
      Experience: string | number;
      Shooting: string | number;
      Riding: string | number;
      Brawling: string | number;
    }>;

    try {
      characterData = JSON.parse(cleanedResponse);
    } catch {
      // Attempt to fix common JSON issues
      const fixedResponse = cleanedResponse
        .replace(/'/g, '"')
        .replace(/(\w+):/g, '"$1":')
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/\n/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      try {
        characterData = JSON.parse(fixedResponse);
      } catch {
        throw new Error('Unable to parse character data');
      }
    }
    
    // Create a Character object from the parsed data
    const character: Character = {
      name: characterData.Name || characterData.name || 'Unknown',
      attributes: {
        speed: Number(characterData.Speed) || 10,
        gunAccuracy: Number(characterData.GunAccuracy) || 10,
        throwingAccuracy: Number(characterData.ThrowingAccuracy) || 10,
        strength: Number(characterData.Strength) || 10,
        baseStrength: Number(characterData.BaseStrength) || 10,
        bravery: Number(characterData.Bravery) || 10,
        experience: Number(characterData.Experience) || 5
      },
      skills: {
        shooting: Number(characterData.Shooting) || 50,
        riding: Number(characterData.Riding) || 50,
        brawling: Number(characterData.Brawling) || 50
      },
      wounds: [],
      isUnconscious: false
    };
    
    // Validate that all character attributes and skills are present and are valid numbers
    const isValid = (
      character.name !== 'Unknown' &&
      !isNaN(character.attributes.speed) &&
      !isNaN(character.attributes.gunAccuracy) &&
      !isNaN(character.attributes.throwingAccuracy) &&
      !isNaN(character.attributes.strength) &&
      !isNaN(character.attributes.baseStrength) &&
      !isNaN(character.attributes.bravery) &&
      !isNaN(character.attributes.experience) &&
      !isNaN(character.skills.shooting) &&
      !isNaN(character.skills.riding) &&
      !isNaN(character.skills.brawling)
    );

    if (!isValid) {
      throw new Error('Invalid character data: some attributes or skills are missing or not numbers');
    }
    
    return character;
  } catch {
    // Generate a random name using generateFieldValue instead of using a default name
    const name = await generateFieldValue('name');
    
    // Return a character with random name and default stats
    return {
      name: name.toString(),
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 10,
        bravery: 10,
        experience: 5
      },
      skills: {
        shooting: 50,
        riding: 50,
        brawling: 50
      },
      wounds: [],
      isUnconscious: false
    };
  }
}

export async function generateFieldValue(
  key: keyof Character['attributes'] | keyof Character['skills'] | 'name'
): Promise<string | number> {
  if (key === 'name') {
    const prompt = "Generate a name for a character in a Western-themed RPG. Provide only the name.";
    const model = getAIModel();
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    return response.text().trim();
  } else {
    return generateRandomValue(key);
  }
}

function generateRandomValue(key: keyof Character['attributes'] | keyof Character['skills']): number {
  const ranges: Record<keyof Character['attributes'] | keyof Character['skills'], [number, number]> = {
    speed: [1, 20],
    gunAccuracy: [1, 20],
    throwingAccuracy: [1, 20],
    strength: [8, 20],
    baseStrength: [8, 20],
    bravery: [1, 20],
    experience: [0, 11],
    shooting: [1, 100],
    riding: [1, 100],
    brawling: [1, 100],
  };

  const [min, max] = ranges[key];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function generateCharacterSummary(character: Character): Promise<string> {
  const prompt = `
    Generate a brief, engaging summary for a character in a Western-themed RPG based on the following attributes:
    Name: ${character.name}
    Attributes:
    ${Object.entries(character.attributes).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
    Skills:
    ${Object.entries(character.skills).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
    
    The summary should capture the essence of the character, their strengths, potential weaknesses, and how they might fit into a Western setting. Keep the tone consistent with a gritty, Wild West atmosphere.
    
    Respond with only the narrative summary, no additional text or formatting.
  `;

  try {
    const model = getAIModel();
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    return response.text().trim();
  } catch {
    return `A ${character.name} is a character in the Old West.`;
  }
}
