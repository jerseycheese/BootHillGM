import React from 'react';
import { render, screen } from '@testing-library/react';
import { NarrativeContent } from '../../components/NarrativeContent';
import { NarrativeDisplay } from '../../components/NarrativeDisplay';
import { NarrativeItem } from '../../components/NarrativeDisplay';

describe('NarrativeContent', () => {
  const processedUpdates = new Set<string>();

  beforeEach(() => {
    processedUpdates.clear();
  });

  const renderContent = (item: NarrativeItem) => {
    render(<NarrativeContent item={item} processedUpdates={processedUpdates} />);
  };

  const testCases = [
    {
      name: 'player action',
      item: { type: 'player-action', content: 'swings sword' } as NarrativeItem,
      expectedClasses: [
        'player-action',
        'border-l-4',
        'border-saddle-brown',
        'pl-4',
        'bg-opacity-5',
        'hover:bg-opacity-10',
        'transition-colors',
        'duration-300',
        'animate-highlight'
      ],
      testId: 'player-action'
    },
    {
      name: 'GM response',
      item: { type: 'gm-response', content: 'hits target' } as NarrativeItem,
      expectedClasses: ['gm-response', 'border-l-4', 'border-dusty-red', 'pl-4'],
      testId: 'gm-response'
    },
    {
      name: 'narrative',
      item: { type: 'narrative', content: 'The room is dark' } as NarrativeItem,
      expectedClasses: ['narrative-line', 'font-western-text', 'leading-relaxed']
    }
  ];

  testCases.forEach(({ name, item, expectedClasses, testId }) => {
    test(`renders ${name} correctly`, () => {
      renderContent(item);
      const element = testId ? 
        screen.getByTestId(testId) : 
        screen.getByText(item.content);
      expect(element).toHaveClass(...expectedClasses);
    });
  });

  describe('item updates', () => {
    const createItemUpdate = (
      updateType: 'acquired' | 'used',
      items: string[]
    ): NarrativeItem => ({
      type: 'item-update',
      content: '',
      metadata: { updateType, items }
    });

    test('handles acquired items', () => {
      const items = ['sword', 'shield'];
      const itemUpdate = createItemUpdate('acquired', items);
      renderContent(itemUpdate);
      const element = screen.getByTestId('item-update-acquired');
      expect(element).toHaveClass('item-update', 'item-update-acquired', 'rounded-sm', 'my-2', 'py-1', 'px-4');
      expect(element).toHaveTextContent(`Acquired Items: ${items.sort().join(', ')}`);
    });

    test('handles used items', () => {
      const items = ['potion'];
      const itemUpdate = createItemUpdate('used', items);
      renderContent(itemUpdate);
      const element = screen.getByTestId('item-update-used');
      expect(element).toHaveClass('item-update', 'item-update-used', 'rounded-sm', 'my-2', 'py-1', 'px-4');
      expect(element).toHaveTextContent(`Used/Removed Items: ${items.sort().join(', ')}`);
    });

    test('deduplicates item updates', () => {
      const items = ['sword'];
      const itemUpdate = createItemUpdate('acquired', items);
      renderContent(itemUpdate);
      renderContent(itemUpdate);
      expect(screen.getAllByTestId('item-update-acquired')).toHaveLength(1);
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

  describe('NarrativeContent', () => {
    const processedUpdates = new Set<string>();

    beforeEach(() => {
      processedUpdates.clear();
    });

    test('properly handles empty content', () => {
      const item = { 
        type: 'narrative', 
        content: '', 
        metadata: { isEmpty: true } 
      } as NarrativeItem;
      
      render(<NarrativeContent item={item} processedUpdates={processedUpdates} />);
      const spacer = screen.getByTestId('empty-spacer');
      expect(spacer).toBeInTheDocument();
      expect(spacer).toHaveAttribute('role', 'separator');
      expect(spacer).toHaveAttribute('aria-hidden', 'true');
    });

    test('skips rendering invalid content', () => {
      const item = {
        type: 'narrative',
        content: 'some undefined content with undefined'
      } as NarrativeItem;
      
      const { container } = render(
        <NarrativeContent item={item} processedUpdates={processedUpdates} />
      );
      expect(container.firstChild).toBeNull();
    });

    test('properly deduplicates item updates', () => {
      const itemUpdate = {
        type: 'item-update',
        content: '',
        metadata: {
          updateType: 'acquired',
          items: ['Sword', 'Shield']
        }
      } as NarrativeItem;

      // Render same update twice
      render(<NarrativeContent item={itemUpdate} processedUpdates={processedUpdates} />);
      const firstRender = screen.getByTestId('item-update-acquired');
      
      render(<NarrativeContent item={itemUpdate} processedUpdates={processedUpdates} />);
      const duplicates = screen.getAllByTestId('item-update-acquired');

      expect(duplicates).toHaveLength(1);
      expect(firstRender).toHaveTextContent('Acquired Items: shield, sword');
    });

    test('handles invalid item updates', () => {
      const invalidUpdate = {
        type: 'item-update',
        content: '',
        metadata: {
          updateType: 'acquired',
          items: ['SUGGESTED_ACTIONS']
        }
      } as NarrativeItem;

      const { container } = render(
        <NarrativeContent item={invalidUpdate} processedUpdates={processedUpdates} />
      );
      expect(container.firstChild).toBeNull();
    });

    test('adds log role to player actions', () => {
      const playerAction = {
        type: 'player-action',
        content: 'draws weapon'
      } as NarrativeItem;

      render(<NarrativeContent item={playerAction} processedUpdates={processedUpdates} />);
      expect(screen.getByTestId('player-action')).toHaveAttribute('role', 'log');
    });

    test('sorts item updates alphabetically', () => {
      const itemUpdate = {
        type: 'item-update',
        content: '',
        metadata: {
          updateType: 'acquired',
          items: ['Knife', 'Gun', 'Ammo']
        }
      } as NarrativeItem;

      render(<NarrativeContent item={itemUpdate} processedUpdates={processedUpdates} />);
      const update = screen.getByTestId('item-update-acquired');
      expect(update).toHaveTextContent('Acquired Items: ammo, gun, knife');
    });

    test('normalizes item names in updates', () => {
      const itemUpdate = {
        type: 'item-update',
        content: '',
        metadata: {
          updateType: 'acquired',
          items: ['  Gun  ', 'AMMO', 'Silver  Bullets  ']
        }
      } as NarrativeItem;

      render(<NarrativeContent item={itemUpdate} processedUpdates={processedUpdates} />);
      const update = screen.getByTestId('item-update-acquired');
      expect(update).toHaveTextContent('Acquired Items: ammo, gun, silver bullets');
    });

    test('handles narrative line type correctly', () => {
      const item = {
        type: 'narrative',
        content: 'Test narrative content'
      } as NarrativeItem;

      render(<NarrativeContent item={item} processedUpdates={processedUpdates} />);
      expect(screen.getByTestId('narrative-line')).toHaveTextContent('Test narrative content');
    });
  });
});
