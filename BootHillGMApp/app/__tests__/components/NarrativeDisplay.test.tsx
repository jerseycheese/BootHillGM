import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NarrativeDisplay } from '../../components/NarrativeDisplay';

describe('NarrativeDisplay', () => {
  const mockError = 'Test error message';
  const mockRetry = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('emphasizes player actions with distinct styling', () => {
    const narrative = `
      Player: draws weapon
      Game Master: You ready your weapon
      Regular narrative text
      Player: aims carefully
    `;
    
    render(<NarrativeDisplay narrative={narrative} />);
    
    const playerActions = screen.getAllByTestId('player-action');
    expect(playerActions).toHaveLength(2);
    playerActions.forEach(action => {
      expect(action).toHaveClass(
        'player-action',
        'border-l-4',
        'border-saddle-brown',
        'pl-4',
        'bg-opacity-5',
        'hover:bg-opacity-10',
        'transition-colors',
        'duration-300',
        'animate-highlight'
      );
    });
  });

  test('maintains proper ordering of different content types', () => {                                                                   
    const narrative = 'Player: enters saloon\nGM: The room falls silent\nACQUIRED_ITEMS: [Whiskey]\nRegular narrative continues';        
                                                                                                                                         
    render(<NarrativeDisplay narrative={narrative} />);                                                                                  
                                                                                                                                         
    const playerAction = screen.getByTestId('player-action');                                                                            
    const gmResponse = screen.getByTestId('gm-response');                                                                                
    const itemUpdate = screen.getByTestId('item-update-acquired');                                                                       
    const narrativeLine = screen.getByTestId('narrative-line');                                                                          
                                                                                                                                         
    // Verify all elements are present                                                                                                   
    expect(playerAction).toBeInTheDocument();                                                                                            
    expect(gmResponse).toBeInTheDocument();                                                                                              
    expect(itemUpdate).toBeInTheDocument();                                                                                              
    expect(narrativeLine).toBeInTheDocument();                                                                                           
                                                                                                                                         
    // Verify relative ordering                                                                                                          
    expect(playerAction.compareDocumentPosition(gmResponse) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();                            
    expect(gmResponse.compareDocumentPosition(itemUpdate) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();                              
    expect(itemUpdate.compareDocumentPosition(narrativeLine) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('handles auto-scrolling behavior correctly', () => {
    const { rerender } = render(<NarrativeDisplay narrative="Initial content" />);
    
    const container = screen.getByTestId('narrative-display');
    const scrollSpy = jest.spyOn(container, 'scrollTop', 'set');
    
    rerender(<NarrativeDisplay narrative="Initial content\nNew content" />);
    
    expect(scrollSpy).toHaveBeenCalled();
  });

  test('disables auto-scroll when user manually scrolls up', () => {
    const { rerender } = render(<NarrativeDisplay narrative="Initial content" />);
    
    const container = screen.getByTestId('narrative-display');
    
    // Simulate manual scroll
    fireEvent.scroll(container, {
      target: { scrollTop: 0 }
    });
    
    // Add new content
    rerender(<NarrativeDisplay narrative="Initial content\nNew content" />);
    
    // Verify scroll position wasn't automatically updated
    expect(container.scrollTop).toBe(0);
  });

  test('deduplicates item updates while maintaining order', () => {
    const narrative = `
      Player: searches the chest
      ACQUIRED_ITEMS: [Gold, Silver]
      GM: You find more items
      ACQUIRED_ITEMS: [Gold, Silver]
    `;
    
    render(<NarrativeDisplay narrative={narrative} />);
    
    const itemUpdates = screen.getAllByTestId('item-update-acquired');
    expect(itemUpdates).toHaveLength(1);
    expect(itemUpdates[0]).toHaveTextContent('Acquired Items: gold, silver');
  });

  test('handles error display and retry functionality', () => {
    render(
      <NarrativeDisplay 
        narrative="Test narrative"
        error={mockError}
        onRetry={mockRetry}
      />
    );
    
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toHaveTextContent(mockError);
    
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  test('preserves empty lines for narrative pacing', () => {
    const narrativeWithEmptyLines = `Line 1\n\nLine 2`;
    render(<NarrativeDisplay narrative={narrativeWithEmptyLines} />);
    
    const emptySpacers = screen.getAllByTestId('empty-spacer');
    expect(emptySpacers).toHaveLength(1);
  });

  test('properly cleans metadata from text content', () => {
    const narrativeWithMetadata = `
      Player: takes action SUGGESTED_ACTIONS: [...] ACQUIRED_ITEMS: []
      GM: responds REMOVED_ITEMS: [] with text
    `;
    
    render(<NarrativeDisplay narrative={narrativeWithMetadata} />);
    
    const playerAction = screen.getByTestId('player-action');
    const gmResponse = screen.getByTestId('gm-response');
    
    expect(playerAction).toHaveTextContent('takes action');
    expect(gmResponse).toHaveTextContent('responds with text');
    expect(playerAction).not.toHaveTextContent('SUGGESTED_ACTIONS');
    expect(gmResponse).not.toHaveTextContent('REMOVED_ITEMS');
  });

  test('processes multiple narrative lines with proper spacing', () => {
    const multilineNarrative = 'Line 1\n\nLine 2\nPlayer: action\nGM: response';
    render(<NarrativeDisplay narrative={multilineNarrative} />);
    
    const narrativeLines = screen.getAllByTestId('narrative-line');
    expect(narrativeLines).toHaveLength(2);
    expect(narrativeLines[0]).toHaveTextContent('Line 1');
    expect(narrativeLines[1]).toHaveTextContent('Line 2');
    expect(screen.getByTestId('empty-spacer')).toBeInTheDocument();
    expect(screen.getByTestId('player-action')).toBeInTheDocument();
    expect(screen.getByTestId('gm-response')).toBeInTheDocument();
  });

  test('handles malformed input gracefully', () => {
    const malformedNarrative = 'ACQUIRED_ITEMS:\nPlayer:\nGM:';
    render(<NarrativeDisplay narrative={malformedNarrative} />);
    
    expect(screen.queryByTestId('item-update-acquired')).not.toBeInTheDocument();
  });
});
