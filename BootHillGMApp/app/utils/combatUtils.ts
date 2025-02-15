import { Character } from '../types/character';
import { cleanText } from './textCleaningUtils';
import { CombatParticipant, NPC } from '../types/combat';

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

export interface CombatMessageParams {
  attackerName: string;
  defenderName: string;
  weaponName: string;
  damage: number;
  roll: number;
  hitChance: number;
}

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
  cleanedName = cleanedName.replace(/important:.*$/, '');
  
  // Apply existing text cleaning
  cleanedName = cleanText(cleanedName);
  
  // Remove any remaining colons and special characters
  cleanedName = cleanedName.replace(/[:{}\[\]]/g, '');
  
  // Clean up any double spaces and trim
  cleanedName = cleanedName.replace(/\s+/g, ' ').trim();
  
  return cleanedName.trim();
};

export const getWeaponName = (character: Character): string => {
  return character.weapon?.name || 'fists';
};

export const isCritical = (roll: number): boolean => {
  return roll <= 5 || roll >= 96;
};

export const formatHitMessage = ({
  attackerName,
  defenderName,
  weaponName,
  damage,
  roll,
  hitChance
}: CombatMessageParams): string => {
  const isCriticalHit = isCritical(roll);
  const cleanedAttacker = cleanCharacterName(attackerName);
  const cleanedDefender = cleanCharacterName(defenderName);
  
  return `${cleanedAttacker} hits ${cleanedDefender} with ${weaponName} for ${damage} damage! [Roll: ${roll}/${hitChance}${isCriticalHit ? ' - Critical!' : ''}]`;
};

export const formatMissMessage = (
  attackerName: string,
  defenderName: string,
  roll: number,
  hitChance: number
): string => {
  const cleanedAttacker = cleanCharacterName(attackerName);
  const cleanedDefender = cleanCharacterName(defenderName);
  
  return `${cleanedAttacker} misses ${cleanedDefender}! [Roll: ${roll}/${hitChance}]`;
};

export const parseWeaponDamage = (damageString: string): number => {
  // Assuming damageString is in the format "XdY" (e.g., "1d6")
  const [count, sides] = damageString.split('d').map(Number);
  let totalDamage = 0;
  for (let i = 0; i < count; i++) {
    totalDamage += Math.floor(Math.random() * sides) + 1;
  }
  return totalDamage;
};

export const calculateCombatDamage = (weapon?: { modifiers: { damage: string } }): number => {
  if (weapon) {
    return parseWeaponDamage(weapon.modifiers.damage);
  } else {
    const baseDamage = Math.floor(Math.random() * 6) + 1;
    return baseDamage;
  }
};

/**
 * Simulates a combat encounter between a player and an opponent.
 * Returns the results of the combat, including the winner and a detailed description of the events.
 * 
 * @param player - The player character
 * @param opponent - The opponent character
 * @returns An object containing the winner and a detailed description of the combat events
 */
import { getCharacterStrength, isKnockout, calculateUpdatedStrength, isCharacterDefeated } from './strengthSystem';

export const resolveCombat = (player: Character, opponent: Character): { winner: 'player' | 'opponent'; results: string } => {
  let combatLog = '';
  let round = 1;

  // Initialize starting strengths using getCharacterStrength
  player.attributes.strength = getCharacterStrength(player, true);
  opponent.attributes.strength = getCharacterStrength(opponent, true);

  while (!isCharacterDefeated(player) && !isCharacterDefeated(opponent)) {
    combatLog += `Round ${round}:\n`;

    // Player attacks opponent
    const playerRoll = Math.floor(Math.random() * 100) + 1;
    const playerHitChance = 50; // Base hit chance
    const playerDamage = calculateCombatDamage(player.weapon);

    if (playerRoll <= playerHitChance) {
      // Pass the whole opponent object to calculateUpdatedStrength
      const { newStrength, updatedHistory } = calculateUpdatedStrength(opponent, playerDamage);
      opponent.attributes.strength = newStrength;
      opponent.strengthHistory = updatedHistory;
      const isKnockedOut = isKnockout(opponent.attributes.strength, playerDamage);
      const hitMessage = formatHitMessage({
        attackerName: player.name,
        defenderName: opponent.name,
        weaponName: getWeaponName(player),
        damage: playerDamage,
        roll: playerRoll,
        hitChance: playerHitChance,
      });
      combatLog += hitMessage + '\n';

      if (isKnockedOut) {
        combatLog += `${opponent.name} is knocked out!\n`;
        break;
      }

      if (opponent.attributes.strength <= 0) {
        combatLog += `${opponent.name} is defeated!\n`;
        break;
      }
    } else {
      combatLog += formatMissMessage(player.name, opponent.name, playerRoll, playerHitChance);
    }

    // Only continue if opponent is still fighting
    if (opponent.attributes.strength <= 0) break;

    // Opponent attacks player
    const opponentRoll = Math.floor(Math.random() * 100) + 1;
    const opponentHitChance = 50; // Base hit chance
    const opponentDamage = calculateCombatDamage(opponent.weapon);

    if (opponentRoll <= opponentHitChance) {
      // Pass the whole player object to calculateUpdatedStrength
      const { newStrength, updatedHistory } = calculateUpdatedStrength(player, opponentDamage);
      player.attributes.strength = newStrength;
      player.strengthHistory = updatedHistory;
      const isKnockedOut = isKnockout(player.attributes.strength, opponentDamage);
      const hitMessage = formatHitMessage({
        attackerName: opponent.name,
        defenderName: player.name,
        weaponName: getWeaponName(opponent),
        damage: opponentDamage,
        roll: opponentRoll,
        hitChance: opponentHitChance,
      });
      combatLog += hitMessage + '\n';

      if (isKnockedOut) {
        combatLog += `${player.name} is knocked out!\n`;
        break;
      }

      if (player.attributes.strength <= 0) {
        combatLog += `${player.name} is defeated!\n`;
        break;
      }
    } else {
      combatLog += formatMissMessage(opponent.name, player.name, opponentRoll, opponentHitChance);
    }

    round++;
  }

  // Determine the winner based on final strength values and knockout status
  const winner = player.attributes.strength > opponent.attributes.strength ? 'player' : 'opponent';
  const winCondition = isKnockout(player.attributes.strength, 0) || isKnockout(opponent.attributes.strength, 0) ? 'knockout' : 'defeat';

  // Construct the final combat results
  const results = `${winner === 'player' ? player.name : opponent.name} emerges victorious by ${winCondition} after ${round} rounds of combat.\n${combatLog}`;

  return { winner, results };
};
