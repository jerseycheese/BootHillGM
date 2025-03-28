import { CombatType } from '../../types/combat';

/**
 * This is a workaround type to resolve the conflict between the combat state 
 * type defined in types/state/combatState.ts and types/combat.ts
 * 
 * This is a merged/compatible type that contains only the properties we need for our processor.
 */
export interface SliceCombatState {
  isActive: boolean;
  combatType: CombatType;
  rounds: number;
  winner?: string | null;
  participants?: unknown[];
  combatLog?: unknown[];
  // ... add other properties as needed
  [key: string]: unknown;
}
