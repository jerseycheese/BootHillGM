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
import { GameEngineAction } from '../types/gameActions';
import { CombatTypeSelection } from './Combat/CombatTypeSelection';
import { CombatType, CombatState, WeaponCombatAction } from '../types/combat';
import { cleanCombatLogEntry } from '../utils/textCleaningUtils';
import { Weapon } from '../types/inventory';
import { getDefaultWeapon } from '../utils/weaponUtils';

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
  // State to track the type of combat (brawling or weapon)
  const [combatType, setCombatType] = useState<CombatType>(null);

  useEffect(() => {
    // Set combatType if initialCombatState is provided and has a non-null combatType
    if (initialCombatState && initialCombatState.combatType !== null) {
      setCombatType(initialCombatState.combatType);
    }
  }, [initialCombatState]);
  
  // Brawling combat logic and state
  const { brawlingState, isProcessing: isBrawlingProcessing, processRound } = useBrawlingCombat({
    playerCharacter,
    opponent,
    onCombatEnd,
    dispatch,
    initialCombatState: initialCombatState?.brawling
  });

  // Weapon combat logic and state
  const {
    weaponState,
    isProcessing: isWeaponProcessing,
    processAction,
    canAim,
    canFire,
    canReload,
    currentOpponent // Track current opponent state
  } = useWeaponCombat({
    playerCharacter,
    opponent,
    onCombatEnd,
    dispatch,
    initialState: initialCombatState?.weapon,
    combatState: initialCombatState || { isActive: false, combatType: null, winner: null, playerStrength: 0, opponentStrength: 0, brawling: undefined, weapon: undefined, currentTurn: 'player' }
  });

  // Handle combat type selection
  const handleCombatTypeSelect = (type: CombatType) => {
    setCombatType(type);
    
    // Find equipped weapon in player's inventory
    const equippedWeapon = playerCharacter.inventory
      .find(item => item.category === 'weapon' && item.isEquipped) as Weapon | undefined;
    
    // Update combat state with selected combat type and equipped weapon
    dispatch({
      type: 'UPDATE_COMBAT_STATE',
      payload: {
        isActive: true,
        combatType: type,
        playerStrength: playerCharacter.attributes.strength,
        opponentStrength: opponent.attributes.strength,
        currentTurn: 'player',
        winner: null,
        brawling: type === 'brawling' ? {
          round: 1,
          playerModifier: 0,
          opponentModifier: 0,
          roundLog: []
        } : undefined,
          weapon: type === 'weapon' ? {
            round: 1,
            playerWeapon: equippedWeapon || null,
            opponentWeapon: getDefaultWeapon(),
            currentRange: 10, // Default starting range
            roundLog: [],
            lastAction: undefined
          } : undefined
      }
    });
  };

  // Render combat controls based on selected combat type
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
          onGrapple={() => processRound(true, false)}
          round={brawlingState?.round || 1}
        />
      );
    }

    if (combatType === 'weapon') {
      return (
        <WeaponCombatControls
          isProcessing={isWeaponProcessing}
          currentState={weaponState}
          onAction={(action: WeaponCombatAction) => processAction(action)}
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
      {/* Display combat status for both player and opponent */}
      <CombatStatus
        playerCharacter={playerCharacter}
        opponent={currentOpponent || opponent}
        combatState={{
          isActive: true,
          combatType,
          winner: null,
          playerStrength: playerCharacter.attributes.strength,
          opponentStrength: currentOpponent?.attributes?.strength || opponent.attributes.strength,
          brawling: brawlingState,
          weapon: weaponState,
          currentTurn: 'player',
          selection: combatType ? undefined : {
            isSelectingType: true,
            availableTypes: ['brawling', 'weapon']
          }
        }}
      />
      
      {/* Render combat controls based on selected combat type */}
      {renderCombatContent()}
      
      {/* Display combat log for brawling */}
      {brawlingState?.roundLog?.length > 0 && (
        <div className="combat-log mt-4">
          {brawlingState.roundLog.map((log, index) => (
            <div key={index} className="text-sm mb-1 even:text-right">
              {cleanCombatLogEntry(log.text)}
            </div>
          ))}
        </div>
      )}

      {/* Display combat log for weapon combat */}
      {weaponState.roundLog.length > 0 && (
        <div className="combat-log mt-4">
          {weaponState.roundLog.map((log, index) => (
            <div key={index} className="text-sm mb-1 even:text-right">
              {cleanCombatLogEntry(log.text)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
