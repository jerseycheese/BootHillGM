// File: BootHillGMApp/app/components/CombatSystem.tsx

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { act } from '@testing-library/react';
import { Character } from '../types/character';
import { CampaignStateContext } from './CampaignStateManager';
import { addCombatJournalEntry } from '../utils/JournalManager';

// Props for the CombatSystem component
interface CombatSystemProps {
  playerCharacter: Character;
  opponent: Character | null;
  onCombatEnd: (winner: 'player' | 'opponent', combatSummary: string) => void;
  onPlayerHealthChange: (newHealth: number) => void;
}

const CombatSystem: React.FC<CombatSystemProps> = ({ 
  playerCharacter, 
  opponent, 
  onCombatEnd, 
  onPlayerHealthChange 
}) => {
  const context = useContext(CampaignStateContext);
  const { dispatch } = context || {};

  const [playerHealth, setPlayerHealth] = useState(playerCharacter.health);
  const [opponentHealth, setOpponentHealth] = useState(opponent?.health ?? 0);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');

  // Update opponent health when the opponent changes
  useEffect(() => {
    if (opponent) {
      setOpponentHealth(opponent.health);
    }
  }, [opponent]);

  const rollD100 = useCallback(() => Math.floor(Math.random() * 100) + 1, []);

  // Function to handle attack logic
  const performAttack = useCallback((attacker: Character, defender: Character, isPlayer: boolean) => {
    const attackRoll = rollD100();
    const hitChance = attacker.skills.shooting;
    
    if (attackRoll <= hitChance) {
      const damage = Math.floor(Math.random() * 6) + 1; // Simple d6 damage
      if (isPlayer) {
        const newHealth = Math.max(0, opponentHealth - damage);
        act(() => {
          setOpponentHealth(newHealth);
        });
        if (newHealth <= 0) {
          // Add combat result to journal when combat ends
          const summary = `${playerCharacter.name} defeated ${opponent?.name ?? 'the opponent'} in combat.`;
          onCombatEnd('player', summary);
          // Dispatch action to update journal with combat result
          dispatch?.({ type: 'UPDATE_JOURNAL', payload: addCombatJournalEntry(summary) });
        }
      } else {
        const newHealth = Math.max(0, playerHealth - damage);
        act(() => {
          setPlayerHealth(newHealth);
        });
        onPlayerHealthChange(newHealth);
        if (newHealth <= 0) {
          // Add combat result to journal when combat ends
          const summary = `${playerCharacter.name} was defeated by ${opponent?.name ?? 'the opponent'} in combat.`;
          onCombatEnd('opponent', summary);
          // Dispatch action to update journal with combat result
          dispatch?.({ type: 'UPDATE_JOURNAL', payload: addCombatJournalEntry(summary) });
        }
      }
      act(() => {
        setCombatLog(prev => [...prev, `${attacker.name} hits ${defender.name} for ${damage} damage!`]);
      });
    } else {
      act(() => {
        setCombatLog(prev => [...prev, `${attacker.name} misses ${defender.name}!`]);
      });
    }

    act(() => {
      setCurrentTurn(isPlayer ? 'opponent' : 'player');
    });
  }, [rollD100, opponentHealth, playerHealth, onPlayerHealthChange, onCombatEnd, dispatch, playerCharacter.name, opponent]);

  // Handle player's attack action
  const handlePlayerAction = useCallback(() => {
    if (opponent) {
      performAttack(playerCharacter, opponent, true);
    }
  }, [playerCharacter, opponent, performAttack]);

  // Handle opponent's attack action
  const handleOpponentTurn = useCallback(() => {
    if (opponent) {
      performAttack(opponent, playerCharacter, false);
    }
  }, [opponent, playerCharacter, performAttack]);

  // Handle opponent's turn after a delay
  useEffect(() => {
    if (currentTurn === 'opponent' && opponent) {
      const timer = setTimeout(handleOpponentTurn, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, handleOpponentTurn, opponent]);

  if (!context) {
    return <div>Error: CombatSystem must be used within a CampaignStateProvider</div>;
  }

  // Don't render anything if there's no opponent
  if (!opponent) {
    return null; // or return some UI indicating no active combat
  }

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
