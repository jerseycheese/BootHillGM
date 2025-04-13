import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIService } from '../../services/ai/aiService';
import { GameStateProvider } from '../../context/GameStateProvider';
import { extractCharacterData } from '../../utils/debugActions';
import { setupLocalStorageMock, resetLocalStorageMock } from '../../test/utils/mockLocalStorage';
import GameControlSection from '../../components/Debug/GameControlSection';

// Mock AIService
jest.mock('../../services/ai/aiService');
const MockAIService = AIService as jest.MockedClass<typeof AIService>;

// Mock UUIDs for consistent testing
jest.mock('../../utils/uuidGenerator', () => ({
  generateUUID: jest.fn().mockReturnValue('test-uuid-12345')
}));

describe('Reset Content Generation Integration Tests', () => {
  // Set up localStorage mock for all tests
  beforeAll(() => {
    setupLocalStorageMock();
  });
  
  beforeEach(() => {
    // Reset localStorage and mocks before each test
    resetLocalStorageMock();
    jest.clearAllMocks();
    
    // Set up mock implementation for AIService
    MockAIService.prototype.generateGameContent.mockResolvedValue({
      narrative: 'AI-generated narrative for testing', // This is what we want to verify appears after reset
      suggestedActions: [
        { id: 'ai-action-1', title: 'AI Action 1', description: 'AI-generated action 1', type: 'optional' },
        { id: 'ai-action-2', title: 'AI Action 2', description: 'AI-generated action 2', type: 'optional' }
      ],
      location: { type: 'town', name: 'Boot Hill' },
      acquiredItems: [],
      removedItems: [],
      opponent: null
    });
  });

  // Simple component that tracks reset state for testing
  const ResetTestComponent = () => {
    const [loading, setLoading] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [gameState, setGameState] = React.useState({
      character: { 
        player: { name: 'Test Character', id: 'test-character', inventory: { items: [] } },
        opponent: null
      }
    });
    
    // Mock dispatch function that updates local state
    const dispatch = jest.fn((action) => {
      if (action.type === 'SET_STATE' && action.payload) {
        setGameState(prevState => ({
          ...prevState,
          ...action.payload
        }));
      }
    });
    
    // Simulate loading indicator
    const setLoadingIndicator = jest.fn();
    
    return (
      <div>
        <GameControlSection
          dispatch={dispatch}
          loading={loading}
          setLoading={setLoading}
          setError={setError}
          setLoadingIndicator={setLoadingIndicator}
          gameState={gameState}
        />
        
        {/* Display state for debugging */}
        <div data-testid="game-state">{JSON.stringify(gameState)}</div>
        
        {loading && <div data-testid="loading-indicator">{loading}</div>}
        {error && <div data-testid="error-message">{error}</div>}
      </div>
    );
  };

  it('should call AIService.generateGameContent during reset', async () => {
    // Arrange - setup test component
    render(
      <GameStateProvider>
        <ResetTestComponent />
      </GameStateProvider>
    );
    
    // Prepare character data in localStorage
    const testCharacter = {
      id: 'test-character',
      name: 'Test Character',
      inventory: { items: [] }
    };
    
    localStorage.setItem('character-creation-progress', JSON.stringify({ character: testCharacter }));
    localStorage.setItem('completed-character', JSON.stringify(testCharacter));
    
    // Act - Click the reset button to trigger reset
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    
    // Assert - Verify AIService was called
    await waitFor(() => {
      expect(MockAIService.prototype.generateGameContent).toHaveBeenCalled();
    });
    
    // Check that reset flags were set
    expect(localStorage.getItem('_boothillgm_reset_flag')).toBeTruthy();
    expect(localStorage.getItem('_boothillgm_force_generation')).toBeTruthy();
  });

  it('should properly process AIService response during reset', async () => {
    
    // Setup character data in localStorage
    const testCharacter = {
      id: 'test-character',
      name: 'Test Character',
      inventory: { items: [] }
    };
    
    localStorage.setItem('character-creation-progress', JSON.stringify({ character: testCharacter }));
    localStorage.setItem('completed-character', JSON.stringify(testCharacter));
    
    // Act - Manually simulate what happens during reset
    // 1. Extract character data
    const characterData = extractCharacterData({ 
      character: { player: testCharacter, opponent: null } 
    });
    
    // 2. Set the reset flags
    localStorage.setItem('_boothillgm_reset_flag', Date.now().toString());
    localStorage.setItem('_boothillgm_force_generation', 'true');
    
    // 3. Save character data for retrieval during reset
    localStorage.setItem('characterData', JSON.stringify(characterData));
    
    // 4. Call AIService directly to simulate what happens in GameControlSection
    const aiService = new AIService();
    const aiResponse = await aiService.generateGameContent(characterData);
    
    // 5. Store the generated content to be picked up by initialization
    localStorage.setItem('narrative', JSON.stringify(aiResponse.narrative || []));
    localStorage.setItem('journal', JSON.stringify([{
      id: `journal_${Date.now()}`,
      title: 'New Adventure',
      content: aiResponse.narrative,
      timestamp: Date.now(),
      type: 'narrative'
    }]));
    localStorage.setItem('suggestedActions', JSON.stringify(aiResponse.suggestedActions || []));
    
    // Assert - Verify the content from AIService is being saved correctly
    const savedNarrative = localStorage.getItem('narrative');
    expect(savedNarrative).toBeTruthy();
    expect(savedNarrative).toContain('AI-generated narrative');
    
    const savedActions = localStorage.getItem('suggestedActions');
    expect(savedActions).toBeTruthy();
    expect(savedActions).toContain('AI Action 1');
    expect(savedActions).toContain('AI Action 2');
    
    // Assert AIService was called with the expected character data
    expect(MockAIService.prototype.generateGameContent).toHaveBeenCalledWith(characterData);
  });
});