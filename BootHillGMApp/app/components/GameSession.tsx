'use client';

import React from 'react';
import CombatSystem from './CombatSystem';
import JournalViewer from './JournalViewer';
import UserInputHandler from './UserInputHandler';
import StatusPanel from './StatusPanel';
import { useGameSession } from '../hooks/useGameSession';
import '../styles/wireframe.css';
import { useGameInitialization } from '../hooks/useGameInitialization';
import NarrativeDisplay from './NarrativeDisplay';
import Inventory from './Inventory';

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

  // Loading state
  if (!isClient || !state || !state.character || isInitializing) {
    return <div className="wireframe-container">Loading game session...</div>;
  }

  // Game narrative is now handled by NarrativeDisplay component for better separation of concerns
  return (
    <div className="wireframe-container">
      <h1 className="wireframe-title">Game Session</h1>
      
      {/* StatusPanel handles character status display and game saving */}
      <StatusPanel 
        character={state.character} 
        location={state.location}
        onSave={handleManualSave}
      />

      <div>
        <NarrativeDisplay
          narrative={state.narrative}
          error={error}
          onRetry={retryLastAction}
        />
      </div>

      {/* Conditional rendering of Combat System or User Input form */}
      {isCombatActive && opponent ? (
        <CombatSystem
          playerCharacter={state.character}
          opponent={opponent}
          onCombatEnd={handleCombatEnd}
          onPlayerHealthChange={handlePlayerHealthChange}
        />
      ) : (
        <UserInputHandler onSubmit={handleUserInput} isLoading={isLoading} />
      )}
      {/* Inventory and Journal components */}
      <Inventory onUseItem={handleUseItem} />
      <JournalViewer entries={state.journal || []} />
    </div>
  );
}
