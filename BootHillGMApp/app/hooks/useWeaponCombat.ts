import { useState, useCallback, useEffect } from 'react';
import { Character } from '../types/character';
import { InventoryItem } from '../types/inventory';
import { Weapon } from '../types/combat';
import { calculateRangeModifier, getWeaponSpeedModifier } from '../utils/bootHillCombat';

const isValidWeapon = (weapon: unknown): weapon is Weapon => {
  return typeof weapon === 'object' && weapon !== null &&
    typeof (weapon as Weapon).name === 'string' &&
    typeof (weapon as Weapon).id === 'string';
};

import { 
  WeaponCombatState, 
  WeaponCombatAction, 
  WeaponCombatResult,
  LogEntry,
  WEAPON_STATS,
  parseWeaponDamage
} from '../types/combat';
import { GameEngineAction } from '../utils/gameEngine';
import { calculateHitChance, isCritical } from '../utils/combatRules';

/**
 * Manages weapon combat state and actions.
 * Handles:
 * - Weapon action resolution (aim, fire, reload, move)
 * - Combat state updates
 * - Turn processing
 * - Damage calculation
 */
import { CombatState } from '../types/combat';

interface UseWeaponCombatProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialState?: WeaponCombatState;
  combatState: CombatState;
  debugMode?: boolean;
}

export const useWeaponCombat = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  dispatch,
  initialState,
  debugMode = false // Default to false
}: UseWeaponCombatProps) => {
  // Track current opponent state
  const [currentOpponent, setCurrentOpponent] = useState(opponent);

  const [weaponState, setWeaponState] = useState<WeaponCombatState>(() => {
    // Find first available weapon in inventory
    const availableWeapon = playerCharacter.inventory?.find((item: InventoryItem) => 
      item.category === 'weapon' && item.quantity > 0
    ) || {
      id: 'default-colt',
      name: 'Colt Revolver',
      quantity: 1,
      category: 'weapon' as const,
      description: 'Standard issue Colt revolver'
    };

    // Always create a weapon object, using either inventory weapon or default
    const playerWeapon = {
      id: availableWeapon.id,
      name: availableWeapon.name,
      modifiers: WEAPON_STATS[availableWeapon.name] || WEAPON_STATS['Colt Revolver'],
      ammunition: 6,
      maxAmmunition: 6
    };

    return initialState || {
      round: 1,
      playerWeapon,
      opponentWeapon: opponent.weapon && isValidWeapon(opponent.weapon) ? {
        id: opponent.weapon.id || 'default-opponent-weapon',
        name: opponent.weapon.name,
        modifiers: WEAPON_STATS[opponent.weapon.name] || WEAPON_STATS['Colt Revolver'],
        ammunition: WEAPON_STATS[opponent.weapon.name]?.ammunition || 6,
        maxAmmunition: WEAPON_STATS[opponent.weapon.name]?.maxAmmunition || 6
      } : null,
      currentRange: 15,
      roundLog: [],
      lastAction: undefined
    };
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [aimBonus, setAimBonus] = useState(0);

  const addToLog = useCallback((entry: LogEntry) => {
    setWeaponState(prev => ({
      ...prev,
      roundLog: [...prev.roundLog, entry]
    }));
  }, []);

  /**
   * Resolves a single weapon combat action.
   * - Applies aim bonuses and range modifiers
   * - Calculates hit chances and damage
   * - Handles weapon malfunctions
   * - Updates combat state based on action outcome
   */
  const resolveWeaponAction = useCallback(async (
    action: WeaponCombatAction,
    isPlayerAction: boolean
  ): Promise<WeaponCombatResult | null | undefined> => {
    // For player actions, player is attacker and opponent is defender
    // For opponent actions, opponent is attacker and player is defender
    const attacker = isPlayerAction ? playerCharacter : opponent;
    const defender = isPlayerAction ? opponent : playerCharacter;
    const weapon = isPlayerAction ? weaponState.playerWeapon : weaponState.opponentWeapon;

    if (!weapon) return null;

    switch (action.type) {
      case 'aim':
        const newAimBonus = aimBonus + 10;
        if (newAimBonus <= 20) {
          setAimBonus(newAimBonus);
          return {
            hit: false,
            roll: 0,
            modifiedRoll: 0,
            targetNumber: 0,
            message: `${attacker.name} takes aim carefully`
          };
        }
        return {
          hit: false,
          roll: 0,
          modifiedRoll: 0,
          targetNumber: 0,
          message: `${attacker.name} cannot aim any more carefully`
        };

      case 'fire': {
        const baseChance = calculateHitChance(attacker);
        const rangeModifier = calculateRangeModifier(weapon, weaponState.currentRange);
        const weaponSpeedMod = getWeaponSpeedModifier(weapon);
        const totalBonus = aimBonus + rangeModifier + weapon.modifiers.accuracy + weaponSpeedMod;
        
        let roll = Math.floor(Math.random() * 100) + 1;
        if (debugMode && isPlayerAction) {
          roll = 1; // Force a hit for player in debug mode
        }
        const modifiedRoll = roll - totalBonus;
        const targetNumber = baseChance;

        // Reset aim bonus after firing
        setAimBonus(0);

        // Check for weapon malfunction
        if (roll >= weapon.modifiers.reliability) {
          return {
            hit: false,
            roll,
            modifiedRoll,
            targetNumber,
            weaponMalfunction: true,
            message: `${attacker.name}'s ${weapon.name} malfunctions!`
          };
        }

        const hit = modifiedRoll <= targetNumber;
        const critical = isCritical(roll);

        if (hit) {

          let damage = parseWeaponDamage(weapon.modifiers.damage);
          if (critical) damage *= 2;

          // Calculate and apply cumulative damage from current strength
          const currentStrength = isPlayerAction ? currentOpponent.attributes.strength : playerCharacter.attributes.strength;
          const newStrength = Math.max(0, currentStrength - damage);
          const updatedDefender = {
            ...defender,
            attributes: {
              ...defender.attributes,
              strength: newStrength
            },
            wounds: [
              ...defender.wounds,
              {
                location: 'chest' as const, // You might want to randomize this
                severity: damage >= 5 ? 'serious' as const : 'light' as const,
                strengthReduction: damage,
                turnReceived: weaponState.round
              }
            ]
          };

          // Update state based on who was hit
          if (isPlayerAction) {
            // Player's action hit the opponent
            dispatch({
              type: 'UPDATE_OPPONENT',
              payload: updatedDefender
            });
            // Immediately update local opponent state
            setCurrentOpponent(updatedDefender);
          } else {
            // Opponent's action hit the player
            dispatch({
              type: 'UPDATE_CHARACTER',
              payload: updatedDefender
            });
          }

          return {
            hit: true,
            damage,
            critical,
            roll,
            modifiedRoll,
            targetNumber,
            message: `${attacker.name} hits ${defender.name} with ${weapon.name} for ${damage} damage! (Strength: ${currentStrength} → ${newStrength})`,
            newStrength // Pass the new strength value
          };
        }

        return {
          hit: false,
          roll,
          modifiedRoll,
          targetNumber,
          message: `${attacker.name} misses with ${weapon.name}`
        };
      }

      case 'move':
        if (action.targetRange !== undefined) {
          setWeaponState(prev => ({
            ...prev,
            currentRange: action.targetRange !== undefined ? action.targetRange : prev.currentRange
          }));
          return {
            hit: false,
            roll: 0,
            modifiedRoll: 0,
            targetNumber: 0,
            message: `${attacker.name} moves to ${action.targetRange} yards distance`
          };
        }
        return null;

      case 'reload':
        return {
          hit: false,
          roll: 0,
          modifiedRoll: 0,
          targetNumber: 0,
          message: `${attacker.name} reloads ${weapon.name}`
        };
    }
  }, [playerCharacter, opponent, weaponState, aimBonus, debugMode, dispatch, currentOpponent]);

  /**
   * Processes a complete combat turn including opponent response.
   * Includes weapon combat resolution, state updates, and combat log entries.
   */
  const processAction = useCallback(async (action: WeaponCombatAction): Promise<void> => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Player's turn
      const result = await resolveWeaponAction(action, true);
      if (!result) {
        setIsProcessing(false);
        return;
      }

      addToLog({
        text: result.message,
        type: result.hit ? 'hit' : 'miss',
        timestamp: Date.now()
      });

      // Check if combat should end after player's action
      if (result.hit && result.newStrength !== undefined && result.newStrength <= 0) {
        setIsProcessing(false);
        onCombatEnd('player', `You defeat ${opponent.name} with a well-placed shot!`);
        return;
      }

      // Opponent's turn
      const opponentAction: WeaponCombatAction = {
        type: Math.random() > 0.3 ? 'fire' : 'aim'
      };

      const opponentResult = await resolveWeaponAction(opponentAction, false);
      if (opponentResult) {
        addToLog({
          text: opponentResult.message,
          type: opponentResult.hit ? 'hit' : 'miss',
          timestamp: Date.now()
        });

        if (opponentResult.hit && opponentResult.newStrength !== undefined && opponentResult.newStrength <= 0) {
          setIsProcessing(false);
          onCombatEnd('opponent', `${opponent.name} defeats you with a deadly shot!`);
          return;
        }
      }

      // Update round counter and reset aim if needed
      setWeaponState(prev => ({
        ...prev,
        round: prev.round + 1,
        lastAction: action.type
      }));

      if (action.type !== 'fire' && opponentAction.type !== 'fire') {
        setAimBonus(0);
      }

    } catch (error) {
      console.error('Combat action error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    resolveWeaponAction,
    addToLog,
    opponent,
    onCombatEnd
  ]);

  const canAim = !isProcessing && aimBonus < 20;
  const canFire = !isProcessing && weaponState.playerWeapon !== null;
  const canReload = !isProcessing;

  // Update currentOpponent when dispatch updates opponent
  useEffect(() => {
    if (opponent !== currentOpponent) {
      setCurrentOpponent(opponent);
    }
  }, [opponent, currentOpponent]);

  return {
    weaponState,
    isProcessing,
    processAction,
    canAim,
    canFire,
    canReload,
    currentOpponent
  };
};
