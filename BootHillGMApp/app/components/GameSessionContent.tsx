'use client';

import React, { useEffect, useState, useRef } from "react";
import { useGameInitialization } from "../hooks/useGameInitialization";
import { useGameSession } from "../hooks/useGameSession";
import { useCombatStateRestoration } from "../hooks/useCombatStateRestoration";
import { useCharacterExtraction } from "../hooks/useCharacterExtraction";
import { useRecoveryOptions } from "../hooks/useRecoveryOptions";
import { LoadingScreen } from "./GameArea/LoadingScreen";
import { MainGameArea } from "./GameArea/MainGameArea";
import { SidePanel } from "./GameArea/SidePanel";
import DevToolsPanel from "./Debug/DevToolsPanel";
import { generateSessionProps } from "../utils/sessionPropsGenerator";
import { createCombatInitiator } from "../utils/combatInitiatorGenerator";
import { useCampaignStateAdapter } from "../hooks/useCampaignStateAdapter";
import { RecoveryOptions } from "./GameArea/RecoveryOptions";
import { GameSessionType } from "../types/session/gameSession.types";

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
  
  // Core hooks
  const { isInitializing, isClient } = useGameInitialization();
  const gameSession = useGameSession();
  const { 
    playerCharacter, 
    playerCharacterError, 
    recoveryInProgress,
    characterRecovered
  } = useCharacterExtraction(gameSession?.state);
  
  // Recovery hooks
  const { handleRecoverGame, handleRestartGame }: {
    handleRecoverGame: () => void;
    handleRestartGame: () => void;
  } = useRecoveryOptions(
    gameSession?.dispatch,
    // Removed playerCharacter argument as it's no longer used by the hook
    recoveryInProgress
  );
  
  // State adapters
  // Removed campaignState from destructuring as it's no longer returned by the adapter
  // Removed playerCharacter argument as it's no longer used by the adapter hook
  const { dispatchAdapter } = useCampaignStateAdapter(
    gameSession?.dispatch,
    gameSession?.state
  );
  
  // Explicitly cast the gameSession to GameSessionType to ensure type compatibility
  const typedGameSession = gameSession as GameSessionType;
  
  // Generate session props and combat initiator
  const sessionProps = generateSessionProps(typedGameSession, playerCharacter);
  const combatInitiator = createCombatInitiator(typedGameSession, sessionProps);
  
  // Restore combat state if needed
  useCombatStateRestoration(gameSession?.state || null, combatInitiator);
  
  // Set up loading time tracker
  useEffect(() => {
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
  }, [isInitializing, loadingStartTime]);
  
  // Add extended loading time detection
  useEffect(() => {
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
  }, [isInitializing, showRecoveryOptions]);
  
  // Handle character recovery if needed
  useEffect(() => {
    if (!playerCharacterError || characterRecovered.current || recoveryInProgress.current) return;
    
    const attemptRecovery = async () => {
      try {
        if (typeof window !== 'undefined') {
          const savedCharacter = localStorage.getItem("character-creation-progress");
          if (savedCharacter) {
            const parsedData = JSON.parse(savedCharacter);
            const extractedChar = parsedData.character;
            
            if (extractedChar &&
                typeof extractedChar === 'object' &&
                'attributes' in extractedChar &&
                extractedChar.attributes &&
                typeof extractedChar.attributes === 'object') {
              
              characterRecovered.current = true;
              
              // Use requestAnimationFrame to defer state updates until after render
              window.requestAnimationFrame(() => {
                handleRecoverGame();
              });
            }
          }
        }
      } catch (error) {
        console.error("Error recovering character:", error);
      }
    };
    
    attemptRecovery();
  }, [playerCharacterError, handleRecoverGame, characterRecovered, recoveryInProgress]);
  
  // Early exit for loading state
  if (!isClient || !gameSession || !gameSession.state) {
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
          // Pass the current gameSession state directly
          gameState={gameSession?.state}
          dispatch={dispatchAdapter}
        />
      </div>
    </div>
  );
}
