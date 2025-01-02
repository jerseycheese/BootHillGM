/**
 * GameplayControls manages the user interaction interface.
 * Switches between normal input mode and combat system based on game state.
 * Handles loading states and suggested actions during gameplay.
 */
import { CombatSystem } from '../Combat/CombatSystem';
import InputManager from '../InputManager';
import type { GameplayControlsProps } from './types';
import { ensureCombatState } from '../../types/combat';

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

  // Transform combat state to match CombatSystem's expected format
  const transformedCombatState = state.combatState
    ? ensureCombatState({
        ...state.combatState,
        isActive: true,
        brawling: {
          round: 1,
          playerModifier: state.combatState.playerStrength ?? 0,
          opponentModifier: state.combatState.opponentStrength ?? 0,
          roundLog: state.combatState.combatLog ?? []
        }
      })
    : undefined;

  return (
    <div className="mt-4 shrink-0">
      {isCombatActive && opponent ? (
        <CombatSystem
          playerCharacter={state.character}
          opponent={opponent}
          onCombatEnd={onCombatEnd}
          dispatch={dispatch}
          initialCombatState={transformedCombatState}
        />
      ) : (
        <InputManager
          onSubmit={onUserInput}
          isLoading={isLoading}
          suggestedActions={state.suggestedActions}
        />
      )}
    </div>
  );
}
