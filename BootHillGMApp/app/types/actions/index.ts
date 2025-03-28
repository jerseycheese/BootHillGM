import { CharacterAction } from './characterActions';
import { CombatAction } from './combatActions';
import { InventoryAction } from './inventoryActions';
import { JournalAction } from './journalActions';
import { NarrativeAction } from './narrativeActions';
import { UIAction } from './uiActions';
import { GameEngineAction } from '../gameActions';

/**
 * Combined game action type
 * This type represents all possible actions that can be dispatched in the game
 */
export type GameAction = 
  | CharacterAction
  | CombatAction
  | InventoryAction 
  | JournalAction
  | NarrativeAction
  | UIAction
  | GameEngineAction;
