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

export interface WeaponCombatState {
  round: number;
  playerWeapon: string | null;
  opponentWeapon: string | null;
  roundLog: LogEntry[];
}

export interface CombatState {
  isActive: boolean;
  combatType: CombatType;
  winner: string | null;
  summary: string | null;
  selection?: CombatSelectionState;
  brawling?: {
    round: 1 | 2;
    playerModifier: number;
    opponentModifier: number;
    roundLog: LogEntry[];
  };
  weapon?: {
    round: number;
    playerWeapon: string | null;
    opponentWeapon: string | null;
    roundLog: LogEntry[];
  };
  
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
      roundLog: state.weapon.roundLog ?? []
    } : undefined,
    playerStrength: state?.playerStrength,
    opponentStrength: state?.opponentStrength,
    currentTurn: state?.currentTurn,
    combatLog: state?.combatLog ?? []
  };
}
