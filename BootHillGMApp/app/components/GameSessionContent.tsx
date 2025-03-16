'use client';

import React, { useCallback, useMemo } from "react";
import { useGameInitialization } from "../hooks/useGameInitialization";
import { useGameSession } from "../hooks/useGameSession";
import { useCombatStateRestoration } from "../hooks/useCombatStateRestoration";
import { LoadingScreen } from "./GameArea/LoadingScreen";
import { MainGameArea } from "./GameArea/MainGameArea";
import { SidePanel } from "./GameArea/SidePanel";
import { InventoryManager } from "../utils/inventoryManager";
import DevToolsPanel from "./Debug/DevToolsPanel";
import { GameAction } from "../types/campaign";
import { GameEngineAction } from "../types/gameActions";
import { Dispatch } from "react";
import { LocationService } from "../services/locationService";

export default function GameSessionContent() {
  const { isInitializing, isClient } = useGameInitialization();
  const gameSession = useGameSession();
  const { state, dispatch, executeCombatRound } = gameSession;
  
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
    const item = state.inventory.find(i => i.id === itemId);
    if (!item || item.category !== 'weapon') {
      return;
    }
    InventoryManager.equipWeapon(state.character, item);
    dispatch({ type: 'EQUIP_WEAPON', payload: itemId });
  }, [state, dispatch]);

  const handleCombatAction = useCallback(async () => {
    if (executeCombatRound) {
      await executeCombatRound();
    }
  }, [executeCombatRound]);

  // Create a session object with all required props
  const sessionProps = {
    ...gameSession,
    handleEquipWeapon,
    handleUseItem,
    handleCombatAction,
    handlePlayerHealthChange: gameSession.handleStrengthChange
  };

  // Create a combat initiator object that includes both prop versions
  const combatInitiator = {
    ...gameSession,
    handleEquipWeapon,
    onEquipWeapon: handleEquipWeapon,
    handleUseItem,
    initiateCombat: gameSession.initiateCombat,
    handleCombatAction: gameSession.executeCombatRound, // Use executeCombatRound directly
    handlePlayerHealthChange: gameSession.handleStrengthChange
  };

  useCombatStateRestoration(state, combatInitiator);

  if (!isClient || !gameSession || !state || !state.character || isInitializing) {
    return <LoadingScreen type="session" />;
  }

  return (
    <div id="bhgmGameSessionContent" data-testid="game-session-content" className="wireframe-container">
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <MainGameArea id="bhgmMainGameArea" data-testid="main-game-area" {...sessionProps} />
        <SidePanel id="bhgmSidePanel" data-testid="side-panel" {...sessionProps} />
      </div>
      {/* The wrapper div handles the ID and test attributes */}
      <div id="bhgmDevToolsPanel" data-testid="dev-tools-panel">
        <DevToolsPanel
          gameState={state}
          dispatch={dispatchAdapter}
        />
      </div>
    </div>
  );
}
