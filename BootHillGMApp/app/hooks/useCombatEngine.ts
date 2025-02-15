/**
 * Custom hook that manages the core combat logic for Boot Hill RPG combat.
 * Separates combat state management and calculations from UI rendering.
 * 
 * Features:
 * - Manages combat state (health, turns, logs)
 * - Handles attack calculations and damage
 * - Processes combat outcomes
 * - Maintains combat log
 * - Integrates with game state through dispatch
 * 
 * @param playerCharacter The player's character data
 * @param opponent The opponent character data
 * @param onCombatEnd Callback for when combat ends
 * @param onPlayerHealthChange Callback for player health updates
 * @param dispatch Game state dispatch function
 * @param initialState Optional initial combat state
 */
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { Character } from '../types/character';
import { CombatState } from '../types/combat';
import { calculateHitChance, rollD100, isCritical } from '../utils/combatRules';
import { getCharacterStrength, validateStrengthValue } from '../utils/strengthSystem';
import { 
  cleanCharacterName,
  getWeaponName,
  formatHitMessage,
  formatMissMessage,
  calculateCombatDamage
} from '../utils/combatUtils';
import { GameEngineAction } from '../types/gameActions';

interface UseCombatEngineProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent') => void;
  onPlayerHealthChange: (health: number) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  combatState: CombatState;
  initialState?: {
    playerHealth: number;
    opponentHealth: number;
    currentTurn: 'player' | 'opponent';
    combatLog: CombatLogEntry[];
  };
}

interface CombatLogEntry {
  text: string;
  type: 'hit' | 'miss' | 'critical' | 'info';
  timestamp: number;
}


export const useCombatEngine = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  onPlayerHealthChange,
  dispatch,
  initialState
}: UseCombatEngineProps) => {
  // Initialize health using the centralized strength system
  const [playerHealth, setPlayerHealth] = useState(
    initialState?.playerHealth ?? getCharacterStrength(playerCharacter)
  );
  const [opponentHealth, setOpponentHealth] = useState(
    initialState?.opponentHealth ?? getCharacterStrength(opponent)
  );
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>(initialState?.currentTurn ?? 'player');
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>(initialState?.combatLog ?? []);
  const [isProcessing, setIsProcessing] = useState(false);
  const combatEndRef = useRef(false);

  /**
   * Manages combat log entries with type-based styling.
   * Types can be: hit, miss, critical, or info
   * Each entry includes a timestamp for ordering.
   */
  const addToCombatLog = useCallback((message: string, type: CombatLogEntry['type'] = 'info') => {
    setCombatLog(prev => [...prev, { text: message, type, timestamp: Date.now() }]);
  }, [setCombatLog]);

  /**
   * Processes an attack turn, handling:
   * - Hit chance calculation based on Boot Hill rules
   * - Damage calculation and health updates
   * - Combat log updates
   * - Combat end conditions
   */
  const performAttack = useCallback((attacker: Character, defender: Character, isPlayer: boolean) => {
    const hitChance = calculateHitChance(attacker);
    const roll = rollD100();
    const hit = roll <= hitChance;
    const critical = isCritical(roll);


    if (hit) {
      const damage = calculateCombatDamage();
      const weaponName = getWeaponName(attacker);
      const message = formatHitMessage({
        attackerName: cleanCharacterName(attacker.name),
        defenderName: cleanCharacterName(defender.name),
        weaponName,
        damage,
        roll,
        hitChance
      });
      
      addToCombatLog(message, critical ? 'critical' : 'hit');

      if (isPlayer) {
        const newHealth = Math.max(0, opponentHealth - damage);
        // Validate the new strength value
        if (!validateStrengthValue(newHealth, opponent)) {
          console.warn('Invalid strength value calculated for opponent');
        }
        setOpponentHealth(newHealth);
        if (newHealth === 0) {
          combatEndRef.current = true;
          onCombatEnd('player');
          return true;
        }
      } else {
        const newHealth = Math.max(0, playerHealth - damage);
        // Validate the new strength value
        if (!validateStrengthValue(newHealth, playerCharacter)) {
          console.warn('Invalid strength value calculated for player');
        }
        setPlayerHealth(newHealth);
        onPlayerHealthChange(newHealth);
        if (newHealth === 0) {
          combatEndRef.current = true;
          onCombatEnd('opponent');
          return true;
        }
      }
    } else {
      addToCombatLog(
        formatMissMessage(
          cleanCharacterName(attacker.name),
          cleanCharacterName(defender.name),
          roll,
          hitChance
        ),
        'miss'
      );
    }
    return false;
  }, [
    opponent,
    playerCharacter,
    playerHealth,
    opponentHealth,
    addToCombatLog,
    onCombatEnd,
    onPlayerHealthChange,
    setPlayerHealth,
    setOpponentHealth
  ]);

  /**
   * Handles player's combat turn.
   * Validates turn order and processes the attack.
   */
  const handlePlayerAttack = useCallback(() => {
    if (isProcessing || currentTurn !== 'player') return;
    setIsProcessing(true);

    const combatEnded = performAttack(playerCharacter, opponent, true);
    if (!combatEnded) {
      setCurrentTurn('opponent');
    }
    setIsProcessing(false);
  }, [
    isProcessing,
    currentTurn,
    performAttack,
    playerCharacter,
    opponent
  ]);

  /**
   * Handles opponent's combat turn.
   * Validates turn order and processes the attack.
   */
  const handleOpponentAttack = useCallback(() => {
    if (currentTurn !== 'opponent' || combatEndRef.current) return;
    setIsProcessing(true);

    const combatEnded = performAttack(opponent, playerCharacter, false);
    if (!combatEnded) {
      setCurrentTurn('player');
    }
    setIsProcessing(false);
  }, [
    currentTurn,
    performAttack,
    opponent,
    playerCharacter
  ]);

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
    const localCombatState = {
      playerStrength: playerHealth,
      opponentStrength: opponentHealth,
      currentTurn,
      combatLog,
    };
    debouncedDispatch({
      type: 'UPDATE_COMBAT_STATE',
      payload: localCombatState,
    });

    return () => {
      debouncedDispatch.cancel();
    };
  }, [playerHealth, opponentHealth, currentTurn, combatLog, debouncedDispatch]);

  return {
    playerHealth,
    opponentHealth,
    currentTurn,
    combatLog,
    isProcessing,
    handlePlayerAttack,
    handleOpponentAttack
  };
};
