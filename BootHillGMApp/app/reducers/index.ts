import { GameState, initialGameState } from '../types/gameState';
import { GameEngineAction } from '../types/gameActions';
import { inventoryReducer } from './inventory/inventoryReducer';
import { narrativeReducer } from './narrativeReducer';
import { gameReducer as baseGameReducer } from './gameReducer';
import { NarrativeAction } from '../types/narrative.types';

function combinedReducer(state: GameState = initialGameState, action: GameEngineAction): GameState {
  let nextState = baseGameReducer(state, action);

  if (
    action.type === 'ADD_ITEM' ||
    action.type === 'REMOVE_ITEM' ||
    action.type === 'USE_ITEM' ||
    action.type === 'UPDATE_ITEM_QUANTITY' ||
    action.type === 'CLEAN_INVENTORY' ||
    action.type === 'SET_INVENTORY' ||
    action.type === 'EQUIP_WEAPON' ||
    action.type === 'UNEQUIP_WEAPON'
  ) {
    nextState = {
      ...nextState,
      ...inventoryReducer(nextState, action),
    };
  }

  if (
    action.type === 'NAVIGATE_TO_POINT' ||
    action.type === 'SELECT_CHOICE' ||
    action.type === 'ADD_NARRATIVE_HISTORY' ||
    action.type === 'SET_DISPLAY_MODE' ||
    action.type === 'START_NARRATIVE_ARC' ||
    action.type === 'COMPLETE_NARRATIVE_ARC' ||
    action.type === 'ACTIVATE_BRANCH' ||
    action.type === 'COMPLETE_BRANCH' ||
    action.type === 'UPDATE_NARRATIVE_CONTEXT' ||
    action.type === 'RESET_NARRATIVE'
  ) {
    nextState = {
      ...nextState,
      narrative: narrativeReducer(nextState.narrative, action as NarrativeAction),
    };
  }

  return nextState;
}

export default combinedReducer;
