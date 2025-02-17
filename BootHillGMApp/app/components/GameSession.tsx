import React, { useCallback } from "react";
import { useGameInitialization } from "../hooks/useGameInitialization";
import { useGameSession } from "../hooks/useGameSession";
import { useCombatStateRestoration } from "../hooks/useCombatStateRestoration";
import { LoadingScreen } from "./GameArea/LoadingScreen";
import { MainGameArea } from "./GameArea/MainGameArea";
import { SidePanel } from "./GameArea/SidePanel";
import { InventoryManager } from "../utils/inventoryManager";
import DevToolsPanel from "./Debug/DevToolsPanel";

export default function GameSession() {
  const { isInitializing, isClient } = useGameInitialization();
  const gameSession = useGameSession();
  const { state, dispatch, executeCombatRound } = gameSession;

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
    <div className="wireframe-container">
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <MainGameArea {...sessionProps} />
        <SidePanel {...sessionProps} />
      </div>
      <DevToolsPanel gameState={state} dispatch={dispatch} />
    </div>
  );
}
