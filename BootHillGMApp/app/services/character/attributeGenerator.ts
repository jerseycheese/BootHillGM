import { Character } from '../../types/character';

export function generateRandomAttribute(key: keyof Character['attributes']): number {
  // Roll d100 for initial value
  const roll = Math.floor(Math.random() * 100) + 1;
  
  switch(key) {
    case 'speed':
      if (roll <= 5) return 1;  // Slow
      if (roll <= 10) return 4;  // Below Average
      if (roll <= 20) return 7;  // Average
      if (roll <= 35) return 9;  // Above Average
      if (roll <= 50) return 11; // Quick
      if (roll <= 65) return 13; // Very Quick
      if (roll <= 80) return 15; // Fast
      if (roll <= 90) return 17; // Very Fast
      if (roll <= 95) return 19; // Lightning
      return 20; // Greased Lightning

    case 'gunAccuracy':
    case 'throwingAccuracy':
      if (roll <= 5) return 1;  // Very Poor
      if (roll <= 15) return 4; // Poor
      if (roll <= 25) return 7; // Below Average
      if (roll <= 35) return 10; // Average
      if (roll <= 50) return 12; // Above Average
      if (roll <= 65) return 14; // Fair
      if (roll <= 75) return 16; // Good
      if (roll <= 85) return 17; // Very Good
      if (roll <= 95) return 19; // Excellent
      if (roll <= 98) return 20; // Crack Shot
      return 20; // Deadeye

    case 'strength':
    case 'baseStrength':
      if (roll <= 2) return 8;  // Feeble
      if (roll <= 5) return 9;  // Puny
      if (roll <= 10) return 10; // Frail
      if (roll <= 17) return 11; // Weakling
      if (roll <= 25) return 12; // Sickly
      if (roll <= 40) return 13; // Average
      if (roll <= 60) return 14; // Above Average
      if (roll <= 75) return 15; // Sturdy
      if (roll <= 83) return 16; // Hardy
      if (roll <= 90) return 17; // Strong
      if (roll <= 95) return 18; // Very Strong
      if (roll <= 98) return 19; // Powerful
      return 20; // Mighty

    case 'bravery':
      if (roll <= 10) return 4;  // Coward
      if (roll <= 20) return 7;  // Cowardly
      if (roll <= 35) return 10; // Average
      if (roll <= 65) return 13; // Above Average
      if (roll <= 80) return 15; // Brave
      if (roll <= 90) return 17; // Very Brave
      if (roll <= 98) return 19; // Fearless
      return 20; // Foolhardy

    case 'experience':
      if (roll <= 40) return 0; // None
      if (roll <= 60) return 1; // 1 gunfight
      if (roll <= 75) return 2; // 2 gunfights
      if (roll <= 85) return 3; // 3 gunfights
      if (roll <= 90) return 4; // 4 gunfights
      if (roll <= 93) return 5; // 5 gunfights
      if (roll <= 95) return 6; // 6 gunfights
      if (roll <= 96) return 7; // 7 gunfights
      if (roll <= 97) return 8; // 8 gunfights
      if (roll <= 98) return 9; // 9 gunfights
      if (roll <= 99) return 10; // 10 gunfights
      return 11; // 11+ gunfights
  }
  
  return 10; // Fallback default
}

export function generateRandomAttributes(): Character['attributes'] {
  return {
    speed: generateRandomAttribute('speed'),
    gunAccuracy: generateRandomAttribute('gunAccuracy'),
    throwingAccuracy: generateRandomAttribute('throwingAccuracy'),
    strength: generateRandomAttribute('strength'),
    baseStrength: generateRandomAttribute('baseStrength'),
    bravery: generateRandomAttribute('bravery'),
    experience: generateRandomAttribute('experience')
  };
}

// Benign change to trigger re-analysis
