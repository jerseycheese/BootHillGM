import { Character } from '../types/character';
// Removed CombatInitiator and UniversalCombatState imports from adapter
import { GameSessionProps } from '../components/GameArea/types';
import { GameSessionType } from '../types/session/gameSession.types';
import { CombatState } from '../types/state/combatState'; // Import standard CombatState
import { CombatState as CombatStateFromCombat } from '../types/combat'; // Import the other CombatState type
import { GameEngineAction } from '../types/gameActions'; // Import GameEngineAction for dispatch type
import { Dispatch } from 'react'; // Import Dispatch

// Redefine CombatInitiator locally using standard CombatState
// Redefine CombatInitiator locally using standard CombatState
interface CombatInitiator {
  initiateCombat: (opponent: Character, combatState?: Partial<CombatStateFromCombat>) => void; // Match useCombatManager signature
  executeCombatRound: () => void;
  handleCombatAction: () => void;
  handlePlayerHealthChange: (characterId: string, newHealth: number) => void;
  onEquipWeapon: (itemId: string) => void;
  getCurrentOpponent: () => Character | null;
  opponent: Character | null;
  isCombatActive: boolean;
  dispatch: Dispatch<GameEngineAction>; // Use imported Dispatch and GameEngineAction
  isLoading?: boolean;
  error?: string | null;
  handleUserInput?: (input: string) => void;
  retryLastAction?: () => void;
  handleDebug?: (command: string) => void;
  handleSave?: () => void;
  handleLoad?: () => void;
  [key: string]: unknown;
}

/**
 * Creates a combat initiator object that centralizes combat-related functionality
 * 
 * @param gameSession - Current game session object
 * @param sessionProps - Generated session props
 * @returns CombatInitiator object
 */
export function createCombatInitiator(
  gameSession: GameSessionType | null | undefined,
  sessionProps: GameSessionProps
): CombatInitiator {
  // Safe access to gameSession properties
  const state = gameSession?.state;
  const dispatch = gameSession?.dispatch;
  
  // Define combat action handler
  const handleCombatAction = async () => {
    if (sessionProps.executeCombatRound) {
      await sessionProps.executeCombatRound();
    }
  };
  
  // Always create with defaults including a function for initiateCombat to satisfy type requirements
  const defaultInitiator: CombatInitiator = {
    initiateCombat: (_opponent: Character, _combatState?: Partial<CombatState>) => { // Use standard CombatState
      // Default implementation does nothing
      // Using underscore prefix to indicate unused parameters
    },
    executeCombatRound: () => {},
    handleCombatAction,
    handlePlayerHealthChange: sessionProps.handlePlayerHealthChange,
    onEquipWeapon: sessionProps.handleEquipWeapon,
    getCurrentOpponent: () => null,
    opponent: null,
    isCombatActive: false,
    dispatch: () => {},
    isLoading: false,
    error: null,
    handleUserInput: undefined,
    retryLastAction: undefined,
    handleDebug: undefined,
    handleSave: undefined,
    handleLoad: undefined
  };
  
  // Only override with real values if everything is available
  if (!gameSession || !state || !dispatch) return defaultInitiator;
  
  return {
    // Core combat functions
    initiateCombat: gameSession.initiateCombat || defaultInitiator.initiateCombat,
    executeCombatRound: gameSession.executeCombatRound || (() => {}),
    handleCombatAction,
    handlePlayerHealthChange: sessionProps.handlePlayerHealthChange,
    
    // Equipment & character management
    onEquipWeapon: sessionProps.handleEquipWeapon,
    getCurrentOpponent: gameSession.getCurrentOpponent || (() => null),
    opponent: sessionProps.opponent,
    
    // State management
    // Access combat status via the combat slice
    isCombatActive: state?.combat?.isActive || false,
    dispatch,
    
    // Additional properties with safe defaults
    isLoading: gameSession.isLoading || false,
    error: gameSession.error || null,
    handleUserInput: gameSession.handleUserInput,
    retryLastAction: gameSession.retryLastAction,
    
    // Optional properties set to undefined
    handleDebug: undefined,
    handleSave: undefined,
    handleLoad: undefined
  };
}
