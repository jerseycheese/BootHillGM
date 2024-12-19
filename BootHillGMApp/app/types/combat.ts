export type CombatType = 'brawling' | 'weapon' | null;

export interface LogEntry {
  text: string;
  type: 'hit' | 'miss' | 'critical' | 'info';
  timestamp: number;
}

export interface BrawlingState {
  round: 1 | 2;
  playerModifier: number;
  opponentModifier: number;
  roundLog: LogEntry[];
}

export interface WeaponModifiers {
  accuracy: number;     // Base accuracy modifier
  range: number;       // Effective range in yards
  reliability: number; // Chance of malfunction (1-100)
  damage: string;      // Damage dice (e.g. "1d6+1")
  speed: number;       // Initiative modifier
  ammunition?: number;  // Current ammunition
  maxAmmunition?: number; // Maximum ammunition capacity
}

export interface Weapon {
  id: string;
  name: string;
  modifiers: WeaponModifiers;
  ammunition?: number;
  maxAmmunition?: number;
}

// Constants for base weapons
export const WEAPON_STATS: Record<string, WeaponModifiers> = {
  'Colt Revolver': {
    accuracy: 2,
    range: 20,
    reliability: 95,
    damage: '1d6',
    speed: 0,
    ammunition: 6,
    maxAmmunition: 6
  },
  'Winchester Rifle': {
    accuracy: 3,
    range: 40,
    reliability: 90,
    damage: '1d8',
    speed: -1,
    ammunition: 15,
    maxAmmunition: 15
  },
  'Shotgun': {
    accuracy: 1,
    range: 10,
    reliability: 85,
    damage: '2d6',
    speed: -2,
    ammunition: 2,
    maxAmmunition: 2
  }
};

export interface WeaponCombatState {
  round: number;
  playerWeapon: Weapon | null;
  opponentWeapon: Weapon | null;
  currentRange: number;
  roundLog: LogEntry[];
  lastAction?: 'aim' | 'fire' | 'reload' | 'move' | 'malfunction';
}

export interface WeaponCombatAction {
  type: 'aim' | 'fire' | 'reload' | 'move' | 'malfunction';
  targetRange?: number;  // For move actions
  modifier?: number;     // For fire/move actions
  damage?: number;       // For fire actions
}

export type WeaponCombatResult = {
  type: 'aim' | 'fire' | 'reload' | 'move' | 'malfunction';
  targetRange?: number;  // For move actions
  hit: boolean;
  damage?: number;
  critical?: boolean;
  weaponMalfunction?: boolean;
  roll: number;
  modifiedRoll: number;
  targetNumber: number;
  message: string;
  newStrength?: number;
};

export interface CombatState {
  isActive: boolean;
  combatType: CombatType;
  winner: string | null;
  selection?: CombatSelectionState;
  brawling?: BrawlingState;
  weapon?: WeaponCombatState;
  
  // Additional properties for state restoration and tracking
  playerStrength?: number;
  opponentStrength?: number;
  currentTurn?: 'player' | 'opponent';
  combatLog?: LogEntry[];
}

export interface CombatSelectionState {
  isSelectingType: boolean;
  availableTypes: CombatType[];
}

// Utility type to ensure non-null properties
// Helper functions for weapon combat
export const calculateWeaponModifier = (
  weapon: Weapon | null,
  range: number,
  isAiming: boolean
): number => {
  if (!weapon) return 0;
  
  const rangePenalty = Math.max(-30, -Math.floor((range / weapon.modifiers.range) * 20));
  const aimBonus = isAiming ? 10 : 0;
  
  return weapon.modifiers.accuracy + rangePenalty + aimBonus;
};

export const rollForMalfunction = (weapon: Weapon): boolean => {
  const roll = Math.floor(Math.random() * 100) + 1;
  return roll > weapon.modifiers.reliability;
};

export const parseWeaponDamage = (damageString: string): number => {
  // Handle empty or invalid input
  if (!damageString) {
    return 0;
  }

  // Split into dice and modifier parts
  const [diceCount, rest] = damageString.split('d');
  
  // If no 'd' found in string, return 0
  if (!rest) {
    return 0;
  }

  // Split the rest into base dice and modifier if it exists
  const [baseDice, modifierStr] = rest.includes('+') ? rest.split('+') : [rest, '0'];
  
  let total = 0;
  const count = parseInt(diceCount) || 0;
  const sides = parseInt(baseDice) || 0;
  const modifier = parseInt(modifierStr) || 0;
  
  // Roll the dice
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  
  // Add modifier
  total += modifier;
  
  return total;
};

export function ensureCombatState(state?: Partial<CombatState>): CombatState {
  return {
    isActive: state?.isActive ?? false,
    combatType: state?.combatType ?? null,
    winner: state?.winner ?? null,
    selection: state?.selection,
    brawling: state?.brawling ? {
      round: state.brawling.round,
      playerModifier: state.brawling.playerModifier ?? 0,
      opponentModifier: state.brawling.opponentModifier ?? 0,
      roundLog: state.brawling.roundLog ?? []
    } : undefined,
    weapon: state?.weapon ? {
      round: state.weapon.round,
      playerWeapon: state.weapon.playerWeapon,
      opponentWeapon: state.weapon.opponentWeapon,
      currentRange: state.weapon.currentRange ?? 0,
      roundLog: state.weapon.roundLog ?? [],
      lastAction: state.weapon.lastAction
    } : undefined,
    playerStrength: state?.playerStrength,
    opponentStrength: state?.opponentStrength,
    currentTurn: state?.currentTurn,
    combatLog: state?.combatLog ?? []
  };
}

export type Wound = {
  location: 'chest';
  severity: 'light' | 'serious' | 'mortal';
  strengthReduction: number;
  turnReceived: number;
};
