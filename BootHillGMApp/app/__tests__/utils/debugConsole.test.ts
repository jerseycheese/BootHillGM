import { initializeBrowserDebugTools, updateDebugCurrentDecision } from '../../utils/debugConsole';
import { LocationType } from '../../services/locationService';
import { initialGameState } from '../../types/gameState';
import { PlayerDecision, DecisionImportance } from '../../types/narrative.types';
import { DebugCommandData } from '../../types/global.d';
import { GameState } from '../../types/gameState';

interface BHGMDebug {
  version: string;
  triggerDecision: (locationType?: LocationType) => void;
  clearDecision: () => void;
  listLocations: () => string[];
  getState: () => GameState;
  currentDecision: PlayerDecision | null;
  sendCommand: (commandType: string, data?: DebugCommandData) => void;
}

describe('debugConsole', () => {
  // Store original window properties
  const originalAddEventListener = window.addEventListener;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  // Mock functions
  const mockGameStateGetter = jest.fn(() => initialGameState);
  const mockDecisionTrigger = jest.fn();
  const mockDecisionClearer = jest.fn();

  beforeEach(() => {
    // Setup mocks
    window.addEventListener = jest.fn();
    console.log = jest.fn();
    console.error = jest.fn();

    // Reset window.bhgmDebug between tests
    if ('bhgmDebug' in window) {
      delete (window as Window & { bhgmDebug?: BHGMDebug }).bhgmDebug;
    }

    // Clear mocks
    mockGameStateGetter.mockClear();
    mockDecisionTrigger.mockClear();
    mockDecisionClearer.mockClear();
  });

  afterEach(() => {
    // Restore original functions
    window.addEventListener = originalAddEventListener;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('initializeBrowserDebugTools', () => {
    it('creates bhgmDebug namespace', () => {
      initializeBrowserDebugTools(
        mockGameStateGetter,
        mockDecisionTrigger,
        mockDecisionClearer
      );

      expect(window.bhgmDebug).toBeDefined();
      expect(window.bhgmDebug!.version).toBeDefined();
    });

    it('sets up core methods', () => {
      initializeBrowserDebugTools(
        mockGameStateGetter,
        mockDecisionTrigger,
        mockDecisionClearer
      );

      expect(typeof window.bhgmDebug!.triggerDecision).toBe('function');
      expect(typeof window.bhgmDebug!.clearDecision).toBe('function');
      expect(typeof window.bhgmDebug!.listLocations).toBe('function');
      expect(typeof window.bhgmDebug!.getState).toBe('function');
    });

    it('calls decision trigger with correct location type', () => {
      initializeBrowserDebugTools(
        mockGameStateGetter,
        mockDecisionTrigger,
        mockDecisionClearer
      );
      const mockLocation: LocationType = { type: 'town', name: 'Test Town' };
      window.bhgmDebug!.triggerDecision(mockLocation);
      expect(mockDecisionTrigger).toHaveBeenCalledWith(mockLocation);
    });

    it('calls decision clearer when clearing', () => {
      initializeBrowserDebugTools(
        mockGameStateGetter,
        mockDecisionTrigger,
        mockDecisionClearer
      );

      window.bhgmDebug!.clearDecision();
      expect(mockDecisionClearer).toHaveBeenCalled();
    });

    it('retrieves game state when requested', () => {
      initializeBrowserDebugTools(
        mockGameStateGetter,
        mockDecisionTrigger,
        mockDecisionClearer
      );

      const bhgmDebug = (window as Window & { bhgmDebug?: BHGMDebug }).bhgmDebug;
      if (!bhgmDebug) throw new Error('bhgmDebug not initialized');
      const result = bhgmDebug.getState();
      expect(mockGameStateGetter).toHaveBeenCalled();
      expect(result).toEqual(initialGameState);
    });

    it('sets up event listener for cross-component communication', () => {
      initializeBrowserDebugTools(
        mockGameStateGetter,
        mockDecisionTrigger,
        mockDecisionClearer
      );

      expect(window.addEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    });
  });

  describe('updateDebugCurrentDecision', () => {
    it('updates currentDecision in bhgmDebug namespace', () => {
      // Create bhgmDebug namespace first
      initializeBrowserDebugTools(
        mockGameStateGetter,
        mockDecisionTrigger,
        mockDecisionClearer
      );

      const testDecision: PlayerDecision = {
        id: 'test-decision',
        prompt: 'Test Decision',
        timestamp: Date.now(),
        options: [],
        context: 'Test',
        importance: 'moderate' as DecisionImportance,
        aiGenerated: false,
        characters: [],
        location: { type: 'town', name: 'Test Town' }
      };

      updateDebugCurrentDecision(testDecision);
      expect(window.bhgmDebug!.currentDecision).toEqual(testDecision);
    });

    it('handles null decision', () => {
      // Create bhgmDebug namespace first
      initializeBrowserDebugTools(
        mockGameStateGetter,
        mockDecisionTrigger,
        mockDecisionClearer
      );

      // Set a decision first
      const testDecision: PlayerDecision = {
        id: 'test-decision',
        prompt: 'Test Decision',
        timestamp: Date.now(),
        options: [],
        context: 'Test',
        importance: 'moderate' as DecisionImportance,
        aiGenerated: false,
        characters: [],
        location: { type: 'town', name: 'Test Town' }
      };

      updateDebugCurrentDecision(testDecision);
      expect(window.bhgmDebug!.currentDecision).toEqual(testDecision);

      // Now clear it
      updateDebugCurrentDecision(null);
      expect(window.bhgmDebug!.currentDecision).toBeNull();
    });
  });
});