import { renderHook, act } from '@testing-library/react';
import { GameState } from '../../types/campaign';
import { GameEngineAction } from '../../utils/gameEngine';

// Mock the GoogleGenerativeAI dependency first
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn()
}));

// Mock process.env
process.env.NEXT_PUBLIC_GEMINI_API_KEY = 'mock-api-key';

describe('useAIInteractions', () => {
  // Set up mocks before importing the modules that use them
  const mockAIServiceInstance = {
    getResponse: jest.fn(),
    retryLastAction: jest.fn(),
  };

  // Use doMock to avoid hoisting issues
  jest.doMock('../../services/ai', () => ({
    AIService: jest.fn().mockImplementation(() => mockAIServiceInstance),
    __esModule: true
  }));

  let useAIInteractions: (
    state: GameState,
    dispatch: React.Dispatch<GameEngineAction>,
    onInventoryChange: (acquired: string[], removed: string[]) => void
  ) => {
    handleUserInput: (input: string) => Promise<void>;
    retryLastAction: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
  };

  beforeAll(async () => {
    // Import the hook after setting up mocks
    const hookModule = await import('../../hooks/useAIInteractions');
    useAIInteractions = hookModule.useAIInteractions;
  });

  const mockDispatch = jest.fn();
  const mockOnInventoryChange = jest.fn();
  const mockInitialState: GameState = {
    currentPlayer: '',
    npcs: [],
    character: null,
    location: 'Test Location',
    gameProgress: 0,
    journal: [],
    narrative: '',
    inventory: [],
    quests: [],
    isCombatActive: false,
    opponent: null,
    isClient: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockAIServiceInstance.getResponse.mockReset();
    mockAIServiceInstance.retryLastAction.mockReset();
  });

  it('should process user input and update state', async () => {
    const userInput = 'Hello AI';
    const mockResponse = {
      narrative: 'AI response narrative',
      location: 'New Location',
      acquiredItems: ['item1'],
      removedItems: [],
    };

    mockAIServiceInstance.getResponse.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAIInteractions(
      mockInitialState,
      mockDispatch,
      mockOnInventoryChange
    ));

    await act(async () => {
      await result.current.handleUserInput(userInput);
    });

    expect(mockAIServiceInstance.getResponse).toHaveBeenCalledWith(
      userInput,
      '',
      {
        inventory: [],
        character: undefined,
        location: 'Test Location'
      }
    );
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_NARRATIVE',
      payload: mockResponse.narrative
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_LOCATION',
      payload: mockResponse.location
    });
    expect(mockOnInventoryChange).toHaveBeenCalledWith(['item1'], []);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors during processing', async () => {
    const userInput = 'Hello AI';
    const error = new Error('Processing failed');

    // Mock the rejection properly
    mockAIServiceInstance.getResponse.mockImplementationOnce(() => Promise.reject(error));

    const { result } = renderHook(() => useAIInteractions(
      mockInitialState,
      mockDispatch,
      mockOnInventoryChange
    ));

    await act(async () => {
      await result.current.handleUserInput(userInput);
    });

    expect(mockAIServiceInstance.getResponse).toHaveBeenCalled();
    expect(result.current.error).toBe('Processing failed');
  });

  it('should handle retry last action', async () => {
    const mockResponse = {
      narrative: 'Retry response',
      acquiredItems: [],
      removedItems: []
    };

    mockAIServiceInstance.retryLastAction.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAIInteractions(
      mockInitialState,
      mockDispatch,
      mockOnInventoryChange
    ));

    await act(async () => {
      await result.current.retryLastAction();
    });

    expect(mockAIServiceInstance.retryLastAction).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_NARRATIVE',
      payload: mockResponse.narrative
    });
    expect(result.current.error).toBeNull();
  });
});
