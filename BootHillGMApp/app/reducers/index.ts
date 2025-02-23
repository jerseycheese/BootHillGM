import { GameState } from '../types/gameState';
import { GameEngineAction } from '../types/gameActions';
import { inventoryReducer } from './inventory/inventoryReducer';
import { gameReducer as baseGameReducer } from './gameReducer';

// Placeholder imports for other reducers
// import { characterReducer } from './character/characterReducer';
// import { combatReducer } from './combat/combatReducer';
// import { journalReducer } from './journal/journalReducer';

type Reducer = (state: GameState, action: GameEngineAction) => GameState;
type PartialReducer = (state: Partial<GameState>, action: GameEngineAction) => Partial<GameState>;

function combineReducers(reducers: Record<string, Reducer | PartialReducer>) {
  return function(state: GameState, action: GameEngineAction): GameState {
    let nextState: GameState = state;

    for (const key in reducers) {
      if (Object.hasOwn(reducers, key)) {
        const reducer = reducers[key];
        // Provide each reducer with the relevant slice of the state
        const previousStateForKey = state;
        const nextStateForKey = reducer(previousStateForKey, action);
        nextState = { ...nextState, ...nextStateForKey };
      }
    }

    return nextState;
  };
}

const rootReducer = combineReducers({
  // TODO: Add other reducers here
  inventory: inventoryReducer,
  game: baseGameReducer,
});

export default rootReducer;
