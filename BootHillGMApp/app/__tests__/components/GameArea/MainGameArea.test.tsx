import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MainGameArea } from '../../../components/GameArea/MainGameArea';
import { GameState } from '../../../types/campaign';
import { NarrativeProvider } from '../../../context/NarrativeContext';

// Mock NarrativeWithDecisions with proper rendering of newlines
jest.mock('../../../components/narrative/NarrativeWithDecisions', () => {
  return function MockNarrativeWithDecisions({ narrative, error, onRetry }) {
    // Split the narrative by newlines and join with <br/> elements to preserve line breaks
    const narrativeWithBreaks = narrative.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < narrative.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));

    return (
      <div data-testid="mock-narrative-with-decisions">
        <div data-testid="narrative-prop">{narrativeWithBreaks}</div>
        {error && <div data-testid="error-prop">{error}</div>}
        {onRetry && (
          <button data-testid="retry-button" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  };
});

// Mock GameplayControls
jest.mock('../../../components/GameArea/GameplayControls', () => ({
  GameplayControls: function MockGameplayControls() {
    return <div data-testid="mock-gameplay-controls">Gameplay Controls</div>;
  }
}));

// Wrap component with NarrativeProvider for testing
const renderWithNarrativeProvider = (ui) => {
  return render(
    <NarrativeProvider>
      {ui}
    </NarrativeProvider>
  );
};

describe('MainGameArea', () => {
  const mockState = {
    narrative: {
      narrativeHistory: ['Line 1', 'Line 2', 'Line 3']
    }
  } as unknown as GameState;

  const defaultProps = {
    state: mockState,
    dispatch: jest.fn(),
    isLoading: false,
    error: null,
    isCombatActive: false,
    opponent: null,
    handleUserInput: jest.fn(),
    retryLastAction: jest.fn(),
    handleCombatEnd: jest.fn(),
    handlePlayerHealthChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the MainGameArea with NarrativeWithDecisions', () => {
    renderWithNarrativeProvider(<MainGameArea {...defaultProps} />);
    
    // Check if NarrativeWithDecisions is rendered
    expect(screen.getByTestId('mock-narrative-with-decisions')).toBeInTheDocument();
    
    // Check for each line separately instead of expecting newlines in content
    expect(screen.getByTestId('narrative-prop')).toHaveTextContent('Line 1');
    expect(screen.getByTestId('narrative-prop')).toHaveTextContent('Line 2');
    expect(screen.getByTestId('narrative-prop')).toHaveTextContent('Line 3');
    
    // Check if GameplayControls is rendered
    expect(screen.getByTestId('mock-gameplay-controls')).toBeInTheDocument();
  });

  it('passes error and retry handler to NarrativeWithDecisions', () => {
    const props = {
      ...defaultProps,
      error: 'Test error',
    };
    
    renderWithNarrativeProvider(<MainGameArea {...props} />);
    
    // Check if error prop is passed correctly
    expect(screen.getByTestId('error-prop')).toHaveTextContent('Test error');
    
    // Check if retry button exists
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    
    // Simulate retry button click
    screen.getByTestId('retry-button').click();
    
    // Check if retry handler is called
    expect(defaultProps.retryLastAction).toHaveBeenCalledTimes(1);
  });

  it('renders with correct container classes', () => {
    renderWithNarrativeProvider(<MainGameArea {...defaultProps} />);
    
    // Check for container classes
    expect(screen.getByTestId('main-game-area-container')).toHaveClass('h-full');
    expect(screen.getByTestId('main-game-area-container')).toHaveClass('flex');
    expect(screen.getByTestId('main-game-area-container')).toHaveClass('flex-col');
    expect(screen.getByTestId('main-game-area-container')).toHaveClass('overflow-auto');
  });
});