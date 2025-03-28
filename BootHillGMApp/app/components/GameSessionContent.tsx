'use client';

import React, { useCallback, useMemo } from "react";
import { useGameInitialization } from "../hooks/useGameInitialization";
import { useGameSession } from "../hooks/useGameSession";
import { useCombatStateRestoration, adaptHealthChangeHandler } from "../hooks/useCombatStateRestoration";
import { LoadingScreen } from "./GameArea/LoadingScreen";
import { MainGameArea } from "./GameArea/MainGameArea";
import { SidePanel } from "./GameArea/SidePanel";
import { InventoryManager } from "../utils/inventoryManager";
import DevToolsPanel from "./Debug/DevToolsPanel";
import { GameAction, CampaignState } from "../types/campaign";
import { GameEngineAction } from "../types/gameActions";
import { Dispatch } from "react";
import { LocationService } from "../services/locationService";
import { Character } from "../types/character";
import { InventoryItem } from "../types/item.types";
import { CombatState } from "../types/combat";
import { JournalEntry } from "../types/journal";
import { CombatInitiator } from "../types/combatStateAdapter";

// Define our extended state interface
interface ExtendedState {
  suggestedActions?: unknown[];
  error?: string;
}

export default function GameSessionContent() {
  const { isInitializing, isClient } = useGameInitialization();
  const gameSession = useGameSession();
  const { state, dispatch, executeCombatRound, getCurrentOpponent } = gameSession;
  
  // Get current opponent
  const opponent = getCurrentOpponent ? getCurrentOpponent() : null;
  
  // Get LocationService singleton instance for parsing locations
  const locationService = useMemo(() => LocationService.getInstance(), []);

  // Create a dispatch adapter that converts GameAction to GameEngineAction
  const dispatchAdapter = useMemo<Dispatch<GameAction>>(() => {
    return (action) => {
      // Handle any necessary type conversions
      if (action.type === 'SET_LOCATION' && typeof action.payload === 'string') {
        // Convert string locations to LocationType using the LocationService
        const locationObject = locationService.parseLocation(action.payload);
        
        // Dispatch with properly typed location object
        dispatch({
          type: 'SET_LOCATION',
          payload: locationObject
        });
        return;
      }
      
      // For all other actions, pass through
      dispatch(action as unknown as GameEngineAction);
    };
  }, [dispatch, locationService]);

  const handleUseItem = useCallback(() => {
    // Existing implementation
  }, []);

  const handleEquipWeapon = useCallback((itemId: string) => {
    if (!state.character) {
      return;
    }
    
    // Handle different inventory structures
    const inventoryItems = 'items' in state.inventory 
      ? state.inventory.items 
      : (state.inventory as unknown as InventoryItem[]);
      
    // Find the item with the matching ID
    const item = inventoryItems.find((i: InventoryItem) => i.id === itemId);
    
    if (!item || item.category !== 'weapon') {
      return;
    }
    
    // Handle different character structures
    const playerCharacter = 'player' in state.character
      ? state.character.player as Character | null
      : (state.character as unknown as Character);
      
    if (!playerCharacter) {
      return;
    }
    
    InventoryManager.equipWeapon(playerCharacter, item);
    dispatch({ type: 'EQUIP_WEAPON', payload: itemId });
  }, [state, dispatch]);

  const handleCombatAction = useCallback(async () => {
    if (executeCombatRound) {
      await executeCombatRound();
    }
  }, [executeCombatRound]);

  // Get player ID safely from different character structures
  const getPlayerId = useCallback((): string => {
    if (!state.character) return 'player';
    
    // If character is a Character type with id
    if ('id' in state.character && typeof state.character.id === 'string') {
      return state.character.id;
    }
    
    // If character is a CharacterState with player property
    if ('player' in state.character && state.character.player) {
      return state.character.player.id;
    }
    
    return 'player';
  }, [state.character]);
  
  // Safe accessor for opponent ID
  const getOpponentId = useCallback((): string => {
    return opponent?.id || 'opponent';
  }, [opponent]);

  // Create an adapter for the handlePlayerHealthChange function
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
    opponent
  };

  // Create a properly typed combat initiator object
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
    isCombatActive: state.isCombatActive || false,
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

  useCombatStateRestoration(state, combatInitiator);

  if (!isClient || !gameSession || !state || !state.character || isInitializing) {
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
  let playerCharacter: Character;
  try {
    if ('player' in state.character && state.character.player && isCharacter(state.character.player)) {
      playerCharacter = state.character.player;
    } else if (isCharacter(state.character)) {
      playerCharacter = state.character;
    } else {
      throw new Error('Invalid character structure');
    }
  } catch (error) {
    console.error('Failed to extract player character:', error);
    return <LoadingScreen 
      type="session" 
      message="Character data error" 
      error="Invalid character data structure detected"
    />;
  }

  const extendedState = state as ExtendedState;

  // Create a CampaignState object for DevToolsPanel
  const campaignState: CampaignState = {
    currentPlayer: state.currentPlayer || '',
    npcs: state.npcs || [],
    character: playerCharacter,
    location: state.location,
    gameProgress: state.gameProgress,
    journal: state.journal && 'entries' in state.journal 
      ? state.journal.entries 
      : (state.journal as unknown as JournalEntry[] || []),
    narrative: state.narrative,
    inventory: state.inventory as unknown as InventoryItem[],
    quests: state.quests || [],
    isCombatActive: state.isCombatActive,
    opponent: opponent,
    isClient: state.isClient,
    suggestedActions: extendedState.suggestedActions as unknown as [] || [],
    combatState: state.combat as unknown as CombatState | undefined,
    error: extendedState.error,
    
    // Define the player getter
    get player() {
      return this.character;
    }
  };

  return (
    <div id="bhgmGameSessionContent" data-testid="game-session-content" className="wireframe-container">
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <MainGameArea id="bhgmMainGameArea" data-testid="main-game-area" {...sessionProps} />
        <SidePanel id="bhgmSidePanel" data-testid="side-panel" {...sessionProps} />
      </div>
      {/* The wrapper div handles the ID and test attributes */}
      <div id="bhgmDevToolsPanel" data-testid="dev-tools-panel">
        <DevToolsPanel
          gameState={campaignState}
          dispatch={dispatchAdapter}
        />
      </div>
    </div>
  );
}
