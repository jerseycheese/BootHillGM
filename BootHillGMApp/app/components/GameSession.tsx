/**
 * Main game session container component.
 * Coordinates between input, display, combat, and inventory systems.
 * Handles conditional rendering based on game state (combat vs. normal play).
 * Uses modular components for better maintainability and testing.
 */
'use client';

import React from 'react';
import { useGameInitialization } from '../hooks/useGameInitialization';
import { useGameSession } from '../hooks/useGameSession';
import CombatSystem from './CombatSystem';
import InputManager from './InputManager';
import StatusDisplayManager from './StatusDisplayManager';
import NarrativeDisplay from './NarrativeDisplay';
import Inventory from './Inventory';
import JournalViewer from './JournalViewer';

export default function GameSession() {
  const { isInitializing, isClient } = useGameInitialization();
  const {
    state,
    isLoading,
    error,
    isCombatActive,
    opponent,
    handleUserInput,
    retryLastAction,
    handleCombatEnd,
    handlePlayerHealthChange,
    handleManualSave,
    handleUseItem,
  } = useGameSession();

  if (!isClient || !state || !state.character || isInitializing) {
    return (
      <div className="wireframe-container" role="status">
        Loading game session...
      </div>
    );
  }

  return (
    <div className="wireframe-container">
      <div className="h-full grid grid-cols-[1fr_300px] gap-4">
        {/* Main Game Area */}
        <div className="h-full flex flex-col overflow-auto">
          
          {/* Narrative section */}
          <div className="wireframe-section flex-1 flex flex-col overflow-auto">
            <NarrativeDisplay
              narrative={state.narrative}
              error={error}
              onRetry={retryLastAction}
            />
            
            {/* Input or Combat section directly below narrative */}
            <div className="mt-4 shrink-0">
              {isCombatActive && opponent ? (
                <CombatSystem
                  playerCharacter={state.character}
                  opponent={opponent}
                  onCombatEnd={handleCombatEnd}
                  onPlayerHealthChange={handlePlayerHealthChange}
                />
              ) : (
                <InputManager
                  onSubmit={handleUserInput}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        </div>

        {/* Side Panel - Fixed at bottom */}
        <div className="h-full flex flex-col justify-end">
          <div className="space-y-4">
            <StatusDisplayManager
              character={state.character}
              location={state.location}
              onManualSave={handleManualSave}
            />
            <Inventory onUseItem={handleUseItem} />
            <JournalViewer entries={state.journal || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
