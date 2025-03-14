import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DevToolsPanel from '../../../components/Debug/DevToolsPanel';
import { initialGameState } from '../../../types/gameState';
import { GameEngineAction } from '../../../types/gameActions';

// Mock the contextual decision generator
jest.mock('../../../utils/contextualDecisionGenerator', () => ({
  generateContextualDecision: jest.fn().mockImplementation(() => ({
    id: 'test-contextual-decision',
    prompt: 'Test Contextual Decision',
    timestamp: Date.now(),
    options: [
      { id: 'option1', text: 'Option 1', impact: 'Impact 1' },
      { id: 'option2', text: 'Option 2', impact: 'Impact 2' }
    ],
    context: 'Test context',
    importance: 'moderate',
    characters: ['Test Character'],
    aiGenerated: false
  }))
}));

// Mock the debug console
jest.mock('../../../utils/debugConsole', () => ({
  initializeBrowserDebugTools: jest.fn(),
  updateDebugCurrentDecision: jest.fn()
}));

// Mock the hooks
jest.mock('../../../components/CampaignStateManager', () => ({
  useCampaignState: jest.fn(() => ({}))
}));

// Mock the window methods that the component uses
Object.defineProperty(window, 'dispatchEvent', {
  value: jest.fn()
});

// Mock the useNarrative hook
jest.mock('../../../context/NarrativeContext', () => {
  const originalModule = jest.requireActual('../../../context/NarrativeContext');
  
  return {
    ...originalModule,
    useNarrative: jest.fn().mockImplementation(() => ({
      state: {
        narrativeHistory: [],
        currentDecision: null,
        narrativeContext: {
          decisionHistory: []
        }
      },
      dispatch: jest.fn()
    }))
  };
});

describe('DevToolsPanel with Contextual Decision Testing', () => {
  const mockDispatch = jest.fn() as jest.MockedFunction<React.Dispatch<GameEngineAction>>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders collapsible contextual decision testing section', () => {
    render(
      <DevToolsPanel gameState={initialGameState} dispatch={mockDispatch} />
    );
    
    // Check for the decision testing section header
    const sectionHeader = screen.getByText('Contextual Decision Testing');
    expect(sectionHeader).toBeInTheDocument();
    
    // Test collapsibility
    const collapseButton = screen.getByLabelText('Toggle Decision Testing Panel');
    expect(collapseButton).toBeInTheDocument();
    
    // Section should be expanded by default
    expect(screen.getByLabelText('Location Type:')).toBeInTheDocument();
    
    // Collapse the section
    fireEvent.click(collapseButton);
    
    // Location type selector should be hidden
    expect(screen.queryByLabelText('Location Type:')).not.toBeInTheDocument();
    
    // Expand again
    fireEvent.click(collapseButton);
    
    // And it should be visible again
    expect(screen.getByLabelText('Location Type:')).toBeInTheDocument();
  });

  it('shows location type selector and trigger button', () => {
    render(
      <DevToolsPanel gameState={initialGameState} dispatch={mockDispatch} />
    );
    
    // Check for the location type dropdown
    const locationTypeSelect = screen.getByLabelText('Location Type:');
    expect(locationTypeSelect).toBeInTheDocument();
    
    // Check for the trigger button
    const triggerButton = screen.getByText('Trigger Contextual Decision');
    expect(triggerButton).toBeInTheDocument();
  });

  it('allows toggling the entire panel', () => {
    render(
      <DevToolsPanel gameState={initialGameState} dispatch={mockDispatch} />
    );
    
    // DevTools heading should be visible
    expect(screen.getByText('DevTools')).toBeInTheDocument();
    
    // Game State section should be visible initially
    expect(screen.getByText('Game State')).toBeInTheDocument();
    
    // Get the collapse button for the entire panel
    const collapseButton = screen.getByLabelText('Toggle DevTools Panel');
    
    // Collapse the panel
    fireEvent.click(collapseButton);
    
    // Game State should be hidden now
    expect(screen.queryByText('Game State')).not.toBeInTheDocument();
    
    // Expand again
    fireEvent.click(collapseButton);
    
    // Game State should be visible again
    expect(screen.getByText('Game State')).toBeInTheDocument();
  });
  
  // We can add more tests like checking disabled states for buttons
  // when a decision is active, but I'll keep it focused for now
});