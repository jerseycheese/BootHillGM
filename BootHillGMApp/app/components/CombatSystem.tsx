/**
 * CombatSystem handles turn-based combat encounters in the game.
 * Manages player and opponent health, turn order, and combat actions.
 * Implements Boot Hill combat rules for hit chance and damage calculation.
 */
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { debounce } from 'lodash';
import { Character } from '../types/character';
import { calculateHitChance, rollD100 } from '../utils/combatRules';
import { GameEngineAction } from '../utils/gameEngine';
import { CombatLog } from './Combat/CombatLog';
import { CombatControls } from './Combat/CombatControls';
import { CombatStatus } from './Combat/CombatStatus';
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

const CombatSystem: React.FC<CombatSystemProps> = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  onPlayerHealthChange,
  dispatch,
  initialCombatState
}) => {
  const [playerHealth, setPlayerHealth] = useState(initialCombatState?.playerHealth ?? 100);
  const [opponentHealth, setOpponentHealth] = useState(initialCombatState?.opponentHealth ?? 100);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>(initialCombatState?.currentTurn ?? 'player');
  const [combatLog, setCombatLog] = useState<string[]>(initialCombatState?.combatLog ?? []);
  const [isProcessing, setIsProcessing] = useState(false);
  const combatEndRef = useRef(false);

  /**
   * Adds a new message to the combat log.
   * Messages are displayed in chronological order, showing combat actions and results.
   */
  const addToCombatLog = useCallback((message: string) => {
    setCombatLog(prev => [...prev, message]);
  }, []);

  /**
   * Processes a combat turn, including:
   * - Hit chance calculation based on Boot Hill rules
   * - Damage calculation and health updates
   * - Combat log updates
   * - Turn management
   * - Combat end conditions
   */
  const performAttack = useCallback(() => {
    if (isProcessing || currentTurn !== 'player') return;
    setIsProcessing(true);

    const hitChance = calculateHitChance(playerCharacter);
    const roll = rollD100();
    const hit = roll <= hitChance;

    if (hit) {
      const damage = calculateCombatDamage();
      const newHealth = Math.max(0, opponentHealth - damage);
      setOpponentHealth(newHealth);
      const weaponName = getWeaponName(playerCharacter);
      const message = formatHitMessage({
        attackerName: cleanCharacterName(playerCharacter.name),
        defenderName: cleanCharacterName(opponent.name),
        weaponName,
        damage,
        roll,
        hitChance
      });
      addToCombatLog(message);

      if (newHealth === 0) {
        combatEndRef.current = true;
        const summary = `${cleanCharacterName(playerCharacter.name)} hits ${cleanCharacterName(opponent.name)} with ${weaponName} - a fatal shot! [Roll: ${roll}/${hitChance}]`;
        onCombatEnd('player', summary);
        return;
      }
    } else {
      addToCombatLog(
        formatMissMessage(
          cleanCharacterName(playerCharacter.name),
          cleanCharacterName(opponent.name),
          roll,
          hitChance
        )
      );
    }

    setCurrentTurn('opponent');
    setIsProcessing(false);
  }, [
    isProcessing,
    currentTurn,
    playerCharacter,
    opponent,
    opponentHealth,
    addToCombatLog,
    onCombatEnd
  ]);

  /**
   * Handles opponent's automatic combat turn after a delay.
   * Uses the same combat rules as player attacks but runs automatically.
   */
  const performOpponentAttack = useCallback(() => {
    if (currentTurn !== 'opponent' || combatEndRef.current) return;
    setIsProcessing(true);

    const hitChance = calculateHitChance(opponent);
    const roll = rollD100();
    const hit = roll <= hitChance;

    if (hit) {
      const damage = calculateCombatDamage();
      const newHealth = Math.max(0, playerHealth - damage);
      setPlayerHealth(newHealth);
      onPlayerHealthChange(newHealth);
      const weaponName = getWeaponName(opponent);
      const message = formatHitMessage({
        attackerName: cleanCharacterName(opponent.name),
        defenderName: cleanCharacterName(playerCharacter.name),
        weaponName,
        damage,
        roll,
        hitChance
      });
      addToCombatLog(message);

      if (newHealth === 0) {
        combatEndRef.current = true;
        const summary = `${cleanCharacterName(opponent.name)} hits ${cleanCharacterName(playerCharacter.name)} with ${weaponName} - a fatal shot! [Roll: ${roll}/${hitChance}]`;
        onCombatEnd('opponent', summary);
        return;
      }
    } else {
      addToCombatLog(
        formatMissMessage(
          cleanCharacterName(opponent.name),
          cleanCharacterName(playerCharacter.name),
          roll,
          hitChance
        )
      );
    }

    setCurrentTurn('player');
    setIsProcessing(false);
  }, [
    currentTurn,
    opponent,
    playerCharacter,
    playerHealth,
    addToCombatLog,
    onCombatEnd,
    onPlayerHealthChange
  ]);

  /**
   * Triggers opponent's turn after a delay when it becomes their turn.
   * Prevents immediate attacks and provides visual feedback.
   */
  useEffect(() => {
    if (currentTurn === 'opponent' && !isProcessing && !combatEndRef.current) {
      const timer = setTimeout(performOpponentAttack, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, isProcessing, performOpponentAttack]);

  /**
   * Creates a debounced dispatch function to prevent excessive state updates.
   * Helps optimize performance by reducing the frequency of combat state updates.
   */
  const debouncedDispatch = useMemo(
    () => debounce((action: GameEngineAction) => dispatch(action), 500),
    [dispatch]
  );

  /**
   * Updates the game engine with the current combat state.
   * Ensures combat state persistence and synchronization with the game engine.
   */
  useEffect(() => {
    const combatState = {
      playerHealth,
      opponentHealth,
      currentTurn,
      combatLog
    };
    debouncedDispatch({
      type: 'UPDATE_COMBAT_STATE',
      payload: combatState
    });

    return () => {
      debouncedDispatch.cancel();
    };
  }, [playerHealth, opponentHealth, currentTurn, combatLog, debouncedDispatch]);

  return (
    <div className="combat-system wireframe-section">
      <CombatStatus
        playerHealth={playerHealth}
        opponentHealth={opponentHealth}
      />
      
      <CombatControls
        currentTurn={currentTurn}
        isProcessing={isProcessing}
        onAttack={performAttack}
      />
      
      <div className="combat-info">
        <CombatLog entries={combatLog} />
      </div>
    </div>
  );
};

export default CombatSystem;
