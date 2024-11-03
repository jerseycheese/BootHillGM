import { render, screen } from '@testing-library/react';
import { LoadingScreen } from '../../components/GameArea/LoadingScreen';

describe('LoadingScreen', () => {
  test('renders default loading screen', () => {
    render(<LoadingScreen />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
    expect(screen.getByText('If loading persists, try navigating to another page and back.')).toBeInTheDocument();
  });

  test('renders with custom messages', () => {
    render(
      <LoadingScreen 
        message="Custom loading message" 
        subMessage="Custom sub-message"
      />
    );
    
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
    expect(screen.getByText('Custom sub-message')).toBeInTheDocument();
  });

  test('renders different sizes', () => {
    const { rerender } = render(<LoadingScreen size="small" />);
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    
    rerender(<LoadingScreen size="large" />);
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
  });

  test('handles section mode', () => {
    render(<LoadingScreen fullscreen={false} />);
    expect(screen.getByTestId('loading-screen')).toHaveClass('wireframe-section');
  });
});
