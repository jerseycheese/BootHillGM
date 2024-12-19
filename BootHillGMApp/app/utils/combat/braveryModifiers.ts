import { CombatModifiers } from './types';

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