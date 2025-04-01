/**
 * GameplayControls manages the user interaction interface.
 * Switches between normal input mode and combat system based on game state.
 * Handles loading states and suggested actions during gameplay.
 */
import { CombatSystem } from '../Combat/CombatSystem';
import InputManager from '../InputManager';
import type { GameplayControlsProps } from './types';
// Removed ensureCombatState import
// Removed unused import: CombatType
// Removed unused imports: CombatState, LogEntry, SuggestedAction
import { Character } from '../../types/character';

// Removed local ExtendedGameState interface definition

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
  // Removed cast to ExtendedGameState, use state directly

  // Get the player character from character state (assuming character.player structure)
  const playerCharacter = 'player' in state.character 
    ? state.character.player 
    : state.character as unknown as Character;

  // Make sure we have a non-null playerCharacter before proceeding
  if (!playerCharacter) {
    return null;
  }

  // Access combat state directly from the GameState slice
  const combatStateSlice = state.combat;

  // Create a safe onSubmit handler that won't be undefined
  const handleUserInput = (input: string) => {
    if (onUserInput) {
      onUserInput(input);
    }
  };

  return (
    <div className="mt-4 shrink-0">
      {isCombatActive && opponent ? (
        <CombatSystem
          playerCharacter={playerCharacter}
          opponent={opponent}
          onCombatEnd={onCombatEnd}
          dispatch={dispatch}
          // Pass the combat slice directly, ensuring it conforms to CombatSystemProps['initialCombatState']
          // Might need further adjustments based on CombatSystem's expected props
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialCombatState={combatStateSlice as any} // Cast to any to match reverted CombatSystem prop type
          // currentCombatState prop might be obsolete if CombatSystem uses state directly
        />
      ) : (
        <InputManager
          onSubmit={handleUserInput}
          isLoading={isLoading}
          suggestedActions={state.suggestedActions || []} // Access directly from state
        />
      )}
    </div>
  );
}
