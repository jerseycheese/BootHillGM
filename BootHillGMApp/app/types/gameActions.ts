import { InventoryItem } from "./item.types";
import { LocationType } from "../services/locationService";
import { NarrativeState } from "./narrative.types";
import { CombatLogEntry } from "./state/combatState";
import { NarrativeAction } from "./narrative/actions.types";
import { CombatState } from "./combat";
import { BaseJournalEntry } from "./journal";
import { SuggestedAction } from "./campaign";
import type { Character, UpdateCharacterPayload } from "./character"; // Combined import with 'type' modifier
import { GameStateAction } from './actions';
import { ActionTypes } from './actionTypes';
import { GameState } from "./gameState";

// Define payload types for specific actions
export interface PerformAttackPayload {
  attackerId: string;
  defenderId: string;
  weaponId?: string; // Optional weapon ID
}

// Define journal update payload type to avoid using 'any'
export interface JournalUpdatePayload extends Partial<BaseJournalEntry> {
  id: string;
  content: string;
  timestamp: number;
  type?: 'narrative' | 'combat' | 'inventory' | 'quest';
  narrativeSummary?: string;
  
  // Optional fields for specific entry types
  combatants?: {
    player: string;
    opponent: string;
  };
  outcome?: 'victory' | 'defeat' | 'escape' | 'truce';
  items?: {
    acquired: string[];
    removed: string[];
  };
  questTitle?: string;
  status?: 'started' | 'updated' | 'completed' | 'failed';
}

// Re-export the type for backward compatibility
export type { UpdateCharacterPayload };

// Define narrative text payload type
export interface NarrativeTextPayload {
  text: string;
}

// Define combat type payload
export type CombatTypePayload = 'brawling' | 'weapon' | null;

// Define the main GameEngineAction type using a union
export type GameEngineAction =
  | { type: typeof ActionTypes.SET_PLAYER; payload: string }
  | { type: typeof ActionTypes.SET_CHARACTER; payload: Character }
  | { type: typeof ActionTypes.UPDATE_CHARACTER; payload: UpdateCharacterPayload }
  | { type: typeof ActionTypes.SET_LOCATION; payload: LocationType }
  | { type: typeof ActionTypes.ADD_ITEM; payload: InventoryItem }
  | { type: typeof ActionTypes.REMOVE_ITEM; payload: string } // Payload is item ID
  | { type: typeof ActionTypes.USE_ITEM; payload: string }
  | { type: typeof ActionTypes.SET_COMBAT_ACTIVE; payload: boolean }
  | { type: typeof ActionTypes.SET_OPPONENT; payload: Partial<Character> }
  | { type: "UPDATE_ITEM_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAN_INVENTORY"; payload?: undefined } // Reverted
  | { type: "SET_INVENTORY"; payload: InventoryItem[] }
  | { type: "SET_SAVED_TIMESTAMP"; payload: number }
  | { type: typeof ActionTypes.SET_STATE; payload: GameState }
  | GameStateAction
  | { type: "UPDATE_PLAYER_STATS"; payload: Partial<Character["attributes"]> }
  | { type: "UPDATE_PLAYER_WOUNDS"; payload: Character["wounds"] }
  | { type: "UPDATE_OPPONENT"; payload: Character }
  | { type: typeof ActionTypes.EQUIP_WEAPON; payload: string }
  | { type: typeof ActionTypes.UNEQUIP_WEAPON; payload: string }
  | { type: "END_COMBAT"; payload?: undefined } // Reverted
  | { type: "UPDATE_NARRATIVE"; payload: Partial<NarrativeState> }
  | { type: typeof ActionTypes.UPDATE_COMBAT_STATE; payload: CombatState } // Use ActionTypes
  | { type: "UPDATE_JOURNAL"; payload: JournalUpdatePayload }
  | { type: "SET_NARRATIVE"; payload: NarrativeTextPayload }
  | { type: "SET_GAME_PROGRESS"; payload: number }
  | { type: "SET_SUGGESTED_ACTIONS"; payload: SuggestedAction[] }
  | { type: typeof ActionTypes.SET_COMBAT_TYPE; payload: CombatTypePayload }
  | { type: typeof ActionTypes.END_COMBAT; payload?: undefined }

  // Narrative action types
  | { type: "ADVANCE_NARRATIVE"; payload: string }
  | { type: "SET_NARRATIVE_POINT"; payload: string }
  | { type: "ADD_NARRATIVE_CHOICE"; payload: unknown }
  | { type: "REMOVE_NARRATIVE_CHOICE"; payload: string }
  | { type: "ACTIVATE_BRANCH"; payload: string }
  | { type: "COMPLETE_BRANCH"; payload: string }
  | { type: "UPDATE_NARRATIVE_CONTEXT"; payload: unknown }
  | { type: "RESET_NARRATIVE"; payload?: undefined } // Reverted
  | { type: "PRESENT_DECISION"; payload: unknown }
  | { type: "RECORD_DECISION"; payload: { decisionId: string; selectedOptionId: string; narrative: string } }
  | { type: "CLEAR_CURRENT_DECISION"; payload?: undefined } // Reverted
  | { type: "PROCESS_DECISION_IMPACTS"; payload: string }
  | { type: "UPDATE_IMPACT_STATE"; payload: unknown }
  | { type: "EVOLVE_IMPACTS"; payload?: undefined } // Reverted
  | { type: "NARRATIVE_ERROR"; payload: unknown }
  | { type: "CLEAR_ERROR"; payload?: undefined } // Reverted

  // Story progression actions
  | { type: "ADD_STORY_POINT"; payload: unknown }
  | { type: "UPDATE_CURRENT_POINT"; payload: string }
  | { type: "MARK_BRANCHING_POINT_TAKEN"; payload: string }
  | { type: "RESET_STORY_PROGRESSION"; payload?: undefined } // Reverted

  | NarrativeAction

  // Combat slice action types
  | { type: "combat/SET_ACTIVE"; payload: boolean }
  | { type: "combat/TOGGLE_TURN"; payload?: undefined } // Reverted
  | { type: "combat/NEXT_ROUND"; payload?: undefined } // Reverted
  | { type: "combat/ADD_LOG_ENTRY"; payload: CombatLogEntry }
  | { type: "combat/RESET_COMBAT"; payload?: undefined } // Reverted
  | { type: "combat/END"; payload?: undefined }
  | { type: "combat/SET_COMBAT_TYPE"; payload: CombatTypePayload }
  | { type: "combat/END_COMBAT"; payload?: undefined }

  // Legacy combat action types
  | { type: "START_COMBAT"; payload: boolean }
  | { type: "PERFORM_ATTACK"; payload: PerformAttackPayload }
  | { type: "NO_OP"; payload?: undefined }
  | { type: "NEXT_COMBAT_TURN"; payload?: undefined };