import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerDecisionCard from '../../components/player/PlayerDecisionCard';
import { PlayerDecision } from '../../types/narrative.types';
import { NarrativeProvider } from '../../context/NarrativeContext';

// Create a mock for useNarrativeContext
const mockRecordPlayerDecision = jest.fn();
jest.mock('../../hooks/useNarrativeContext', () => ({
  useNarrativeContext: () => ({
    recordPlayerDecision: mockRecordPlayerDecision,
    isGeneratingNarrative: false,
  }),
}));

// Mock NarrativeProvider
jest.mock('../../context/NarrativeContext', () => ({
  NarrativeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('PlayerDecisionCard', () => {
  // Sample decision for testing
  const mockDecision: PlayerDecision = {
    id: 'test-decision-123',
    prompt: 'What will you do next?',
    timestamp: Date.now(),
    options: [
      { id: 'option1', text: 'Go to the saloon', impact: 'You might find information' },
      { id: 'option2', text: 'Visit the sheriff', impact: 'You could get official help' },
      { id: 'option3', text: 'Check the general store', impact: 'You might find supplies' }
    ],
    context: 'You find yourself in a dusty western town',
    importance: 'significant',
    characters: ['Sheriff Johnson'],
    aiGenerated: true
  };

  beforeEach(() => {
    // Reset the mock before each test
    mockRecordPlayerDecision.mockReset();
    mockRecordPlayerDecision.mockResolvedValue(undefined);
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(
      <NarrativeProvider>
        {ui}
      </NarrativeProvider>
    );
  };

  it('renders the decision prompt correctly', () => {
    renderWithProvider(<PlayerDecisionCard decision={mockDecision} />);
    
    expect(screen.getByText('What will you do next?')).toBeInTheDocument();
    expect(screen.getByText('significant')).toBeInTheDocument();
    expect(screen.getByTestId('player-decision-card')).toHaveClass('bhgm-decision-card');
  });

  it('renders all decision options', () => {
    renderWithProvider(<PlayerDecisionCard decision={mockDecision} />);
    
    expect(screen.getByText('Go to the saloon')).toBeInTheDocument();
    expect(screen.getByText('Visit the sheriff')).toBeInTheDocument();
    expect(screen.getByText('Check the general store')).toBeInTheDocument();
    
    const optionsContainer = screen.getByTestId('option-option1').closest('div');
    expect(optionsContainer).toHaveClass('bhgm-decision-options-container');
  });

  it('renders nothing when no decision is provided', () => {
    const { container } = renderWithProvider(<PlayerDecisionCard decision={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('allows selecting an option', () => {
    renderWithProvider(<PlayerDecisionCard decision={mockDecision} />);
    
    const optionButton = screen.getByRole('button', {name: 'Go to the saloon'});
    fireEvent.click(optionButton);
    
    // The option should now be selected (with aria-pressed attribute)
    expect(optionButton).toHaveAttribute('aria-pressed', 'true');
    expect(optionButton).toHaveClass('bhgm-decision-option-selected');
    
    // The submit button should be enabled
    const submitButton = screen.getByText('Confirm Decision');
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onDecisionMade callback when a decision is submitted', async () => {
    const mockOnDecisionMade = jest.fn();
    
    renderWithProvider(
      <PlayerDecisionCard 
        decision={mockDecision} 
        onDecisionMade={mockOnDecisionMade} 
      />
    );
    
    // Select an option
    fireEvent.click(screen.getByText('Visit the sheriff'));
    
    // Submit the decision
    fireEvent.click(screen.getByText('Confirm Decision'));
    
    // Wait for the async submission to complete
    await waitFor(() => {
      expect(mockRecordPlayerDecision).toHaveBeenCalledWith(
        'test-decision-123',
        'option2'
      );
      expect(mockOnDecisionMade).toHaveBeenCalledWith(
        'test-decision-123',
        'option2'
      );
    });
  });

  it('disables options during submission', async () => {
    // Mock a slow response
    mockRecordPlayerDecision.mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });
    
    renderWithProvider(<PlayerDecisionCard decision={mockDecision} />);
    
    // Select an option
    fireEvent.click(screen.getByText('Go to the saloon'));
    
    // Submit the decision
    fireEvent.click(screen.getByText('Confirm Decision'));
    
    // Immediately after clicking, it should show loading state
    expect(screen.getByText('Confirming...')).toBeInTheDocument();
    
    // All buttons should be disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
    
    // Wait for the submission to complete
    await waitFor(() => {
      expect(mockRecordPlayerDecision).toHaveBeenCalled();
    }, { timeout: 200 });
  });

  it('handles errors from recordPlayerDecision', async () => {
    // Mock an error response
    const mockError = new Error('Test error message');
    mockRecordPlayerDecision.mockRejectedValue(mockError);
    
    // Spy on console.error to verify it's called
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    renderWithProvider(<PlayerDecisionCard decision={mockDecision} />);
    
    // Select an option
    fireEvent.click(screen.getByText('Go to the saloon'));
    
    // Submit the decision
    fireEvent.click(screen.getByText('Confirm Decision'));
    
    // Wait for the async submission to complete
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to record decision:',
        mockError
      );
      expect(screen.getByTestId('decision-error-message')).toBeInTheDocument();
      expect(screen.getByTestId('decision-error-message')).toHaveClass('bhgm-decision-error');
    });
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('handles edge case with an empty decision options array', () => {
    const emptyOptionsDecision = {
      ...mockDecision,
      options: []
    };
    
    renderWithProvider(<PlayerDecisionCard decision={emptyOptionsDecision} />);
    
    // Should still render the prompt
    expect(screen.getByText('What will you do next?')).toBeInTheDocument();
    
    // Should show the no options message
    expect(screen.getByTestId('no-options-message')).toBeInTheDocument();
    expect(screen.getByTestId('no-options-message')).toHaveClass('bhgm-decision-no-options');
    
    // The submit button should be disabled
    expect(screen.getByTestId('decision-submit-button')).toBeDisabled();
  });

  it('applies the correct CSS class based on decision importance', () => {
    // Completely clean approach using separate renders
    const { unmount: criticalUnmount } = renderWithProvider(
      <PlayerDecisionCard 
        decision={{
          ...mockDecision,
          importance: 'critical'
        }} 
      />
    );
    
    // Check for critical class
    expect(screen.getByTestId('player-decision-card')).toHaveClass('bhgm-decision-critical');
    
    // Important: Unmount the critical component first to completely remove it from the DOM
    criticalUnmount();
    
    // Now render the minor importance component in a clean DOM
    renderWithProvider(
      <PlayerDecisionCard 
        decision={{
          ...mockDecision,
          importance: 'minor'
        }} 
      />
    );
    
    // Check for minor class
    expect(screen.getByTestId('player-decision-card')).toHaveClass('bhgm-decision-minor');
  });
});