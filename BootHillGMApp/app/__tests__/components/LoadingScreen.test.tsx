import { render, screen, fireEvent } from '@testing-library/react';
import { LoadingScreen } from '../../components/GameArea/LoadingScreen';

describe('LoadingScreen', () => {
  test('renders with default props', () => {
    render(<LoadingScreen />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders type-specific messages', () => {
    const { rerender } = render(<LoadingScreen type="session" />);
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();

    rerender(<LoadingScreen type="combat" />);
    expect(screen.getByText('Preparing combat...')).toBeInTheDocument();

    rerender(<LoadingScreen type="ai" />);
    expect(screen.getByText('Processing response...')).toBeInTheDocument();

    rerender(<LoadingScreen type="inventory" />);
    expect(screen.getByText('Updating inventory...')).toBeInTheDocument();

    rerender(<LoadingScreen type="general" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles error state with retry', () => {
    const mockRetry = jest.fn();
    render(
      <LoadingScreen 
        error="Test error" 
        onRetry={mockRetry} 
      />
    );

    expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalled();
  });

  test('applies size classes correctly', () => {
    const { container, rerender } = render(<LoadingScreen size="small" />);
    expect(container.querySelector('.h-4')).toBeInTheDocument();

    rerender(<LoadingScreen size="large" />);
    expect(container.querySelector('.h-12')).toBeInTheDocument();
  });

  test('toggles fullscreen mode', () => {
    const { container, rerender } = render(<LoadingScreen fullscreen={true} />);
    expect(container.firstChild).toHaveClass('wireframe-container');

    rerender(<LoadingScreen fullscreen={false} />);
    expect(container.firstChild).toHaveClass('wireframe-section');
  });
});
