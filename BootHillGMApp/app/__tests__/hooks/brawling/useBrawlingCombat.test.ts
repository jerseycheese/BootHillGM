import { renderHook, act } from '@testing-library/react';
import { useBrawlingCombat } from '../../../hooks/useBrawlingCombat';
import { mockPlayer, mockOpponent, setupBrawlingTestEnvironment, cleanupBrawlingTestEnvironment } from '../../../test/fixtures/brawling/brawlingTestFixtures';
import * as brawlingSystem from '../../../utils/brawlingSystem';

/**
 * Tests for the useBrawlingCombat hook, focusing on the processing state.
 */
describe('useBrawlingCombat - Processing State', () => {
  let mockDispatch: jest.Mock;
  let mockOnCombatEnd: jest.Mock;

  beforeEach(() => {
    ({ mockDispatch, mockOnCombatEnd } = setupBrawlingTestEnvironment(true));
  });

  afterEach(() => {
    cleanupBrawlingTestEnvironment();
    jest.restoreAllMocks(); // Restore original setTimeout after each test
  });

  it('should correctly manage the isProcessing state during combat', async () => {
    // Use real timers for this test
    jest.useRealTimers();
    
    // Mock the brawlingSystem to return a consistent result
    (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation(() => ({
      roll: 4,
      result: 'Light Hit',
      damage: 1,
      location: 'chest',
      nextRoundModifier: 0,
    }));
    
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
      cb();
      return setTimeout(() => { /* Intentionally empty */ }, 0);
    });
    
    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );
    
    // Verify initial state
    expect(result.current.isProcessing).toBe(false);
    
    // Process the round
    await act(async () => {
      await result.current.processRound(true, true);
    });
    
    // Verify processing state becomes false after processing
    expect(result.current.isProcessing).toBe(false);
    
    // Restore original setTimeout
    jest.restoreAllMocks();
  });
});
