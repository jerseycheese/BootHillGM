/**
 * SidePanel displays supplementary game information.
 * Shows character status, inventory, and journal entries.
 * Positioned on the right side of the game interface.
 * 
 * NOTE: This component has been updated to use the unified GameState model
 * instead of CampaignState. It handles both state formats for backward
 * compatibility according to the state unification strategy outlined in
 * the technical-guides/state-management documentation.
 */
'use client';

import { useEffect, useState } from 'react';
import StatusDisplayManager from '../StatusDisplayManager';
import { Inventory } from '../Inventory';
import JournalViewer from '../JournalViewer';
import { useGameState } from '../../context/GameStateProvider';
import { JournalEntry, JournalEntryType, RawJournalEntry } from '../../types/journal';
import GameStorage from '../../utils/gameStorage';
import { Character } from '../../types/character';
import { GameState } from '../../types/gameState';

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

/**
 * Helper function to extract the player character from GameState
 * Handles both legacy and domain-specific state formats for backward compatibility.
 * 
 * @param state - The game state
 * @returns The player character or null
 */
const getPlayerCharacter = (state: GameState | null | undefined): Character | null => {
  if (!state || !state.character) return null;
  
  // Check both formats: {player, opponent} and direct character object
  if ('player' in state.character && state.character.player) {
    return state.character.player;
  } else if ('attributes' in state.character) {
    return state.character as unknown as Character;
  }
  
  return null;
};

/**
 * SidePanel component for displaying supplementary game information
 * 
 * Shows the character status, inventory, and journal entries in a side column.
 * Handles different state formats for backward compatibility.
 */
export function SidePanel({
  handleEquipWeapon,
  isLoading,
}: SidePanelProps) {
  // Get state using useGameState instead of useCampaignState
  const { state } = useGameState();
  
  // Extract player character from state
  const playerCharacter = getPlayerCharacter(state);

  // Initialize state variables properly
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
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