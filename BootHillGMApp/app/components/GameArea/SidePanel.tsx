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
import { useCampaignState } from '../../hooks/useCampaignStateContext'; // Import the context hook
import { JournalEntry, JournalEntryType, RawJournalEntry } from '../../types/journal';
import GameStorage from '../../utils/gameStorage';

/**
 * Extracts the player character object from the game state.
 *
 * @param s - The current game state.
 * @returns The player Character object or null if not found.
 */
// Helper function to extract player character from state

/**
 * Processes an array of raw journal entries, ensuring they are correctly typed
 * and preserving the `narrativeSummary` property if present.
 *
 * @param entries - An array of raw journal entry data.
 * @returns An array of validated and typed JournalEntry objects.
 */
// Helper function to ensure journal entries maintain all properties
const processJournalEntries = (entries: Array<JournalEntry | RawJournalEntry>): JournalEntry[] => {
  if (!Array.isArray(entries)) return [];
  
  return entries.map(rawOrTypedEntry => {
    // Treat the input as RawJournalEntry to handle potentially missing fields
    const entry = rawOrTypedEntry as RawJournalEntry;
    // Basic validation check
    if (!entry || typeof entry !== 'object') {
      return null;
    }
    
    // Check for narrativeSummary specifically before processing
    const hasNarrativeSummary = 'narrativeSummary' in entry && entry.narrativeSummary;
    
    // Store the original narrative summary
    const narrativeSummary = entry.narrativeSummary;
    
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
          title: entry.title || 'Combat Encounter', // Add title
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
          title: entry.title || 'Inventory Update', // Add title
          timestamp: entry.timestamp || Date.now(),
          content: entry.content || '',
          type: 'inventory',
          items: entry.items || { acquired: [], removed: [] },
        };
        break;
        
      case 'quest':
        processedEntry = {
          id: entry.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: entry.title || entry.questTitle || 'Quest Update', // Add title (use questTitle if available)
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
          title: entry.title || 'Narrative Update', // Add title
          timestamp: entry.timestamp || Date.now(),
          content: entry.content || '',
          type: 'narrative',
          narrativeSummary: entry.narrativeSummary || '',
        };
    }
    
    // Explicitly add the narrativeSummary if it exists
    if (hasNarrativeSummary && typeof narrativeSummary === 'string') {
      (processedEntry as JournalEntry & { narrativeSummary?: string }).narrativeSummary = narrativeSummary;
    }
    
    return processedEntry;
  }).filter(Boolean) as JournalEntry[]; // Remove any null entries
};

// Define specific props for SidePanel
interface SidePanelProps {
  handleEquipWeapon: (itemId: string) => void;
  isLoading: boolean;
}

export function SidePanel({
  handleEquipWeapon,
  isLoading,
}: SidePanelProps) { // Use the new props interface
  // Get state for location, and the derived player character directly from context
  const { state, player: playerCharacter } = useCampaignState();
  
  // No longer need to derive playerCharacter here
  // const playerCharacter = getPlayerFromState(state);

  // Initialize state variables properly
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  // Update character when state changes - Removed useEffect for characterData
  // useEffect(() => {
  //   if (state?.character) {
  //     const player = getPlayerFromState(state);
  //     if (player) {
  //       setCharacterData(player);
  //     }
  //   } else {
  //     // Handle case where state or character becomes null/undefined
  //     setCharacterData(null);
  //   }
  // }, [state]); // Depend on context state

  // Journal entries processing
  useEffect(() => {
    if (!state) return;
    
    let sourceEntries: Array<JournalEntry | RawJournalEntry> = []; // Allow both types
    
    // Process journal entries from state if available
    if (state.journal) {
      if (typeof state.journal === 'object' && 'entries' in state.journal && Array.isArray(state.journal.entries)) {
        sourceEntries = state.journal.entries; // Remove incorrect cast
      } else if (Array.isArray(state.journal)) {
        sourceEntries = state.journal as RawJournalEntry[];
      }
    }
    
    // If there are entries in state.entries as fallback
    if (sourceEntries.length === 0 && state.journal?.entries && Array.isArray(state.journal.entries)) {
      sourceEntries = state.journal.entries; // Remove incorrect cast
    }
    
    // Process entries to ensure narrativeSummary is preserved
    if (sourceEntries.length > 0) {
      // Process entries to ensure all properties are maintained
      const processedEntries = processJournalEntries(sourceEntries);
      
      setJournalEntries(processedEntries);
    } else {
      // Fallback to storage only if we have no entries yet
      const storageEntries = GameStorage.getJournalEntries();
      if (storageEntries.length > 0) {
        const processedStorageEntries = processJournalEntries(storageEntries); // Remove incorrect cast (processJournalEntries handles raw/typed)
        setJournalEntries(processedStorageEntries);
      }
    }
  }, [state]); // Depend on context state
  
  // Get inventory items from state
  const inventoryItems = state?.inventory?.items || [];
  
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

  // Unavailable state if loading finished and playerCharacter is still null
  if (!playerCharacter) {
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

  // Main content render when character data is available
  return (
    <div className="h-full flex flex-col" data-testid="side-panel">
      <div className="space-y-4">
        <StatusDisplayManager
          character={playerCharacter} // Pass locally derived character
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