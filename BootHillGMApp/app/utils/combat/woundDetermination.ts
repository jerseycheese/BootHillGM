export interface WoundResult {
  location: string;
  severity: 'Light' | 'Serious' | 'Mortal';
  strengthReduction: number;
  specialEffects?: string;
}

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