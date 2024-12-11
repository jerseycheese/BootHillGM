import { Character } from '../types/character';
import { WeaponCombatAction, WeaponCombatResult, WeaponCombatState, LogEntry } from '../types/combat';
import { resolveWeaponAction } from './weaponCombatResolver';
import { processWeaponCombatTurn } from './weaponCombatState';
import { GameEngineAction } from '../types/gameActions';
import { CombatState } from '../types/combat';

export const processPlayerAction = async (
  action: WeaponCombatAction,
  playerCharacter: Character,
  opponent: Character,
  weaponState: WeaponCombatState,
  aimBonus: number,
  dispatch: React.Dispatch<GameEngineAction>,
  combatState: CombatState
): Promise<{
  result: WeaponCombatResult;
  turnResult: {
    updatedCharacter: Character | null;
    logEntry: LogEntry;
    shouldEndCombat: boolean;
  };
}> => {

  const result = await resolveWeaponAction({
    action,
    attacker: playerCharacter,
    defender: opponent,
    weapon: weaponState.playerWeapon!,
    currentRange: weaponState.currentRange,
    aimBonus,
    debugMode: false
  });

  if (!result) {
    throw new Error('Failed to resolve player action');
  }

  const turnResult = await processWeaponCombatTurn(
    result,
    true,
    playerCharacter,
    opponent,
    dispatch,
    combatState
  );

  return { result, turnResult };
};

export const processOpponentAction = async (
  opponent: Character,
  playerCharacter: Character,
  weaponState: WeaponCombatState,
  dispatch: React.Dispatch<GameEngineAction>,
  combatState: CombatState
) => {
  const opponentAction: WeaponCombatAction = { type: 'fire' };

  const result = await resolveWeaponAction({
    action: opponentAction,
    attacker: opponent,
    defender: playerCharacter,
    weapon: weaponState.opponentWeapon!,
    currentRange: weaponState.currentRange,
    aimBonus: 0,
    debugMode: false
  });

  if (!result) return null;

  const turnResult = await processWeaponCombatTurn(
    result,
    false,
    opponent,
    playerCharacter,
    dispatch,
    combatState
  );

  return { result, turnResult, action: opponentAction };
};
