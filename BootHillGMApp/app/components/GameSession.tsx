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
      <h1 className="wireframe-title">Game Session</h1>
      
      <StatusDisplayManager
        character={state.character}
        location={state.location}
        onManualSave={handleManualSave}
      />

      <NarrativeDisplay
        narrative={state.narrative}
        error={error}
        onRetry={retryLastAction}
      />

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

      <Inventory onUseItem={handleUseItem} />
      <JournalViewer entries={state.journal || []} />
    </div>
  );
}
