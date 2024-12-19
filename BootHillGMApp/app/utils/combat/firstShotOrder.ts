import { Character } from '../../types/character';
import { getBraveryModifiers } from './braveryModifiers';

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