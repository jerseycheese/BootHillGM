import { GameState } from "../../types/gameState";
import { GameEngineAction } from "../../types/gameActions";


const initialJournalState: Pick<GameState, 'journal'> = {
  journal: [],
};

/**
 * Reducer function to handle journal-related state updates.
 * @param state - The current game state.
 * @param action - The action to be processed.
 * @returns The updated game state.
 */
export function journalReducer(
  state: Partial<GameState> = initialJournalState,
  action: GameEngineAction
): Partial<GameState> {
  switch (action.type) {
    case 'UPDATE_JOURNAL':
      // Handle both single entries and arrays of entries
      return {
        ...state,
        journal: Array.isArray(action.payload)
          ? action.payload
          : [...(state.journal || []), action.payload]
      };

    // Future implementation: could add more journal-specific actions
    // case 'CLEAR_JOURNAL':
    //   return { ...state, journal: [] };
    // case 'REMOVE_JOURNAL_ENTRY':
    //   return {
    //     ...state,
    //     journal: state.journal?.filter((entry) =>
    //       entry.timestamp !== action.payload
    //     ),
    //   };
    // case 'UPDATE_JOURNAL_ENTRY':
    //   return {
    //     ...state,
    //     journal: state.journal?.map((entry) =>
    //       entry.timestamp === action.payload.timestamp
    //         ? { ...entry, ...action.payload.updates }
    //         : entry
    //     ),
    //   };

    default:
      return state;
  }
}