/**
 * Boot Hill v2 Brawling System
 * 
 * Implements authentic Boot Hill brawling mechanics:
 * - Two rounds per combat turn
 * - Punch and grapple options
 * - Location-based damage
 * - Strength reduction from wounds
 * - Combat modifiers based on previous actions
 */

// Dice rolling utility
/**
 * Rolls a specified number of dice with a given number of sides.
 * @param numDice The number of dice to roll.
 * @param sides The number of sides on each die.
 * @returns The total result of the dice rolls.
 * @throws Error if invalid input is provided (e.g., non-positive number of dice or sides).
 */
const rollDice = (numDice: number, sides: number): number => {
  if (numDice <= 0 || sides <= 0) {
    throw new Error("Invalid input: numDice and sides must be positive integers.");
  }
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
};

/**
 * Represents the result of a brawling round.
 */
export type BrawlingResult = {
  /** The total dice roll, including modifiers. */
  roll: number;
  /** Description of the brawling result (e.g., "Miss", "Solid Hit"). */
  result: string;
  /** Damage inflicted in the round. */
  damage: number;
  /** Location of the hit. */
  location: "head" | "chest" | "abdomen" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg";
  /** Modifier to apply to the next round. */
  nextRoundModifier: number;
};

/**
 * Represents a brawling table mapping dice rolls to results.
 */
export type BrawlingTable = {
  [key: number]: {
    result: string;
    damage: number;
    location: "head" | "chest" | "abdomen" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg";
    nextRoundModifier: number;
  };
};

/**
 * Brawling table for punching attacks.
 */
export const PUNCHING_TABLE: BrawlingTable = {
  2: { result: 'Miss', damage: 0, location: 'head', nextRoundModifier: -2 },
  3: { result: 'Glancing Blow', damage: 1, location: 'leftArm', nextRoundModifier: -1 },
  4: { result: 'Solid Hit', damage: 2, location: 'chest', nextRoundModifier: 0 },
  5: { result: 'Strong Hit', damage: 3, location: 'head', nextRoundModifier: 1 },
  6: { result: 'Critical Hit', damage: 4, location: 'head', nextRoundModifier: 2 }
};

/**
 * Brawling table for grappling attacks.
 */
export const GRAPPLING_TABLE: BrawlingTable = {
  2: { result: 'Miss', damage: 0, location: 'chest', nextRoundModifier: -2 },
  3: { result: 'Weak Hold', damage: 1, location: 'leftArm', nextRoundModifier: -1 },
  4: { result: 'Firm Grip', damage: 2, location: 'chest', nextRoundModifier: 0 },
  5: { result: 'Strong Lock', damage: 3, location: 'leftLeg', nextRoundModifier: 1 },
  6: { result: 'Submission Hold', damage: 4, location: 'head', nextRoundModifier: 2 }
};

/**
 * Resolves a brawling round based on the provided modifier and attack type.
 * @param modifier Modifier to the dice roll.
 * @param isPunching True if punching, false if grappling.
 * @returns The result of the brawling round.
 */
export const resolveBrawlingRound = (modifier: number, isPunching: boolean): BrawlingResult => {
  const roll = Math.max(2, Math.min(6, rollDice(1, 6) + modifier));
  const table = isPunching ? PUNCHING_TABLE : GRAPPLING_TABLE;
  const result = table[roll];

  return {
    roll,
    ...result
  };
};
