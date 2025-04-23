import { Character } from '../types/character';
import { GameSessionProps } from '../components/GameArea/types';
import { CombatState as CombatStateFromCombat } from '../types/combat';
import { GameEngineAction } from '../types/gameActions';
import { GameAction } from '../types/actions'; // Import base GameAction
import { GameState } from '../types/gameState';
import { Dispatch } from 'react';

// Define CombatInitiator locally using standard CombatState
interface CombatInitiator {
  // Combat core functions
  initiateCombat: (opponent: Character, combatState?: Partial<CombatStateFromCombat>) => void;
  executeCombatRound: () => Promise<void>;
  handleCombatAction: () => Promise<void>;
  handlePlayerHealthChange: (characterId: string, newHealth: number) => void;
  handleCombatEnd: (winner: "player" | "opponent", combatResults: string) => Promise<void>;
  handleStrengthChange: (characterType: "player" | "opponent", newStrength: number) => void;
  
  // Player/character management
  onEquipWeapon: (itemId: string) => void;
  getCurrentOpponent: () => Character | null;
  opponent: Character | null;
  
  // State management
  isCombatActive: boolean;
  isProcessing: boolean;
  combatQueueLength: number;
  dispatch: Dispatch<GameEngineAction>;
  
  // Additional properties
  isLoading?: boolean;
  error?: string | null;
  handleUserInput?: (input: string) => void;
  retryLastAction?: () => void;
  handleDebug?: (command: string) => void;
  handleSave?: () => void;
  handleLoad?: () => void;
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
  const safeDispatch: Dispatch<GameEngineAction> = dispatch as Dispatch<GameEngineAction> || (() => { /* Intentionally empty */ });

  // Default initiator structure
  const defaultInitiator: CombatInitiator = {
    initiateCombat: () => {
      console.warn('initiateCombat default implementation called');
    },
    executeCombatRound: async () => { console.warn('executeCombatRound default implementation called'); },
    handleCombatAction: async () => { console.warn('handleCombatAction default implementation called'); },
    handleCombatEnd: sessionProps.handleCombatEnd || (async () => {
      console.warn('handleCombatEnd default implementation called');
    }),
    handleStrengthChange: sessionProps.handleStrengthChange || ((characterType, newStrength) => {
      console.warn('handleStrengthChange default implementation called');
      sessionProps.handlePlayerHealthChange(characterType, newStrength);
    }),
    handlePlayerHealthChange: sessionProps.handlePlayerHealthChange,
    onEquipWeapon: sessionProps.handleEquipWeapon,
    getCurrentOpponent: () => null,
    opponent: null,
    isCombatActive: false,
    isProcessing: false,
    combatQueueLength: 0,
    dispatch: safeDispatch,
    isLoading: sessionProps.isLoading || false,
    error: sessionProps.error || null,
    handleUserInput: sessionProps.handleUserInput,
    retryLastAction: sessionProps.retryLastAction,
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
    // Core combat functions
    initiateCombat: defaultInitiator.initiateCombat,
    executeCombatRound: defaultInitiator.executeCombatRound,
    handleCombatAction,
    handleCombatEnd: defaultInitiator.handleCombatEnd,
    handleStrengthChange: defaultInitiator.handleStrengthChange,

    // Health & Equipment
    handlePlayerHealthChange: sessionProps.handlePlayerHealthChange,
    onEquipWeapon: sessionProps.handleEquipWeapon,

    // Opponent info
    getCurrentOpponent: () => state.character?.opponent || null,
    opponent: state.character?.opponent || null,

    // State management
    isCombatActive: state.combat?.isActive || false,
    isProcessing: false,
    combatQueueLength: 0,
    dispatch: safeDispatch,

    // Additional properties
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
