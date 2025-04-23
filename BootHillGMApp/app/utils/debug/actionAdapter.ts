/**
 * Action Adapter Utility
 * 
 * Converts GameEngineAction to GameAction with enhanced validation
 */
import { GameAction } from "../../types/actions";
import { GameEngineAction } from "../../types/gameActions";
import { logDiagnostic } from "../initializationDiagnostics";
import { ActionTypes } from '../../types/actionTypes';
import { GameState } from "../../types/gameState";

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
    hasPayload: 'payload' in action && action.type !== 'RESET_NARRATIVE' // Use string literal instead of ActionTypes
  });

  // Create a typesafe way to check legacy strings
  const actionType = action.type as string;

  // Handle specific type conversions
  // Check for the legacy action type format (not using ActionTypes)
  if (actionType === "SET_LOCATION" && 'payload' in action && typeof action.payload !== "string") {
    const location = action.payload as SafeLocation;
    return {
      type: ActionTypes.SET_LOCATION,
      payload: location.name || location.description || "unknown"
    };
  }
  
  // Enhanced SET_STATE action validation
  if (actionType === ActionTypes.SET_STATE && 'payload' in action) {
    // Cast payload to GameState for proper typing
    const payload = action.payload as GameState;
    
    // Log character data for diagnostic purposes
    if (payload && 
        typeof payload === 'object' && 
        'character' in payload && 
        payload.character && 
        'player' in payload.character && 
        payload.character.player) {
      
      const player = payload.character.player;
      
      logDiagnostic('ActionAdapter', 'SET_STATE character data', {
        name: player.name,
        attributeCount: Object.keys(player.attributes || {}).length,
        inventoryCount: player.inventory?.items?.length || 0
      });
    }

    return {
      type: ActionTypes.SET_STATE,
      payload
    };
  }
  
  // Handle RESET_NARRATIVE actions
  if (actionType === "RESET_NARRATIVE") {
    return { type: ActionTypes.RESET_NARRATIVE };
  }
  
  // Handle RESET_STATE actions
  if (actionType === "RESET_STATE") {
    return { type: ActionTypes.RESET_STATE };
  }
  
  // Default case
  return action as unknown as GameAction;
}