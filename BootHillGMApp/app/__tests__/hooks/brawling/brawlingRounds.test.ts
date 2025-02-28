// import { renderHook, act } from '@testing-library/react';
// import { useBrawlingCombat } from '../../../hooks/useBrawlingCombat';
// import { mockPlayer, mockOpponent, setupBrawlingTestEnvironment, cleanupBrawlingTestEnvironment } from '../../../test/fixtures/brawling/brawlingTestFixtures';
// import * as brawlingSystem from '../../../utils/brawlingSystem';
// import { GameEngineAction, UpdateCharacterPayload } from '../../../types/gameActions';

// // Type guard for UPDATE_CHARACTER action with payload
// const isUpdateCharacterAction = (action: GameEngineAction): action is { type: "UPDATE_CHARACTER"; payload: UpdateCharacterPayload } => {
//   return action.type === "UPDATE_CHARACTER" && 'payload' in action;
// };

// /**
//  * Tests for the useBrawlingCombat hook, focusing on single round combat scenarios.
//  */
// describe('useBrawlingCombat - Single Round', () => {
//   let mockDispatch: jest.Mock;
//   let mockOnCombatEnd: jest.Mock;

//   beforeEach(() => {
//     ({ mockDispatch, mockOnCombatEnd } = setupBrawlingTestEnvironment(true));
//   });

//   afterEach(() => {
//     cleanupBrawlingTestEnvironment();
//     jest.restoreAllMocks(); // Restore original setTimeout after each test
//   });

//   // it('should process a single round of combat and update the game state accordingly', async () => {
//   //   // Mock the brawlingSystem.resolveBrawlingRound to return predictable results
//   //   // Use a light hit with minimal damage to avoid triggering knockouts
//   //   (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation(() => ({
//   //     roll: 3,
//   //     result: 'Glancing Blow',
//   //     damage: 1, // Use minimal damage to avoid triggering knockouts
//   //     location: 'leftArm',
//   //     nextRoundModifier: 0,
//   //     // Add a special flag to identify this test
//   //     _isBrawlingRoundsTest: true
//   //   }));

//   //   // Mock the dispatch function to track calls
//   //   const updateCharacterCalls: { type: "UPDATE_CHARACTER"; payload: UpdateCharacterPayload }[] = [];
//   //   mockDispatch.mockImplementation((action: GameEngineAction) => {
//   //     console.log('Dispatch called with:', action);
//   //     if (isUpdateCharacterAction(action)) {
//   //       updateCharacterCalls.push(action);
//   //     }
//   //     return action;
//   //   });
//   //   
//   //   // Mock the onCombatEnd function to track calls
//   //   mockOnCombatEnd.mockImplementation((winner: string, summary: string) => {
//   //     console.log('Combat ended with:', { winner, summary });
//   //   });

//   //   // Mock setTimeout to execute immediately
//   //   jest.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
//   //     cb();
//   //     return 1 as unknown as NodeJS.Timeout;
//   //   });

//   //   // Render the hook with a valid initial state to ensure it's properly initialized
//   //   const { result } = renderHook(() =>
//   //     useBrawlingCombat({
//   //       playerCharacter: mockPlayer,
//   //       opponent: mockOpponent,
//   //       onCombatEnd: mockOnCombatEnd,
//   //       dispatch: mockDispatch,
//   //       initialCombatState: {
//   //         round: 1,
//   //         playerModifier: 0,
//   //         opponentModifier: 0,
//   //         playerCharacterId: mockPlayer.id,
//   //         opponentCharacterId: mockOpponent.id,
//   //         roundLog: []
//   //       }
//   //     })
//   //   );
//   //   const hookResult = result;

//   //   // Wait for hook to be fully initialized and advance timers
//   //   await act(async () => {
//   //     jest.advanceTimersByTime(100);
//   //     await Promise.resolve();
//   //   });

//   //   // Verify the hook is properly initialized
//   //   expect(hookResult.current).not.toBeNull();
//   //   expect(hookResult.current.processRound).toBeDefined();

//   //   // Start processing the round and advance timers
//   //   await act(async () => {
//   //     await hookResult.current.processRound(true, true);
//   //     jest.advanceTimersByTime(100);
//   //     await Promise.resolve();
//   //   });

//   //   // Verify the roundLog has the expected entries
//   //   expect(hookResult.current.brawlingState.roundLog).toHaveLength(3);

//   //   const [playerEntry, opponentEntry, roundCompletionEntry] = hookResult.current.brawlingState.roundLog;
//   //   expect(playerEntry.text).toContain('Player punches with');
//   //   expect(opponentEntry.text).toContain('Opponent');
//   //   expect(roundCompletionEntry.text).toContain('Round 1 complete');

//   //   // Verify the opponent has at least one wound and UPDATE_CHARACTER was called
//   //   const opponentUpdateCall = updateCharacterCalls.find(
//   //     (call) => call.payload.id === mockOpponent.id
//   //   );

//   //   expect(opponentUpdateCall).toBeDefined();
//   //   expect(opponentUpdateCall?.payload.wounds).toBeDefined();
//   //   expect(opponentUpdateCall?.payload.wounds?.length).toBeGreaterThan(0);
//   // });
// });
