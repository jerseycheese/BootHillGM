import { render, screen, fireEvent } from '@testing-library/react';
import NarrativeDisplay from '../../components/NarrativeDisplay';

describe('NarrativeDisplay', () => {
  const mockNarrative = 'Test narrative content';
  const mockError = 'Test error message';
  const mockRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders narrative content correctly', () => {
    render(<NarrativeDisplay narrative={mockNarrative} />);
    expect(screen.getByText(mockNarrative)).toBeInTheDocument();
  });

  test('handles long narrative content with scroll', () => {
    const longNarrative = 'A'.repeat(1000);
    const { container } = render(<NarrativeDisplay narrative={longNarrative} />);
    const narrativeContainer = container.firstChild as HTMLElement;
    expect(narrativeContainer).toHaveClass('overflow-y-auto');
  });

  test('preserves whitespace in narrative', () => {
    const formattedNarrative = 'Line 1\n  Indented line\nLine 3';
    render(<NarrativeDisplay narrative={formattedNarrative} />);
    const narrativeElement = screen.getByText(/Line 1/);
    expect(narrativeElement).toHaveClass('whitespace-pre-wrap');
  });

  test('does not render error section when no error provided', () => {
    render(<NarrativeDisplay narrative={mockNarrative} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  describe('error handling', () => {
    test('renders error message when error is provided', () => {
      render(
        <NarrativeDisplay 
          narrative={mockNarrative} 
          error={mockError}
        />
      );
      expect(screen.getByText(mockError)).toBeInTheDocument();
    });

    test('does not render error section when error is null', () => {
      render(
        <NarrativeDisplay 
          narrative={mockNarrative} 
          error={null}
        />
      );
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    test('does not render retry button when onRetry is not provided', () => {
      render(
        <NarrativeDisplay 
          narrative={mockNarrative} 
          error={mockError}
        />
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('renders retry button when both error and onRetry are provided', () => {
      render(
        <NarrativeDisplay 
          narrative={mockNarrative} 
          error={mockError}
          onRetry={mockRetry}
        />
      );
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    test('calls onRetry when retry button is clicked', () => {
      render(
        <NarrativeDisplay 
          narrative={mockNarrative} 
          error={mockError}
          onRetry={mockRetry}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    test('error message has appropriate text color for visibility', () => {
      render(
        <NarrativeDisplay 
          narrative={mockNarrative} 
          error={mockError}
        />
      );
      const errorElement = screen.getByText(mockError).parentElement;
      expect(errorElement).toHaveClass('text-red-500');
    });

    test('retry button has appropriate hover state', () => {
      render(
        <NarrativeDisplay 
          narrative={mockNarrative} 
          error={mockError}
          onRetry={mockRetry}
        />
      );
      const button = screen.getByRole('button', { name: /retry/i });
      expect(button).toHaveClass('hover:bg-red-200');
    });
  });
});
