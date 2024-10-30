import React, { useState, useCallback, useEffect } from 'react';
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
}

const CombatSystem: React.FC<CombatSystemProps> = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  onPlayerHealthChange,
  dispatch
}) => {
  // Use the actual character health instead of defaulting to 100
  const [playerHealth, setPlayerHealth] = useState(playerCharacter.health);
  const [opponentHealth, setOpponentHealth] = useState(opponent.health);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const performAttack = useCallback((attacker: Character, defender: Character, isPlayer: boolean) => {
    setIsProcessing(true);
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
      
      if (isPlayer) {
        const newHealth = Math.max(0, opponentHealth - damage);
        setOpponentHealth(newHealth);
        
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
          onCombatEnd('player', summary);
          return;
        } else {
          setCombatLog(prev => [...prev, hitMessage]);
        }
      } else {
        const newHealth = Math.max(0, playerHealth - damage);
        setPlayerHealth(newHealth);
        onPlayerHealthChange(newHealth);
        
        if (newHealth <= 0) {
          const summary = `${attackerName} defeats ${defenderName} with ${weaponName}!`;
          dispatch({ 
            type: 'UPDATE_JOURNAL',
            payload: {
              timestamp: Date.now(),
              content: summary,
              narrativeSummary: `Combat ended with ${attackerName} defeating ${defenderName}`
            }
          });
          onCombatEnd('opponent', summary);
          return;
        } else {
          setCombatLog(prev => [...prev, hitMessage]);
        }
      }
    } else {
      const missMessage = formatMissMessage(attackerName, defenderName, attackRoll, hitChance);
      setCombatLog(prev => [...prev, missMessage]);
    }
    
    setCurrentTurn(isPlayer ? 'opponent' : 'player');
    setIsProcessing(false);
  }, [opponentHealth, playerHealth, onPlayerHealthChange, onCombatEnd, dispatch]);

  // Effect to handle opponent's turn
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentTurn === 'opponent' && !isProcessing) {
      timer = setTimeout(() => {
        performAttack(opponent, playerCharacter, false);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentTurn, opponent, playerCharacter, performAttack, isProcessing]);

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
            onClick={() => performAttack(playerCharacter, opponent, true)}
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
