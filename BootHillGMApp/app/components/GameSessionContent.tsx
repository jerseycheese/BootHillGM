'use client';

import React, { useEffect, useState, useRef } from "react";
import { useGameInitialization } from "../hooks/useGameInitialization";
import { useGameSession } from "../hooks/useGameSession";
import { useGameState } from "../context/GameStateProvider"; 
import { useCharacterExtraction } from "../hooks/useCharacterExtraction";
import { useRecoveryOptions } from "../hooks/useRecoveryOptions";
import { LoadingScreen } from "./GameArea/LoadingScreen";
import { MainGameArea } from "./GameArea/MainGameArea";
import { SidePanel } from "./GameArea/SidePanel";
import DevToolsPanel from "./Debug/DevToolsPanel";
import { generateSessionProps } from "../utils/sessionPropsGenerator";
import { useCampaignStateAdapter } from "../hooks/useCampaignStateAdapter";
import { RecoveryOptions } from "./GameArea/RecoveryOptions";
// Import as regular functions rather than hooks
import { useCombatStateRestoration as combatStateRestoration } from "../hooks/useCombatStateRestoration";
import { DEFAULT_NARRATIVE_CONTEXT } from '../utils/narrative/narrativeContextDefaults';
import { 
  updateNarrativeContext,
  navigateToPoint 
} from '../actions/narrativeActions';
import { narrativeDispatchWrapper } from '../utils/narrativeDispatchWrapper';

// Maximum loading time before showing recovery options
const MAX_LOADING_TIME = 5000; // 5 seconds

export default function GameSessionContent(): JSX.Element {
  // Component state
  const [loadingStartTime] = useState(Date.now());
  const [showRecoveryOptions, setShowRecoveryOptions] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  
  // Refs for tracking state
  const initialized = useRef(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recoveryAttempted = useRef(false);
  const narrativeInitialized = useRef(false);
  
  // Core hooks
  const { isInitializing, isClient } = useGameInitialization();
  const { state, dispatch } = useGameState(); 
  
  // Explicitly check for client-side rendering
  const isBrowser = typeof window !== 'undefined';
  
  // Always call the hook at the top level, then conditionally use its result
  const gameSession = useGameSession();
  const gameSessionForClient = isBrowser ? gameSession : null;
  
  // Using defensive programming to handle potential null values
  // Only extract character if state exists
  const {
    playerCharacter,
    playerCharacterError,
    recoveryInProgress,
    characterRecovered
  } = useCharacterExtraction(state || null); 
  
  // Recovery hooks - safely initialize
  const { handleRecoverGame, handleRestartGame } = useRecoveryOptions(
    dispatch, 
    recoveryInProgress
  );
  
  // State adapters - safely initialize
  const { dispatchAdapter } = useCampaignStateAdapter(
    dispatch
  );
  
  // Generate session props with null checks
  const sessionProps = generateSessionProps(
    state || null, 
    dispatch, 
    playerCharacter || null, 
    isInitializing
  );
  
  // Call combat state restoration in useEffect to avoid hook issues
  useEffect(() => {
    // Only run on client-side and when we have all required data
    if (isBrowser && state && gameSessionForClient) {
      try {
        // Call as a function, not a hook
        setTimeout(() => {
          combatStateRestoration(state, gameSessionForClient);
        }, 100); // Delay slightly to ensure all rendering is complete
      } catch (error) {
        console.error("Error in combat state restoration:", error);
      }
    }
  }, [isBrowser, state, gameSessionForClient]);
  
  // Direct narrative initialization without using a hook
  useEffect(() => {
    // Only run once, when we have character data, and only on the client
    if (!isBrowser || !playerCharacter || narrativeInitialized.current) {
      return;
    }
    
    console.log('[DEBUG] Initializing narrative directly in GameSessionContent');
    
    // Mark as initialized to prevent multiple initializations
    narrativeInitialized.current = true;
    
    try {
      // Create a wrapped dispatch for narrative actions
      const narrativeDispatch = narrativeDispatchWrapper(dispatch);
      
      // Create a basic narrative state based on the character
      const initialNarrativeContext = {
        ...DEFAULT_NARRATIVE_CONTEXT,
        characterFocus: [playerCharacter.name],
        // Use default western themes since traits may not be available
        themes: ['adventure', 'western'],
        decisionHistory: []
      };
      
      // Use the wrapped dispatch function that handles type conversion
      narrativeDispatch(updateNarrativeContext(initialNarrativeContext));
      narrativeDispatch(navigateToPoint('introduction'));
      
      console.log('[DEBUG] Narrative initialization completed successfully');
    } catch (error) {
      console.error('[DEBUG] Error initializing narrative:', error);
    }
  }, [isBrowser, playerCharacter, dispatch]);
  
  // Set up loading time tracker - only on client side
  useEffect(() => {
    if (!isBrowser) return;
    
    if (isInitializing) {
      // Start a timer to update loading time every second
      loadingTimerRef.current = setInterval(() => {
        setLoadingTime((Date.now() - loadingStartTime) / 1000);
      }, 1000);
    } else if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    return () => {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [isInitializing, loadingStartTime, isBrowser]);
  
  // Add extended loading time detection - only on client side
  useEffect(() => {
    if (!isBrowser) return;
    
    // Skip if we've already initialized or if recovery options are shown
    if (initialized.current || showRecoveryOptions || !isInitializing) return;
    
    const timerId = setTimeout(() => {
      // Only update state if we're still initializing
      if (isInitializing) {
        setShowRecoveryOptions(true);
      }
    }, MAX_LOADING_TIME);
    
    // Mark as initialized to prevent duplicate timers
    initialized.current = true;
    
    return () => clearTimeout(timerId);
  }, [isInitializing, showRecoveryOptions, isBrowser]);
  
  // Handle character recovery if needed - only on client side
  useEffect(() => {
    if (!isBrowser) return;
    
    // Added check for playerCharacter to prevent recovery when we already have a valid character
    // Also check if recovery has already been attempted to prevent multiple attempts
    if (!playerCharacterError || 
        characterRecovered.current || 
        recoveryInProgress.current || 
        playerCharacter || 
        recoveryAttempted.current) {
      return;
    }
    
    // Mark that we've attempted recovery to prevent infinite loops
    recoveryAttempted.current = true;
    
    const attemptRecovery = async () => {
      // Set recovery flag first to prevent multiple attempts
      recoveryInProgress.current = true;
      
      try {
        // Already checked for isBrowser above
        const savedCharacter = localStorage.getItem("character-creation-progress");
        if (savedCharacter) {
          try {
            const parsedData = JSON.parse(savedCharacter);
            const extractedChar = parsedData.character;
            
            if (extractedChar &&
                typeof extractedChar === 'object' &&
                'attributes' in extractedChar &&
                extractedChar.attributes &&
                typeof extractedChar.attributes === 'object') {
              
              characterRecovered.current = true;
              
              // Use setTimeout instead of requestAnimationFrame for better error handling
              setTimeout(() => {
                handleRecoverGame();
              }, 50);
            } else {
              // Failed to recover, reset flag
              recoveryInProgress.current = false;
            }
          } catch (parseError) {
            console.error("Error parsing saved character:", parseError);
            recoveryInProgress.current = false;
          }
        } else {
          // No saved character to recover
          recoveryInProgress.current = false;
        }
      } catch (error) {
        console.error("Error recovering character:", error);
        recoveryInProgress.current = false;
      }
    };
    
    attemptRecovery();
  }, [playerCharacterError, handleRecoverGame, playerCharacter, isBrowser]);
  // Removed characterRecovered and recoveryInProgress from dependencies since they're refs
  
  // For server-side rendering, always show the loading screen
  if (!isBrowser || !isClient) {
    return (
      <LoadingScreen 
        type="session" 
        message="Loading game session..."
        loadingTime={0}
      />
    );
  }

  // Early exit for loading state
  if (!state) {
    return (
      <LoadingScreen 
        type="session" 
        message={showRecoveryOptions ? "Game is taking longer than expected to load..." : undefined}
        error={showRecoveryOptions ? "Game initialization may be stuck" : undefined}
        loadingTime={loadingTime}
      >
        {showRecoveryOptions && (
          <RecoveryOptions 
            onRecover={handleRecoverGame} 
            onRestart={handleRestartGame} 
            isRecovering={recoveryInProgress.current}
          />
        )}
      </LoadingScreen>
    );
  }

  // Return loading screen if still initializing
  if (isInitializing) {
    return (
      <LoadingScreen 
        type="session" 
        message={showRecoveryOptions ? "Game is taking longer than expected to load..." : undefined}
        error={showRecoveryOptions ? "Game initialization may be stuck" : undefined}
        loadingTime={loadingTime}
      >
        {showRecoveryOptions && (
          <RecoveryOptions 
            onRecover={handleRecoverGame} 
            onRestart={handleRestartGame} 
            isRecovering={recoveryInProgress.current}
          />
        )}
      </LoadingScreen>
    );
  }

  // Handle character error case
  if (playerCharacterError && !characterRecovered.current) {
    return (
      <LoadingScreen 
        type="session" 
        message="Character data unavailable" 
        error="Character data not found or invalid"
        loadingTime={loadingTime}
      >
        <RecoveryOptions 
          onRecover={handleRecoverGame} 
          onRestart={handleRestartGame} 
          isRecovering={recoveryInProgress.current}
        />
      </LoadingScreen>
    );
  }

  // Final render with all components
  return (
    <div id="bhgmGameSessionContent" data-testid="game-session-content" className="wireframe-container">
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <MainGameArea id="bhgmMainGameArea" data-testid="main-game-area" {...sessionProps} />
        <SidePanel id="bhgmSidePanel" data-testid="side-panel" {...sessionProps} />
      </div>
      <div id="bhgmDevToolsPanel" data-testid="dev-tools-panel">
        <DevToolsPanel
          gameState={state} 
          dispatch={dispatchAdapter}
        />
      </div>
    </div>
  );
}