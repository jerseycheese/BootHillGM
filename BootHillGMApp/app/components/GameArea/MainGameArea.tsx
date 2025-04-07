/**
 * MainGameArea handles the primary game interaction space.
 * Combines narrative display with gameplay controls in a scrollable container.
 * Manages the display of both normal gameplay and combat interfaces.
 */
'use client';

import { useMemo } from 'react';
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
  // Get narrative text with proper memoization - always call useMemo
  const narrativeToDisplay = useMemo(() => {
    // Check if narrative history exists and is an array
    if (!state?.narrative?.narrativeHistory || !Array.isArray(state.narrative.narrativeHistory)) {
      return ''; // Return empty if narrative history isn't ready or not an array
    }
    
    // Read from the correct state path: state.narrative.narrativeHistory
    const history = state.narrative.narrativeHistory as string[]; // History is now an array of strings
    let calculatedNarrative = ''; // Initialize variable

    if (history.length > 0) {
      // Join the narrative history strings
      // Add styling for player actions if needed (future enhancement)
      // For now, just join them. Add logic here to differentiate player actions later.
      calculatedNarrative = history
        .filter(entry => typeof entry === 'string' && entry.trim() !== '') // Ensure entries are non-empty strings
        .join('\n\n'); // Join with double newline for better separation
    } else {
      calculatedNarrative = ''; // Explicitly set to empty if no history
    }

    return calculatedNarrative; // Return the calculated value
  }, [state?.narrative?.narrativeHistory]); // Depend on narrativeHistory specifically
  
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
