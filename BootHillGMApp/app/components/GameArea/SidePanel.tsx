/**
 * SidePanel displays supplementary game information.
 * Shows character status, inventory, and journal entries.
 * Positioned on the right side of the game interface.
 */
'use client';

import { useEffect, useState } from 'react'; 
import StatusDisplayManager from '../StatusDisplayManager';
import { Inventory } from '../Inventory';
import JournalViewer from '../JournalViewer';
import type { GameSessionProps } from './types';
import { Character } from '../../types/character';
import { JournalEntry } from '../../types/journal';
import GameStorage from '../../utils/gameStorage';

// Helper function to extract player character from state
const getPlayerFromState = (s: GameSessionProps['state']): Character | null => {
    if (!s?.character) return null;
    if (typeof s.character === 'object' && 'player' in s.character && s.character.player) {
        return s.character.player;
    }
    // Handle case where state.character might be the Character object directly (legacy?)
    if (typeof s.character === 'object' && 'id' in s.character) { 
        return s.character as unknown as Character;
    }
    return null;
};

export function SidePanel({
  state,
  handleEquipWeapon,
  isLoading, // Add isLoading prop
}: GameSessionProps) {
  // Initialize state variables properly - always call useState
  // Default to null or empty array so they're always defined
  const [characterData, _setCharacterData] = useState<Character | null>(getPlayerFromState(state));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Always call useEffect, but handle conditional logic inside
  useEffect(() => {
    // Early return if state is missing - no need for journal handling
    if (!state) return;
    
    let currentJournalEntries: JournalEntry[] = [];
    
    // Process journal entries from state if available
    if (state.journal) {
      if (typeof state.journal === 'object' && 'entries' in state.journal && Array.isArray(state.journal.entries)) {
        currentJournalEntries = state.journal.entries;
      } else if (Array.isArray(state.journal)) {
        currentJournalEntries = state.journal;
      }
    }
    
    // Only update state if we found entries or need fallback
    if (currentJournalEntries.length > 0) {
      // Avoid unnecessary state updates by comparing
      if (JSON.stringify(currentJournalEntries) !== JSON.stringify(journalEntries)) {
        // Removed console log
        setJournalEntries(currentJournalEntries);
      }
    } else if (journalEntries.length === 0) {
      // Fallback to storage only if we have no entries yet
      const entries = GameStorage.getJournalEntries();
      if (entries.length > 0) {
        console.log('SidePanel: Using journal entries from GameStorage');
        setJournalEntries(entries);
      }
    }
  }, [state, journalEntries]); // Depend on state and journalEntries
  
  // If the main game state is initializing, show a loading indicator
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center" data-testid="side-panel-main-loading">
        <p className="text-lg font-semibold">Loading Game Data...</p>
      </div>
    );
  }

  // Initial loading state if the main state prop is missing
  if (!state) {
    return (
      <div className="h-full flex flex-col" data-testid="side-panel-initial-loading">
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <p>Loading game state...</p>
          </div>
        </div>
      </div>
    );
  }

  // Unavailable state if loading finished and character is still null
  if (!characterData) {
    return (
      <div className="h-full flex flex-col" data-testid="side-panel-unavailable">
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <p>Character data not available</p>
            {/* Remove the retry button for test compatibility */}
          </div>
        </div>
      </div>
    );
  }

  // Main content render when character data is available
  // Removed console log
  return (
    <div className="h-full flex flex-col" data-testid="side-panel">
      <div className="space-y-4">
        <StatusDisplayManager
          character={characterData} // Use the resolved characterData
          location={state.location}
        />
        <Inventory
          // Pass only props that match the Inventory component's interface
          handleEquipWeapon={handleEquipWeapon}
        />
        {/* Removed incorrect log placement */}
        <JournalViewer entries={journalEntries} />
      </div>
    </div>
  );
}