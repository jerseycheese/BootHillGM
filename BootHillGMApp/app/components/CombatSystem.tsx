/**
 * CombatSystem implements Boot Hill RPG combat mechanics featuring:
 * - Turn-based combat between player and opponent
 * - Hit chance calculations based on character attributes
 * - Automatic opponent turns with 1-second delay
 * - Combat log showing attack rolls and results
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Character } from '../types/character';
import { calculateHitChance, rollD100 } from '../utils/combatRules';
import { GameEngineAction } from '../utils/gameEngine';

interface CombatSystemProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  onPlayerHealthChange: (health: number) => void;
  dispatch: React.Dispatch<GameEngineAction>;
}

/**
 * Removes metadata markers from character names to ensure clean combat messages.
 * Example: "Bandit ACQUIRED_ITEMS:" becomes "Bandit"
 */
function cleanCharacterName(name: string): string {
  return name
    .replace(/\s*ACQUIRED_ITEMS:\s*REMOVED_ITEMS:\s*/g, '')
    .replace(/\s*ACQUIRED_ITEMS:\s*/g, '')
    .replace(/\s*REMOVED_ITEMS:\s*/g, '')
    .trim();
}

/**
 * Gets the weapon name for a character, defaulting to "fists" if no weapon is equipped
 */
const getWeaponName = (character: Character): string => {
  return character.weapon?.name || 'fists';
};

/**
 * Determines if a roll is critical (≤5 or ≥96)
 */
const isCritical = (roll: number): boolean => {
  return roll <= 5 || roll >= 96;
};

/**
 * Combat system component that manages turn-based combat between player and opponent.
 * Handles attack calculations, damage, health tracking, and combat logging.
 */
const CombatSystem: React.FC<CombatSystemProps> = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  onPlayerHealthChange,
  dispatch
}) => {
  const [playerHealth, setPlayerHealth] = useState(playerCharacter.health || 100);
  const [opponentHealth, setOpponentHealth] = useState(opponent.health || 100);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [combatLog, setCombatLog] = useState<string[]>([]);

  /**
   * Executes an attack action between two characters.
   * Calculates hit chance, rolls for success, applies damage, and updates combat state.
   * Also handles combat end conditions and journal updates.
   */
  const performAttack = useCallback((attacker: Character, defender: Character, isPlayer: boolean) => {
    const hitChance = calculateHitChance(attacker);
    const attackRoll = rollD100();
    
    const attackerName = cleanCharacterName(attacker.name);
    const defenderName = cleanCharacterName(defender.name);
    
    if (attackRoll <= hitChance) {
      const damage = Math.floor(Math.random() * 6) + 1;
      const hitMessage = `${attackerName} hits ${defenderName} with ${getWeaponName(attacker)} for ${damage} damage! [Roll: ${attackRoll}/${hitChance}${isCritical(attackRoll) ? ' - Critical!' : ''}]`;
      
      if (isPlayer) {
        const newHealth = Math.max(0, opponentHealth - damage);
        setOpponentHealth(newHealth);
        
        if (newHealth <= 0) {
          const summary = `${attackerName} hits ${defenderName} with ${getWeaponName(attacker)} - a fatal shot! [Roll: ${attackRoll}/${hitChance}${isCritical(attackRoll) ? ' - Critical!' : ''}]`;
          dispatch({ 
            type: 'UPDATE_JOURNAL',
            payload: {
              timestamp: Date.now(),
              content: summary,
              narrativeSummary: `Combat ended with ${attackerName} defeating ${defenderName}`
            }
          });
          onCombatEnd('player', summary);
        } else {
          setCombatLog(prev => [...prev, hitMessage]);
        }
      } else {
        const newHealth = Math.max(0, playerHealth - damage);
        setPlayerHealth(newHealth);
        onPlayerHealthChange(newHealth);
        
        if (newHealth <= 0) {
          const summary = `${attackerName} defeats ${defenderName} with ${getWeaponName(attacker)}! [Roll: ${attackRoll}/${hitChance}${isCritical(attackRoll) ? ' - Critical!' : ''}]`;
          dispatch({ 
            type: 'UPDATE_JOURNAL',
            payload: {
              timestamp: Date.now(),
              content: summary,
              narrativeSummary: `Combat ended with ${attackerName} defeating ${defenderName}`
            }
          });
          onCombatEnd('opponent', summary);
        } else {
          setCombatLog(prev => [...prev, hitMessage]);
        }
      }
    } else {
      const missMessage = `${attackerName} misses ${defenderName}! [Roll: ${attackRoll}/${hitChance}]`;
      setCombatLog(prev => [...prev, missMessage]);
    }
    
    setCurrentTurn(isPlayer ? 'opponent' : 'player');
  }, [opponentHealth, playerHealth, onPlayerHealthChange, onCombatEnd, dispatch]);

  // Handles automatic opponent turns with a 1-second delay
  useEffect(() => {
    if (currentTurn === 'opponent') {
      const timer = setTimeout(() => {
        performAttack(opponent, playerCharacter, false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, opponent, playerCharacter, performAttack]);

  return (
    <div className="combat-system wireframe-section">
      <h2>Combat</h2>
      <div className="combat-actions">
        {currentTurn === 'player' && (
          <button
            onClick={() => performAttack(playerCharacter, opponent, true)}
            disabled={currentTurn !== 'player'}
            className="wireframe-button"
          >
            Attack
          </button>
        )}
        {currentTurn === 'opponent' && <p>Opponent is taking their turn...</p>}
      </div>
      <div className="combat-info">
        <div className="health-bars">
          <div>Player Health: {playerHealth}</div>
          <div>Opponent Health: {opponentHealth}</div>
        </div>
        <div className="combat-log max-h-48 overflow-y-auto">
          {combatLog.map((log: string, index: number) => (
            <p key={index} className="text-sm">{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CombatSystem;
