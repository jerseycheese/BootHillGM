/**
 * MainGameArea handles the primary game interaction space.
 * Combines narrative display with gameplay controls in a scrollable container.
 * Manages the display of both normal gameplay and combat interfaces.
 */
import NarrativeWithDecisions from '../narrative/NarrativeWithDecisions';
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
    <div id="bhgmMainGameAreaContainer" data-testid="main-game-area-container" className="h-full flex flex-col overflow-auto bhgm-main-game-area">
      <div className="wireframe-section flex-1 flex flex-col overflow-auto">
        <NarrativeWithDecisions
          id="bhgmNarrativeWithDecisions"
          data-testid="narrative-with-decisions"
          narrative={state.narrative.narrativeHistory.join('\n')}
          error={error}
          onRetry={retryLastAction}
          className="flex-1"
        />
        <GameplayControls
          id="bhgmGameplayControls"
          data-testid="gameplay-controls"
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