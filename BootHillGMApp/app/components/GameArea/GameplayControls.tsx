/**
 * GameplayControls manages the user interaction interface.
 * Switches between normal input mode and combat system based on game state.
 * Handles loading states and suggested actions during gameplay.
 */
import { CombatSystem } from '../CombatSystem';
import InputManager from '../InputManager';
import type { GameplayControlsProps } from './types';

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
  const transformedCombatState = state.combatState ? {
    round: 1 as const,  // Default to round 1 if not specified
    playerModifier: state.combatState.playerStrength,
    opponentModifier: state.combatState.opponentStrength,
    roundLog: state.combatState.combatLog,
  } : undefined;


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
