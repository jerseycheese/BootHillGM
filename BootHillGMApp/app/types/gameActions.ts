import { CombatLogEntry } from './state/combatState';
export interface PerformAttackPayload {
  weaponId: string;
  targetId: string;
}
import { Character } from "./character";
import { InventoryItem } from "./item.types";
import { JournalEntry } from "./journal";
import { SuggestedAction } from "./campaign";
import { CombatState, CombatType, Wound } from "./combat";
import { GameState } from "./gameState";
import { LocationType } from "../services/locationService";
import { NarrativeAction, NarrativeState, StoryProgressionState } from './narrative.types';
import { InventoryAction } from './actions/inventoryActions';

// Define a specific type for the UPDATE_CHARACTER payload
export interface UpdateCharacterPayload {
  attributes?: Partial<Character["attributes"]>;
  wounds?: Wound[];
  strengthHistory?: {
    baseStrength: number;
    changes: {
      previousValue: number;
      newValue: number;
      reason: string;
      timestamp: Date;
    }[];
  };
  damageInflicted?: number; // Add the damageInflicted property
  [key: string]: unknown; // Allow other properties as well
}

export type GameEngineAction =
  | { type: "SET_PLAYER"; payload: string }
  | { type: "ADD_NPC"; payload: string }
  | { type: "SET_LOCATION"; payload: LocationType }
  | { type: "ADD_ITEM"; payload: InventoryItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "USE_ITEM"; payload: string }
  | { type: "ADD_QUEST"; payload: string }
  | { type: "SET_CHARACTER"; payload: Character | null }
  | { type: "UPDATE_CHARACTER"; payload: UpdateCharacterPayload }
  | { type: "SET_NARRATIVE"; payload: { text: string; storyProgression?: Partial<StoryProgressionState> } }
  | { type: "SET_GAME_PROGRESS"; payload: number }
  | { type: "UPDATE_JOURNAL"; payload: JournalEntry | JournalEntry[] }
  | { type: "journal/ADD_ENTRY"; payload: Partial<JournalEntry> }
  | { type: "journal/REMOVE_ENTRY"; payload: { id: string } }
  | { type: "journal/UPDATE_ENTRY"; payload: Partial<JournalEntry> & { id: string } }

  | { type: "SET_COMBAT_ACTIVE"; payload: boolean }
  | { type: "SET_OPPONENT"; payload: Partial<Character> }
  | { type: "UPDATE_ITEM_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAN_INVENTORY"; payload?: undefined }
  | { type: "SET_INVENTORY"; payload: InventoryItem[] }
  | { type: "SET_SAVED_TIMESTAMP"; payload: number }
  | { type: "SET_STATE"; payload: Partial<GameState> }
  | { type: "SET_SUGGESTED_ACTIONS"; payload: SuggestedAction[] }
  | { type: "UPDATE_COMBAT_STATE"; payload: Partial<CombatState> }
  | { type: "SET_COMBAT_TYPE"; payload: CombatType }
  | { type: "UPDATE_OPPONENT"; payload: Character }
  | { type: "EQUIP_WEAPON"; payload: string }
  | { type: "UNEQUIP_WEAPON"; payload: string }
  | { type: "END_COMBAT"; payload?: undefined }
  | { type: "UPDATE_NARRATIVE"; payload: Partial<NarrativeState> }
  
  // Narrative action types
  | { type: "NAVIGATE_TO_POINT"; payload: string }
  | { type: "SELECT_CHOICE"; payload: string }
  | { type: "ADD_NARRATIVE_HISTORY"; payload: string }
  | { type: "SET_DISPLAY_MODE"; payload: string }
  | { type: "START_NARRATIVE_ARC"; payload: string }
  | { type: "COMPLETE_NARRATIVE_ARC"; payload: string }
  | { type: "ACTIVATE_BRANCH"; payload: string }
  | { type: "COMPLETE_BRANCH"; payload: string }
  | { type: "UPDATE_NARRATIVE_CONTEXT"; payload: unknown }
  | { type: "RESET_NARRATIVE"; payload?: undefined }
  | { type: "PRESENT_DECISION"; payload: unknown }
  | { type: "RECORD_DECISION"; payload: { decisionId: string; selectedOptionId: string; narrative: string } }
  | { type: "CLEAR_CURRENT_DECISION"; payload?: undefined }
  | { type: "PROCESS_DECISION_IMPACTS"; payload: string }
  | { type: "UPDATE_IMPACT_STATE"; payload: unknown }
  | { type: "EVOLVE_IMPACTS"; payload?: undefined }
  | { type: "NARRATIVE_ERROR"; payload: unknown }
  | { type: "CLEAR_ERROR"; payload?: undefined }
  
  // Story progression actions
  | { type: "ADD_STORY_POINT"; payload: unknown }
  | { type: "UPDATE_CURRENT_POINT"; payload: string }
  | { type: "MARK_BRANCHING_POINT_TAKEN"; payload: string }
  | { type: "RESET_STORY_PROGRESSION"; payload?: undefined }
  
  | NarrativeAction
  | InventoryAction
  
  // Combat slice action types
  | { type: "combat/SET_ACTIVE"; payload: boolean }
  | { type: "combat/TOGGLE_TURN"; payload?: undefined }
  | { type: "combat/NEXT_ROUND"; payload?: undefined }
  | { type: "combat/ADD_LOG_ENTRY"; payload: CombatLogEntry }
  | { type: "combat/RESET_COMBAT"; payload?: undefined }
  | { type: "combat/END"; payload?: undefined }
  
  // Legacy combat action types
  | { type: "START_COMBAT"; payload: boolean }
  | { type: "PERFORM_ATTACK"; payload: PerformAttackPayload }
  | { type: "NO_OP"; payload?: undefined }

  | { type: "NEXT_COMBAT_TURN"; payload?: undefined };
