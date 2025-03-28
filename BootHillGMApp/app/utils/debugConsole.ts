import { PlayerDecision } from "../types/narrative.types";
import { LocationType } from "../services/locationService";
import { GameState } from "../types/gameState";
// Import types from our central definition file
import { DebugCommandData } from "../types/global.d";
// Import the global declarations
import '../types/global.d';

/**
 * Helper for conditional logging based on environment
 * 
 * @param message Message to log
 * @param data Optional data to include
 */
const debugLog = (message: string, data?: DebugCommandData | GameState | string | Error | undefined): void => {
  if (process.env.NODE_ENV !== 'production') {
    if (data !== undefined) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

/**
 * Initialize the BHGM debug namespace in the browser window
 * This provides console debugging tools for development
 * 
 * @param gameStateGetter Function to get the current game state
 * @param decisionTrigger Function to trigger a decision
 * @param decisionClearer Function to clear the current decision
 */
export const initializeBrowserDebugTools = (
  // Dependencies passed in to avoid circular references
  gameStateGetter: () => GameState,
  decisionTrigger: (locationType?: LocationType) => void,
  decisionClearer: () => void
): void => {
  if (typeof window === 'undefined') return;

  // Create or access the existing debug namespace
  if (!window.bhgmDebug) {
    // Initialize the object if it doesn't exist yet
    window.bhgmDebug = {
      version: '1.0.0',
      triggerDecision: (locationType?: LocationType) => {
        debugLog(`BHGM Debug: Triggering contextual decision for ${locationType?.type || 'current location'}`);
        decisionTrigger(locationType);
      },
      clearDecision: () => {
        debugLog('BHGM Debug: Clearing current decision');
        decisionClearer();
      },
      listLocations: () => {
        debugLog('BHGM Debug: Available location types:');
        debugLog(['town', 'wilderness', 'ranch', 'mine', 'camp'].join(', '));
        return ['town', 'wilderness', 'ranch', 'mine', 'camp'];
      },
      getState: () => {
        const state = gameStateGetter();
        debugLog('BHGM Debug: Current game state:', state);
        return state;
      },
      currentDecision: null,
      // Define sendCommand function directly here
      sendCommand: (commandType: string, data?: unknown) => {
        try {
          if (data && typeof data === 'object' && data !== null) {
            localStorage.setItem('bhgm_debug_command', JSON.stringify({ type: commandType, ...data as object }));
          } else {
            localStorage.setItem('bhgm_debug_command', JSON.stringify({ type: commandType, data }));
          }
        } catch (error) {
          console.error('BHGM Debug: Error sending command via localStorage:', error);
        }
      }
    };
  } else {
    // If the object already exists, only update properties that won't cause conflicts
    window.bhgmDebug.version = '1.0.0';
    window.bhgmDebug.triggerDecision = (locationType?: LocationType) => {
      debugLog(`BHGM Debug: Triggering contextual decision for ${locationType?.type || 'current location'}`);
      decisionTrigger(locationType);
    };
    window.bhgmDebug.clearDecision = () => {
      debugLog('BHGM Debug: Clearing current decision');
      decisionClearer();
    };
    window.bhgmDebug.listLocations = () => {
      debugLog('BHGM Debug: Available location types:');
      debugLog(['town', 'wilderness', 'ranch', 'mine', 'camp'].join(', '));
      return ['town', 'wilderness', 'ranch', 'mine', 'camp'];
    };
    window.bhgmDebug.getState = () => {
      const state = gameStateGetter();
      debugLog('BHGM Debug: Current game state:', state);
      return state;
    };
    
    // Only define sendCommand if it doesn't already exist
    if (typeof window.bhgmDebug.sendCommand !== 'function') {
      window.bhgmDebug.sendCommand = (commandType: string, data?: unknown) => {
        try {
          if (data && typeof data === 'object' && data !== null) {
            localStorage.setItem('bhgm_debug_command', JSON.stringify({ type: commandType, ...data as object }));
          } else {
            localStorage.setItem('bhgm_debug_command', JSON.stringify({ type: commandType, data }));
          }
        } catch (error) {
          console.error('BHGM Debug: Error sending command via localStorage:', error);
        }
      };
    }
  }


  // Listen for cross-component messages using storage events
  window.addEventListener('storage', (event) => {
    if (event.key === 'bhgm_debug_command' && event.newValue) {
      try {
        const command = JSON.parse(event.newValue);
        if (command.type === 'trigger_decision') {
          window.bhgmDebug!.triggerDecision(command.locationType);
        } else if (command.type === 'clear_decision') {
          window.bhgmDebug!.clearDecision();
        }
      } catch (error) {
        console.error('BHGM Debug: Error processing cross-component message', error);
      }
    }
  });
  
  // Removed the Object.defineProperty section that was causing the error
};

/**
 * Update the current decision in the debug namespace
 * This allows for inspecting the current decision in the console
 * 
 * @param decision Current decision or null if cleared
 */
export const updateDebugCurrentDecision = (decision: PlayerDecision | null): void => {
  if (typeof window !== 'undefined' && window.bhgmDebug) {
    window.bhgmDebug.currentDecision = decision;
    debugLog('BHGM Debug: Current decision updated', decision?.id || 'cleared');
  }
};