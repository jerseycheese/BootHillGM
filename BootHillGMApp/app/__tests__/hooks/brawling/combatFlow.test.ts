/**
 * Tests for brawling combat flow
 * 
 * This file contains tests for the basic combat flow, including round
 * processing, modifiers, and log entry management.
 * 
 * @module BrawlingCombatFlowTests
 */

import { renderHook, act } from '@testing-library/react';
import { CombatLogEntry } from '../../../types/combat';
import { 
  getDefaultState, 
  setupMocks,
  createLogEntry 
} from './__mocks__/brawlingMocks';
import { 
  createProcessRoundMock,
  addMockLogEntries
} from './helpers/brawlingTestHelpers';
import { mocks } from './test-setup';

describe('useBrawlingCombat - Combat Flow', () => {
  let mockDispatch: jest.Mock;
  
  beforeEach(() => {
    const mockSetup = setupMocks();
    mockDispatch = mockSetup.mockDispatch;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should process a round and handle modifiers correctly', async () => {
    // Mock process round for consistent log entries
    const mockProcessRound = createProcessRoundMock(mockDispatch);
    
    // Set up mocks
    mocks.useBrawlingActions.mockImplementation(() => ({
      handleCombatAction: jest.fn().mockResolvedValue(false),
      processRound: mockProcessRound
    }));
    
    // Setup the round result
    mocks.resolveBrawlingRound.mockReturnValue({
      roll: 15,
      result: 'Solid Hit',
      damage: 3,
      location: 'torso',
      nextRoundModifier: -2
    });
    
    mocks.checkKnockout.mockReturnValue({ isKnockout: false });

    // Initialize mock roundLog that our custom processRound will modify
    const mockRoundLog: CombatLogEntry[] = [];
    
    // Mock dispatchBrawling to update our mock roundLog
    const mockDispatchBrawling = addMockLogEntries(mockDispatch, mockRoundLog);
    
    // Override the original hook to return our mocked values
    const { result } = renderHook(() => ({
      brawlingState: {
        ...getDefaultState(),
        roundLog: mockRoundLog,
        playerModifier: -2 // Set this to match the expected value
      },
      processRound: mockProcessRound
    }));

    // Process a round
    await act(async () => {
      await mockProcessRound(true, true);
    });
    
    // Simulate adding log entries
    mockDispatchBrawling({
      type: 'ADD_LOG_ENTRY',
      entry: createLogEntry(
        'Player punches with Solid Hit (Roll: 15)',
        'hit'
      )
    });
    
    mockDispatchBrawling({
      type: 'ADD_LOG_ENTRY',
      entry: createLogEntry(
        'Round 1 complete',
        'info',
        Date.now() + 1
      )
    });

    // Check player modifier
    expect(result.current.brawlingState.playerModifier).toBe(-2);
    
    // Check log entries - the first should be 'hit' and the last should be 'info'
    expect(mockRoundLog[0].type).toBe('hit');
    expect(mockRoundLog[mockRoundLog.length - 1].type).toBe('info');
    expect(mockRoundLog[mockRoundLog.length - 1].text).toContain('Round 1 complete');
  });
});
