import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useGameInitialization } from "../hooks/useGameInitialization";
import { useGameSession } from "../hooks/useGameSession";
import { adaptHealthChangeHandler, useCombatStateRestoration as combatStateRestoration } from "../hooks/useCombatStateRestoration";
import { LoadingScreen } from "./GameArea/LoadingScreen";
import { MainGameArea } from "./GameArea/MainGameArea";
import { SidePanel } from "./GameArea/SidePanel";
import { InventoryManager } from "../utils/inventoryManager";
import DevToolsPanel from "./Debug/DevToolsPanel";
import { Character } from "../types/character";
import { InventoryItem } from "../types/item.types";
import { ActionTypes } from "../types/actionTypes";

/**
 * Main GameSession component that orchestrates the game interface
 * and coordinates between different game systems
 */
export const GameSession: React.FC = () => {
  const { isInitializing, isClient } = useGameInitialization();
  const gameSession = useGameSession();
  const { state, dispatch, executeCombatRound, getCurrentOpponent } = gameSession;
  
  // Check for skip loading flag during reset
  const [skipLoadingScreen, setSkipLoadingScreen] = useState(false);
  
  useEffect(() => {
    // Check for skip loading flag in localStorage
    if (typeof window !== 'undefined') {
      const skipLoading = localStorage.getItem('_boothillgm_skip_loading');
      const isReset = localStorage.getItem('_boothillgm_reset_flag');
      
      if (skipLoading === 'true' || isReset) {
        setSkipLoadingScreen(true);
        
        // Clean up after a short delay to allow state to be processed
        const timer = setTimeout(() => {
          localStorage.removeItem('_boothillgm_skip_loading');
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleUseItem = useCallback(() => {
    // Existing implementation
  }, []);

  const handleEquipWeapon = useCallback((itemId: string) => {
    if (!state.character) {
      return;
    }

    // Get inventory items from state - handle both array and object formats
    const inventoryItems = state.inventory && 'items' in state.inventory
      ? state.inventory.items
      : (state.inventory as unknown as InventoryItem[]);

    // Find the item with the matching ID
    const item = inventoryItems?.find((i: InventoryItem) => i.id === itemId);
    
    if (!item || item.category !== 'weapon') {
      return;
    }

    // Get player character - handle both Character and CharacterState formats
    const playerCharacter = state.character && 'player' in state.character
      ? state.character.player as Character | null
      : (state.character as unknown as Character);

    if (!playerCharacter) {
      return;
    }
    
    InventoryManager.equipWeapon(playerCharacter, item);
    dispatch({ type: ActionTypes.EQUIP_WEAPON, payload: itemId }); // Use standardized action type
  }, [state, dispatch]);

  const handleCombatAction = useCallback(async () => {
    if (executeCombatRound) {
      await executeCombatRound();
    }
  }, [executeCombatRound]);

  // Get the current opponent using the dedicated method from gameSession
  const opponent = getCurrentOpponent ? getCurrentOpponent() : null;
  
  // Get player ID safely from different character structures
  const getPlayerId = useCallback((): string => {
    if (!state || !state.character) return 'player';
    
    // If character is a Character type with id
    if ('id' in state.character && typeof state.character.id === 'string') {
      return state.character.id;
    }
    
    // If character is a CharacterState with player property
    if ('player' in state.character && state.character.player) {
      return state.character.player.id;
    }
    
    return 'player';
  }, [state]);
  
  // Safe accessor for opponent ID
  const getOpponentId = useCallback((): string => {
    return opponent?.id || 'opponent';
  }, [opponent]);
  
  // Create an adapter for the handlePlayerHealthChange function with safe IDs
  const adaptedHealthChangeHandler = useMemo(() => {
    // Try-catch the function call since the implementation may differ in tests
    try {
      return adaptHealthChangeHandler(
        gameSession.handleStrengthChange, 
        getPlayerId(), 
        getOpponentId()
      );
    } catch (error) {
      console.error("Error creating health change handler:", error);
      // Return a no-op function as fallback
      return () => {
        console.warn("Health change handler not available");
      };
    }
  }, [gameSession.handleStrengthChange, getPlayerId, getOpponentId]);

  // Create a session object with all required props
  const sessionProps = {
    ...gameSession,
    handleEquipWeapon,
    handleUseItem,
    handleCombatAction,
    handlePlayerHealthChange: adaptedHealthChangeHandler,
    opponent,
    isCombatActive: state?.combat?.isActive || false
  };

  // Call the combat state restoration function in useEffect
  useEffect(() => {
    // Only run on client-side and when we have all required data
    if (typeof window !== 'undefined' && state && gameSession) {
      try {
        // Use as a regular function, not a hook
        combatStateRestoration(state, gameSession);
      } catch (error) {
        console.error("Error in combat state restoration:", error);
      }
    }
  }, [state, gameSession]);

  // Skip loading screen during reset
  if (skipLoadingScreen) {
    // Just render a minimal placeholder until state is ready
    if (!isClient || !gameSession || !state) {
      return <div data-testid="loading-placeholder"></div>;
    }
  } else {
    // Early return if any required data is missing
    if (!isClient || !gameSession || !state) {
      return <LoadingScreen type="session" />;
    }

    // Check for initialized character (this is separate from the isInitializing check)
    if (isInitializing || !state.character) {
      return <LoadingScreen type="session" />;
    }
  }

  // Create a type guard for checking if an object is a Character
  const isCharacter = (obj: unknown): obj is Character => {
    return obj !== null &&
      typeof obj === 'object' &&
      'isNPC' in obj &&
      'isPlayer' in obj &&
      'id' in obj &&
      'name' in obj &&
      'attributes' in obj;
  };

  // Extract player character with proper type safety
  const getPlayerCharacter = (): Character => {
    // First check if state.character is null or undefined
    if (!state.character) {
      throw new Error('Character state is null or undefined');
    }

    // If it has a player property, it's likely a CharacterState
    if ('player' in state.character) {
      const player = state.character.player;
      // Ensure the player is a valid Character
      if (isCharacter(player)) {
        return player;
      }
      // Fallback to an empty Character if player isn't valid
      throw new Error('Player character is not a valid Character object');
    }
    
    // If the character itself is a Character, return it
    if (isCharacter(state.character)) {
      return state.character;
    }
    
    // If we've reached here, state.character exists but isn't in a recognized format
    throw new Error('Unable to extract a valid Character from state');
  };

  // Try to get a valid Character or handle errors gracefully
  try {
    getPlayerCharacter(); // Call function but don't assign to unused variable
  } catch (error) {
    console.error('Failed to extract player character:', error);
    
    // Skip error screen during reset
    if (skipLoadingScreen) {
      return <div data-testid="error-placeholder"></div>;
    }
    
    // Use the LoadingScreen with a custom error message instead of an invalid type
    return <LoadingScreen 
      type="session" 
      message="Character data error" 
      error="Invalid character data structure detected"
    />;
  }

  return (
    <div className="wireframe-container" data-testid="game-container">
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <MainGameArea {...sessionProps} />
        <SidePanel {...sessionProps} />
      </div>
      <DevToolsPanel 
        // Pass the current GameState directly to DevToolsPanel
        gameState={state}
        dispatch={dispatch} // Use direct dispatch
      />
    </div>
  );
};

// Default export for easier imports
export default GameSession;