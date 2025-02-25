import { Character } from "./character";
import { InventoryItem } from "./item.types";
import { JournalEntry } from "./journal";
import { SuggestedAction } from "./campaign";
import { CombatState, CombatType, Wound } from "./combat";
import { GameState } from "./gameState";
import { LocationType } from "../services/locationService";

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
  | { type: "SET_NARRATIVE"; payload: string }
  | { type: "SET_GAME_PROGRESS"; payload: number }
  | { type: "UPDATE_JOURNAL"; payload: JournalEntry | JournalEntry[] }
  | { type: "SET_COMBAT_ACTIVE"; payload: boolean }
  | { type: "SET_OPPONENT"; payload: Partial<Character> }
  | { type: "UPDATE_ITEM_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAN_INVENTORY" }
  | { type: "SET_INVENTORY"; payload: InventoryItem[] }
  | { type: "SET_SAVED_TIMESTAMP"; payload: number }
  | { type: "SET_STATE"; payload: Partial<GameState> }
  | { type: "SET_SUGGESTED_ACTIONS"; payload: SuggestedAction[] }
  | { type: "UPDATE_COMBAT_STATE"; payload: Partial<CombatState> }
  | { type: "SET_COMBAT_TYPE"; payload: CombatType }
  | { type: "UPDATE_OPPONENT"; payload: Character }
  | { type: "EQUIP_WEAPON"; payload: string }
  | { type: "UNEQUIP_WEAPON"; payload: string }
  | { type: "END_COMBAT" };
