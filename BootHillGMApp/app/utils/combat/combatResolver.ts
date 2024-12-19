import { Character } from '../../types/character';
import { CombatSituation, getHitModifiers } from './hitModifiers';
import { getBraveryModifiers } from './braveryModifiers';
import { getExperienceModifier } from './experienceModifiers';
import { determineWoundLocation, WoundResult } from './woundDetermination';

export interface CombatResult {
  hit: boolean;
  roll: number;
  targetNumber: number;
  wound?: WoundResult;  // Changed back to optional
}

export const resolveCombatRound = (
  attacker: Character,
  defender: Character,
  situation: CombatSituation
): CombatResult => {
  // Calculate base hit chance per Boot Hill rules
  const braveryMods = getBraveryModifiers(attacker.attributes.bravery);
  const expMod = getExperienceModifier(attacker.attributes.experience);
  const situationMod = getHitModifiers(situation);
  
  const targetNumber = 50 + 
    attacker.attributes.gunAccuracy + 
    braveryMods.accuracyMod + 
    expMod +
    situationMod;

  const roll = Math.floor(Math.random() * 100) + 1;
  const hit = roll <= targetNumber;

  if (!hit) {
    return { hit: false, roll, targetNumber };
  }

  const wound = determineWoundLocation();
  
  return { hit: true, roll, targetNumber, wound };
};