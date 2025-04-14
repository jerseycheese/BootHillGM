/**
 * Reset Process Tracking Utilities
 * 
 * Provides diagnostics and tracking for the reset process
 */
import { logDiagnostic, captureStateSnapshot } from "../initializationDiagnostics";

// Define tracking interface for diagnostics
export interface TrackingDiagnostics {
  beforeActionDispatch: (actionType: string, actionPayload?: unknown) => void;
  afterActionDispatch: () => void;
}

// Enhanced tracking implementation with proper diagnostics
export const trackResetProcess: TrackingDiagnostics = {
  beforeActionDispatch: (actionType, actionPayload) => {
    // Log detailed action information before dispatch
    logDiagnostic('RESET', `Before dispatch: ${actionType}`, {
      actionType,
      hasPayload: !!actionPayload,
      payloadType: actionPayload ? typeof actionPayload : 'none',
      timestamp: new Date().toISOString()
    });
    
    // Capture state snapshot before reset for comparison
    const beforeSnapshot = captureStateSnapshot();
    if (beforeSnapshot) {
      logDiagnostic('RESET', 'State snapshot before reset', {
        totalKeys: beforeSnapshot.totalKeys,
        characterName: beforeSnapshot.gameStateKeys['saved-game-state']?.characterName,
        inventoryCount: beforeSnapshot.gameStateKeys['saved-game-state']?.inventoryCount
      });
    }
  },
  afterActionDispatch: () => {
    // Capture state after reset for verification
    const afterSnapshot = captureStateSnapshot();
    if (afterSnapshot) {
      logDiagnostic('RESET', 'State snapshot after reset', {
        totalKeys: afterSnapshot.totalKeys,
        characterName: afterSnapshot.gameStateKeys['saved-game-state']?.characterName,
        inventoryCount: afterSnapshot.gameStateKeys['saved-game-state']?.inventoryCount
      });
    }
    
    logDiagnostic('RESET', 'Reset process completed, preparing for page reload');
  }
};