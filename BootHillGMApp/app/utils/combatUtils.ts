import { Character } from '../types/character';
import { cleanText } from './textCleaningUtils';
import { CombatParticipant, NPC } from '../types/combat';

/**
 * Converts a Character object to a CombatParticipant object.
 * @param character The character object to convert.
 * @param isNPC Whether the character is an NPC or not.
 * @returns The CombatParticipant object.
 */
export function characterToCombatParticipant(
  character: Character,
  isNPC: boolean
): CombatParticipant {
  if (!isNPC) {
    return character;
  } else {
    return {
      id: character.id,
      name: character.name,
      isNPC: true,
      weapon: character.weapon || undefined,
      strength: character.attributes.strength,
      wounds: character.wounds,
      isUnconscious: false,
    } as NPC;
  }
}

/**
 * Cleans up a character name string by removing metadata and special characters.
 * @param name The character name to clean.
 * @returns The cleaned character name.
 */
export const cleanCharacterName = (name: string): string => {
  if (!name) return '';

  // Get the first line only
  let cleanedName = name.split('\n')[0];

  // Remove all metadata markers and their content
  const metadataPattern = /\s*(ACQUIRED_ITEMS|REMOVED_ITEMS|LOCATION|SUGGESTED_ACTIONS):\s*[^:]*/g;
  cleanedName = cleanedName.replace(metadataPattern, '');

  // Remove suggested actions section completely
  cleanedName = cleanedName.replace(/SUGGESTED_ACTIONS:.*?(?=\s+\w+|$)/g, '');

  // Try to remove any remaining JSON-like content
  cleanedName = cleanedName.replace(/\[[^\]]*\]/g, '');

  // Remove any remaining quoted strings
  cleanedName = cleanedName.replace(/"[^"]*"/g, '');

  // Remove any narrative indicators
  cleanedName = cleanedName.replace(/important:.*$/,'');

  // Apply existing text cleaning
  cleanedName = cleanText(cleanedName);

  // Remove any remaining colons and special characters
  cleanedName = cleanedName.replace(/[:{}\[\]]/g, '');

  // Clean up any double spaces and trim
  cleanedName = cleanedName.replace(/\s+/g, ' ').trim();

  return cleanedName.trim();
};

interface KnockoutCheckParams {
  isPlayer: boolean;
  playerCharacter: Character;
  opponent: Character;
  newStrength: number;
  damage: number;
  isPunching: boolean;
  location: string;
}

interface KnockoutResult {
  isKnockout: boolean;
  winner?: 'player' | 'opponent';
  summary?: string;
}

/**
 * Checks if a knockout has occurred based on the combat result.
 *
 * @param {KnockoutCheckParams} params - The parameters for the knockout check.
 * @param {boolean} params.isPlayer - Indicates if the player is the attacker.
 * @param {Character} params.playerCharacter - The player character object.
 * @param {Character} params.opponent - The opponent character object.
 * @param {number} params.newStrength - The new strength of the target after damage.
 * @param {number} params.damage - The amount of damage inflicted.
 * @param {boolean} params.isPunching - Indicates if the attack was a punch.
 * @param {string} params.location - The location of the hit.
 * @returns {KnockoutResult} - The result of the knockout check.
 * @returns {boolean} return.isKnockout - True if a knockout occurred, false otherwise.
 * @returns {'player' | 'opponent'} [return.winner] - The winner of the combat, if a knockout occurred.
 * @returns {string} [return.summary] - A summary of the knockout, if a knockout occurred.
 */
export function checkKnockout(params: KnockoutCheckParams): KnockoutResult {
  const { isPlayer, playerCharacter, opponent, newStrength, isPunching, location } = params;

  const target = isPlayer ? opponent : playerCharacter;
  const attacker = isPlayer ? playerCharacter : opponent;

  if (newStrength <= 0) {
    const damageType = isPunching ? "punch" : "grapple";
    const summary = `${attacker.name} knocked out ${target.name} with a ${damageType} to the ${location}!`;
    return {
      isKnockout: true,
      winner: isPlayer ? 'player' : 'opponent',
      summary,
    };
  }

  return {
    isKnockout: false,
  };
}
