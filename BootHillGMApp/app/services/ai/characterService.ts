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
  // Roll d100 for initial value
  const roll = Math.floor(Math.random() * 100) + 1;
  
  switch(key) {
    case 'speed':
      if (roll <= 5) return 1;  // Slow
      if (roll <= 10) return 4;  // Below Average
      if (roll <= 20) return 7;  // Average
      if (roll <= 35) return 9;  // Above Average
      if (roll <= 50) return 11; // Quick
      if (roll <= 65) return 13; // Very Quick
      if (roll <= 80) return 15; // Fast
      if (roll <= 90) return 17; // Very Fast
      if (roll <= 95) return 19; // Lightning
      return 20; // Greased Lightning

    case 'gunAccuracy':
    case 'throwingAccuracy':
      if (roll <= 5) return 1;  // Very Poor
      if (roll <= 15) return 4; // Poor
      if (roll <= 25) return 7; // Below Average
      if (roll <= 35) return 10; // Average
      if (roll <= 50) return 12; // Above Average
      if (roll <= 65) return 14; // Fair
      if (roll <= 75) return 16; // Good
      if (roll <= 85) return 17; // Very Good
      if (roll <= 95) return 19; // Excellent
      if (roll <= 98) return 20; // Crack Shot
      return 20; // Deadeye

    case 'strength':
    case 'baseStrength':
      if (roll <= 2) return 8;  // Feeble
      if (roll <= 5) return 9;  // Puny
      if (roll <= 10) return 10; // Frail
      if (roll <= 17) return 11; // Weakling
      if (roll <= 25) return 12; // Sickly
      if (roll <= 40) return 13; // Average
      if (roll <= 60) return 14; // Above Average
      if (roll <= 75) return 15; // Sturdy
      if (roll <= 83) return 16; // Hardy
      if (roll <= 90) return 17; // Strong
      if (roll <= 95) return 18; // Very Strong
      if (roll <= 98) return 19; // Powerful
      return 20; // Mighty

    case 'bravery':
      if (roll <= 10) return 4;  // Coward
      if (roll <= 20) return 7;  // Cowardly
      if (roll <= 35) return 10; // Average
      if (roll <= 65) return 13; // Above Average
      if (roll <= 80) return 15; // Brave
      if (roll <= 90) return 17; // Very Brave
      if (roll <= 98) return 19; // Fearless
      return 20; // Foolhardy

    case 'experience':
      if (roll <= 40) return 0; // None
      if (roll <= 60) return 1; // 1 gunfight
      if (roll <= 75) return 2; // 2 gunfights
      if (roll <= 85) return 3; // 3 gunfights
      if (roll <= 90) return 4; // 4 gunfights
      if (roll <= 93) return 5; // 5 gunfights
      if (roll <= 95) return 6; // 6 gunfights
      if (roll <= 96) return 7; // 7 gunfights
      if (roll <= 97) return 8; // 8 gunfights
      if (roll <= 98) return 9; // 9 gunfights
      if (roll <= 99) return 10; // 10 gunfights
      return 11; // 11+ gunfights

    // Skills use percentile rolls with some modifications
    case 'shooting':
    case 'riding':
    case 'brawling':
      // Apply initial modification for player characters
      let modified = roll;
      if (roll <= 25) modified += 25;
      else if (roll <= 50) modified += 15;
      else if (roll <= 70) modified += 10;
      else if (roll <= 90) modified += 5;
      
      // Apply survival modification
      if (modified <= 51) modified += 3;
      else if (modified <= 70) modified += 2;
      else if (modified <= 90) modified += 1;
      else if (modified <= 95) modified += 0.5;
      
      return Math.min(100, Math.floor(modified));
  }
  
  return 10; // Fallback default
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
