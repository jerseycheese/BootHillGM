/**
 * Implements Boot Hill v2 combat system with:
 * - Strength-based damage calculation
 * - Wound location and severity tracking
 * - Two-round brawling structure
 * - Punch and grapple options
 */
import { useState } from 'react';
import { Character } from '../types/character';
import { CombatStatus } from './Combat/CombatStatus';
import { BrawlingControls } from './Combat/BrawlingControls';
import { useBrawlingCombat } from '../hooks/useBrawlingCombat';
import { GameEngineAction } from '../utils/gameEngine';

interface CombatLogEntry {
  text: string;
  type: 'hit' | 'miss' | 'critical' | 'info';
  timestamp: number;
}


interface CombatSystemProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialCombatState?: {
    round: 1 | 2;
    playerModifier: number;
    opponentModifier: number;
    roundLog: CombatLogEntry[];
  };
}

export const CombatSystem: React.FC<CombatSystemProps> = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  dispatch,
  initialCombatState
}) => {
  const [isBrawling, setIsBrawling] = useState(false);
  
  const { brawlingState, isProcessing, processRound } = useBrawlingCombat({
    playerCharacter,
    opponent,
    onCombatEnd,
    dispatch,
    initialCombatState
  });

  const handleStartBrawling = () => {
    setIsBrawling(true);
  };

  return (
    <div className="combat-system wireframe-section space-y-4">
      <CombatStatus
        playerCharacter={playerCharacter}
        opponent={opponent}
      />
      
      {!isBrawling ? (
        <button 
          onClick={handleStartBrawling}
          className="wireframe-button w-full"
        >
          Start Brawling
        </button>
      ) : (
        <BrawlingControls
          isProcessing={isProcessing}
          onPunch={() => processRound(true, true)}
          onGrapple={() => processRound(false, true)}
          round={brawlingState?.round || 1}
        />
      )}
      
      <div className="combat-log mt-4">
        {brawlingState?.roundLog?.map((log, index) => (
          <div key={index} className="text-sm mb-1 even:text-right">{log.text}</div>
        ))}
      </div>
    </div>
  );
};
