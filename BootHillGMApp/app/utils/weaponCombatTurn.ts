import { WeaponCombatAction, WeaponCombatState } from '../types/combat';
import { Character } from '../types/character';
import { GameEngineAction } from '../types/gameActions';
import { CombatState } from '../types/combat';
import { processPlayerAction, processOpponentAction } from './weaponCombatActions';
import { updateWeaponState } from './weaponCombatState';
import { addLogEntry, createCombatSummary } from './weaponCombatLog';

interface ProcessTurnParams {
  action: WeaponCombatAction;
  playerCharacter: Character;
  opponent: Character;
  weaponState: WeaponCombatState;
  aimBonus: number;
  dispatch: React.Dispatch<GameEngineAction>;
  combatState: CombatState;
  setWeaponState: (state: WeaponCombatState | ((prev: WeaponCombatState) => WeaponCombatState)) => void;
  setCurrentOpponent: (opponent: Character) => void;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
}

export const processCombatTurn = async ({
  action,
  playerCharacter,
  opponent,
  weaponState,
  aimBonus,
  dispatch,
  combatState,
  setWeaponState,
  setCurrentOpponent,
  onCombatEnd
}: ProcessTurnParams): Promise<void> => {

  // Process player's action
  const { result, turnResult } = await processPlayerAction(
    action,
    playerCharacter,
    opponent,
    weaponState,
    aimBonus,
    dispatch,
    combatState
  );

  setWeaponState(prev => addLogEntry(prev, turnResult.logEntry));
  
  if (result && result.type === 'move') {
    const targetRange = result.targetRange !== undefined ? result.targetRange : 0;
    setWeaponState(prev => ({
      ...prev,
      currentRange: targetRange
    }));
  }

  if (turnResult.updatedCharacter) {
    setCurrentOpponent(turnResult.updatedCharacter);
    
    // Check if opponent is defeated
    if (turnResult.updatedCharacter.attributes.strength !== undefined && turnResult.updatedCharacter.attributes.strength <= 0) {
      onCombatEnd('player', `You defeat ${opponent.name} with a well-placed shot!`);
      return;
    }
  }

  // Check for combat end conditions immediately after player's action
  if (turnResult.shouldEndCombat === true || (turnResult.updatedCharacter?.attributes.strength !== undefined && turnResult.updatedCharacter.attributes.strength <= 0)) {
    const summary = `You defeat ${opponent.name} with a fatal shot!`;
    onCombatEnd('player', summary);
    return;
  }

  setWeaponState(prev => updateWeaponState(prev, action.type, turnResult.logEntry));

  // Process opponent's action if they have a weapon
  if (!weaponState.opponentWeapon) return;

  const opponentTurn = await processOpponentAction(
    opponent,
    playerCharacter,
    weaponState,
    dispatch,
    combatState
  );

  if (opponentTurn) {
    const { turnResult, action: opponentAction } = opponentTurn;

    setWeaponState(prev => addLogEntry(prev, turnResult.logEntry));

    // Check if combat should end after opponent's action
    if (turnResult.updatedCharacter && turnResult.updatedCharacter.attributes.strength !== undefined && turnResult.updatedCharacter.attributes.strength <= 0) {
      onCombatEnd('player', createCombatSummary('player', opponent.name));
      return;
    }

    if (turnResult.shouldEndCombat === true) {
      const winner = turnResult.updatedCharacter?.attributes.strength !== undefined && turnResult.updatedCharacter.attributes.strength <= 0 ? 'player' : 'opponent';
      const loser = winner === 'player' ? opponent.name : playerCharacter.name;
      onCombatEnd(winner, createCombatSummary(winner, loser));
      return;
    }

    setWeaponState(prev => 
      updateWeaponState(prev, opponentAction.type, turnResult.logEntry)
    );
  }
};
