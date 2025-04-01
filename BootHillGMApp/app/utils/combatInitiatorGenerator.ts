import { Character } from '../types/character';
import { CombatInitiator } from '../types/combatStateAdapter';
import { GameSessionProps } from '../components/GameArea/types';
import { UniversalCombatState } from '../types/combatStateAdapter';
import { GameSessionType } from '../types/session/gameSession.types';

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
    initiateCombat: (_opponent: Character, _combatState?: UniversalCombatState) => {
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
    isCombatActive: state?.isCombatActive || false,
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
