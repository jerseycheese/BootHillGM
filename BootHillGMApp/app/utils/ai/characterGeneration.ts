import { Character } from '../../types/character';
import { InventoryItem } from '../../types/inventory';
import { getAIResponse } from '../../services/ai/gameService';
import { generateFieldValue } from './fieldValueGeneration';
import {} from './aiConfig';

// Function to generate a complete character using AI
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
      const response = await getAIResponse(prompt, '', []);
      // The AI returns both JSON data and narrative text together
      // Extract only the JSON portion between markdown code blocks to ensure clean parsing
      const jsonMatch = response.narrative.match(/```json\n([\s\S]*?)\n```/);
      const cleanedResponse = jsonMatch ? jsonMatch[1].trim() : response.narrative.trim();

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
      id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      wounds: [],
      isUnconscious: false,
      inventory: [] as InventoryItem[]
    };
    
    // Validate that all character attributes are present and are valid numbers
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
    
    return character;
  } catch {
    // Generate a random name using generateFieldValue instead of using a default name
    const name = await generateFieldValue('name');
    
    // Return a character with random name and default stats
    return {
      id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      wounds: [],
      isUnconscious: false,
      inventory: [] as InventoryItem[]
    };
    }
}
