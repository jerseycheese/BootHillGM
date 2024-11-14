/**
 * Implements Boot Hill v2 combat system with:
 * - Strength-based damage calculation
 * - Wound location and severity tracking
 * - Two-round brawling structure
 * - Punch and grapple options
 */
import { useState, useEffect } from 'react';
import { Character } from '../types/character';
import { CombatStatus } from './Combat/CombatStatus';
import { BrawlingControls } from './Combat/BrawlingControls';
import { useBrawlingCombat } from '../hooks/useBrawlingCombat';
import { GameEngineAction } from '../utils/gameEngine';
import { CombatTypeSelection } from './Combat/CombatTypeSelection';
import { CombatType, CombatState } from '../types/combat';

export const CombatSystem: React.FC<{
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialCombatState?: CombatState;
}> = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  dispatch,
  initialCombatState
}) => {
  const [combatType, setCombatType] = useState<CombatType>(null);

  useEffect(() => {
    // Only set combatType if initialCombatState exists and has a non-null combatType
    if (initialCombatState && initialCombatState.combatType !== null) {
      setCombatType(initialCombatState.combatType);
    }
  }, [initialCombatState]);
  
  const { brawlingState, isProcessing: isBrawlingProcessing, processRound } = useBrawlingCombat({
    playerCharacter,
    opponent,
    onCombatEnd,
    dispatch,
    initialCombatState: initialCombatState?.brawling
  });

  const handleCombatTypeSelect = (type: CombatType) => {
    setCombatType(type);
    dispatch({
      type: 'UPDATE_COMBAT_STATE',
      payload: {
        isActive: true,
        combatType: type,
        playerStrength: playerCharacter.attributes.strength,
        opponentStrength: opponent.attributes.strength,
        currentTurn: 'player',
        winner: null,
        summary: null,
        brawling: type === 'brawling' ? {
          round: 1,
          playerModifier: 0,
          opponentModifier: 0,
          roundLog: []
        } : undefined
      }
    });
  };

  const renderCombatContent = () => {
    if (!combatType) {
      return (
        <CombatTypeSelection
          playerCharacter={playerCharacter}
          opponent={opponent}
          onSelectType={handleCombatTypeSelect}
        />
      );
    }

    if (combatType === 'brawling') {
      return (
        <BrawlingControls
          isProcessing={isBrawlingProcessing}
          onPunch={() => processRound(true, true)}
          onGrapple={() => processRound(false, true)}
          round={brawlingState?.round || 1}
        />
      );
    }

    // Weapon combat will be implemented in next phase
    if (combatType === 'weapon') {
      return (
        <div className="text-center py-4">
          <p>Weapon combat coming soon...</p>
          <button
            onClick={() => handleCombatTypeSelect(null)}
            className="wireframe-button mt-2"
          >
            Choose Different Combat Type
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="combat-system wireframe-section space-y-4">
      <CombatStatus
        playerCharacter={playerCharacter}
        opponent={opponent}
      />
      
      {renderCombatContent()}
      
      <div className="combat-log mt-4">
        {brawlingState?.roundLog?.map((log, index) => (
          <div key={index} className="text-sm mb-1 even:text-right">{log.text}</div>
        ))}
      </div>
    </div>
  );
};
