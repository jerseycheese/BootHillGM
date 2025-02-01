/**
 * Implements Boot Hill v2 combat system with:
 * - Strength-based damage calculation
 * - Wound location and severity tracking
 * - Two-round brawling structure
 * - Punch and grapple options
 * - Weapon combat actions and display
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Character } from '../../types/character';
import { characterToCombatParticipant } from '../../utils/combatUtils';
import { CombatStatus } from './CombatStatus';
import { BrawlingControls } from './BrawlingControls';
import { WeaponCombatControls } from './WeaponCombatControls';
import { useBrawlingCombat } from '../../hooks/useBrawlingCombat';
import { useWeaponCombat } from '../../hooks/useWeaponCombat';
import { GameEngineAction } from '../../types/gameActions';
import { CombatTypeSelection } from './CombatTypeSelection';
import { 
  CombatType, 
  CombatState, 
  WeaponCombatAction, 
  ensureCombatState,
  CombatSummary 
} from '../../types/combat';
import { Weapon } from '../../types/inventory';
import { getDefaultWeapon } from '../../utils/weaponUtils';
import { CombatLog } from './CombatLog';

export const CombatSystem: React.FC<{
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialCombatState?: CombatState;
  currentCombatState?: CombatState;
}> = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  dispatch,
  initialCombatState,
  currentCombatState
}) => {

  // State to track the type of combat (brawling or weapon)
  const [combatType, setCombatType] = useState<CombatType>(null);
  const [combatSummary, setCombatSummary] = useState<CombatSummary | undefined>(
    currentCombatState?.summary || initialCombatState?.summary
  );

  useEffect(() => {
    // Set combatType if initialCombatState is provided and has a non-null combatType
    if (initialCombatState && initialCombatState.combatType !== null) {
      setCombatType(initialCombatState.combatType);
    }
  }, [initialCombatState]);

  // Brawling combat logic and state
  const { 
    brawlingState, 
    isProcessing: isBrawlingProcessing, 
    isCombatEnded: isBrawlingEnded,
    processRound 
  } = useBrawlingCombat({
    playerCharacter,
    opponent,
    onCombatEnd: (winner, summary) => {
      setCombatSummary({
        winner,
        results: summary,
        stats: {
          rounds: brawlingState?.round || 0,
          damageDealt: playerCharacter.attributes.baseStrength - opponent.attributes.strength,
          damageTaken: opponent.attributes.baseStrength - playerCharacter.attributes.strength
        }
      });
      onCombatEnd(winner, summary);
    },
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
    currentOpponent
  } = useWeaponCombat({
    playerCharacter,
    opponent,
    onCombatEnd: (winner, summary) => {
      setCombatSummary({
        winner,
        results: summary,
        stats: {
          rounds: weaponState?.round || 0,
          damageDealt: playerCharacter.attributes.baseStrength - opponent.attributes.strength,
          damageTaken: opponent.attributes.baseStrength - playerCharacter.attributes.strength
        }
      });
      onCombatEnd(winner, summary);
    },
    dispatch,
    initialState: initialCombatState?.weapon,
    combatState: initialCombatState || ensureCombatState()
  });

  // Handle returning to narrative UI
  const handleReturnToNarrative = useCallback(() => {
    dispatch({ type: 'SET_COMBAT_ACTIVE', payload: false });
    dispatch({ type: 'END_COMBAT' });
  }, [dispatch]);

  // Memoize combat log entries to prevent unnecessary re-renders
  const combatLogEntries = useMemo(() => {
    const entries = [
      ...(brawlingState?.roundLog || []),
      ...(weaponState?.roundLog || [])
    ].sort((a, b) => a.timestamp - b.timestamp);

    // Remove duplicate entries by comparing timestamps only
    const uniqueEntries = entries.filter((entry, index) => 
      entries.findIndex(e => e.timestamp === entry.timestamp) === index
    );

    return uniqueEntries;
  }, [brawlingState?.roundLog, weaponState?.roundLog]);

  // Handle combat type selection
  const handleCombatTypeSelect = useCallback((type: CombatType) => {
    setCombatType(type);
    
    // Find equipped weapon in player's inventory
    const equippedWeapon = playerCharacter.inventory
      .find(item => item.category === 'weapon' && item.isEquipped) as Weapon | undefined;
    
    // Update combat state with selected combat type and equipped weapon
    dispatch({
      type: 'UPDATE_COMBAT_STATE',
      payload: ensureCombatState({
        isActive: true,
        combatType: type,
        currentTurn: 'player',
        winner: null,
        brawling: type === 'brawling' ? {
          round: 1 as const,
          playerModifier: 0,
          opponentModifier: 0,
          playerCharacterId: playerCharacter.id,
          opponentCharacterId: opponent.id,
          roundLog: []
        } : undefined,
        weapon: type === 'weapon' ? {
          round: 1,
          playerWeapon: equippedWeapon || null,
          opponentWeapon: getDefaultWeapon(),
          currentRange: 10,
          playerCharacterId: playerCharacter.id,
          opponentCharacterId: opponent.id,
          roundLog: [],
          lastAction: undefined
        } : undefined
      })
    });
  }, [playerCharacter, opponent, dispatch]);

  // Handle brawling actions with proper state validation
  const handleBrawlingAction = useCallback(async (isPunching: boolean) => {

    if (isBrawlingEnded || playerCharacter.attributes.strength <= 0 || opponent.attributes.strength <= 0) { // Use character strength
      return;
    }

    await processRound(true, isPunching);
  }, [processRound, isBrawlingEnded, opponent.attributes.strength, playerCharacter.attributes.strength]);

  // Get current combat state for status display
  const currentCombatStateForDisplay: CombatState = useMemo(() => ensureCombatState({
    isActive: !isBrawlingEnded,
    combatType,
    winner: combatSummary?.winner || null,
    brawling: brawlingState,
    weapon: weaponState,
    currentTurn: 'player',
    participants: [playerCharacter, opponent],
    rounds: brawlingState?.round || weaponState?.round || 0,
    selection: combatType ? undefined : {
      isSelectingType: true,
      availableTypes: ['brawling', 'weapon'] as CombatType[]
    },
    summary: combatSummary
  }), [
    combatType,
    brawlingState,
    weaponState,
    playerCharacter,
    opponent,
    isBrawlingEnded,
    combatSummary
  ]);

  return (
    <div className="combat-system wireframe-section space-y-4">
      {/* Display combat status for both player and opponent */}
      <CombatStatus
        playerCharacter={playerCharacter}
        opponent={currentOpponent ? characterToCombatParticipant(currentOpponent, true) : characterToCombatParticipant(opponent, true)}
        combatState={currentCombatStateForDisplay}
      />
      
      {/* Render combat controls based on selected combat type */}
      {!isBrawlingEnded && !combatType && (
        <CombatTypeSelection
          playerCharacter={playerCharacter}
          opponent={opponent}
          onSelectType={handleCombatTypeSelect}
        />
      )}
      
      {!isBrawlingEnded && combatType === 'brawling' && (
        <BrawlingControls
          isProcessing={isBrawlingProcessing}
          onPunch={() => handleBrawlingAction(true)}
          onGrapple={() => handleBrawlingAction(false)}
          round={brawlingState?.round || 1}
        />
      )}
      
      {!isBrawlingEnded && combatType === 'weapon' && (
        <WeaponCombatControls
          isProcessing={isWeaponProcessing}
          currentState={weaponState}
          opponent={opponent} // Pass opponent prop
          onAction={(action: WeaponCombatAction) => processAction(action)}
          canAim={canAim}
          canFire={canFire}
          canReload={canReload}
        />
      )}
      
      {/* Display unified combat log */}
      <CombatLog
        entries={combatLogEntries}
        summary={combatSummary}
        isCombatEnded={isBrawlingEnded}
      />

      {/* Return to Narrative button shown when combat ends */}
      {isBrawlingEnded && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleReturnToNarrative}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return to Narrative
          </button>
        </div>
      )}
    </div>
  );
};
