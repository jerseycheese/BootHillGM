import { 
  cleanMetadataMarkers, 
  cleanCombatLogEntry, 
  toSentenceCase,
  extractItemUpdates 
} from '../../utils/textCleaningUtils';

describe('Text Cleaning Utilities', () => {
  describe('cleanMetadataMarkers', () => {
    it('removes metadata markers while preserving content', () => {
      const input = 'Player SUGGESTED_ACTIONS: [{"text": "action"}] hits enemy';
      expect(cleanMetadataMarkers(input)).toBe('Player hits enemy');
    });

    it('handles empty input', () => {
      expect(cleanMetadataMarkers('')).toBe('');
      expect(cleanMetadataMarkers('  ')).toBe('');
      expect(cleanMetadataMarkers(undefined)).toBe('');
    });
  });

  describe('cleanCombatLogEntry', () => {
    it('preserves combat roll information', () => {
      const input = 'Player hits enemy [Roll: 15/20] SUGGESTED_ACTIONS: []';
      expect(cleanCombatLogEntry(input)).toBe('Player hits enemy [Roll: 15/20]');
    });

    it('removes complex JSON metadata from combat entries', () => {
      const input = 'Prospector ACQUIRED_ITEMS: [] REMOVED_ITEMS: [] SUGGESTED_ACTIONS: [{"text": "Throw a punch", "type": "combat", "context": "Attack the prospector"}, {"text": "Search the prospector\'s pockets", "type": "interaction", "context": "Attempt to rob the prospector"}, {"text": "Run back into the saloon", "type": "basic", "context": "Escape the fight"}] grapples with Weak Hold (Roll: 3) dealing 1 damage to leftArm';
      expect(cleanCombatLogEntry(input)).toBe('Prospector grapples with Weak Hold (Roll: 3) dealing 1 damage to leftArm');
    });

    it('handles multiline metadata blocks', () => {
      const input = `Prospector

ACQUIRED_ITEMS: []
REMOVED_ITEMS: []
SUGGESTED_ACTIONS: [{"text": "Throw a punch", "type": "combat", "context": "Attack the prospector"}] punches with Miss (Roll: 2) dealing 0 damage to head`;
      expect(cleanCombatLogEntry(input)).toBe('Prospector punches with Miss (Roll: 2) dealing 0 damage to head');
    });

    it('handles multiple consecutive multiline metadata blocks', () => {
      const input = `Prospector

ACQUIRED_ITEMS: []
REMOVED_ITEMS: []
SUGGESTED_ACTIONS: [{"text": "Throw a punch"}]
ACQUIRED_ITEMS: []
REMOVED_ITEMS: [] punches with Miss (Roll: 2) dealing 0 damage to head`;
      expect(cleanCombatLogEntry(input)).toBe('Prospector punches with Miss (Roll: 2) dealing 0 damage to head');
    });

    it('handles nested JSON metadata within markers', () => {
      const input = 'Player SUGGESTED_ACTIONS: [{"text": "Attack", "type": "combat"}] attacks ACQUIRED_ITEMS: [] with sword';
      expect(cleanCombatLogEntry(input)).toBe('Player attacks with sword');
    });
  });

  describe('toSentenceCase', () => {
    it('preserves proper nouns', () => {
      expect(toSentenceCase('John walks to The Saloon'))
        .toBe('John walks to The Saloon');
    });
  });

  describe('extractItemUpdates', () => {
    it('prioritizes explicit metadata over natural language', () => {
      const input = `
        ACQUIRED_ITEMS: [Revolver]
        You quickly grab the health potion.
      `;
      const updates = extractItemUpdates(input);
      expect(updates.acquired).toEqual(['Revolver']);
      expect(updates.removed).toEqual([]);
    });

    it('ignores narrative descriptions that contain item-like words', () => {
      const input = 'The presence of your trusty six-shooter reassures you.';
      const updates = extractItemUpdates(input);
      expect(updates.acquired).toEqual([]);
      expect(updates.removed).toEqual([]);
    });

    it('detects items from metadata markers', () => {
      const input = 'ACQUIRED_ITEMS: [Gun, Knife] REMOVED_ITEMS: [Bullets]';
      const updates = extractItemUpdates(input);
      expect(updates.acquired).toEqual(['Gun', 'Knife']);
      expect(updates.removed).toEqual(['Bullets']);
    });

    it('detects compound items from take commands', () => {
      const input = `
        Player: Take the liquid in the spittoon
        `;
      const updates = extractItemUpdates(input);
      expect(updates.acquired).toEqual(['liquid in the spittoon']);
    });
    
    it('detects items from use commands', () => {
      const input = `
        Player: Use your whiskey bottle
        `;
      const updates = extractItemUpdates(input);
      expect(updates.acquired).toEqual([]);
      expect(updates.removed).toEqual(['whiskey bottle']);
    });
    
    it('detects items from GM responses with various verbs', () => {
      const input = `
        GM: You pick up the liquid into your mug.
        GM: You uncork a whiskey bottle.
        GM: You lose the bottle.
        `;
      const updates = extractItemUpdates(input);
      expect(updates.acquired).toEqual(['liquid', 'whiskey bottle']);
      expect(updates.removed).toEqual(['bottle']);
    });
    
    it('handles commands with and without "the"', () => {
      const input = `
        Player: Take liquid
        Player: Take the bottle
        `;
      const updates = extractItemUpdates(input);
      expect(updates.acquired).toEqual(['liquid', 'bottle']);
      expect(updates.removed).toEqual([]);
    });
    
    it('handles multiple item updates in sequence', () => {
      const input = `
        Player: Take the liquid in the spittoon
        Player: Use the Whiskey bottle
        `;
      const updates = extractItemUpdates(input);
      expect(updates.acquired).toEqual(['liquid in the spittoon']);
      expect(updates.removed).toEqual(['Whiskey bottle']);
    });
  });
});
