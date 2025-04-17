import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DevToolsPanel from '../../../components/Debug/DevToolsPanel';

// Mock dependencies
jest.mock('../../../components/CampaignStateManager', () => ({
  useCampaignState: () => ({}),
}));

jest.mock('../../../context/NarrativeContext', () => ({
  useNarrative: () => ({
    state: {
      narrativeContext: {
        decisionHistory: [],
      },
      narrativeHistory: [],
      currentDecision: null,
    },
    dispatch: jest.fn(),
  }),
}));

jest.mock('../../../utils/debugConsole', () => ({
  initializeBrowserDebugTools: jest.fn(),
  updateDebugCurrentDecision: jest.fn(),
}));

jest.mock('../../../utils/events', () => ({
  EVENTS: {
    DECISION_CLEARED: 'decision_cleared',
    DECISION_READY: 'decision_ready',
    UI_FORCE_UPDATE: 'ui_force_update',
    UI_STATE_CHANGED: 'ui_state_changed',
  },
  triggerCustomEvent: jest.fn(),
}));

// Mock the contextualDecisionGenerator
jest.mock('../../../utils/contextualDecisionGenerator', () => ({
  initializeDecisionDebugTools: jest.fn(),
  generateEnhancedDecision: jest.fn(),
}));

// Mock child components
jest.mock('../../../components/Debug/GameControlSection', () => {
  return function MockGameControlSection() {
    return <div data-testid="game-control-section">Game Controls</div>;
  };
});

jest.mock('../../../components/Debug/DecisionTestingSection', () => {
  return function MockDecisionTestingSection() {
    return <div data-testid="decision-testing-section">Decision Testing</div>;
  };
});

jest.mock('../../../components/Debug/ContextualDecisionSection', () => {
  return function MockContextualDecisionSection() {
    return <div data-testid="contextual-decision-section">Contextual Decision</div>;
  };
});

jest.mock('../../../components/Debug/NarrativeDebugPanel', () => {
  return function MockNarrativeDebugPanel() {
    return <div data-testid="narrative-debug-panel">Narrative Debug</div>;
  };
});

jest.mock('../../../components/Debug/AIDecisionControls', () => {
  return function MockAIDecisionControls() {
    return <div data-testid="ai-decision-controls">AI Decision Controls</div>;
  };
});

jest.mock('../../../components/Debug/GameStateDisplay', () => {
  return function MockGameStateDisplay() {
    return <div data-testid="game-state-display">Game State Display</div>;
  };
});

// Mock global window for browser environment
global.window = Object.create(window);
Object.defineProperty(window, 'bhgmDebug', {
  value: {
    decisions: {
      lastDetectionScore: null,
    },
    triggerDecision: null,
  },
  writable: true
});

describe('DevToolsPanel', () => {
  const mockProps = {
    gameState: { 
      player: { name: 'Test Player' },
      world: { location: 'Test Location' },
    },
    dispatch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<DevToolsPanel {...mockProps} />);
    expect(screen.getByText('DevTools')).toBeInTheDocument();
  });

  it('renders all child components when expanded', () => {
    render(<DevToolsPanel {...mockProps} />);
    
    expect(screen.getByTestId('game-control-section')).toBeInTheDocument();
    expect(screen.getByTestId('decision-testing-section')).toBeInTheDocument();
    expect(screen.getByTestId('contextual-decision-section')).toBeInTheDocument();
    expect(screen.getByTestId('narrative-debug-panel')).toBeInTheDocument();
    expect(screen.getByTestId('ai-decision-controls')).toBeInTheDocument();
    expect(screen.getByTestId('game-state-display')).toBeInTheDocument();
  });

  it('collapses and expands panel when toggle button is clicked', () => {
    render(<DevToolsPanel {...mockProps} />);
    
    // Initially, all sections should be visible
    expect(screen.getByTestId('game-control-section')).toBeVisible();
    
    // Click collapse button
    const toggleButton = screen.getByRole('button', { name: /Toggle DevTools Panel/i });
    fireEvent.click(toggleButton);
    
    // After collapse, sections should not be visible
    expect(screen.queryByTestId('game-control-section')).not.toBeInTheDocument();
    
    // Click expand button
    fireEvent.click(toggleButton);
    
    // After expand, sections should be visible again
    expect(screen.getByTestId('game-control-section')).toBeVisible();
  });
});