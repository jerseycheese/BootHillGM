import { useState, useCallback } from 'react';
import { Character } from '../types/character';
import { 
  WeaponCombatState, 
  WeaponCombatAction, 
  WeaponCombatResult,
  LogEntry,
  Weapon,
  calculateWeaponModifier,
  rollForMalfunction,
  parseWeaponDamage,
  WEAPON_STATS
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
interface UseWeaponCombatProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialState?: WeaponCombatState;
  state: GameState;
  debugMode?: boolean; // Added debug mode
}

export const useWeaponCombat = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  dispatch,
  initialState,
  state,
  debugMode = false // Default to false
}: UseWeaponCombatProps) => {
  const [weaponState, setWeaponState] = useState<WeaponCombatState>(() => {
    // Find equipped weapon in inventory
    const equippedWeapon = state.inventory.find(item => 
      item.category === 'weapon' && item.quantity > 0
    );

    const playerWeapon = equippedWeapon ? {
      id: equippedWeapon.id,
      name: equippedWeapon.name,
      modifiers: WEAPON_STATS[equippedWeapon.name] || WEAPON_STATS['Colt Revolver'], // Fallback
      ammunition: 6,
      maxAmmunition: 6
    } : null;

    return initialState || {
      round: 1,
      playerWeapon,
      opponentWeapon: opponent.weapon ? {
        id: opponent.weapon.id,
        name: opponent.weapon.name,
        modifiers: WEAPON_STATS[opponent.weapon.name],
        ammunition: opponent.weapon.ammunition,
        maxAmmunition: opponent.weapon.maxAmmunition
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
    isPlayer: boolean
  ): Promise<WeaponCombatResult | null> => {
    const attacker = isPlayer ? playerCharacter : opponent;
    const defender = isPlayer ? opponent : playerCharacter;
    const weapon = isPlayer ? weaponState.playerWeapon : weaponState.opponentWeapon;

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
        const rangeModifier = Math.max(-30, -Math.floor((weaponState.currentRange / weapon.modifiers.range) * 20));
        const totalBonus = aimBonus + rangeModifier + weapon.modifiers.accuracy;
        
        let roll = Math.floor(Math.random() * 100) + 1;
        if (debugMode && isPlayer) {
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

          let damage = Math.floor(Math.random() * 6) + 1;
          if (critical) damage *= 2;

          dispatch({
            type: 'SET_OPPONENT',
            payload: {
              ...opponent,
              attributes: {
                ...opponent.attributes,
                strength: Math.max(0, opponent.attributes.strength - damage)
              }
            }
          });

          return {
            hit: true,
            damage,
            critical,
            roll,
            modifiedRoll,
            targetNumber,
            message: `${attacker.name} hits ${defender.name} with ${weapon.name} for ${damage} damage!`
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
  }, [playerCharacter, opponent, weaponState, aimBonus, debugMode, dispatch]);

  /**
   * Processes a complete combat turn including opponent response.
   * Includes weapon combat resolution, state updates, and combat log entries.
   */
  const processAction = useCallback(async (action: WeaponCombatAction): Promise<void> => {
    setIsProcessing(true);
    try {
      const result = await resolveWeaponAction(action, true);
      if (!result) return;

      addToLog({
        text: result.message,
        type: result.hit ? 'hit' : 'miss',
        timestamp: Date.now()
      });

      if (result.damage) {
        // Update opponent health
        dispatch({
          type: 'SET_OPPONENT',
          payload: {
            ...opponent,
            attributes: {
              ...opponent.attributes,
              strength: Math.max(0, opponent.attributes.strength - result.damage)
            }
          }
        });
        if (opponent.attributes.strength - result.damage <= 0) {
          onCombatEnd('player', `You defeat ${opponent.name} with a well-placed shot!`);
          return;
        }
      }

      // Process opponent's response
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

        if (opponentResult.damage) {
          dispatch({
            type: 'UPDATE_CHARACTER',
            payload: {
              attributes: {
                ...playerCharacter.attributes,
                strength: Math.max(0, playerCharacter.attributes.strength - opponentResult.damage)
              }
            }
          });
          if (playerCharacter.attributes.strength - opponentResult.damage <= 0) {
            onCombatEnd('opponent', `${opponent.name} defeats you with a deadly shot!`);
            return;
          }
        }
      }

      // Reset aim bonus at end of round if not used
      if (action.type !== 'fire' && opponentAction.type !== 'fire') {
        setAimBonus(0);
      }

    } finally {
      setIsProcessing(false);
    }
  }, [
    resolveWeaponAction,
    addToLog,
    dispatch,
    opponent,
    playerCharacter,
    onCombatEnd
  ]);

  const canAim = !isProcessing && aimBonus < 20;
  const canFire = !isProcessing && weaponState.playerWeapon !== null;
  const canReload = !isProcessing;

  return {
    weaponState,
    isProcessing,
    processAction,
    canAim,
    canFire,
    canReload
  };
};
