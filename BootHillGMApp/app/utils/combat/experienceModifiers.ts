export const getExperienceModifier = (previousGunfights: number): number => {
  if (previousGunfights === 0) return -10;
  if (previousGunfights === 1 || previousGunfights === 2) return -5;
  if (previousGunfights <= 4) return 0;
  if (previousGunfights <= 6) return 2;
  if (previousGunfights <= 8) return 6;
  if (previousGunfights <= 10) return 8;
  return 10; // 11 or more gunfights
};