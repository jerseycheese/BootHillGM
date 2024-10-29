import { parseAIResponse } from '../../../services/ai/responseParser';

describe('responseParser', () => {
  test('should clean metadata markers from combat text', () => {
    const input = `
Combat
Attack
Player Health: 67
Opponent Health: 100
Dusty McTrigger ACQUIRED_ITEMS: REMOVED_ITEMS: misses Shopkeeper! (Roll: 73, Target: 61)
Shopkeeper ACQUIRED_ITEMS: REMOVED_ITEMS: hits Dusty McTrigger for 5 damage! (Roll: 60, Target: 62)
    `;

    const result = parseAIResponse(input);

    expect(result.narrative).toContain('Dusty McTrigger misses Shopkeeper!');
    expect(result.narrative).toContain('Shopkeeper hits Dusty McTrigger for 5 damage!');
    expect(result.narrative).not.toContain('ACQUIRED_ITEMS:');
    expect(result.narrative).not.toContain('REMOVED_ITEMS:');
  });

  test('should handle combat text with inventory changes', () => {
    const input = `
Combat ensues!
ACQUIRED_ITEMS: [Gun, Bullets]
REMOVED_ITEMS: [Money]
Player attacks bandit ACQUIRED_ITEMS: REMOVED_ITEMS: and hits! (Roll: 45, Target: 50)
    `;

    const result = parseAIResponse(input);

    expect(result.narrative).toContain('Combat ensues!');
    expect(result.narrative).toContain('Player attacks bandit and hits!');
    expect(result.narrative).not.toContain('ACQUIRED_ITEMS:');
    expect(result.narrative).not.toContain('REMOVED_ITEMS:');
    expect(result.acquiredItems).toEqual(['Gun', 'Bullets']);
    expect(result.removedItems).toEqual(['Money']);
  });

  test('should handle combat initiation with opponent name', () => {
    const input = `
A menacing figure appears!
COMBAT: Angry Bandit ACQUIRED_ITEMS: REMOVED_ITEMS:
The bandit draws his gun!
    `;

    const result = parseAIResponse(input);

    expect(result.narrative).toContain('A menacing figure appears!');
    expect(result.narrative).toContain('The bandit draws his gun!');
    expect(result.opponent?.name).toBe('Angry Bandit');
    expect(result.narrative).not.toContain('ACQUIRED_ITEMS:');
    expect(result.narrative).not.toContain('REMOVED_ITEMS:');
  });

  test('should preserve combat roll information', () => {
    const input = `
Combat round:
Player ACQUIRED_ITEMS: REMOVED_ITEMS: attacks with (Roll: 75, Target: 70)
    `;

    const result = parseAIResponse(input);

    expect(result.narrative).toContain('Combat round:');
    expect(result.narrative).toContain('Player attacks with (Roll: 75, Target: 70)');
    expect(result.narrative).not.toContain('ACQUIRED_ITEMS:');
    expect(result.narrative).not.toContain('REMOVED_ITEMS:');
  });
});
