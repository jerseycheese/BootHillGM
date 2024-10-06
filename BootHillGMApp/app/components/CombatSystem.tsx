// File: BootHillGMApp/app/components/CombatSystem.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Character } from '../types/character';

// Props for the CombatSystem component
interface CombatSystemProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent') => void;
  onPlayerHealthChange: (newHealth: number) => void;
}

const CombatSystem: React.FC<CombatSystemProps> = ({ 
  playerCharacter, 
  opponent, 
  onCombatEnd, 
  onPlayerHealthChange 
}) => {
  // State for managing combat
  const [playerHealth, setPlayerHealth] = useState(playerCharacter.health);
  const [opponentHealth, setOpponentHealth] = useState(opponent.health);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');

  // Function to simulate rolling a d100
  const rollD100 = useCallback(() => Math.floor(Math.random() * 100) + 1, []);

  // Function to handle attack logic
  const performAttack = useCallback((attacker: Character, defender: Character, isPlayer: boolean) => {
    const attackRoll = rollD100();
    const hitChance = attacker.skills.shooting;
    
    if (attackRoll <= hitChance) {
      const damage = Math.floor(Math.random() * 6) + 1; // Simple d6 damage
      if (isPlayer) {
        setOpponentHealth(prev => Math.max(0, prev - damage));
        setCombatLog(prev => [...prev, `${attacker.name} hits ${defender.name} for ${damage} damage!`]);
      } else {
        setPlayerHealth(prev => {
          const newHealth = Math.max(0, prev - damage);
          onPlayerHealthChange(newHealth);
          return newHealth;
        });
        setCombatLog(prev => [...prev, `${attacker.name} hits ${playerCharacter.name} for ${damage} damage!`]);
      }
    } else {
      setCombatLog(prev => [...prev, `${attacker.name} misses ${isPlayer ? defender.name : playerCharacter.name}!`]);
    }

    setCurrentTurn(isPlayer ? 'opponent' : 'player');
  }, [rollD100, playerCharacter.name, onPlayerHealthChange]);

  // Check for combat end conditions
  useEffect(() => {
    if (playerHealth <= 0) {
      onCombatEnd('opponent');
    } else if (opponentHealth <= 0) {
      onCombatEnd('player');
    }
  }, [playerHealth, opponentHealth, onCombatEnd]);

  // Handle player's attack action
  const handlePlayerAction = useCallback(() => {
    performAttack(playerCharacter, opponent, true);
  }, [playerCharacter, opponent, performAttack]);

  // Handle opponent's turn
  const handleOpponentTurn = useCallback(() => {
    performAttack(opponent, playerCharacter, false);
  }, [opponent, playerCharacter, performAttack]);

  // Automatically trigger opponent's turn after a delay
  useEffect(() => {
    if (currentTurn === 'opponent') {
      const timer = setTimeout(handleOpponentTurn, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, handleOpponentTurn]);

  return (
    <div className="combat-system wireframe-section">
      <h2>Combat</h2>
      <div className="flex justify-between">
        <div className="combat-actions">
          {currentTurn === 'player' && (
            <button onClick={handlePlayerAction} disabled={currentTurn !== 'player'} className="wireframe-button">
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
          <div className="combat-log">
            {combatLog.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatSystem;