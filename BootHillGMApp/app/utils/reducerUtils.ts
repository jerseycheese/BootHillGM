/**
 * Utility functions for reducers
 */

/**
 * Creates a reducer with handlers for different action types
 * @param initialState The initial state for this reducer
 * @param handlers An object mapping action types to handler functions
 */
export const createReducer = <S, A extends { type: string }>(
  initialState: S, 
  handlers: Record<string, (state: S, action: A) => S>
) => {
  return (state = initialState, action: A): S => {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    }
    return state;
  };
};

/**
 * Helper function to create action creators with less boilerplate
 * @param type The action type
 */
export const createAction = <P = undefined>(type: string) => {
  return (payload?: P) => ({ type, payload });
};

/**
 * Type-safe action creator utility
 */
export interface ActionCreator<P> {
  type: string;
  (payload: P): { type: string; payload: P };
}

export function createActionCreator<P>(type: string): ActionCreator<P> {
  const actionCreator = (payload: P) => ({ type, payload });
  actionCreator.type = type;
  return actionCreator as ActionCreator<P>;
}
