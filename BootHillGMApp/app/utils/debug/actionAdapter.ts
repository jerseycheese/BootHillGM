/**
 * Action Adapter Utility
 * 
 * Converts GameEngineAction to GameAction with enhanced validation
 */
import { GameAction } from "../../types/actions";
import { GameEngineAction } from "../../types/gameActions";
import { logDiagnostic } from "../initializationDiagnostics";

// Type for location that includes both variants
interface SafeLocation {
  type: string;
  name?: string;
  description?: string;
}

/**
 * Adapts a GameEngineAction to a GameAction with enhanced validation
 * 
 * @param action The GameEngineAction to adapt
 * @returns The adapted GameAction
 */
export function adaptAction(action: GameEngineAction): GameAction {
  // Log action adaptation for diagnostics
  logDiagnostic('ActionAdapter', `Converting action: ${action.type}`, {
    originalType: action.type,
    hasPayload: action.type !== "RESET_NARRATIVE"
  });

  // Handle specific type conversions
  if (action.type === "SET_LOCATION" && typeof action.payload !== "string") {
    const location = action.payload as SafeLocation;
    return {
      type: action.type,
      payload: location.name || location.description || "unknown"
    };
  }
  
  // Enhanced SET_STATE action validation
  if (action.type === "SET_STATE") {
    // Log character data for diagnostic purposes
    if (action.payload?.character?.player) {
      logDiagnostic('ActionAdapter', 'SET_STATE character data', {
        name: action.payload.character.player.name,
        attributeCount: Object.keys(action.payload.character.player.attributes || {}).length,
        inventoryCount: action.payload.character.player.inventory?.items?.length || 0
      });
    }

    return {
      type: "SET_STATE",
      payload: action.payload
    };
  }
  
  // Handle RESET_NARRATIVE actions
  if (action.type === "RESET_NARRATIVE") {
    return { type: "RESET_NARRATIVE" };
  }
  
  // Handle RESET_STATE actions
  if ((action.type as string) === "RESET_STATE") {
    return { type: "RESET_STATE" };
  }
  
  // Default case
  return action as unknown as GameAction;
}