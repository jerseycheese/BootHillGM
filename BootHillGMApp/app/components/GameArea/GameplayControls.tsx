/**
 * GameplayControls manages the user interaction interface.
 * Switches between normal input mode and combat system based on game state.
 * Handles loading states and suggested actions during gameplay.
 */
import CombatSystem from '../CombatSystem';
import InputManager from '../InputManager';
import type { GameplayControlsProps } from './types';

export function GameplayControls({
  isLoading,
  isCombatActive,
  opponent,
  state,
  onUserInput,
  onCombatEnd,
  onPlayerHealthChange,
  dispatch,
}: GameplayControlsProps) {
  if (!state.character) {
    return null;
  }

  return (
    <div className="mt-4 shrink-0">
      {isCombatActive && opponent ? (
        <CombatSystem
          playerCharacter={state.character}
          opponent={opponent}
          onCombatEnd={onCombatEnd}
          onPlayerHealthChange={onPlayerHealthChange}
          dispatch={dispatch}
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
