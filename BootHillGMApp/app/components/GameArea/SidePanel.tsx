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
import { JournalEntry, JournalEntryType, RawJournalEntry, EnhancedJournalEntry } from '../../types/journal';
import GameStorage from '../../utils/gameStorage';

/**
 * Extracts the player character object from the game state.
 *
 * @param s - The current game state.
 * @returns The player Character object or null if not found.
 */
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

/**
 * Processes an array of raw journal entries, ensuring they are correctly typed
 * and preserving the `narrativeSummary` property if present.
 *
 * @param entries - An array of raw journal entry data.
 * @returns An array of validated and typed JournalEntry objects.
 */
// Helper function to ensure journal entries maintain all properties
const processJournalEntries = (entries: RawJournalEntry[]): JournalEntry[] => {
  if (!Array.isArray(entries)) return [];
  
  return entries.map(entry => {
    // Basic validation check
    if (!entry || typeof entry !== 'object') {
      return null;
    }
    
    // First debug the incoming entry
    
    // Check for narrativeSummary specifically before processing
    const hasNarrativeSummary = 'narrativeSummary' in entry && entry.narrativeSummary;
    
    // Store the original narrative summary
    const narrativeSummary = entry.narrativeSummary;
    if (narrativeSummary) {
    }
    
    // Determine the entry type and ensure it's a valid JournalEntryType
    let entryType: JournalEntryType = 'narrative';
    if (entry.type === 'combat' || entry.type === 'inventory' || entry.type === 'quest') {
      entryType = entry.type;
    }
    
    // Create a properly typed journal entry based on the entry type
    let processedEntry: JournalEntry;
    
    switch (entryType) {
      case 'combat':
        processedEntry = {
          id: entry.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: entry.timestamp || Date.now(),
          content: entry.content || '',
          type: 'combat',
          combatants: entry.combatants || { player: '', opponent: '' },
          outcome: (entry.outcome as 'victory' | 'defeat' | 'escape' | 'truce') || 'victory',
        };
        break;
        
      case 'inventory':
        processedEntry = {
          id: entry.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: entry.timestamp || Date.now(),
          content: entry.content || '',
          type: 'inventory',
          items: entry.items || { acquired: [], removed: [] },
        };
        break;
        
      case 'quest':
        processedEntry = {
          id: entry.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: entry.timestamp || Date.now(),
          content: entry.content || '',
          type: 'quest',
          questTitle: entry.questTitle || 'Unknown Quest',
          status: (entry.status as 'started' | 'updated' | 'completed' | 'failed') || 'started',
        };
        break;
        
      default:
        // Default to narrative entry
        processedEntry = {
          id: entry.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: entry.timestamp || Date.now(),
          content: entry.content || '',
          type: 'narrative',
        };
    }
    
    // Explicitly add the narrativeSummary if it exists
    if (hasNarrativeSummary && typeof narrativeSummary === 'string') {
      (processedEntry as JournalEntry & { narrativeSummary?: string }).narrativeSummary = narrativeSummary;
    }
    
    // Final check of processed entry
    
    return processedEntry;
  }).filter(Boolean) as JournalEntry[]; // Remove any null entries
};

export function SidePanel({
  state,
  handleEquipWeapon,
  isLoading, // Add isLoading prop
}: GameSessionProps) {
  // Initialize state variables properly
  const [characterData, setCharacterData] = useState<Character | null>(getPlayerFromState(state));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  // Update character when state changes
  useEffect(() => {
    if (state?.character) {
      const player = getPlayerFromState(state);
      if (player) {
        setCharacterData(player);
      }
    }
  }, [state]);

  // Journal entries processing
  useEffect(() => {
    if (!state) return;
    
    
    let sourceEntries: RawJournalEntry[] = [];
    
    // Process journal entries from state if available
    if (state.journal) {
      if (typeof state.journal === 'object' && 'entries' in state.journal && Array.isArray(state.journal.entries)) {
        sourceEntries = state.journal.entries as RawJournalEntry[];
      } else if (Array.isArray(state.journal)) {
        sourceEntries = state.journal as RawJournalEntry[];
      }
    }
    
    // If there are entries in state.entries as fallback
    if (sourceEntries.length === 0 && state.journal?.entries && Array.isArray(state.journal.entries)) {
      sourceEntries = state.journal.entries as RawJournalEntry[];
    }
    
    // Process entries to ensure narrativeSummary is preserved
    if (sourceEntries.length > 0) {
      // DEBUGGING: Check each entry for narrativeSummary
      
      // Process entries to ensure all properties are maintained
      const processedEntries = processJournalEntries(sourceEntries);
      
      
      // DEBUGGING: Check processed entries for narrativeSummary
      
      setJournalEntries(processedEntries);
    } else {
      // Fallback to storage only if we have no entries yet
      const storageEntries = GameStorage.getJournalEntries();
      if (storageEntries.length > 0) {
        const processedStorageEntries = processJournalEntries(storageEntries as RawJournalEntry[]);
        setJournalEntries(processedStorageEntries);
      }
    }
  }, [state]); // Only depend on state
  
  // Get inventory items from state
  const inventoryItems = state?.inventory?.items || [];
  useEffect(() => {
    if (state?.inventory?.items) {
    } else if (inventoryItems.length === 0) {
      // If no inventory items in state, try to get default items
      const defaultItems = GameStorage.getDefaultInventoryItems();
    }
  }, [state, inventoryItems.length]);
  
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
          </div>
        </div>
      </div>
    );
  }

  // Debug log for journal entries before render
  
  // DEBUGGING: Check all journal entries right before passing to JournalViewer

  // Main content render when character data is available
  return (
    <div className="h-full flex flex-col" data-testid="side-panel">
      <div className="space-y-4">
        <StatusDisplayManager
          character={characterData}
          location={state.location}
        />
        <Inventory
          items={inventoryItems}
          handleEquipWeapon={handleEquipWeapon}
        />
        <JournalViewer 
          entries={journalEntries}
        />
      </div>
    </div>
  );
}