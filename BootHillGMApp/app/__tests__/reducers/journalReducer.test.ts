import { journalReducer } from "../../reducers/journal/journalReducer";
import { GameState } from "../../types/gameState";
import { GameEngineAction } from "../../types/gameActions";


describe('journalReducer', () => {
  const initialState: Partial<GameState> = {
    journal: []
  };

  it('should return the initial state when no matching action', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as GameEngineAction;
    const result = journalReducer(initialState, action);
    expect(result).toEqual(initialState);
  });

  describe('UPDATE_JOURNAL action', () => {
    it('should add a single journal entry to an empty journal', () => {
      const entry = {
        type: 'narrative' as const,
        timestamp: Date.now(),
        content: 'Test narrative entry'
      };

      const action = {
        type: 'UPDATE_JOURNAL' as const,
        payload: entry
      };

      const result = journalReducer(initialState, action);
      expect(result.journal).toHaveLength(1);
      expect(result.journal?.[0]).toEqual(entry);
    });

    it('should add a single journal entry to an existing journal', () => {
      const existingEntry = {
        type: 'narrative' as const,
        timestamp: Date.now() - 1000,
        content: 'Existing entry'
      };

      const newEntry = {
        type: 'combat' as const,
        timestamp: Date.now(),
        content: 'New combat entry',
        combatants: {
          player: 'Player',
          opponent: 'Enemy'
        },
        outcome: 'victory' as const
      };

      const stateWithEntry = {
        journal: [existingEntry]
      };

      const action = {
        type: 'UPDATE_JOURNAL' as const,
        payload: newEntry
      };

      const result = journalReducer(stateWithEntry, action);
      expect(result.journal).toHaveLength(2);
      expect(result.journal?.[0]).toEqual(existingEntry);
      expect(result.journal?.[1]).toEqual(newEntry);
    });

    it('should replace the journal with an array of entries', () => {
      const existingEntry = {
        type: 'narrative' as const,
        timestamp: Date.now() - 1000,
        content: 'Existing entry'
      };

      const newEntries = [
        {
          type: 'narrative' as const,
          timestamp: Date.now(),
          content: 'First new entry'
        },
        {
          type: 'inventory' as const,
          timestamp: Date.now() + 1000,
          content: 'Second new entry',
          items: {
            acquired: ['Pistol'],
            removed: []
          }
        }
      ];

      const stateWithEntry = {
        journal: [existingEntry]
      };

      const action = {
        type: 'UPDATE_JOURNAL' as const,
        payload: newEntries
      };

      const result = journalReducer(stateWithEntry, action);
      expect(result.journal).toHaveLength(2);
      expect(result.journal).toEqual(newEntries);
    });

    it('should handle different types of journal entries', () => {
      // Test with narrative entry
      const narrativeEntry = {
        type: 'narrative' as const,
        timestamp: Date.now(),
        content: 'Test narrative'
      };

      const narrativeAction = {
        type: 'UPDATE_JOURNAL' as const,
        payload: narrativeEntry
      };

      let result = journalReducer(initialState, narrativeAction);
      expect(result.journal?.[0].type).toBe('narrative');

      // Test with combat entry
      const combatEntry = {
        type: 'combat' as const,
        timestamp: Date.now(),
        content: 'Test combat',
        combatants: {
          player: 'Player',
          opponent: 'Enemy'
        },
        outcome: 'defeat' as const
      };

      const combatAction = {
        type: 'UPDATE_JOURNAL' as const,
        payload: combatEntry
      };

      result = journalReducer(result, combatAction);
      expect(result.journal).toHaveLength(2);
      expect(result.journal?.[1].type).toBe('combat');

      // Test with inventory entry
      const inventoryEntry = {
        type: 'inventory' as const,
        timestamp: Date.now(),
        content: 'Test inventory',
        items: {
          acquired: ['Gun', 'Bullets'],
          removed: ['Old gun']
        }
      };

      const inventoryAction = {
        type: 'UPDATE_JOURNAL' as const,
        payload: inventoryEntry
      };

      result = journalReducer(result, inventoryAction);
      expect(result.journal).toHaveLength(3);
      expect(result.journal?.[2].type).toBe('inventory');

      // Test with quest entry
      const questEntry = {
        type: 'quest' as const,
        timestamp: Date.now(),
        content: 'Test quest',
        questTitle: 'Main Quest',
        status: 'started' as const
      };

      const questAction = {
        type: 'UPDATE_JOURNAL' as const,
        payload: questEntry
      };

      result = journalReducer(result, questAction);
      expect(result.journal).toHaveLength(4);
      expect(result.journal?.[3].type).toBe('quest');
    });

    it('should handle undefined state by using initialJournalState', () => {
      const entry = {
        type: 'narrative' as const,
        timestamp: Date.now(),
        content: 'Test entry'
      };

      const action = {
        type: 'UPDATE_JOURNAL' as const,
        payload: entry
      };

      const result = journalReducer(undefined, action);
      expect(result.journal).toHaveLength(1);
      expect(result.journal?.[0]).toEqual(entry);
    });

    it('should handle undefined journal array by creating a new array', () => {
      const stateWithUndefinedJournal = {} as Partial<GameState>;

      const entry = {
        type: 'narrative' as const,
        timestamp: Date.now(),
        content: 'Test entry'
      };

      const action = {
        type: 'UPDATE_JOURNAL' as const,
        payload: entry
      };

      const result = journalReducer(stateWithUndefinedJournal, action);
      expect(result.journal).toHaveLength(1);
      expect(result.journal?.[0]).toEqual(entry);
    });
  });

  // Future tests for additional journal actions
  // describe('CLEAR_JOURNAL action', () => {
  //   it('should clear all journal entries', () => {
  //     // Test implementation
  //   });
  // });

  // describe('REMOVE_JOURNAL_ENTRY action', () => {
  //   it('should remove the specified journal entry', () => {
  //     // Test implementation
  //   });
  // });

  // describe('UPDATE_JOURNAL_ENTRY action', () => {
  //   it('should update the specified journal entry', () => {
  //     // Test implementation
  //   });
  // });
});