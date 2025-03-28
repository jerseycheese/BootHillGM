import { CampaignState } from '../types/campaign';
import { NarrativeState } from '../types/narrative.types';
import { NarrativeChoice, NarrativeDisplayMode } from '../types/narrative/choice.types';
import { StateWithMixedStructure } from '../types/gameSession.types';
import { Character } from '../types/character';
import { JournalEntry } from '../types/journal';
import { InventoryItem } from '../types/item.types';

/**
 * Creates a state object compatible with CampaignState from potentially mixed state structures.
 * This handles various edge cases and ensures the resulting state conforms to expected interfaces.
 * 
 * @param state - The mixed state structure to convert
 * @param isCombatActive - Whether combat is currently active
 * @returns A state object compatible with CampaignState interface
 */
export const createCompatibleState = (
  state: StateWithMixedStructure, 
  isCombatActive: boolean
): CampaignState & { isCombatActive: boolean } => {
  // Extract opponent from character state if available
  let opponent: Character | null = null;
  if (state.character && typeof state.character === 'object') {
    if ('opponent' in state.character && state.character.opponent) {
      if (typeof state.character.opponent === 'object' && 
          'id' in state.character.opponent && 
          'name' in state.character.opponent && 
          'attributes' in state.character.opponent) {
        opponent = state.character.opponent as Character;
      }
    }
  } else if (state.opponent && typeof state.opponent === 'object') {
    if ('id' in state.opponent && 'name' in state.opponent && 'attributes' in state.opponent) {
      opponent = state.opponent as Character;
    }
  }
  
  // Create a default narrative state that matches NarrativeState interface
  const defaultNarrativeState: NarrativeState = {
    currentStoryPoint: null,
    visitedPoints: [],
    availableChoices: [],
    narrativeHistory: [],
    displayMode: 'standard'
  };
  
  // Process narrative state based on its type
  let narrativeState = defaultNarrativeState;
  
  if (state.narrative) {
    if (typeof state.narrative === 'string') {
      // Convert string to basic narrative state
      narrativeState = {
        ...defaultNarrativeState,
        narrativeHistory: [state.narrative]
      };
    } else if (typeof state.narrative === 'object') {
      // Extract properties safely
      const narrativeObj = state.narrative as Record<string, unknown>;
      
      // Create properly typed narrative choices if they exist
      const availableChoices: NarrativeChoice[] = [];
      if (Array.isArray(narrativeObj.availableChoices)) {
        for (const choice of narrativeObj.availableChoices) {
          if (typeof choice === 'object' && choice !== null) {
            const choiceObj = choice as Record<string, unknown>;
            if (typeof choiceObj.id === 'string' && typeof choiceObj.text === 'string') {
              availableChoices.push({
                id: choiceObj.id,
                text: choiceObj.text,
                leadsTo: typeof choiceObj.leadsTo === 'string' ? choiceObj.leadsTo : 'unknown'
              });
            }
          }
        }
      }
      
      narrativeState = {
        currentStoryPoint: null, // We can't safely reconstruct a StoryPoint
        visitedPoints: Array.isArray(narrativeObj.visitedPoints) ?
          narrativeObj.visitedPoints.filter(p => typeof p === 'string') as string[] : [],
        availableChoices,
        narrativeHistory: Array.isArray(narrativeObj.narrativeHistory) ?
          narrativeObj.narrativeHistory.filter(h => typeof h === 'string') as string[] : [],
        displayMode: typeof narrativeObj.displayMode === 'string' ?
          narrativeObj.displayMode as NarrativeDisplayMode : 'standard'
      };
    }
  }
  
  // Safely extract character
  let character: Character | null = null;
  if (state.character) {
    if (typeof state.character === 'object') {
      if ('player' in state.character && state.character.player) {
        // It's a CharacterState-like object, extract the player
        if (typeof state.character.player === 'object' && 
            'id' in state.character.player && 
            'name' in state.character.player && 
            'attributes' in state.character.player) {
          character = state.character.player as Character;
        }
      } else if ('id' in state.character && 
                'name' in state.character && 
                'attributes' in state.character) {
        // It's a Character object
        character = state.character as Character;
      }
    }
  }
  
  // Safely extract journal entries
  let journalEntries: JournalEntry[] = [];
  if (state.journal) {
    if (Array.isArray(state.journal)) {
      // It's already an array of journal entries
      journalEntries = state.journal as JournalEntry[];
    } else if (typeof state.journal === 'object') {
      if ('entries' in state.journal && Array.isArray(state.journal.entries)) {
        // It's a JournalState object
        journalEntries = state.journal.entries as JournalEntry[];
      }
    }
  }
  
  // Safely extract inventory items
  let inventoryItems: InventoryItem[] = [];
  if (state.inventory) {
    if (Array.isArray(state.inventory)) {
      // It's already an array of inventory items
      inventoryItems = state.inventory as InventoryItem[];
    } else if (typeof state.inventory === 'object') {
      if ('items' in state.inventory && Array.isArray(state.inventory.items)) {
        // It's an InventoryState object
        inventoryItems = state.inventory.items as InventoryItem[];
      }
    }
  }
  
  // Create a compatible state object
  return {
    currentPlayer: state.currentPlayer || '',
    npcs: state.npcs || [],
    character,
    location: state.location || null,
    savedTimestamp: state.savedTimestamp,
    gameProgress: state.gameProgress || 0,
    journal: journalEntries,
    narrative: narrativeState,
    inventory: inventoryItems,
    quests: state.quests || [],
    isCombatActive,
    opponent,
    isClient: state.isClient,
    suggestedActions: state.suggestedActions || [],
    // Just omit combatState since we're handling isActive separately
    combatState: undefined,
    get player() {
      return this.character;
    }
  };
};