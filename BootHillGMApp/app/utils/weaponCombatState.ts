import { Character } from '../types/character';
import { WeaponCombatState, WeaponCombatResult, CombatState, LogEntry, WeaponCombatAction, Wound } from '../types/combat';
import { GameAction } from '../types/actions'; // Use main GameAction type
import { WOUND_EFFECTS } from './strengthSystem';
import { ActionTypes } from '../types/actionTypes';

/**
 * Updates the weapon combat state with new values.
 * @param prevState - The previous state of the weapon combat.
 * @param action - The type of action that was performed.
 * @param logEntry - Optional log entry to add to the round log.
 * @param updates - Optional partial updates to the weapon combat state.
 * @returns The updated weapon combat state.
 */
export const updateWeaponState = (
  prevState: WeaponCombatState,
  action: WeaponCombatAction['type'],
  logEntry?: LogEntry,
  updates: Partial<WeaponCombatState> = {}
): WeaponCombatState => {
  return {
    ...prevState,
    ...updates,
    round: prevState.round + 1,
    lastAction: action,
    roundLog: prevState.roundLog, // Keep existing log entries
  };
};

/**
 * Creates a log entry for a combat action.
 * @param message - The message to log.
 * @param type - The type of log entry ('hit', 'miss', or 'info').
 * @returns A log entry object.
 */
export const createLogEntry = (
  message: string,
  type: 'hit' | 'miss' | 'info'
): LogEntry => ({
  text: message,
  type,
  timestamp: Date.now()
});

/**
 * Creates a wound object for a character.
 * @param damage - The amount of damage dealt.
 * @param turnReceived - The turn number when the wound was received.
 * @returns A wound object.
 */
export const createWound = (damage: number, turnReceived: number): Wound => ({
  damage,
  location: 'chest' as const, // Assuming chest for now, needs location logic
  severity: damage >= 7 ? 'mortal' : damage >= 3 ? 'serious' : 'light',
  strengthReduction: damage >= 7 ? WOUND_EFFECTS.MORTAL : damage >= 3 ? WOUND_EFFECTS.SERIOUS : WOUND_EFFECTS.LIGHT,
  turnReceived
});

/**
 * Updates a character's state after taking damage.
 * @param character - The character to update.
 * @param damage - The amount of damage dealt.
 * @param newStrength - The new strength of the character.
 * @param turnReceived - The turn number when the damage was received.
 * @param isOpponent - Indicates if the character is the opponent.
 * @returns The updated character object.
 */
export const updateCharacterAfterHit = (
  character: Character,
  damage: number,
  newStrength: number,
  turnReceived: number,
  isOpponent = false
): Character => ({
  ...character,
  attributes: {
    ...character.attributes,
    strength: newStrength,
    ...(isOpponent && {
      baseStrength: character.attributes.baseStrength || character.attributes.strength
    })
  },
  wounds: [...(character.wounds || []), createWound(damage, turnReceived)]
});

/**
 * Handles the result of a combat action, updating the state and dispatching actions as needed.
 * @param result - The result of the combat action.
 * @param isPlayerAction - Indicates if the action was performed by the player.
 * @param attacker - The character performing the action.
 * @param defender - The character receiving the action.
 * @param dispatch - The dispatch function for updating the global state.
 * @param combatState - The current combat state.
 * @returns The updated character object or null if no update is needed.
 */
// Updates character state after a hit
export const handleCombatResult = (
  result: WeaponCombatResult,
  isPlayerAction: boolean,
  attacker: Character,
  defender: Character,
  dispatch: React.Dispatch<GameAction>,
  combatState: CombatState
): Character | null => {
  const damage = result.damage || 0;
  const newStrength = result.newStrength ?? defender.attributes.strength;
  const turnReceived = combatState.weapon?.round || 1;

  let updatedCharacter: Character | null = null;
  if (damage > 0) { // Only update if damage occurred
    if (isPlayerAction) {
      // Update the opponent character
      updatedCharacter = updateCharacterAfterHit(defender, damage, newStrength, turnReceived, true);

      // Dispatch action to update opponent
      dispatch({
        type: ActionTypes.UPDATE_CHARACTER,
        payload: {
          id: updatedCharacter.id,
          attributes: updatedCharacter.attributes,
          wounds: updatedCharacter.wounds,
          strengthHistory: updatedCharacter.strengthHistory
        }
      });
    } else {
      // Update the player character
      updatedCharacter = updateCharacterAfterHit(defender, damage, newStrength, turnReceived);

      // Dispatch action to update player character
      dispatch({
        type: ActionTypes.UPDATE_CHARACTER,
        payload: {
          id: updatedCharacter.id,
          attributes: updatedCharacter.attributes,
          wounds: updatedCharacter.wounds,
          strengthHistory: updatedCharacter.strengthHistory
        }
      });
    }
  }

  return updatedCharacter;
};


/**
 * Processes a complete combat turn, updating the state and handling combat results.
 * @param result - The result of the combat action.
 * @param isPlayerAction - Indicates if the action was performed by the player.
 * @param attacker - The character performing the action.
 * @param defender - The character receiving the action.
 * @param dispatch - The dispatch function for updating the global state.
 * @param combatState - The current combat state.
 * @returns An object containing the updated character, log entry, and a flag indicating if the combat should end.
 */
export const processWeaponCombatTurn = async (
  result: WeaponCombatResult,
  isPlayerAction: boolean,
  attacker: Character,
  defender: Character,
  dispatch: React.Dispatch<GameAction>, // Use main GameAction type
  combatState: CombatState
): Promise<{
  updatedCharacter: Character | null;
  logEntry: LogEntry;
  shouldEndCombat: boolean;
}> => {
  const logEntry = createLogEntry(result.message, result.hit ? 'hit' : 'miss');
  
  const updatedCharacter = handleCombatResult(
    result,
    isPlayerAction,
    attacker,
    defender,
    dispatch,
    combatState
  );

  // Ensure updatedCharacter is not null and attributes.strength is defined
  const shouldEndCombat = Boolean(
    (updatedCharacter?.attributes?.strength ?? defender.attributes.strength) <= 0 || // Check against defender's original strength if no update
    (result.damage && result.damage >= (defender.attributes.strength || 0))
  );

  return {
    updatedCharacter,
    logEntry,
    shouldEndCombat
  };
};
