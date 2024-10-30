/**
 * MainGameArea handles the primary game interaction space.
 * Combines narrative display with gameplay controls in a scrollable container.
 * Manages the display of both normal gameplay and combat interfaces.
 */
import NarrativeDisplay from '../NarrativeDisplay';
import { GameplayControls } from './GameplayControls';
import type { GameSessionProps } from './types';

export function MainGameArea({
  state,
  dispatch,
  isLoading,
  error,
  isCombatActive,
  opponent,
  handleUserInput,
  retryLastAction,
  handleCombatEnd,
  handlePlayerHealthChange,
}: GameSessionProps) {
  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="wireframe-section flex-1 flex flex-col overflow-auto">
        <NarrativeDisplay
          narrative={state.narrative}
          error={error}
          onRetry={retryLastAction}
        />
        <GameplayControls
          isLoading={isLoading}
          isCombatActive={isCombatActive}
          opponent={opponent}
          state={state}
          onUserInput={handleUserInput}
          onCombatEnd={handleCombatEnd}
          onPlayerHealthChange={handlePlayerHealthChange}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}
