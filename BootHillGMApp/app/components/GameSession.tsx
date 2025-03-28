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

interface ExtendedState {
  suggestedActions?: unknown[];
  error?: string;
}

export default function GameSession() {
  const { isInitializing, isClient } = useGameInitialization();
  const gameSession = useGameSession();
  const { state, dispatch, executeCombatRound, getCurrentOpponent } = gameSession;
  
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
    dispatch({ type: 'EQUIP_WEAPON', payload: itemId });
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
    opponent
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
    isCombatActive: state?.isCombatActive || false,
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
  let playerCharacter: Character;
  try {
    playerCharacter = getPlayerCharacter();
  } catch (error) {
    console.error('Failed to extract player character:', error);
    // Use the LoadingScreen with a custom error message instead of an invalid type
    return <LoadingScreen 
      type="session" 
      message="Character data error" 
      error="Invalid character data structure detected"
    />;
  }

  const extendedState = state as ExtendedState;

  // Properly define the player getter function with explicit return type
  const getPlayer = function(this: CampaignState): Character | null {
    return this.character;
  };
  
  // Create our campaign state with all required properties
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
    inventory: state.inventory && 'items' in state.inventory 
      ? state.inventory.items 
      : (state.inventory as unknown as InventoryItem[] || []),
    quests: state.quests || [],
    isCombatActive: state.isCombatActive || false,
    opponent: opponent,
    isClient: state.isClient,
    suggestedActions: extendedState.suggestedActions as unknown as [] || [],
    combatState: state.combat as unknown as CombatState | undefined,
    error: extendedState.error,
    
    // Define the getter with proper binding
    get player() {
      return getPlayer.call(this);
    }
  };

  return (
    <div className="wireframe-container" data-testid="game-container">
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <MainGameArea {...sessionProps} />
        <SidePanel {...sessionProps} />
      </div>
      <DevToolsPanel 
        gameState={campaignState} 
        dispatch={dispatchAdapter} 
      />
    </div>
  );
}
