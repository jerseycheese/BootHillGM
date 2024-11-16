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
    const narrative = container.querySelector('.narrative-line');
    expect(narrative).toBeInTheDocument();
    expect(narrative).toHaveTextContent(narrativeText);
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
