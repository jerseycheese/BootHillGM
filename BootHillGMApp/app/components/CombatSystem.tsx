/**
 * Implements Boot Hill v2 combat system with:
 * - Strength-based damage calculation
 * - Wound location and severity tracking
 * - Two-round brawling structure
 * - Punch and grapple options
 * - Weapon combat actions and display
 */
import { useState, useEffect } from 'react';
import { Character } from '../types/character';
import { CombatStatus } from './Combat/CombatStatus';
import { BrawlingControls } from './Combat/BrawlingControls';
import { WeaponCombatControls } from './Combat/WeaponCombatControls';
import { useBrawlingCombat } from '../hooks/useBrawlingCombat';
import { useWeaponCombat } from '../hooks/useWeaponCombat';
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

  const { 
    weaponState, 
    isProcessing: isWeaponProcessing, 
    processAction, 
    canAim, 
    canFire, 
    canReload 
  } = useWeaponCombat({
    playerCharacter,
    opponent,
    onCombatEnd,
    dispatch,
    initialState: initialCombatState?.weapon
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
        } : undefined,
        weapon: type === 'weapon' ? {
          round: 1,
          playerWeapon: null,
          opponentWeapon: null,
          currentRange: 0,
          roundLog: [],
          lastAction: undefined
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

    if (combatType === 'weapon') {
      return (
        <WeaponCombatControls
          isProcessing={isWeaponProcessing}
          currentState={weaponState}
          onAction={processAction}
          canAim={canAim}
          canFire={canFire}
          canReload={canReload}
        />
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
      
      {brawlingState?.roundLog?.length > 0 && (
        <div className="combat-log mt-4">
          {brawlingState.roundLog.map((log, index) => (
            <div key={index} className="text-sm mb-1 even:text-right">{log.text}</div>
          ))}
        </div>
      )}

      {weaponState.roundLog.length > 0 && (
        <div className="combat-log mt-4">
          {weaponState.roundLog.map((log, index) => (
            <div key={index} className="text-sm mb-1 even:text-right">
            {log.text}
          </div>
          ))}
        </div>
      )}
    </div>
  );
};
