import { useState, useCallback, useEffect } from 'react';
import { Character } from '../types/character';
import { InventoryItem } from '../types/inventory';
import { 
  WeaponCombatState, 
  WeaponCombatAction, 
  WeaponCombatResult,
  LogEntry,
  Weapon,
  calculateWeaponModifier,
  rollForMalfunction,
  parseWeaponDamage
} from '../types/combat';

interface WeaponStats {
  [key: string]: {
    name: string;
    damage: string;
    id: string;
    ammunition: number;
    maxAmmunition: number;
    accuracy: number;
    range: number;
    reliability: number;
    speed: number;
  };
}

const WEAPON_STATS: WeaponStats = {
  'Colt Revolver': {
    name: 'Colt Revolver',
    damage: '2d6',
    id: 'colt-revolver',
    ammunition: 6,
    maxAmmunition: 6,
    accuracy: 5,
    range: 20,
    reliability: 95,
    speed: 3
  }
  // Add other weapons as needed
};
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
  combatState,
  debugMode = false // Default to false
}: UseWeaponCombatProps) => {
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
        const rangeModifier = Math.max(-30, -Math.floor((weaponState.currentRange / weapon.modifiers.range) * 20));
        const totalBonus = aimBonus + rangeModifier + weapon.modifiers.accuracy;
        
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

      if (result.damage && typeof result.newStrength === 'number' && result.newStrength <= 0) {
        onCombatEnd('player', `You defeat ${opponent.name} with a well-placed shot!`);
        return;
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

        if (opponentResult.damage && typeof opponentResult.newStrength === 'number' && opponentResult.newStrength <= 0) {
          onCombatEnd('opponent', `${opponent.name} defeats you with a deadly shot!`);
          return;
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

  // Track current opponent state
  const [currentOpponent, setCurrentOpponent] = useState(opponent);

  // Update currentOpponent when dispatch updates opponent
  useEffect(() => {
    if (opponent !== currentOpponent) {
      setCurrentOpponent(opponent);
    }
  }, [opponent]);

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
