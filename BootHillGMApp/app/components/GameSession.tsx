/**
 * Main game session container that orchestrates the game's UI components.
 * Uses a two-column layout with the main game area and side panel.
 * Handles initialization checks and loading states before rendering the game interface.
 */
import { useEffect } from 'react';
import { useGameInitialization } from '../hooks/useGameInitialization';
import { useGameSession } from '../hooks/useGameSession';
import { MainGameArea } from './GameArea/MainGameArea';
import { SidePanel } from './GameArea/SidePanel';
import { LoadingScreen } from './GameArea/LoadingScreen';
import { Character } from '../types/character';

export default function GameSession() {
  const { isInitializing, isClient } = useGameInitialization();
  const gameSession = useGameSession();
  const { state } = gameSession;

  // Enhanced combat state restoration
  useEffect(() => {
    if (!state || !gameSession) return;

    // Log current state for debugging
    console.log('GameSession - Current state:', {
      isCombatActive: state.isCombatActive,
      opponent: state.opponent,
      combatState: state.combatState
    });

    const shouldRestoreCombat = state.isCombatActive && 
      state.opponent && 
      state.combatState &&
      !gameSession.isCombatActive;

    if (shouldRestoreCombat && state.opponent && state.combatState) {
      console.log('GameSession - Restoring combat with:', {
        opponent: state.opponent,
        combatState: state.combatState
      });

      // Ensure opponent has all required fields for Character type
      const restoredOpponent: Character = {
        name: state.opponent.name,
        health: Number(state.opponent.health),
        attributes: {
          speed: state.opponent.attributes?.speed ?? 5,
          gunAccuracy: state.opponent.attributes?.gunAccuracy ?? 5,
          throwingAccuracy: state.opponent.attributes?.throwingAccuracy ?? 5,
          strength: state.opponent.attributes?.strength ?? 5,
          bravery: state.opponent.attributes?.bravery ?? 5,
          experience: state.opponent.attributes?.experience ?? 5
        },
        skills: {
          shooting: state.opponent.skills?.shooting ?? 50,
          riding: state.opponent.skills?.riding ?? 50,
          brawling: state.opponent.skills?.brawling ?? 50
        },
        weapon: state.opponent.weapon ? {
          name: state.opponent.weapon.name,
          damage: state.opponent.weapon.damage
        } : undefined
      };

      // Initialize combat with saved state and proper type conversion
      gameSession.initiateCombat(
        restoredOpponent,
        {
          playerHealth: Number(state.combatState.playerHealth),
          opponentHealth: Number(state.combatState.opponentHealth),
          currentTurn: state.combatState.currentTurn,
          combatLog: Array.isArray(state.combatState.combatLog) 
            ? [...state.combatState.combatLog] 
            : []
        }
      );

      // Verify combat restoration
      console.log('Combat restoration complete:', {
        isCombatActive: gameSession.isCombatActive,
        opponent: gameSession.getCurrentOpponent(),
        combatState: state.combatState
      });
    }
  }, [state, gameSession]);

  /**
   * Debug utility to inspect the current saved state
   */
  const debugState = () => {
    try {
      const saved = localStorage.getItem('campaignState');
      if (saved) {
        const parsedState = JSON.parse(saved);
        console.log('Current saved state:', {
          ...parsedState,
          isCombatActive: Boolean(parsedState.isCombatActive),
          opponent: parsedState.opponent ? {
            ...parsedState.opponent,
            health: Number(parsedState.opponent.health)
          } : null,
          combatState: parsedState.combatState ? {
            ...parsedState.combatState,
            playerHealth: Number(parsedState.combatState.playerHealth),
            opponentHealth: Number(parsedState.combatState.opponentHealth)
          } : null
        });
      }
    } catch (error) {
      console.error('Error parsing debug state:', error);
    }
  };

  // Show loading screen until game state is fully initialized
  if (!isClient || !gameSession || !state || !state.character || isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div className="wireframe-container">
      <div className="h-full grid grid-cols-[1fr_300px] gap-4">
        <MainGameArea {...gameSession} />
        <SidePanel {...gameSession} />
      </div>
      <button 
        onClick={debugState} 
        className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded"
      >
        Debug State
      </button>
    </div>
  );
}
