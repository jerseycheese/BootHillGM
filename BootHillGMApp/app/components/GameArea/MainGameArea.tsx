/**
 * MainGameArea handles the primary game interaction space.
 * Combines narrative display with gameplay controls in a scrollable container.
 * Manages the display of both normal gameplay and combat interfaces.
 */
'use client';

import { useMemo } from 'react'; // Import useMemo
import NarrativeWithDecisions from '../narrative/NarrativeWithDecisions';
import { GameplayControls } from './GameplayControls';
import type { GameSessionProps } from './types';
import GameStorage from '../../utils/gameStorage';

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
  // Default narrative text to use as fallback
  const defaultNarrative = 'Your adventure begins in the rugged frontier town of Boot Hill...';
  
  // Get narrative text with proper memoization - always call useMemo
  const narrativeToDisplay = useMemo(() => {
    if (!state || !state.narrative) {
      console.log('MainGameArea: Falling back to GameStorage for narrative (no state)');
      return GameStorage.getNarrativeText() || defaultNarrative;
    }
    
    const history = state.narrative.narrativeHistory;
    if (history && Array.isArray(history) && history.length > 0) {
      return history.join('\n');
    }
    
    // Fallback if narrative history is empty or invalid
    console.log('MainGameArea: Falling back to GameStorage for narrative (empty history)');
    return GameStorage.getNarrativeText() || defaultNarrative;
  }, [state]); // Depend on state, not nested properties
  
  // If the game is initializing, show a loading state
  if (isLoading) {
    return (
      <div id="bhgmMainGameAreaContainer" data-testid="main-game-area-loading" className="h-full flex flex-col items-center justify-center bhgm-main-game-area">
        <p className="text-xl font-semibold">Initializing Game...</p>
        {/* Optional: Add a spinner or more detailed loading indicator */}
      </div>
    );
  }

  // Handle null state
  if (!state) {
    return (
      <div id="bhgmMainGameAreaContainer" data-testid="main-game-area-container" className="h-full flex flex-col overflow-auto bhgm-main-game-area">
        <div className="wireframe-section flex-1 flex flex-col overflow-auto">
          <div className="flex-1 p-4">
            <p>Loading game state...</p>
            <button 
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => {
                // Initialize new game state as a last resort
                GameStorage.initializeNewGame();
                // No need to set local state here anymore
                // Reload the page to reinitialize components
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
            >
              Initialize New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="bhgmMainGameAreaContainer" data-testid="main-game-area-container" className="h-full flex flex-col overflow-auto bhgm-main-game-area">
      <div className="wireframe-section flex-1 flex flex-col overflow-auto">
        <NarrativeWithDecisions
          id="bhgmNarrativeWithDecisions"
          data-testid="narrative-with-decisions"
          narrative={narrativeToDisplay}
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
