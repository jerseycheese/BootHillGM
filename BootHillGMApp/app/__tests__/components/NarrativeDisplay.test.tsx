import { render, screen, fireEvent, act } from '@testing-library/react';
import { NarrativeDisplay } from '../../components/NarrativeDisplay';

describe('NarrativeDisplay', () => {
  const mockNarrative = 'Test narrative content';
  const mockError = 'Test error message';
  const mockRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
    // Mock scrollHeight and clientHeight
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: 1000
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 500
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders narrative content with proper formatting', () => {
    const formattedNarrative = `
Player: Look around
Game Master: You see a dusty saloon
Regular narrative text
    `;
    
    render(<NarrativeDisplay narrative={formattedNarrative} />);
    
    expect(screen.getByText('Player: Look around')).toHaveClass('player-action');
    expect(screen.getByText('GM: You see a dusty saloon')).toHaveClass('gm-response');
    expect(screen.getByText('Regular narrative text')).toHaveClass('narrative-line');
  });

  test('auto-scrolls when new content is added', () => {
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
    act(() => {
      fireEvent.scroll(container, {
        target: { scrollTop: 0 }
      });
    });
    
    // Add new content
    rerender(<NarrativeDisplay narrative="Initial content\nNew content" />);
    
    // Verify scroll position wasn't automatically updated
    expect(container.scrollTop).toBe(0);
  });

  test('handles error states correctly', () => {
    render(
      <NarrativeDisplay 
        narrative={mockNarrative} 
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

  test('maintains empty line spacing', () => {
    const narrativeWithEmptyLines = `Line 1\n\nLine 2`;
    render(<NarrativeDisplay narrative={narrativeWithEmptyLines} />);
    
    const emptySpacers = document.getElementsByClassName('h-2');
    expect(emptySpacers.length).toBe(1);
  });
});
