/**
 * CombatSystem handles turn-based combat encounters in the game.
 * It uses the useCombatEngine hook to manage combat state and logic while
 * focusing solely on rendering the combat interface.
 * 
 * Key features:
 * - Displays combat status (health, turns)
 * - Manages player and opponent turns
 * - Shows combat log
 * - Auto-processes opponent turns after delay
 */
import React, { useEffect } from 'react';
import { Character } from '../types/character';
import { GameEngineAction } from '../utils/gameEngine';
import { CombatLog } from './Combat/CombatLog';
import { CombatControls } from './Combat/CombatControls';
import { CombatStatus } from './Combat/CombatStatus';
import { LoadingScreen } from './GameArea/LoadingScreen';
import { useCombatEngine } from '../hooks/useCombatEngine';

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
  const {
    playerHealth,
    opponentHealth,
    currentTurn,
    combatLog,
    isProcessing,
    handlePlayerAttack,
    handleOpponentAttack
  } = useCombatEngine({
    playerCharacter,
    opponent,
    onCombatEnd,
    onPlayerHealthChange,
    dispatch,
    initialState: initialCombatState
  });

  /**
   * Triggers opponent's turn after a delay when it becomes their turn.
   * Prevents immediate attacks and provides visual feedback.
   */
  useEffect(() => {
    if (currentTurn === 'opponent' && !isProcessing) {
      const timer = setTimeout(handleOpponentAttack, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, isProcessing, handleOpponentAttack]);

  return (
    <div className="combat-system wireframe-section space-y-4">
      <CombatStatus
        playerHealth={playerHealth}
        opponentHealth={opponentHealth}
      />
      
      <div className="relative">
        <CombatControls
          currentTurn={currentTurn}
          isProcessing={isProcessing}
          onAttack={handlePlayerAttack}
        />
        
        {isProcessing && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90" 
          >
            <LoadingScreen 
              message="Processing combat action..." 
              size="small"
              fullscreen={false}
            />
          </div>
        )}
      </div>
      
      <div className="combat-info">
        <CombatLog entries={combatLog} />
      </div>
    </div>
  );
};

export default CombatSystem;
