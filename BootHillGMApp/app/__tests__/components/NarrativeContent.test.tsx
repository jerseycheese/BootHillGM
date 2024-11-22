import { render, screen } from '@testing-library/react';
import { NarrativeDisplay } from '../../components/NarrativeDisplay';
import { NarrativeItem, ContentType } from '../../components/NarrativeDisplay';
import { NarrativeContent } from '../../components/NarrativeContent';

describe('NarrativeContent', () => {
  const processedUpdates = new Set<string>();

  beforeEach(() => {
    processedUpdates.clear();
  });

  const renderContent = (item: NarrativeItem) => {
    console.log('Rendering item:', item);
    render(<NarrativeContent item={item} processedUpdates={processedUpdates} />);
  };

  const testCases = [
    {
      name: 'player action',
      item: { type: 'player-action' as ContentType, content: 'swings sword' },
      expectedClass: 'border-green-500',
      testId: 'player-action'
    },
    {
      name: 'GM response',
      item: { type: 'gm-response' as ContentType, content: 'hits target' },
      expectedClass: 'border-blue-500',
      testId: 'gm-response'
    },
    {
      name: 'narrative',
      item: { type: 'narrative' as ContentType, content: 'The room is dark' },
      expectedClass: 'narrative-line'
    }
  ];

  testCases.forEach(({ name, item, expectedClass, testId }) => {
    test(`renders ${name} correctly`, () => {
      renderContent(item);
      const element = testId ? 
        screen.getByTestId(testId) : 
        screen.getByText(item.content);
      expect(element).toHaveClass(expectedClass);
    });
  });

  describe('item updates', () => {
    const createItemUpdate = (
      updateType: 'acquired' | 'used',
      items: string[]
    ): NarrativeItem => ({
      type: 'item-update' as ContentType,
      content: '',
      metadata: { updateType, items }
    });

    test('handles acquired items', () => {
      const items = ['sword', 'shield'];
      const itemUpdate = createItemUpdate('acquired', items);
      console.log('Item update:', itemUpdate);
      renderContent(itemUpdate);
      const element = screen.getByTestId('item-update-acquired');
      expect(element).toHaveClass('bg-amber-50', 'border-amber-400');
      expect(element).toHaveTextContent(`Acquired Items: ${items.sort().join(', ')}`);
    });

    test('handles used items', () => {
      const items = ['potion'];
      const itemUpdate = createItemUpdate('used', items);
      console.log('Item update:', itemUpdate);
      renderContent(itemUpdate);
      const element = screen.getByTestId('item-update-used');
      expect(element).toHaveClass('bg-gray-50', 'border-gray-400');
      expect(element).toHaveTextContent(`Used/Removed Items: ${items.sort().join(', ')}`);
    });

    test('deduplicates item updates', () => {
      const items = ['sword'];
      const itemUpdate = createItemUpdate('acquired', items);
      console.log('Item update:', itemUpdate);
      renderContent(itemUpdate);
      renderContent(itemUpdate);
      expect(screen.getAllByTestId('item-update-acquired')).toHaveLength(1);
    });
  });
});

describe('NarrativeContent - Item Update Deduplication', () => {
  it('should only render unique item updates once', () => {
    // Create a narrative with duplicate item updates
    const narrative = `
      Player: searches the chest
      GM: You find a golden key and a silver ring
      ACQUIRED_ITEMS: golden key, silver ring
      Player: looks deeper in the chest
      GM: You find more items
      ACQUIRED_ITEMS: golden key, silver ring
      SUGGESTED_ACTIONS: [{"text": "Use the key", "type": "basic"}]
    `;

    render(<NarrativeDisplay narrative={narrative} />);

    // Get all item update elements
    const itemUpdates = screen.getAllByTestId('item-update-acquired');
    
    // Verify only one update is rendered
    expect(itemUpdates).toHaveLength(1);
    
    // Verify the content is correct
    expect(itemUpdates[0]).toHaveTextContent('Acquired Items: golden key, silver ring');

    // Verify the items are in alphabetical order
    const updateText = itemUpdates[0].textContent;
    expect(updateText).toMatch(/golden key.*silver ring/);
  });

  it('should handle multiple different item updates correctly', () => {
    const narrative = `
      Player: searches the chest
      GM: You find a golden key
      ACQUIRED_ITEMS: golden key
      Player: uses the key
      GM: You use the key to open a door
      REMOVED_ITEMS: golden key
      Player: finds a potion
      GM: You discover a healing potion
      ACQUIRED_ITEMS: healing potion
    `;

    render(<NarrativeDisplay narrative={narrative} />);

    // Get all item updates
    const acquiredUpdates = screen.getAllByTestId('item-update-acquired');
    const removedUpdates = screen.getAllByTestId('item-update-used');

    // Verify correct number of updates
    expect(acquiredUpdates).toHaveLength(2); // golden key and healing potion
    expect(removedUpdates).toHaveLength(1); // golden key removed

    // Verify content and order
    expect(acquiredUpdates[0]).toHaveTextContent('Acquired Items: golden key');
    expect(removedUpdates[0]).toHaveTextContent('Used/Removed Items: golden key');
    expect(acquiredUpdates[1]).toHaveTextContent('Acquired Items: healing potion');
  });

  it('should handle mixed case and spacing variations in item names', () => {
    const narrative = `
      GM: You find some items
      ACQUIRED_ITEMS: Golden KEY, Silver  Ring
      Player: searches more
      GM: You find more items
      ACQUIRED_ITEMS: golden key,   silver ring
    `;

    render(<NarrativeDisplay narrative={narrative} />);

    const itemUpdates = screen.getAllByTestId('item-update-acquired');
    
    // Verify only one update is rendered despite case/spacing differences
    expect(itemUpdates).toHaveLength(1);
    
    // Verify normalized content
    expect(itemUpdates[0]).toHaveTextContent('Acquired Items: golden key, silver ring');
  });

  it('should ignore empty or invalid item updates', () => {
    const narrative = `
      GM: You search but find nothing
      ACQUIRED_ITEMS:
      REMOVED_ITEMS:
      ACQUIRED_ITEMS: , ,
      Player: keeps searching
      ACQUIRED_ITEMS: golden key
    `;

    render(<NarrativeDisplay narrative={narrative} />);

    const itemUpdates = screen.getAllByTestId('item-update-acquired');
    
    // Verify only valid updates are rendered
    expect(itemUpdates).toHaveLength(1);
    expect(itemUpdates[0]).toHaveTextContent('Acquired Items: golden key');
  });

  it('should handle SUGGESTED_ACTIONS mixed with item updates', () => {
    const narrative = `
      GM: You find a weapon
      ACQUIRED_ITEMS: silver sword
      SUGGESTED_ACTIONS: [{"text": "Equip the sword", "type": "basic"}]
      ACQUIRED_ITEMS: silver sword
      Player: looks around
      SUGGESTED_ACTIONS: [{"text": "Search more", "type": "basic"}]
    `;

    render(<NarrativeDisplay narrative={narrative} />);

    const itemUpdates = screen.getAllByTestId('item-update-acquired');
    
    // Verify only one update is rendered and SUGGESTED_ACTIONS are ignored
    expect(itemUpdates).toHaveLength(1);
    expect(itemUpdates[0]).toHaveTextContent('Acquired Items: silver sword');
    
    // Verify SUGGESTED_ACTIONS text is not rendered
    const narrativeContent = screen.getByTestId('narrative-display');
    expect(narrativeContent).not.toHaveTextContent('SUGGESTED_ACTIONS');
    expect(narrativeContent).not.toHaveTextContent('Equip the sword');
  });
});
