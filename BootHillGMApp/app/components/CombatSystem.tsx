import React, { useState, useEffect } from 'react';
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
  // State for tracking health, combat log, and current turn
  const [playerHealth, setPlayerHealth] = useState(playerCharacter.health);
  const [opponentHealth, setOpponentHealth] = useState(opponent.health);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');

  // Effect to check for combat end conditions
  useEffect(() => {
    if (playerHealth <= 0) {
      onCombatEnd('opponent');
    } else if (opponentHealth <= 0) {
      onCombatEnd('player');
    }
  }, [playerHealth, opponentHealth, onCombatEnd]);

  // Effect to update player health in parent component
  useEffect(() => {
    onPlayerHealthChange(playerHealth);
  }, [playerHealth, onPlayerHealthChange]);

  // Function to simulate a d100 roll
  const rollD100 = () => Math.floor(Math.random() * 100) + 1;

  // Function to handle attack logic
  const performAttack = (attacker: Character, defender: Character, isPlayer: boolean) => {
    const attackRoll = rollD100();
    const hitChance = attacker.skills.shooting;
    
    if (attackRoll <= hitChance) {
      const damage = Math.floor(Math.random() * 6) + 1; // Simple d6 damage
      if (isPlayer) {
        setOpponentHealth(prev => Math.max(0, prev - damage));
        setCombatLog(prev => [...prev, `${attacker.name} hits ${defender.name} for ${damage} damage!`]);
      } else {
        setPlayerHealth(prev => Math.max(0, prev - damage));
        setCombatLog(prev => [...prev, `${attacker.name} hits ${playerCharacter.name} for ${damage} damage!`]);
      }
    } else {
      setCombatLog(prev => [...prev, `${attacker.name} misses ${isPlayer ? defender.name : playerCharacter.name}!`]);
    }
  };

  // Function to handle player's turn
  const handlePlayerAction = () => {
    performAttack(playerCharacter, opponent, true);
    setCurrentTurn('opponent');
    setTimeout(handleOpponentTurn, 1000);
  };

  // Function to handle opponent's turn
  const handleOpponentTurn = () => {
    performAttack(opponent, playerCharacter, false);
    setCurrentTurn('player');
  };

  // Render combat interface
  return (
    <div className="combat-system">
      <h2>Combat</h2>
      <div className="health-bars">
        <div>Player Health: {playerHealth}</div>
        <div>Opponent Health: {opponentHealth}</div>
      </div>
      <div className="combat-log">
        {combatLog.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
      {currentTurn === 'player' && (
        <button onClick={handlePlayerAction} disabled={currentTurn !== 'player'}>
          Attack
        </button>
      )}
      {currentTurn === 'opponent' && <p>Opponent is taking their turn...</p>}
    </div>
  );
};

export default CombatSystem;