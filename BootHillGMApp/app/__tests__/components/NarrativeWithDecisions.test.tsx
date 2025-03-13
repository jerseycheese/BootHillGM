import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NarrativeWithDecisions from '../../components/narrative/NarrativeWithDecisions';
import { PlayerDecision, DecisionImportance } from '../../types/narrative.types';

// Mock the useNarrativeContext hook
const mockRecordPlayerDecision = jest.fn();
const mockDecision: PlayerDecision = {
  id: 'test-decision-123',
  prompt: 'Test decision prompt',
  timestamp: Date.now(),
  options: [
    { id: 'option1', text: 'Option 1', impact: 'Impact 1' },
    { id: 'option2', text: 'Option 2', impact: 'Impact 2' }
  ],
  context: 'Test context',
  importance: 'moderate' as DecisionImportance,
  characters: [],
  aiGenerated: true
};

const mockUseNarrativeContext = {
  currentDecision: mockDecision,
  hasActiveDecision: true,
  recordPlayerDecision: mockRecordPlayerDecision,
  decisionHistory: []
};

jest.mock('../../hooks/useNarrativeContext', () => ({
  useNarrativeContext: () => mockUseNarrativeContext
}));

// Mock the NarrativeDisplay component
jest.mock('../../components/NarrativeDisplay', () => ({
  NarrativeDisplay: function MockNarrativeDisplay({
    narrative,
    error,
    onRetry
  }: {
    narrative: string;
    error: string | null;
    onRetry?: () => void;
  }) {
    return (
      <div data-testid="narrative-display">
        <div data-testid="narrative-text">{narrative}</div>
        {error && <div data-testid="narrative-error">{error}</div>}
        {onRetry && (
          <button data-testid="narrative-retry" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }
}));

// Mock PlayerDecisionCard component
jest.mock('../../components/player/PlayerDecisionCard', () => {
  return function MockPlayerDecisionCard({ 
    decision, 
    onDecisionMade 
  }: { 
    decision?: PlayerDecision; 
    onDecisionMade?: (decisionId: string, optionId: string) => void 
  }) {
    const handleSubmit = () => {
      if (decision && onDecisionMade) {
        onDecisionMade(decision.id, 'option1');
      }
    };
    
    if (!decision) return null;
    
    return (
      <div className="bhgm-decision-card bhgm-decision-moderate" data-testid="player-decision-card">
        <div className="bhgm-decision-importance-indicator">
          <span className="bhgm-decision-importance-label">moderate</span>
        </div>
        <div className="bhgm-decision-prompt">
          <h3>{decision.prompt}</h3>
        </div>
        <div className="bhgm-decision-options-container">
          <button
            className="bhgm-decision-option-button bhgm-decision-option-selected"
            data-testid="option-option1"
          >
            Option 1
          </button>
          <button
            className="bhgm-decision-option-button"
            data-testid="option-option2"
          >
            Option 2
          </button>
        </div>
        <div className="bhgm-decision-action-container">
          <button 
            className="bhgm-decision-submit-button" 
            onClick={handleSubmit} 
            data-testid="decision-submit-button"
          >
            Confirm Decision
          </button>
        </div>
      </div>
    );
  };
});

// No need to use NarrativeProvider in tests since we're mocking the hook directly

describe('NarrativeWithDecisions', () => {
  const mockProps = {
    narrative: 'Test narrative content',
    error: null,
    onRetry: jest.fn()
  };
  
  beforeEach(() => {
    // Reset mocks before each test
    mockRecordPlayerDecision.mockReset();
    mockRecordPlayerDecision.mockResolvedValue(undefined);
    mockProps.onRetry.mockReset();
    
    // Reset mock context
    mockUseNarrativeContext.hasActiveDecision = true;
    mockUseNarrativeContext.currentDecision = { ...mockDecision };
    
    // Clear any timers
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders both the decision card and narrative display with correct props', () => {
    render(<NarrativeWithDecisions {...mockProps} />);
    
    // After the animation delay, the decision should be visible
    jest.advanceTimersByTime(600);
    
    // Check that both components are rendered
    expect(screen.getByText('Test decision prompt')).toBeInTheDocument();
    expect(screen.getByTestId('narrative-display')).toBeInTheDocument();
    
    // Check that narrative is passed correctly
    expect(screen.getByTestId('narrative-text')).toHaveTextContent('Test narrative content');
    
    // The narrative display should have the faded class
    expect(screen.getByTestId('narrative-content-wrapper')).toHaveClass('bhgm-narrative-faded');
    
    // Check for correct container class
    expect(screen.getByTestId('narrative-with-decisions')).toHaveClass('bhgm-narrative-container');
    expect(screen.getByTestId('decision-wrapper')).toHaveClass('bhgm-narrative-decision-wrapper');
  });

  it('handles decision selection and submission', async () => {
    render(<NarrativeWithDecisions {...mockProps} />);
    
    // After the animation delay, the decision should be visible
    jest.advanceTimersByTime(600);
    
    // Submit the decision
    fireEvent.click(screen.getByTestId('decision-submit-button'));
    
    // Wait for the async submission to complete
    await waitFor(() => {
      expect(mockRecordPlayerDecision).toHaveBeenCalledWith(
        'test-decision-123',
        'option1'
      );
    });
  });

  it('shows error message if decision submission fails', async () => {
    // Mock a rejection
    mockRecordPlayerDecision.mockRejectedValue(new Error('Test error message'));
    
    render(<NarrativeWithDecisions {...mockProps} />);
    
    // After the animation delay, the decision should be visible
    jest.advanceTimersByTime(600);
    
    // Submit the decision
    fireEvent.click(screen.getByTestId('decision-submit-button'));
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByTestId('narrative-error-message')).toBeInTheDocument();
    });
    
    // Test error dismissal
    fireEvent.click(screen.getByTestId('dismiss-error-button'));
    expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
  });

  it('passes error and retry handler to NarrativeDisplay', () => {
    render(<NarrativeWithDecisions narrative="Test" error="Test error" onRetry={mockProps.onRetry} />);
    
    // After the animation delay, the decision should be visible
    jest.advanceTimersByTime(600);
    
    // Check that error is passed to NarrativeDisplay
    expect(screen.getByTestId('narrative-error')).toHaveTextContent('Test error');
    
    // Check that retry handler works
    fireEvent.click(screen.getByTestId('narrative-retry'));
    expect(mockProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it('transitions between decision and narrative states', async () => {
    // First render with decision active
    const { unmount } = render(<NarrativeWithDecisions {...mockProps} />);
    
    // After the animation delay, the decision should be visible
    jest.advanceTimersByTime(600);
    expect(screen.getByText('Test decision prompt')).toBeInTheDocument();
    expect(screen.getByTestId('decision-wrapper')).toHaveClass('bhgm-narrative-transition-in');
    
    // Unmount and update context
    unmount();
    mockUseNarrativeContext.hasActiveDecision = false;
    // Revert to mockDecision to avoid type error
    mockUseNarrativeContext.currentDecision = mockDecision;
    
    // Render again with the updated context
    render(<NarrativeWithDecisions {...mockProps} />);
    
    // Since there's no decision now, the narrative should not be faded
    jest.advanceTimersByTime(600);
    const narrativeWrapper = screen.getByTestId('narrative-content-wrapper');
    expect(narrativeWrapper).not.toHaveClass('bhgm-narrative-faded');
  });
  
  it('applies custom className correctly', () => {
    render(<NarrativeWithDecisions {...mockProps} className="custom-class" />);
    
    expect(screen.getByTestId('narrative-with-decisions')).toHaveClass('custom-class');
  });
  
  it('applies custom id and data-testid correctly', () => {
    render(<NarrativeWithDecisions {...mockProps} id="custom-id" data-testid="custom-testid" />);
    
    const component = screen.getByTestId('custom-testid');
    expect(component).toHaveAttribute('id', 'custom-id');
  });
});