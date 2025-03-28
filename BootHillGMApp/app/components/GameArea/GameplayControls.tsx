/**
 * GameplayControls manages the user interaction interface.
 * Switches between normal input mode and combat system based on game state.
 * Handles loading states and suggested actions during gameplay.
 */
import { CombatSystem } from '../Combat/CombatSystem';
import InputManager from '../InputManager';
import type { GameplayControlsProps } from './types';
import { ensureCombatState, CombatType, LogEntry } from '../../types/combat';
import { Character } from '../../types/character';
import { SuggestedAction } from '../../types/campaign';

// Define a strongly-typed extended GameState interface for this component
interface ExtendedGameState {
  combatState?: {
    isActive: boolean;
    combatType: CombatType;
    winner: string | null;
    combatLog: LogEntry[];
    participants: string[]; // This is a string[] in the extended state
    rounds: number;
    brawling?: {
      playerModifier?: number;
      opponentModifier?: number;
      roundLog?: LogEntry[];
    };
    [key: string]: unknown;
  };
  suggestedActions?: SuggestedAction[];
}

export function GameplayControls({
  isLoading,
  isCombatActive,
  opponent,
  state,
  onUserInput,
  onCombatEnd,
  dispatch,
}: GameplayControlsProps) {
  if (!state.character) {
    return null;
  }

  // Access the state as extended state to handle combatState access
  const extendedState = state as unknown as ExtendedGameState;

  // Get the player character from character state (assuming character.player structure)
  const playerCharacter = 'player' in state.character 
    ? state.character.player 
    : state.character as unknown as Character;

  // Make sure we have a non-null playerCharacter before proceeding
  if (!playerCharacter) {
    return null;
  }

  // Transform combat state to match CombatSystem's expected format
  const transformedCombatState = extendedState.combatState
    ? ensureCombatState({
        isActive: true,
        combatType: extendedState.combatState.combatType,
        winner: extendedState.combatState.winner,
        rounds: extendedState.combatState.rounds,
        // Convert string[] to empty CombatParticipant[] to satisfy type requirements
        participants: [], 
        combatLog: extendedState.combatState.combatLog || [],
        brawling: extendedState.combatState.brawling ? {
          round: 1,
          playerModifier: extendedState.combatState.brawling.playerModifier ?? 0,
          opponentModifier: extendedState.combatState.brawling.opponentModifier ?? 0,
          roundLog: extendedState.combatState.brawling.roundLog ?? [],
          playerCharacterId: playerCharacter.id,
          opponentCharacterId: opponent?.id ?? ''
        } : undefined
      })
    : undefined;

  return (
    <div className="mt-4 shrink-0">
      {isCombatActive && opponent ? (
        <CombatSystem
          playerCharacter={playerCharacter}
          opponent={opponent}
          onCombatEnd={onCombatEnd}
          dispatch={dispatch}
          initialCombatState={transformedCombatState}
          currentCombatState={extendedState.combatState 
            ? ensureCombatState({
                isActive: extendedState.combatState.isActive,
                combatType: extendedState.combatState.combatType,
                winner: extendedState.combatState.winner,
                rounds: extendedState.combatState.rounds,
                // Convert string[] to empty CombatParticipant[] to satisfy type requirements
                participants: [],
                combatLog: extendedState.combatState.combatLog || []
              }) 
            : undefined}
        />
      ) : (
        <InputManager
          onSubmit={onUserInput}
          isLoading={isLoading}
          suggestedActions={extendedState.suggestedActions || []}
        />
      )}
    </div>
  );
}
