// /app/utils/initialization/initState.ts
import { debug } from './initHelpers';
import { logDiagnostic } from '../initializationDiagnostics';

/**
 * Type definition for initialization reference
 */
export interface InitializationRef {
  initialized: boolean;
  inProgress: boolean;
  initCalled: number;
  resetDetected: boolean;
  lastResetTimestamp: number;
  timeoutId: NodeJS.Timeout | null;
  forceAIGeneration: boolean;
  directAIGenerationAttempted: boolean;
}

/**
 * Sets up the initialization state and processes reset flags
 * Note: This is a regular function, not a React hook
 */
export function setupInitState(initRef: InitializationRef): { 
  nowResetDetected: boolean; 
  resetTimestamp: number;
} {
  // Check for reset flag
  const resetFlag = localStorage.getItem('_boothillgm_reset_flag');
  const forceGenFlag = localStorage.getItem('_boothillgm_force_generation');
  
  debug('Reset flags check - resetFlag:', resetFlag, 'forceGenFlag:', forceGenFlag);
  logDiagnostic('FLAGS', 'Pre-check', { 
    resetFlag, 
    forceGenFlag,
    timeSinceReset: resetFlag ? Date.now() - parseInt(resetFlag) : null
  });

  const nowResetDetected = !!resetFlag;
  let resetTimestamp = Date.now();
  
  // CRITICAL FIX: Remove flags immediately when detected to prevent infinite loops
  if (nowResetDetected) {
    debug('RESET FLAG DETECTED - forcing reinitialization');
    logDiagnostic('GAMEINIT', 'Reset flag detected - forcing AI generation');
    
    resetTimestamp = resetFlag ? parseInt(resetFlag) : Date.now();
    
    // IMMEDIATELY remove the flags to prevent infinite loop
    debug('Removing reset flags IMMEDIATELY to prevent infinite loop');
    localStorage.removeItem('_boothillgm_reset_flag');
    
    if (forceGenFlag) {
      localStorage.removeItem('_boothillgm_force_generation');
    }

    debug('Flags removed');
    logDiagnostic('FLAGS', 'Post-removal', {
      resetFlag: localStorage.getItem('_boothillgm_reset_flag'),
      forceGenFlag: localStorage.getItem('_boothillgm_force_generation')
    });

    if (forceGenFlag) {
      initRef.forceAIGeneration = true;
      debug('FORCE GENERATION FLAG DETECTED - will generate new AI content');
      logDiagnostic('GAMEINIT', 'Force generation flag detected - will generate new AI content');
    }
    
    initRef.resetDetected = true;
    initRef.lastResetTimestamp = resetTimestamp;
    
    // Force a new initialization even if we've already initialized
    initRef.initialized = false;
    
    // Check for character data in specific storage key
    const characterData = localStorage.getItem('characterData');
    if (characterData) {
      debug('FOUND CHARACTER DATA IN STORAGE, will use for AI generation');
      logDiagnostic('GAMEINIT', 'Found character data for reset in characterData key');
    }
  }
  
  return { nowResetDetected, resetTimestamp };
}