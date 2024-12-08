import { buildGamePrompt } from '../../../services/ai/promptBuilder';
import { InventoryItem } from '../../../types/inventory';

describe('promptBuilder', () => {
  test('should build basic prompt', () => {
    const prompt = buildGamePrompt(
      'look around',
      'You entered the saloon',
      []
    );

    expect(prompt).toContain('You are an AI Game Master');
    expect(prompt).toContain('look around');
    expect(prompt).toContain('You entered the saloon');
  });

  test('should include inventory items', () => {
    const inventory: InventoryItem[] = [
      {
        id: '1', name: 'Gun', quantity: 1, description: 'A rusty revolver',
        category: 'weapon'
      },
      {
        id: '2', name: 'Bullets', quantity: 6, description: 'Six rounds',
        category: 'weapon'
      }
    ];

    const prompt = buildGamePrompt(
      'check inventory',
      'test context',
      inventory
    );

    expect(prompt).toContain('Gun (x1)');
    expect(prompt).toContain('Bullets (x6)');
  });

  test('should handle empty context and inventory', () => {
    const prompt = buildGamePrompt('test action', '', []);
    
    expect(prompt).toContain('test action');
    expect(prompt).toContain('Recent story events:');
    expect(prompt).toContain('ACQUIRED_ITEMS:');
    expect(prompt).toContain('REMOVED_ITEMS:');
  });

  test('should include all required AI instructions', () => {
    const prompt = buildGamePrompt('test action', 'test context', []);
    
    expect(prompt).toContain('complete free will');
    expect(prompt).toContain('ACQUIRED_ITEMS:');
    expect(prompt).toContain('REMOVED_ITEMS:');
    expect(prompt).toContain('Player input:');
  });

  test('should sanitize special characters in inputs', () => {
    const prompt = buildGamePrompt(
      'use "health potion"',
      'Player\'s health is low',
      []
    );
    
    expect(prompt).toContain('use "health potion"');
    expect(prompt).toContain('Player\'s health is low');
    expect(prompt).not.toContain('undefined');
  });

  test('should include multi-line context correctly', () => {
    const multiLineContext = `First line
    Second line
    Third line`;

    const prompt = buildGamePrompt('test action', multiLineContext, []);
    expect(prompt).toContain('First line');
    expect(prompt).toContain('Second line');
    expect(prompt).toContain('Third line');
  });
});
