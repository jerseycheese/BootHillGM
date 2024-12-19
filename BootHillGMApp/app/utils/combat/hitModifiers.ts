export interface CombatSituation {
  isMoving: boolean;
  movementType?: 'walking' | 'crawling' | 'running' | 'dodging' | 'trotting' | 'galloping';
  targetMoving: boolean;
  targetMovementType?: 'walking' | 'crawling' | 'running' | 'dodging' | 'trotting' | 'galloping';
  range: 'short' | 'medium' | 'long' | 'extreme';
  weaponResting?: boolean;
  shotNumber?: number;
  weaponType?: 'scatter' | 'shotgun' | 'normal';
  wrongHand?: boolean;
  woundedGunArm?: 'light' | 'serious';
  twoGuns?: boolean;
  hipShooting?: boolean;
  targetObscured?: boolean;
}

export const getHitModifiers = (situation: CombatSituation): number => {
  let modifier = 0;

  // Range modifiers
  switch (situation.range) {
    case 'short': modifier -= 10; break;
    case 'long': modifier += 15; break;
    case 'extreme': modifier += 25; break;
  }

  // Movement modifiers
  if (situation.isMoving) {
    switch (situation.movementType) {
      case 'walking': modifier -= 5; break;
      case 'crawling': modifier -= 10; break;
      case 'running': modifier -= 20; break;
      case 'dodging': modifier -= 30; break;
      case 'trotting': modifier -= 15; break;
      case 'galloping': modifier -= 25; break;
    }
  }

  // Target movement modifiers
  if (situation.targetMoving) {
    switch (situation.targetMovementType) {
      case 'walking':
      case 'crawling': modifier += 5; break;
      case 'running':
      case 'trotting': modifier += 10; break;
      case 'galloping': modifier += 15; break;
      case 'dodging': modifier += 20; break;
    }
  }

  // Additional modifiers
  if (situation.weaponResting) modifier += 10;
  if (situation.shotNumber === 2) modifier -= 10;
  if (situation.shotNumber === 3) modifier -= 20;
  if (situation.weaponType === 'scatter') modifier -= 20;
  if (situation.weaponType === 'shotgun') modifier -= 10;
  if (situation.wrongHand) modifier -= 10;
  if (situation.woundedGunArm === 'light') modifier -= 25;
  if (situation.woundedGunArm === 'serious') modifier -= 50;
  if (situation.twoGuns) modifier -= 30;
  if (situation.hipShooting) modifier -= 10;
  if (situation.targetObscured) modifier -= 10;

  return modifier;
};