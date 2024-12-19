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