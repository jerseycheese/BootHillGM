import { Character } from '../types/character';
import { GameSessionProps } from '../components/GameArea/types';
import { CombatState as _StandardCombatState } from '../types/state/combatState'; // Renamed and marked as unused
import { CombatState as CombatStateFromCombat } from '../types/combat';
import { GameEngineAction } from '../types/gameActions';
import { GameAction } from '../types/actions'; // Import base GameAction
import { GameState } from '../types/gameState';
import { Dispatch } from 'react';

// Define CombatInitiator locally using standard CombatState
interface CombatInitiator {
  initiateCombat: (opponent: Character, combatState?: Partial<CombatStateFromCombat>) => void;
  executeCombatRound: () => Promise<void>; // Ensure it returns Promise<void>
  handleCombatAction: () => Promise<void>; // Ensure it returns Promise<void>
  handlePlayerHealthChange: (characterId: string, newHealth: number) => void;
  onEquipWeapon: (itemId: string) => void;
  getCurrentOpponent: () => Character | null;
  opponent: Character | null;
  isCombatActive: boolean;
  dispatch: Dispatch<GameEngineAction>; // Expects GameEngineAction
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
 * @param state - Current game state object
 * @param dispatch - Dispatch function for game actions (GameAction type)
 * @param sessionProps - Generated session props (contains handlers like handleEquipWeapon)
 * @returns CombatInitiator object
 */
export function createCombatInitiator(
  state: GameState | null | undefined,
  dispatch: Dispatch<GameAction> | null | undefined, // Accept GameAction
  sessionProps: GameSessionProps
): CombatInitiator {

  // Define combat action handler using sessionProps if available
  const handleCombatAction = async () => {
    if (sessionProps.executeCombatRound) {
      await sessionProps.executeCombatRound();
    } else {
        console.warn('executeCombatRound not available on sessionProps');
    }
  };

  // Create a non-nullable dispatch, casting to the expected type for the interface
  const safeDispatch: Dispatch<GameEngineAction> = dispatch as Dispatch<GameEngineAction> || (() => {});

  // Default initiator structure
  const defaultInitiator: CombatInitiator = {
    initiateCombat: (_opponent: Character, _combatState?: Partial<CombatStateFromCombat>) => {
      console.warn('initiateCombat default implementation called');
    },
    executeCombatRound: async () => { console.warn('executeCombatRound default implementation called'); },
    handleCombatAction: async () => { console.warn('handleCombatAction default implementation called'); },
    handlePlayerHealthChange: sessionProps.handlePlayerHealthChange, // Get from sessionProps
    onEquipWeapon: sessionProps.handleEquipWeapon, // Get from sessionProps
    getCurrentOpponent: () => null,
    opponent: null,
    isCombatActive: false,
    dispatch: safeDispatch, // Use the casted safe dispatch
    isLoading: sessionProps.isLoading || false, // Get from sessionProps
    error: sessionProps.error || null, // Get from sessionProps
    handleUserInput: sessionProps.handleUserInput, // Get from sessionProps
    retryLastAction: sessionProps.retryLastAction, // Get from sessionProps
    handleDebug: undefined,
    handleSave: undefined,
    handleLoad: undefined
  };

  // If state or dispatch is missing, return defaults
  if (!state || !dispatch) {
      return defaultInitiator;
  }

  // Return the fully constructed object, using values from state and sessionProps
  return {
    // Core combat functions (provide defaults or potentially pass down if needed)
    initiateCombat: defaultInitiator.initiateCombat, // Placeholder
    executeCombatRound: defaultInitiator.executeCombatRound, // Placeholder
    handleCombatAction, // Use the defined handler

    // Health & Equipment
    handlePlayerHealthChange: sessionProps.handlePlayerHealthChange,
    onEquipWeapon: sessionProps.handleEquipWeapon,

    // Opponent info
    getCurrentOpponent: () => state.character?.opponent || null, // Get from state
    opponent: state.character?.opponent || null, // Get from state

    // State management
    isCombatActive: state.combat?.isActive || false, // Get from state
    dispatch: safeDispatch, // Use the casted dispatch

    // Additional properties from sessionProps
    isLoading: sessionProps.isLoading,
    error: sessionProps.error,
    handleUserInput: sessionProps.handleUserInput,
    retryLastAction: sessionProps.retryLastAction,

    // Optional properties
    handleDebug: undefined,
    handleSave: undefined,
    handleLoad: undefined
  };
}
