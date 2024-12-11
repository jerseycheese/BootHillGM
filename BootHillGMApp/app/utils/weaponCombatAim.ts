export const MAX_AIM_BONUS = 20;
export const AIM_BONUS_INCREMENT = 10;

export const calculateNewAimBonus = (currentBonus: number): number => {
  const newBonus = currentBonus + AIM_BONUS_INCREMENT;
  return newBonus <= MAX_AIM_BONUS ? newBonus : currentBonus;
};

export const shouldResetAim = (actionType: string): boolean => {
  return actionType !== 'fire';
};

export const getAimMessage = (characterName: string, currentBonus: number): string => {
  const canAimMore = currentBonus < MAX_AIM_BONUS;
  return canAimMore
    ? `${characterName} takes aim carefully`
    : `${characterName} cannot aim any more carefully`;
};
