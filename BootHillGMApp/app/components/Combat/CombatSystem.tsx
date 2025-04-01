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
  CombatState, // Use older CombatState from types/combat
  WeaponCombatAction,
  ensureCombatState,
  CombatSummary,
  // Removed unused LogEntry import
} from '../../types/combat'; // Import from older types/combat
import { Weapon } from '../../types/weapon.types';
import { getDefaultWeapon } from '../../utils/weaponUtils';
import { CombatLog } from './CombatLog';

// Use inline props definition expecting older types
export const CombatSystem: React.FC<{
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>; // Expect GameEngineAction
  initialCombatState?: CombatState; // Expect older CombatState
  currentCombatState?: CombatState; // Add back currentCombatState
}> = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  dispatch,
  initialCombatState,
  currentCombatState // Add back currentCombatState
}) => {

  // State to track the type of combat (brawling or weapon)
  const [combatType, setCombatType] = useState<CombatType>(null);
  const [combatSummary, setCombatSummary] = useState<CombatSummary | undefined>(
    // Use older CombatState properties
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
          damageDealt:
            playerCharacter.attributes.strength - opponent.attributes.strength,
          damageTaken:
            opponent.attributes.strength - playerCharacter.attributes.strength,
        },
      });
      onCombatEnd(winner, summary);
    },
    dispatch, // Pass dispatch directly (should match GameEngineAction now)
    // Pass older CombatState property
    initialCombatState: initialCombatState?.brawling,
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
          damageDealt:
            playerCharacter.attributes.strength - opponent.attributes.strength,
          damageTaken:
            opponent.attributes.strength - playerCharacter.attributes.strength,
        },
      });
      onCombatEnd(winner, summary);
    },
    dispatch, // Pass dispatch directly
    // Pass older CombatState property
    initialState: initialCombatState?.weapon,
    // Pass older CombatState, use ensureCombatState for default
    combatState: initialCombatState || ensureCombatState(),
  });

  // Handle returning to narrative UI
  const handleReturnToNarrative = useCallback(() => {
    // Use non-namespaced types expected by older logic/GameEngineAction
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

  // Find equipped weapon safely
  const findEquippedWeapon = useCallback((character: Character): Weapon | undefined => {
    if (!character) return undefined;

    // Handle different inventory formats safely
    if (character.inventory) {
      if (Array.isArray(character.inventory)) {
        // Direct array format
        return character.inventory.find(
          item => item.category === 'weapon' && item.isEquipped
        ) as Weapon | undefined;
      } else if (character.inventory.items && Array.isArray(character.inventory.items)) {
        // Object with items array format
        return character.inventory.items.find(
          item => item.category === 'weapon' && item.isEquipped
        ) as Weapon | undefined;
      }
    }

    // Fallback to character's weapon property if available
    return character.weapon as Weapon | undefined;
  }, []);

  // Handle combat type selection
  const handleCombatTypeSelect = useCallback((type: CombatType) => {
    setCombatType(type);

    const equippedWeapon = findEquippedWeapon(playerCharacter);

    // Use ensureCombatState and older payload structure
    dispatch({
      type: 'UPDATE_COMBAT_STATE',
      payload: ensureCombatState({
        isActive: true,
        combatType: type,
        currentTurn: 'player',
        winner: null,
        brawling: type === 'brawling' ? { round: 1, playerModifier: 0, opponentModifier: 0, playerCharacterId: playerCharacter.id, opponentCharacterId: opponent.id, roundLog: [] } : undefined,
        weapon: type === 'weapon' ? { round: 1, playerWeapon: equippedWeapon || null, opponentWeapon: getDefaultWeapon(), currentRange: 10, playerCharacterId: playerCharacter.id, opponentCharacterId: opponent.id, roundLog: [], lastAction: undefined } : undefined,
        rounds: initialCombatState?.rounds ?? 0,
        combatLog: initialCombatState?.combatLog ?? [],
        // playerCharacterId and opponentCharacterId might be redundant here
      })
    });
  }, [playerCharacter, opponent, dispatch, findEquippedWeapon, initialCombatState]);

  // Handle brawling actions with proper state validation
  const handleBrawlingAction = useCallback(async (isPunching: boolean) => {

    if (isBrawlingEnded || playerCharacter.attributes.strength <= 0 || opponent.attributes.strength <= 0) { // Use character strength
      return;
    }

    await processRound(true, isPunching);
  }, [processRound, isBrawlingEnded, opponent.attributes.strength, playerCharacter.attributes.strength]);

  // Get current combat state for status display
  // Revert currentCombatStateForDisplay construction using ensureCombatState
  const currentCombatStateForDisplay: CombatState = useMemo(() => ensureCombatState({
    isActive: !isBrawlingEnded,
    combatType,
    winner: combatSummary?.winner || null,
    brawling: brawlingState,
    weapon: weaponState,
    currentTurn: 'player', // Assuming player turn for display
    participants: [playerCharacter, opponent], // Re-add participants if needed by ensureCombatState
    rounds: brawlingState?.round || weaponState?.round || 0,
    selection: combatType ? undefined : { // Add back selection property
      isSelectingType: true,
      availableTypes: ['brawling', 'weapon'] as CombatType[]
    },
    summary: combatSummary,
    combatLog: combatLogEntries, // Pass memoized log
  }), [
    combatType,
    brawlingState,
    weaponState,
    playerCharacter,
    opponent,
    isBrawlingEnded,
    combatSummary, combatLogEntries // Revert dependencies
  ]);

  return (
    <div className="combat-system wireframe-section space-y-4">
      {/* Display combat status for both player and opponent */}
      <CombatStatus
        playerCharacter={playerCharacter}
        opponent={currentOpponent ? characterToCombatParticipant(currentOpponent, true) : characterToCombatParticipant(opponent, true)}
        combatState={currentCombatStateForDisplay} // Remove cast
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
          onAction={(action: WeaponCombatAction) => processAction(action)} // Use older action type
          canAim={canAim}
          canFire={canFire}
          canReload={canReload}
        />
      )}

      {/* Display unified combat log */}
      <CombatLog
        entries={combatLogEntries}
        summary={combatSummary} // Remove cast
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
