import React, { useCallback, useMemo } from "react";
import { useGameInitialization } from "../hooks/useGameInitialization";
import { useGameSession } from "../hooks/useGameSession";
import { useCombatStateRestoration, adaptHealthChangeHandler } from "../hooks/useCombatStateRestoration";
import { LoadingScreen } from "./GameArea/LoadingScreen";
import { MainGameArea } from "./GameArea/MainGameArea";
import { SidePanel } from "./GameArea/SidePanel";
import { InventoryManager } from "../utils/inventoryManager";
import DevToolsPanel from "./Debug/DevToolsPanel";
// Removed unused imports: GameAction, GameEngineAction, Dispatch
// Removed unused import: LocationService
import { Character } from "../types/character";
import { InventoryItem } from "../types/item.types";
// Removed unused imports: CombatState, JournalEntry
import { CombatInitiator } from "../types/combatStateAdapter";

// Removed unused interface: ExtendedState
export default function GameSession() {
  const { isInitializing, isClient } = useGameInitialization();
  const gameSession = useGameSession();
  const { state, dispatch, executeCombatRound, getCurrentOpponent } = gameSession;
  
  // Get LocationService singleton instance for parsing locations
  // Removed unused locationService variable

  // Removed dispatchAdapter as GameAction should be used consistently

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
    dispatch({ type: 'inventory/EQUIP_WEAPON', payload: itemId }); // Use namespaced type
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
    return adaptHealthChangeHandler(
      gameSession.handleStrengthChange, 
      getPlayerId(), 
      getOpponentId()
    );
  }, [gameSession.handleStrengthChange, getPlayerId, getOpponentId]);

  // Create a session object with all required props
  const sessionProps = {
    ...gameSession,
    handleEquipWeapon,
    handleUseItem,
    handleCombatAction,
    handlePlayerHealthChange: adaptedHealthChangeHandler,
    opponent,
    isCombatActive: state.combat?.isActive || false // Add isCombatActive from combat slice
  };

  // Create a properly typed combat initiator object
  // Put explicit properties first, then spread gameSession to avoid overrides
  const combatInitiator: CombatInitiator = {
    // Core combat functions
    initiateCombat: gameSession.initiateCombat,
    executeCombatRound: gameSession.executeCombatRound || (() => {}),
    handleCombatAction,
    handlePlayerHealthChange: adaptedHealthChangeHandler,
    
    // Equipment & character management
    onEquipWeapon: handleEquipWeapon,
    getCurrentOpponent: gameSession.getCurrentOpponent || (() => null),
    opponent,
    
    // State management
    // Access combat status via the combat slice
    isCombatActive: state?.combat?.isActive || false,
    dispatch,
    
    // Additional properties - using optional chaining to handle properties that may not exist
    isLoading: gameSession.isLoading || false,
    error: gameSession.error || null,
    handleUserInput: gameSession.handleUserInput,
    retryLastAction: gameSession.retryLastAction,
    
    // Optional properties - these might not exist in gameSession
    handleDebug: undefined,  // Optional property in CombatInitiator
    handleSave: undefined,   // Optional property in CombatInitiator
    handleLoad: undefined    // Optional property in CombatInitiator
  };

  // Always call hooks at the top level - pass null if data isn't available yet
  useCombatStateRestoration(state || null, state ? combatInitiator : null);

  // Early return if any required data is missing
  if (!isClient || !gameSession || !state) {
    return <LoadingScreen type="session" />;
  }

  // Check for initialized character (this is separate from the isInitializing check)
  // This handles the error from GameSession.test.tsx
  if (isInitializing || !state.character) {
    return <LoadingScreen type="session" />;
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
  // Removed unused variable: playerCharacter
  try {
    getPlayerCharacter(); // Call function but don't assign to unused variable
  } catch (error) {
    console.error('Failed to extract player character:', error);
    // Use the LoadingScreen with a custom error message instead of an invalid type
    return <LoadingScreen 
      type="session" 
      message="Character data error" 
      error="Invalid character data structure detected"
    />;
  }

  // Removed unused variable: extendedState

  // Removed obsolete CampaignState reconstruction logic

  return (
    <div className="wireframe-container" data-testid="game-container">
      <div className="grid grid-cols-[1fr_300px] gap-4">
        {/* Temporarily cast dispatch prop until MainGameArea/SidePanel props are updated */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <MainGameArea {...sessionProps} dispatch={sessionProps.dispatch as any} />
        {/* Temporarily cast dispatch prop until MainGameArea/SidePanel props are updated */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <SidePanel {...sessionProps} dispatch={sessionProps.dispatch as any} />
      </div>
      <DevToolsPanel 
        // Pass the current GameState directly to DevToolsPanel
        gameState={state}
        dispatch={dispatch} // Use direct dispatch
      />
    </div>
  );
}
