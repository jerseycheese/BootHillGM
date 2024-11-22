import { cleanText } from '../../utils/textCleaningUtils';

describe('cleanText', () => {
  const testCases = [
    {
      name: 'metadata markers',
      input: 'Player SUGGESTED_ACTIONS: [{"text": "action"}] hits enemy',
      expected: 'Player hits enemy'
    },
    {
      name: 'multiline metadata',
      input: 'Player\nACQUIRED_ITEMS: [item]\nREMOVED_ITEMS: []',
      expected: 'Player'
    },
    {
      name: 'combat rolls',
      input: 'Player hits [Roll: 15/20] with damage',
      expected: 'Player hits with damage'
    },
    {
      name: 'combat status',
      input: 'Player (Unconscious) falls',
      expected: 'Player falls'
    }
  ];

  testCases.forEach(({ name, input, expected }) => {
    test(`handles ${name}`, () => {
      expect(cleanText(input)).toBe(expected);
    });
  });

  test('handles empty/undefined input', () => {
    expect(cleanText('')).toBe('');
    expect(cleanText('  ')).toBe('');
    expect(cleanText(undefined)).toBe('');
  });
});
