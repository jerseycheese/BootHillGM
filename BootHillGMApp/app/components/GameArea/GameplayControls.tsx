/**
 * GameplayControls manages the user interaction interface.
 * Switches between normal input mode and combat system based on game state.
 * Handles loading states and suggested actions during gameplay.
 */
'use client';

import { useMemo } from 'react'; // Import useMemo
import { CombatSystem } from '../Combat/CombatSystem';
import InputManager from '../InputManager';
import type { GameplayControlsProps } from './types';
import type { SuggestedAction } from '../../types/campaign';
import { Character } from '../../types/character';
import GameStorage from '../../utils/gameStorage';
import { CombatState } from '../../types/combat';

// Default actions moved outside component to avoid ESLint dependency warning
const defaultActions: SuggestedAction[] = [];

export function GameplayControls({
  isLoading,
  isCombatActive,
  opponent,
  state,
  onUserInput,
  onCombatEnd,
  dispatch,
}: GameplayControlsProps) {
  // Derive suggestedActions directly from state or fallback - always call useMemo
  const actionsToDisplay = useMemo(() => {
    if (!state) return defaultActions;
    
    if (state.suggestedActions && state.suggestedActions.length > 0) {
      return state.suggestedActions;
    }
    
    // Fallback if state actions are empty or invalid
    console.log('GameplayControls: Falling back to GameStorage for suggested actions');
    return GameStorage.getSuggestedActions();
  }, [state]); // Only depend on state
  
  // If the game is initializing, show a loading state for controls
  if (isLoading) {
    return (
      <div className="mt-4 shrink-0 flex items-center justify-center">
        <p className="text-lg font-semibold">Loading Controls...</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="mt-4 shrink-0">
        <p>Loading game controls...</p>
      </div>
    );
  }

  // Even if state.character is null, still try to render the input controls
  // with fallback suggested actions from GameStorage
  if (!state.character) {
    return (
      <div className="mt-4 shrink-0">
        <InputManager
          onSubmit={(input) => onUserInput?.(input)}
          isLoading={isLoading}
          suggestedActions={actionsToDisplay}
        />
      </div>
    );
  }

  // Get the player character from character state (attempting both formats)
  const playerCharacter = 'player' in state.character 
    ? state.character.player 
    : state.character as unknown as Character;

  // If playerCharacter is null, still show the input manager with suggested actions
  if (!playerCharacter) {
    return (
      <div className="mt-4 shrink-0">
        <InputManager
          onSubmit={(input) => onUserInput?.(input)}
          isLoading={isLoading}
          suggestedActions={actionsToDisplay}
        />
      </div>
    );
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
          // Cast using as CombatState to match required type
          initialCombatState={combatStateSlice as CombatState}
        />
      ) : (
        <InputManager
          onSubmit={handleUserInput}
          isLoading={isLoading}
          suggestedActions={actionsToDisplay}
        />
      )}
    </div>
  );
}