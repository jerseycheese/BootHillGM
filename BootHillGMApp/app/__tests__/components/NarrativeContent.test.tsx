import { render, screen } from '@testing-library/react';
import { NarrativeDisplay } from '../../components/NarrativeDisplay';

describe('NarrativeContent', () => {
  it('renders player action with correct styling', () => {
    render(<NarrativeDisplay narrative="Player: takes a step forward" />);
    const playerAction = screen.getByText('Player: takes a step forward');
    expect(playerAction).toHaveClass('player-action', 'border-l-4', 'border-green-500');
  });

  it('renders GM response with correct styling', () => {
    render(<NarrativeDisplay narrative="GM: You move forward cautiously" />);
    const gmResponse = screen.getByText('GM: You move forward cautiously');
    expect(gmResponse).toHaveClass('gm-response', 'border-l-4', 'border-blue-500');
  });

  it('renders acquired item updates with correct styling', () => {
    const narrative = `
      Player: searches the chest
      GM: You find a golden key
      ACQUIRED_ITEMS: golden key
    `;
    render(<NarrativeDisplay narrative={narrative} />);
    const itemUpdate = screen.getByTestId('item-update-acquired');
    expect(itemUpdate).toHaveClass('bg-amber-50', 'border-amber-400');
    expect(itemUpdate).toHaveTextContent('Acquired Items: golden key');
  });

  it('renders used/removed item updates with correct styling', () => {
    const narrative = `
      Player: uses the key
      REMOVED_ITEMS: golden key
    `;
    render(<NarrativeDisplay narrative={narrative} />);
    const itemUpdate = screen.getByTestId('item-update-used');
    expect(itemUpdate).toHaveClass('bg-gray-50', 'border-gray-400');
    expect(itemUpdate).toHaveTextContent('Used/Removed Items: golden key');
  });

  it('renders narrative text without special styling', () => {
    const narrativeText = 'The room is dark and cold.';
    const { container } = render(<NarrativeDisplay narrative={narrativeText} />);
    const narrativeElement = container.querySelector('.narrative-line');
    expect(narrativeElement).toBeInTheDocument();
    expect(narrativeElement?.textContent).toBe(narrativeText);
  });

  it('handles empty lines with spacing', () => {
    const narrative = `Line 1\n\nLine 2`;
    render(<NarrativeDisplay narrative={narrative} />);
    const spacer = screen.getByText('Line 1').nextElementSibling;
    expect(spacer).toHaveClass('h-2');
  });

  it('renders error state with retry button', () => {
    const onRetry = jest.fn();
    render(
      <NarrativeDisplay 
        narrative="" 
        error="An error occurred" 
        onRetry={onRetry} 
      />
    );
    
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('processes and renders complex narrative interactions', () => {
    const narrative = `
      Player: enters the room
      GM: The room is dimly lit by torches
      Player: examines the chest
      GM: You find some valuable items
      ACQUIRED_ITEMS: gold coins, silver ring
      The chest creaks as you close it
    `;

    render(<NarrativeDisplay narrative={narrative} />);

    expect(screen.getByText('Player: enters the room')).toHaveClass('player-action');
    expect(screen.getByText('GM: The room is dimly lit by torches')).toHaveClass('gm-response');
    expect(screen.getByText('Player: examines the chest')).toHaveClass('player-action');
    expect(screen.getByText('GM: You find some valuable items')).toHaveClass('gm-response');
    expect(screen.getByTestId('item-update-acquired')).toHaveTextContent('Acquired Items: gold coins, silver ring');
    expect(screen.getByText('The chest creaks as you close it')).toHaveClass('narrative-line');
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
