import { render, screen, fireEvent } from '@testing-library/react';
import { LoadingScreen } from '../../components/GameArea/LoadingScreen';

describe('LoadingScreen', () => {
  test('renders basic loading state', () => {
    render(<LoadingScreen />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles different loading types', () => {
    const { rerender } = render(<LoadingScreen type="session" />);
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();

    rerender(<LoadingScreen type="combat" />);
    expect(screen.getByText('Preparing combat...')).toBeInTheDocument();

  });

  test('shows error state with retry', () => {
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

});
