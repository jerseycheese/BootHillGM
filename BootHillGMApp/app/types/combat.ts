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

export interface WeaponStats {
  damage: string;        // e.g. "1d6+1"
  range: number;         // Range in yards
  speed: number;        // Speed modifier
  accuracy: number;     // Accuracy modifier
  reliability: number;  // Chance of malfunction (1-100)
}

export interface WeaponCombatState {
  round: number;
  playerWeapon: {
    id: string;
    name: string;
    stats: WeaponStats;
  } | null;
  opponentWeapon: {
    name: string;
    stats: WeaponStats;
  } | null;
  currentRange: number;
  roundLog: LogEntry[];
  lastAction?: 'aim' | 'fire' | 'reload' | 'move';
}

export interface WeaponCombatAction {
  type: 'aim' | 'fire' | 'reload' | 'move';
  targetRange?: number;  // For move actions
}

export type WeaponCombatResult = {
  hit: boolean;
  damage?: number;
  critical?: boolean;
  weaponMalfunction?: boolean;
  roll: number;
  modifiedRoll: number;
  targetNumber: number;
  message: string;
};

export interface CombatState {
  isActive: boolean;
  combatType: CombatType;
  winner: string | null;
  summary: string | null;
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
export function ensureCombatState(state?: Partial<CombatState>): CombatState {
  return {
    isActive: state?.isActive ?? false,
    combatType: state?.combatType ?? null,
    winner: state?.winner ?? null,
    summary: state?.summary ?? null,
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
