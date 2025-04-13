// /app/hooks/useGameInitialization.ts
import { useState, useEffect, useRef } from 'react';
import { useGameState } from '../context/GameStateProvider';
import { logDiagnostic } from '../utils/initializationDiagnostics';
import { 
  debug 
} from '../utils/initialization/initHelpers';
import { 
  InitializationRef,
  setupInitState
} from '../utils/initialization/initState';
import { 
  handleResetInitialization,
  handleRestoredGameState,
  handleFirstTimeInitialization
} from '../utils/initialization/initScenarios';
import { GameStorage } from '../utils/gameStorage';

/**
 * Enhanced useGameInitialization hook with improved reset handling
 * 
 * This hook manages game state initialization, ensuring the game
 * has a valid state when starting up or after being reset.
 */
export function useGameInitialization() {
  const { state, dispatch } = useGameState();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Reference to track initialization status
  const initializationRef = useRef<InitializationRef>({
    initialized: false,
    inProgress: false,
    initCalled: 0,
    resetDetected: false,
    lastResetTimestamp: 0,
    timeoutId: null,
    forceAIGeneration: false,
    directAIGenerationAttempted: false
  });

  // Client-side check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Main initialization effect
  useEffect(() => {
    if (!isClient) return;
    
    const initRef = initializationRef.current;
    
    // IMPORTANT: Fix for infinite loop - we need to prevent multiple initializations from the same reset
    // Check initialization status first before checking flags
    if (initRef.inProgress) {
      debug();
      return;
    }
    
    // Setup initialization state - using regular function, not hook
    const { nowResetDetected } = setupInitState(initRef);
    
    // Skip if already initialized (unless reset detected)
    if (initRef.initialized && !nowResetDetected) {
      debug();
      return;
    }
    
    // Mark initialization as in progress
    initRef.inProgress = true;
    initRef.initCalled++;
    
    debug(`Starting initialization (call #${initRef.initCalled}), reset detected: ${initRef.resetDetected}, force AI generation: ${initRef.forceAIGeneration}`);
    
    // Set a safety timeout
    initRef.timeoutId = setTimeout(() => {
      debug('SAFETY TIMEOUT: Forcing initialization to complete');
      if (isInitializing) {
        setIsInitializing(false);
        initRef.inProgress = false;
        initRef.initialized = true;
      }
    }, 10000);

    const initializeState = async () => {
      try {
        debug('Checking localStorage for game state...');
        
        // Load saved state if it exists
        const savedState = localStorage.getItem(GameStorage.keys.GAME_STATE);
        
        // Check for pre-generated content from reset handler
        const narrativeContent = localStorage.getItem('narrative');
        const journalContent = localStorage.getItem('journal');
        const suggestedActionsContent = localStorage.getItem('suggestedActions');
        
        debug('Checking for pre-generated content:', {
          hasNarrative: !!narrativeContent,
          hasJournal: !!journalContent,
          hasSuggestedActions: !!suggestedActionsContent
        });
        
        // IMPORTANT: Check for character data in specific storage key first
        let characterData = null;
        const characterDataKey = localStorage.getItem('characterData');
        if (characterDataKey) {
          try {
            debug('Found characterData key, parsing character...');
            characterData = JSON.parse(characterDataKey);
            
            // Save character data to every possible location to ensure persistence
            try {
              localStorage.setItem('completed-character', JSON.stringify(characterData));
              localStorage.setItem('character-creation-progress', JSON.stringify({ character: characterData }));
              debug('Saved character data to all storage locations');
            } catch (storageError) {
              debug('Error saving character data to storage:', storageError);
            }
          } catch (error) {
            debug('Error parsing characterData:', error);
          }
        }
        
        // Get character data from storage or use default
        const character = characterData || 
                         GameStorage.getCharacter().player || 
                         GameStorage.getDefaultCharacter();
        
        if (!character.id) {
          character.id = `character_${Date.now()}`;
        }
        
        debug(`Character being used: ${character.name}`);
        logDiagnostic('GAMEINIT', 'Character for initialization', {
          name: character.name,
          id: character.id,
          fromReset: !!characterData,
          resetDetected: initRef.resetDetected
        });
        
        // We need to force new AI content generation after reset
        // The special flags or narrativeExists check will trigger generation
        const forceNewGeneration = initRef.resetDetected || initRef.forceAIGeneration;
        
        // CRITICAL FIX: Always prefer direct AI generation on reset
        if (forceNewGeneration) {
          await handleResetInitialization({
            initRef,
            character,
            narrativeContent,
            journalContent,
            suggestedActionsContent,
            dispatch
          });
        } else if (savedState && !forceNewGeneration) {
          // Normal case - restore saved state when available
          await handleRestoredGameState({
            character,
            savedState,
            dispatch
          });
        } else {
          // Initialize a new game when no saved state exists (first time run)
          await handleFirstTimeInitialization({
            character,
            dispatch
          });
        }
        
        // Clean up temp characterData key as we've now used it
        if (characterDataKey) {
          localStorage.removeItem('characterData');
        }
        
        // Finalize initialization
        setIsInitializing(false);
        initRef.inProgress = false;
        initRef.initialized = true;
        initRef.resetDetected = false;
        initRef.forceAIGeneration = false;
        initRef.directAIGenerationAttempted = false;
        
        if (initRef.timeoutId) {
          clearTimeout(initRef.timeoutId);
          initRef.timeoutId = null;
        }
        
        debug('Initialization complete');
        logDiagnostic('GAMEINIT', 'Initialization complete');
        logDiagnostic('FLAGS', 'GenerationSuccess', {
          flagsRemaining: {
            reset: localStorage.getItem('_boothillgm_reset_flag'),
            force: localStorage.getItem('_boothillgm_force_generation')
          }
        });
      } catch (error) {
        debug('Initialization error:', error);
        logDiagnostic('GAMEINIT', 'Initialization error', { error: String(error) });
        logDiagnostic('FLAGS', 'GenerationFailed', {
          flagsRemaining: {
            reset: localStorage.getItem('_boothillgm_reset_flag'),
            force: localStorage.getItem('_boothillgm_force_generation')
          },
          error: String(error)
        });
        
        setIsInitializing(false);
        initRef.inProgress = false;
        
        if (initRef.timeoutId) {
          clearTimeout(initRef.timeoutId);
          initRef.timeoutId = null;
        }
      }
    };

    initializeState();
    
    return () => {
      if (initRef.timeoutId) {
        clearTimeout(initRef.timeoutId);
      }
    };
  }, [isClient, dispatch, state, isInitializing]);

  return { isInitializing, isClient };
}