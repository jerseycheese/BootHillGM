'use client';

import React from 'react';
import CombatSystem from './CombatSystem';
import JournalViewer from './JournalViewer';
import UserInputHandler from './UserInputHandler';
import StatusPanel from './StatusPanel';
import { useGameSession } from '../hooks/useGameSession';
import '../styles/wireframe.css';
import { useGameInitialization } from '../hooks/useGameInitialization';
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

  // Render component
  return (
    <div className="wireframe-container">
      <h1 className="wireframe-title">Game Session</h1>
      
      {/* StatusPanel handles character status display and game saving */}
      <StatusPanel 
        character={state.character!} 
        location={state.location} 
        onSave={handleManualSave}
      />
      
      {/* Game narrative display */}
      <div className="wireframe-section h-64 overflow-y-auto">
        <pre className="wireframe-text whitespace-pre-wrap">{state.narrative}</pre>
      </div>
      {error && (
        <div className="text-red-500 flex items-center gap-2">
          <span>{error}</span>
          <button
            onClick={retryLastAction}
            className="px-2 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
          >
            Retry
          </button>
        </div>
      )}
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
