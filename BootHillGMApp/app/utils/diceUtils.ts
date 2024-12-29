/**
 * Represents a dice roll configuration.
 */
interface DiceRoll {
  count: number;
  sides: number;
  modifier?: number;
  advantage?: boolean;
  disadvantage?: boolean;
}

/**
 * Rolls dice based on the given configuration.
 *
 * @param {DiceRoll} config - The dice roll configuration.
 * @returns {number} The total result of the dice roll.
 */
const rollDice = ({
  count,
  sides,
  modifier = 0,
  advantage = false,
  disadvantage = false,
}: DiceRoll): number => {
  if (sides === 0) {
    return 0;
  }
  let total = 0;
  if (advantage && disadvantage) {
    advantage = false;
    disadvantage = false;
  }

  if (advantage) {
    for (let i = 0; i < count; i++) {
      const roll1 = Math.floor(Math.random() * sides) + 1;
      const roll2 = Math.floor(Math.random() * sides) + 1;
      total += Math.max(roll1, roll2);
    }
  } else if (disadvantage) {
    for (let i = 0; i < count; i++) {
      const roll1 = Math.floor(Math.random() * sides) + 1;
      const roll2 = Math.floor(Math.random() * sides) + 1;
      total += Math.min(roll1, roll2);
    }
  } else {
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
  }

  return total + modifier;
};

export type { DiceRoll }; export { rollDice };