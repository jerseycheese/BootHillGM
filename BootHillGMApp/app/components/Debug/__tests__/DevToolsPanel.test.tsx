// components/Debug/__tests__/DevToolsPanel.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DevToolsPanel from '../DevToolsPanel';
import { GameState } from '../../../types/gameState';
import { initialState } from '../../../types/initialState';

// Mock dependencies
jest.mock('../../CampaignStateManager', () => ({
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

jest.mock('../GameControlSection', () => {
  return function MockGameControlSection() {
    return <div data-testid="game-control-section">Game Controls</div>;
  };
});

jest.mock('../DecisionTestingSection', () => {
  return function MockDecisionTestingSection() {
    return <div data-testid="decision-testing-section">Decision Testing</div>;
  };
});

jest.mock('../ContextualDecisionSection', () => {
  return function MockContextualDecisionSection() {
    return <div data-testid="contextual-decision-section">Contextual Decision</div>;
  };
});

jest.mock('../NarrativeDebugPanel', () => {
  return function MockNarrativeDebugPanel() {
    return <div data-testid="narrative-debug-panel">Narrative Debug</div>;
  };
});

jest.mock('../AIDecisionControls', () => {
  return function MockAIDecisionControls() {
    return <div data-testid="ai-decision-controls">AI Decision Controls</div>;
  };
});

jest.mock('../GameStateDisplay', () => {
  return function MockGameStateDisplay() {
    return <div data-testid="game-state-display">Game State Display</div>;
  };
});

jest.mock('../../../utils/contextualDecisionGenerator.enhanced', () => ({
  initializeDecisionDebugTools: jest.fn(),
  generateEnhancedDecision: jest.fn(),
}));

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
  // Create a valid GameState object based on the required properties
  const mockGameState: GameState = {
    ...initialState,
    character: {
      player: {
        id: 'player-1',
        name: 'Test Player',
        isNPC: false,
        isPlayer: true,
        inventory: { items: [] },
        attributes: { speed: 10, gunAccuracy: 10, throwingAccuracy: 10, strength: 10, baseStrength: 10, bravery: 10, experience: 0 },
        minAttributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 1, baseStrength: 1, bravery: 1, experience: 0 },
        maxAttributes: { speed: 10, gunAccuracy: 10, throwingAccuracy: 10, strength: 10, baseStrength: 10, bravery: 10, experience: 100 },
        wounds: [],
        isUnconscious: false
      },
      opponent: null
    },
    location: 'town',
  };

  const mockProps = {
    gameState: mockGameState,
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
