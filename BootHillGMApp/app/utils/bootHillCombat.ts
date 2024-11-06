/**
 * Boot Hill v2 Combat System Implementation
 * 
 * This module implements the combat rules from Boot Hill v2, including:
 * - First shot determination based on speed, bravery, and situation
 * - Hit determination with modifiers for range, movement, wounds etc.
 * - Wound location and severity calculation
 * - Experience and bravery effects on combat
 */

import { Character } from '../types/character';

export interface CombatModifiers {
  speedMod: number;
  accuracyMod: number;
}

/**
 * Calculate brawling damage based on strength and current condition
 * Ensures combat can end with knockouts
 */
export const calculateBrawlingDamage = (
  baseRoll: number,
  strength: number,
  currentStrength: number
): number => {
  // Ensure minimum damage can be dealt even at low strength
  const minimumDamage = 1;
  const maximumDamage = Math.max(
    minimumDamage,
    Math.floor((strength * baseRoll) / 10)
  );

  // If current strength is very low, ensure we can still end combat
  if (currentStrength <= 3) {
    return Math.max(minimumDamage, maximumDamage);
  }

  return maximumDamage;
};

/**
 * Calculate combat modifiers based on character's bravery score
 * From Boot Hill v2 rules table
 */
export const getBraveryModifiers = (bravery: number): CombatModifiers => {
  
  if (bravery <= 10) return { speedMod: -4, accuracyMod: -6 };
  if (bravery <= 20) return { speedMod: -2, accuracyMod: -3 };
  if (bravery <= 35) return { speedMod: 0, accuracyMod: 0 };
  if (bravery <= 65) return { speedMod: 1, accuracyMod: 3 };
  if (bravery <= 80) return { speedMod: 2, accuracyMod: 6 };
  if (bravery <= 90) return { speedMod: 3, accuracyMod: 10 };
  if (bravery <= 98) return { speedMod: 4, accuracyMod: 15 };
  return { speedMod: 5, accuracyMod: 15 }; // Foolhardy (99-00)
};

/**
 * Calculate experience modifier based on number of previous gunfights
 * From Boot Hill v2 rules table
 */
export const getExperienceModifier = (previousGunfights: number): number => {
  if (previousGunfights === 0) return -10;
  if (previousGunfights === 1 || previousGunfights === 2) return -5;
  if (previousGunfights <= 4) return 0;
  if (previousGunfights <= 6) return 2;
  if (previousGunfights <= 8) return 6;
  if (previousGunfights <= 10) return 8;
  return 10; // 11 or more gunfights
};

export interface WoundResult {
  location: string;
  severity: 'Light' | 'Serious' | 'Mortal';
  strengthReduction: number;
  specialEffects?: string;
}

/**
 * Determine wound location and severity based on random rolls
 * Complete implementation of Boot Hill v2 wound chart
 */
export const determineWoundLocation = (): WoundResult => {
  const locationRoll = Math.floor(Math.random() * 100) + 1;
  const severityRoll = Math.floor(Math.random() * 100) + 1;

  if (locationRoll <= 10) {
    const severity = severityRoll <= 40 ? 'Light' : severityRoll <= 80 ? 'Serious' : 'Mortal';
    return {
      location: 'Left Leg',
      severity,
      strengthReduction: severity === 'Light' ? 3 : severity === 'Serious' ? 7 : 15,
      specialEffects: 'Movement reduced'
    };
  }
  
  if (locationRoll <= 20) {
    const severity = severityRoll <= 40 ? 'Light' : severityRoll <= 80 ? 'Serious' : 'Mortal';
    return {
      location: 'Right Leg',
      severity,
      strengthReduction: severity === 'Light' ? 3 : severity === 'Serious' ? 7 : 15,
      specialEffects: 'Movement reduced'
    };
  }

  if (locationRoll <= 30) {
    const severity = severityRoll <= 30 ? 'Light' : severityRoll <= 70 ? 'Serious' : 'Mortal';
    return {
      location: 'Left Arm',
      severity,
      strengthReduction: severity === 'Light' ? 2 : severity === 'Serious' ? 5 : 10,
      specialEffects: 'Two-handed weapons unusable'
    };
  }

  if (locationRoll <= 40) {
    const severity = severityRoll <= 30 ? 'Light' : severityRoll <= 70 ? 'Serious' : 'Mortal';
    return {
      location: 'Right Arm',
      severity,
      strengthReduction: severity === 'Light' ? 2 : severity === 'Serious' ? 5 : 10,
      specialEffects: 'Gun arm penalties apply'
    };
  }

  if (locationRoll <= 70) {
    const severity = severityRoll <= 20 ? 'Light' : severityRoll <= 60 ? 'Serious' : 'Mortal';
    return {
      location: 'Body',
      severity,
      strengthReduction: severity === 'Light' ? 4 : severity === 'Serious' ? 8 : 20
    };
  }

  // Head (71-100)
  const severity = severityRoll <= 10 ? 'Light' : severityRoll <= 40 ? 'Serious' : 'Mortal';
  return {
    location: 'Head',
    severity,
    strengthReduction: severity === 'Light' ? 5 : severity === 'Serious' ? 10 : 25,
    specialEffects: severity === 'Serious' ? 'Stunned for 1d6 rounds' : severity === 'Mortal' ? 'Immediate death' : undefined
  };
};

export interface CombatSituation {
  isMoving: boolean;
  movementType?: 'walking' | 'crawling' | 'running' | 'dodging' | 'trotting' | 'galloping';
  targetMoving: boolean;
  targetMovementType?: 'walking' | 'crawling' | 'running' | 'dodging' | 'trotting' | 'galloping';
  range: 'short' | 'medium' | 'long' | 'extreme';
  weaponResting?: boolean;
  shotNumber?: number;
  weaponType?: 'scatter' | 'shotgun' | 'normal';
  wrongHand?: boolean;
  woundedGunArm?: 'light' | 'serious';
  twoGuns?: boolean;
  hipShooting?: boolean;
  targetObscured?: boolean;
}

/**
 * Calculate hit modifiers based on combat situation
 * Implements all Boot Hill v2 situational modifiers
 */
export const getHitModifiers = (situation: CombatSituation): number => {
  let modifier = 0;

  // Range modifiers
  switch (situation.range) {
    case 'short': modifier -= 10; break;
    case 'long': modifier += 15; break;
    case 'extreme': modifier += 25; break;
  }

  // Movement modifiers
  if (situation.isMoving) {
    switch (situation.movementType) {
      case 'walking': modifier -= 5; break;
      case 'crawling': modifier -= 10; break;
      case 'running': modifier -= 20; break;
      case 'dodging': modifier -= 30; break;
      case 'trotting': modifier -= 15; break;
      case 'galloping': modifier -= 25; break;
    }
  }

  // Target movement modifiers
  if (situation.targetMoving) {
    switch (situation.targetMovementType) {
      case 'walking':
      case 'crawling': modifier += 5; break;
      case 'running':
      case 'trotting': modifier += 10; break;
      case 'galloping': modifier += 15; break;
      case 'dodging': modifier += 20; break;
    }
  }

  // Additional modifiers
  if (situation.weaponResting) modifier += 10;
  if (situation.shotNumber === 2) modifier -= 10;
  if (situation.shotNumber === 3) modifier -= 20;
  if (situation.weaponType === 'scatter') modifier -= 20;
  if (situation.weaponType === 'shotgun') modifier -= 10;
  if (situation.wrongHand) modifier -= 10;
  if (situation.woundedGunArm === 'light') modifier -= 25;
  if (situation.woundedGunArm === 'serious') modifier -= 50;
  if (situation.twoGuns) modifier -= 30;
  if (situation.hipShooting) modifier -= 10;
  if (situation.targetObscured) modifier -= 10;

  return modifier;
};

export interface CombatResult {
  hit: boolean;
  roll: number;
  targetNumber: number;
  wound?: WoundResult;  // Changed back to optional
}

/**
 * Resolve a complete combat round between two characters
 * Implements full Boot Hill v2 combat resolution system
 */
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

/**
 * Determine which character gets to act first in combat
 * Implements Boot Hill v2 first shot determination rules
 */
export const getFirstShotOrder = (
  char1: Character, 
  char2: Character,
  situation: { 
    givingFirstMove?: boolean,
    surprised?: 'none' | 'partial' | 'complete',
    running?: boolean,
    mounted?: boolean,
    wounded?: boolean,
    severlyWounded?: boolean,
    drawingTwoGuns?: boolean,
    hipShooting?: boolean,
    consecutiveTurns?: number,
    consecutiveAims?: number
  } = {}
): Character => {
  
  const calc = (char: Character): number => {
    let total = char.attributes.speed;
    
    // Add bravery modifier
    total += getBraveryModifiers(char.attributes.bravery).speedMod;
    
    // Situation modifiers
    if (situation.givingFirstMove) total -= 1;
    if (situation.surprised === 'partial') total -= 5;
    if (situation.surprised === 'complete') total -= 10;
    if (situation.running) total -= 20;
    if (situation.mounted) total -= 10;
    if (situation.wounded) total -= 5;
    if (situation.severlyWounded) total -= 20;
    if (situation.drawingTwoGuns) total -= 3;
    if (situation.hipShooting) total += 5;
    if (situation.consecutiveTurns) total += 10;
    if (situation.consecutiveAims) total += 5;
    
    return total;
  };

  const score1 = calc(char1);
  const score2 = calc(char2);
  
  return score1 >= score2 ? char1 : char2;
};
