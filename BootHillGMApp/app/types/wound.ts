export interface Wound {
  /** Location of the wound on the body */
  location: 'head' | 'chest' | 'abdomen' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';
  /** Severity level of the wound */
  severity: 'light' | 'serious' | 'mortal';
  /** Amount of strength reduction caused by the wound */
  strengthReduction: number;
  /** Combat turn when the wound was received */
  turnReceived: number;
  /** Damage caused by the wound */
  damage: number;
}

export type WoundLocation = 'head' | 'chest' | 'abdomen' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';
