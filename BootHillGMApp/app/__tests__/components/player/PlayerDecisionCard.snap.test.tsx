import React from 'react';
import { render } from '@testing-library/react';
import PlayerDecisionCard from '@/app/components/player/PlayerDecisionCard';
import { mockPlayerDecisions } from '@/app/test/fixtures/mockComponents';

// Mock the narrative context
jest.mock('@/app/hooks/useNarrativeContext', () => ({
  useNarrativeContext: () => ({
    recordPlayerDecision: jest.fn(),
    isGeneratingNarrative: false,
  }),
}));

describe('PlayerDecisionCard snapshots', () => {
  it('matches snapshot with moderate importance decision', () => {
    const { container } = render(
      <PlayerDecisionCard decision={mockPlayerDecisions.moderate} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with critical importance decision', () => {
    const { container } = render(
      <PlayerDecisionCard decision={mockPlayerDecisions.critical} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with significant importance decision', () => {
    const { container } = render(
      <PlayerDecisionCard decision={mockPlayerDecisions.significant} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with minor importance decision', () => {
    const { container } = render(
      <PlayerDecisionCard decision={mockPlayerDecisions.minor} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot without context', () => {
    const { container } = render(
      <PlayerDecisionCard decision={mockPlayerDecisions.noContext} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot without options', () => {
    const { container } = render(
      <PlayerDecisionCard decision={mockPlayerDecisions.noOptions} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with null decision (should not render)', () => {
    const { container } = render(
      <PlayerDecisionCard decision={undefined} />
    );
    expect(container).toMatchSnapshot();
  });

  // Loading state
  it('matches snapshot while generating narrative', () => {
    // Create a new mock implementation for just this test
    const originalMock = jest.requireMock('@/app/hooks/useNarrativeContext');
    const originalImplementation = originalMock.useNarrativeContext;
    
    // Override the mock completely
    originalMock.useNarrativeContext = () => ({
      recordPlayerDecision: jest.fn(),
      isGeneratingNarrative: true,
    });
    
    const { container } = render(
      <PlayerDecisionCard decision={mockPlayerDecisions.moderate} />
    );
    
    // Take the snapshot
    expect(container).toMatchSnapshot();
    
    // Restore the original mock implementation
    originalMock.useNarrativeContext = originalImplementation;
  });

  // With callback
  it('matches snapshot with onDecisionMade callback', () => {
    const onDecisionMade = jest.fn();
    const { container } = render(
      <PlayerDecisionCard 
        decision={mockPlayerDecisions.moderate} 
        onDecisionMade={onDecisionMade}
      />
    );
    expect(container).toMatchSnapshot();
  });

  // With custom className
  it('matches snapshot with custom className', () => {
    const { container } = render(
      <PlayerDecisionCard 
        decision={mockPlayerDecisions.moderate} 
        className="custom-class"
      />
    );
    expect(container).toMatchSnapshot();
  });
});
