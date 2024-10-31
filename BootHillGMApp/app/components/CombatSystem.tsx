import React, { useState, useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { Character } from '../types/character';
import { calculateHitChance, rollD100 } from '../utils/combatRules';
import { GameEngineAction } from '../utils/gameEngine';
import { CombatLog } from './CombatLog';
import {
  cleanCharacterName,
  getWeaponName,
  formatHitMessage,
  formatMissMessage,
  calculateCombatDamage
} from '../utils/combatUtils';

interface CombatSystemProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  onPlayerHealthChange: (health: number) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialCombatState?: {
    playerHealth: number;
    opponentHealth: number;
    currentTurn: 'player' | 'opponent';
    combatLog: string[];
  };
}

// Move debounce outside component to prevent recreation
const updateCombatState = debounce((
  dispatch: React.Dispatch<GameEngineAction>,
  state: {
    playerHealth: number;
    opponentHealth: number;
    currentTurn: 'player' | 'opponent';
    combatLog: string[];
  }
) => {
  dispatch({
    type: 'UPDATE_COMBAT_STATE',
    payload: state
  });
}, 250);

const CombatSystem: React.FC<CombatSystemProps> = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  onPlayerHealthChange,
  dispatch,
  initialCombatState
}) => {
  // Use ref to prevent initialization loops
  const isInitialized = useRef(false);
  
  // Initialize state from initialCombatState if available
  const [playerHealth, setPlayerHealth] = useState(
    initialCombatState?.playerHealth ?? playerCharacter.health
  );
  const [opponentHealth, setOpponentHealth] = useState(
    initialCombatState?.opponentHealth ?? opponent.health
  );
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>(
    initialCombatState?.currentTurn ?? 'player'
  );
  const [combatLog, setCombatLog] = useState<string[]>(
    initialCombatState?.combatLog ?? []
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize the callback function that uses the debounced update
  const debouncedUpdateCombatState = useCallback((state: {
    playerHealth: number;
    opponentHealth: number;
    currentTurn: 'player' | 'opponent';
    combatLog: string[];
  }) => {
    updateCombatState(dispatch, state);
  }, [dispatch]);

  // Add initialization effect with ref guard
  useEffect(() => {
    if (!isInitialized.current && initialCombatState) {
      isInitialized.current = true;
      const { playerHealth: savedPlayerHealth, opponentHealth: savedOpponentHealth, currentTurn: savedTurn, combatLog: savedLog } = initialCombatState;
      
      console.log('Combat System - Restoring state:', {
        savedPlayerHealth,
        savedOpponentHealth,
        savedTurn,
        savedLogEntries: savedLog?.length
      });

      setPlayerHealth(savedPlayerHealth);
      setOpponentHealth(savedOpponentHealth);
      setCurrentTurn(savedTurn);
      
      if (savedLog && savedLog.length > 0) {
        setCombatLog(savedLog);
      }
    }
  }, [initialCombatState]); 

  // Update combat state when relevant values change
  useEffect(() => {
    if (isInitialized.current) {
      debouncedUpdateCombatState({
        playerHealth,
        opponentHealth,
        currentTurn,
        combatLog
      });
    }
  }, [playerHealth, opponentHealth, currentTurn, combatLog, debouncedUpdateCombatState]);

  // Notify parent of player health changes
  useEffect(() => {
    onPlayerHealthChange(playerHealth);
  }, [playerHealth, onPlayerHealthChange]);

  // Wrapper for setPlayerHealth that also notifies parent
  const updatePlayerHealth = useCallback((newHealth: number) => {
    setPlayerHealth(newHealth);
  }, []);

  // Memoize the attack logic separately from the handler
  const processAttack = useCallback((
    attacker: Character,
    defender: Character,
    isPlayer: boolean,
    currentHealth: number,
    setHealth: (health: number) => void,
    updateLog: (message: string) => void
  ) => {
    const hitChance = calculateHitChance(attacker);
    const attackRoll = rollD100();
    
    const attackerName = cleanCharacterName(attacker.name);
    const defenderName = cleanCharacterName(defender.name);
    const weaponName = getWeaponName(attacker);
    
    if (attackRoll <= hitChance) {
      const damage = calculateCombatDamage();
      const hitMessage = formatHitMessage({
        attackerName,
        defenderName,
        weaponName,
        damage,
        roll: attackRoll,
        hitChance
      });
      
      const newHealth = Math.max(0, currentHealth - damage);
      setHealth(newHealth);
      
      if (newHealth <= 0) {
        const summary = `${attackerName} hits ${defenderName} with ${weaponName} - a fatal shot! [Roll: ${attackRoll}/${hitChance}]`;
        dispatch({ 
          type: 'UPDATE_JOURNAL',
          payload: {
            timestamp: Date.now(),
            content: summary,
            narrativeSummary: `Combat ended with ${attackerName} defeating ${defenderName}`
          }
        });
        onCombatEnd(isPlayer ? 'player' : 'opponent', summary);
        return true;
      } else {
        updateLog(hitMessage);
      }
    } else {
      const missMessage = formatMissMessage(attackerName, defenderName, attackRoll, hitChance);
      updateLog(missMessage);
    }
    return false;
  }, [dispatch, onCombatEnd]);

  const performAttack = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);

    const isGameOver = processAttack(
      playerCharacter,
      opponent,
      true,
      opponentHealth,
      setOpponentHealth,
      (message) => setCombatLog(prev => [...prev, message])
    );

    if (!isGameOver) {
      setCurrentTurn('opponent');
    }
    setIsProcessing(false);
  }, [
    isProcessing,
    processAttack,
    playerCharacter,
    opponent,
    opponentHealth,
    setCurrentTurn,
    setCombatLog
  ]);

  // Effect to handle opponent's turn with cleanup
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentTurn === 'opponent' && !isProcessing) {
      timer = setTimeout(() => {
        const isGameOver = processAttack(
          opponent,
          playerCharacter,
          false,
          playerHealth,
          updatePlayerHealth,
          (message) => setCombatLog(prev => [...prev, message])
        );
        if (!isGameOver) {
          setCurrentTurn('player');
        }
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    currentTurn,
    isProcessing,
    processAttack,
    opponent,
    playerCharacter,
    playerHealth,
    updatePlayerHealth,
    setCurrentTurn,
    setCombatLog
  ]);

  // Add turn indicator style
  const getTurnStyle = (turn: 'player' | 'opponent') => 
    currentTurn === turn ? 'bg-green-100 text-black font-bold' : '';

  return (
    <div className="combat-system wireframe-section">
      <div className="combat-actions">
        <div className="turn-indicator mb-2">
          <div className={`p-2 ${getTurnStyle('player')}`}>
            Player&#39;s Turn
          </div>
          <div className={`p-2 ${getTurnStyle('opponent')}`}>
            {currentTurn === 'opponent' ? "Opponent's Turn..." : "Opponent's Turn"}
          </div>
        </div>
        {currentTurn === 'player' && !isProcessing && (
          <button
            onClick={performAttack}
            className="wireframe-button"
          >
            Attack
          </button>
        )}
      </div>
      <div className="combat-info">
        <div className="health-bars">
          <div>Player Health: {playerHealth}</div>
          <div>Opponent Health: {opponentHealth}</div>
        </div>
        <CombatLog entries={combatLog} />
      </div>
    </div>
  );
};

export default CombatSystem;
