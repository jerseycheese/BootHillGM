// Define valid ranges for each attribute
const validRanges: Record<string, [number, number]> = {
  speed: [1, 20],
  gunAccuracy: [1, 20],
  throwingAccuracy: [1, 20],
  strength: [8, 20],
  baseStrength: [8, 20],
  bravery: [1, 20],
  experience: [0, 11]
};

// Function to validate attribute values based on Boot Hill rules
export function validateAttributeValue(attribute: string, value: number): boolean {
  if (attribute in validRanges) {
    const [min, max] = validRanges[attribute];
    return value >= min && value <= max;
  }

  return true; // Return true for attributes not in the validRanges object
}