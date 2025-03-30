/**
 * Journal Adapter Tests
 * 
 * Tests for the journal adapter that makes the journal entries
 * behave like an array for backward compatibility.
 */

import { journalAdapter } from '../../../utils/stateAdapters';
import { GameState } from '../../../types/gameState';
import { PartialGameStateWithJournal } from './testTypes';
import { hasEntriesArray } from './testHelpers';

describe('journalAdapter', () => {
  test('should add array methods to entries', () => {
    const state: PartialGameStateWithJournal = {
      journal: {
        entries: [
          { 
            id: 'entry1', 
            title: 'First Entry',
            content: 'First entry content',
            timestamp: Date.now()
          },
          { 
            id: 'entry2', 
            title: 'Second Entry',
            content: 'Second entry content',
            timestamp: Date.now()
          }
        ]
      }
    };
    
    const adapted = journalAdapter.adaptForTests(state as unknown as GameState);
    
    // Check that entries are properly adapted
    expect(hasEntriesArray(adapted)).toBe(true);
    
    if (hasEntriesArray(adapted)) {
      // Check that entries are accessible as an array
      expect(adapted.entries.length).toBe(2);
      expect(adapted.entries[0].id).toBe('entry1');
      expect(adapted.entries[1].title).toBe('Second Entry');
      
      // Check array methods
      expect(adapted.entries.find(entry => entry.id === 'entry1')).toBeDefined();
      expect(adapted.entries.filter(entry => typeof entry.title === 'string' && entry.title.includes('First')).length).toBe(1);
      
      // Should allow spread and iteration
      const entriesCopy = [...adapted.entries];
      expect(entriesCopy.length).toBe(2);
      expect(entriesCopy[0].title).toBe('First Entry');
    }
  });
  
  test('should handle empty entries', () => {
    const state: PartialGameStateWithJournal = {
      journal: {
        entries: []
      }
    };
    
    const adapted = journalAdapter.adaptForTests(state as unknown as GameState);
    
    // Check that entries are properly adapted
    expect(hasEntriesArray(adapted)).toBe(true);
    
    if (hasEntriesArray(adapted)) {
      expect(adapted.entries.length).toBe(0);
      expect([...adapted.entries]).toEqual([]);
    }
  });
});