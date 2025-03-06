/**
 * MainGameArea handles the primary game interaction space.
 * Combines narrative display with gameplay controls in a scrollable container.
 * Manages the display of both normal gameplay and combat interfaces.
 */
import { NarrativeDisplay } from '../NarrativeDisplay';
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
        <NarrativeDisplay
          id="bhgmNarrativeDisplay"
          data-testid="narrative-display"
          narrative={state.narrative}
          error={error}
          onRetry={retryLastAction}
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
