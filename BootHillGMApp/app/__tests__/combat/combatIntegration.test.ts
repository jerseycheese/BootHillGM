import { renderHook, act } from "@testing-library/react";
import { useBrawlingCombat } from "../../hooks/useBrawlingCombat";
import { Character } from "../../types/character";
import { GameAction } from "../../types/actions";
import { UpdateCharacterPayload } from "../../types/actions/characterActions";
import { InventoryItem } from "../../types/item.types";
import { resolveBrawlingRound } from "../../utils/brawlingSystem";
import * as combatUtils from "../../utils/combatUtils";

jest.mock("../../utils/brawlingSystem", () => ({
  resolveBrawlingRound: jest.fn(),
}));

// Mock checkKnockout
jest.mock("../../utils/combatUtils", () => ({
  ...jest.requireActual("../../utils/combatUtils"),
  checkKnockout: jest.fn()
}));

describe("Combat Integration Tests", () => {
  let initialPlayerCharacter: Character;
  let initialOpponent: Character;
  let mockDispatch: jest.MockedFunction<React.Dispatch<GameAction>>;
  let mockOnCombatEnd: jest.Mock;

  beforeEach(() => {
    // Reset mocks and initial data before each test
    jest.clearAllMocks();

    initialPlayerCharacter = {
      isNPC: false,
      isPlayer: true,
      id: "player",
      name: "Player",
      inventory: { items: [] as InventoryItem[] },
      isUnconscious: false,
      attributes: {
        strength: 15,
        baseStrength: 15,
        speed: 9,
        gunAccuracy: 8,
        throwingAccuracy: 8,
        bravery: 12,
        experience: 0,
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 8,
        baseStrength: 8,
        bravery: 1,
        experience: 0
      },
      maxAttributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 20,
        baseStrength: 20,
        bravery: 20,
        experience: 11
      },
      wounds: [],
      strengthHistory: {
        baseStrength: 15,
        changes: [{
          previousValue: 15,
          newValue: 15,
          reason: 'initial',
          timestamp: new Date()
        }]
      },
    };

    initialOpponent = {
      isNPC: true,
      isPlayer: false,
      id: "opponent",
      name: "Opponent",
      inventory: { items: [] as InventoryItem[] },
      isUnconscious: false,
      attributes: {
        strength: 12,
        baseStrength: 12,
        speed: 7,
        gunAccuracy: 6,
        throwingAccuracy: 5,
        bravery: 10,
        experience: 0,
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 8,
        baseStrength: 8,
        bravery: 1,
        experience: 0
      },
      maxAttributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 20,
        baseStrength: 20,
        bravery: 20,
        experience: 11
      },
      wounds: [],
      strengthHistory: {
        baseStrength: 12,
        changes: [{
          previousValue: 12,
          newValue: 12,
          reason: 'initial',
          timestamp: new Date()
        }]
      },
    };

    mockDispatch = jest.fn() as jest.MockedFunction<
      React.Dispatch<GameAction>
    >;
    mockOnCombatEnd = jest.fn();
  });

  it("should correctly update strength and track history during brawling combat", async () => {
    (resolveBrawlingRound as jest.Mock).mockReturnValue({
        hit: true,
        damage: 2,
        location: 'head',
        nextRoundModifier: 0
    });
    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: initialPlayerCharacter,
        opponent: initialOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch,
        initialCombatState: undefined,
      })
    );

    // Simulate a player punch that hits
    await act(() => result.current.processRound(true, true));

    // Find the UPDATE_CHARACTER action and get the updated character
    const opponentUpdateAction = mockDispatch.mock.calls.find(
      (call) => call[0].type === "character/UPDATE_CHARACTER" && call[0].payload.id === "opponent"
    );
    expect(opponentUpdateAction).toBeDefined();

    const updatedOpponent = (
      opponentUpdateAction![0] as { type: "character/UPDATE_CHARACTER"; payload: UpdateCharacterPayload }
    ).payload;

    // Verify strength reduction
    expect(updatedOpponent.attributes?.strength ?? 0).toBeLessThan(
      initialOpponent.attributes.strength
    );

    // Verify strength history tracking
    expect(updatedOpponent.strengthHistory?.changes.length ?? 0).toBe(2);
    const lastChange = updatedOpponent.strengthHistory!.changes[1];
    expect(lastChange.previousValue).toBe(initialOpponent.attributes.strength);
    expect(lastChange.newValue).toBe(updatedOpponent.attributes?.strength ?? 0);
    expect(lastChange.reason).toBe('damage');
    expect(lastChange.timestamp).toBeInstanceOf(Date);

    // Verify wound was recorded
    expect(updatedOpponent.wounds?.length ?? 0).toBe(1);
    const wound = updatedOpponent.wounds?.[0];
    if (wound) {
      expect(wound.damage).toBe(2); // From mock return value
      expect(wound.location).toBe('head'); // From mock return value
    }
  });

  it("should track strength history for knockout", async () => {
    const weakPlayerCharacter: Character = {
      id: 'player-1',
      name: 'Player',
      isPlayer: true,
      isNPC: false,
      attributes: {
        speed: 0,
        gunAccuracy: 0,
        throwingAccuracy: 0,
        strength: 1,
        baseStrength: 1,
        bravery: 0,
        experience: 0
      },
      wounds: [],
      isUnconscious: false,
      inventory: { items: [] as InventoryItem[] },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 8,
        baseStrength: 8,
        bravery: 1,
        experience: 0
      },
      maxAttributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 20,
        baseStrength: 20,
        bravery: 20,
        experience: 11
      },
      strengthHistory: {
        baseStrength: 1,
        changes: [{
          previousValue: 1,
          newValue: 1,
          reason: 'initial',
          timestamp: new Date()
        }]
      },
    };

      // Mock resolveBrawlingRound for knockout scenario
      (resolveBrawlingRound as jest.Mock).mockReturnValue({
          hit: true,
          damage: 12, // Enough to knock out the opponent
          location: "head",
          nextRoundModifier: 0,
      });

    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: weakPlayerCharacter,
        opponent: initialOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch,
        initialCombatState: undefined,
      })
    );

    // Mock checkKnockout to return true (knockout)
      (combatUtils.checkKnockout as jest.Mock).mockReturnValue({
        isKnockout: true,
        winner: 'player',
        summary: 'Player knocked out opponent with a punch to the head!'
    });

    // Simulate a player punch that does enough damage to reduce strength to 0

    await act(() => result.current.processRound(true, true));

    // Find the UPDATE_CHARACTER action to verify strength history
    const opponentUpdateAction = mockDispatch.mock.calls.find(
      (call) => call[0].type === "character/UPDATE_CHARACTER" && call[0].payload.id === "opponent"
    );
    expect(opponentUpdateAction).toBeDefined();

    const updatedOpponent = (
      opponentUpdateAction![0] as { type: "character/UPDATE_CHARACTER"; payload: UpdateCharacterPayload }
    ).payload;

    // Verify strength history for knockout
    expect(updatedOpponent.strengthHistory?.changes.length ?? 0).toBe(2);
    const knockoutChange = updatedOpponent.strengthHistory!.changes[1];
    expect(knockoutChange.previousValue).toBe(12); // Initial strength of opponent
    expect(knockoutChange.newValue).toBeLessThanOrEqual(0); // Knockout
    expect(knockoutChange.reason).toBe('damage');
    expect(knockoutChange.timestamp).toBeInstanceOf(Date);

    // Verify combat ended with correct winner
    expect(mockOnCombatEnd).toHaveBeenCalledWith("player", expect.any(String));
  });

  it("should track strength history for defeat (strength below 0)", async () => {
    const weakOpponent: Character = {
      ...initialOpponent,
      attributes: {
        ...initialOpponent.attributes,
        strength: 1,
        baseStrength: 1,
      },
      wounds: [], // Ensure no initial wounds
        strengthHistory: {
            baseStrength: 1,
            changes: [{
                previousValue: 1,
                newValue: 1,
                reason: 'initial',
                timestamp: new Date()
            }]
        },
    };

      // Mock resolveBrawlingRound for defeat scenario
      (resolveBrawlingRound as jest.Mock).mockReturnValue({
          hit: true,
          damage: 2, // Enough to defeat the opponent
          location: "head",
          nextRoundModifier: 0,
      });

      // Mock checkKnockout to return knockout when strength is below 0
      (combatUtils.checkKnockout as jest.Mock).mockReturnValue({
          isKnockout: true,
          winner: 'player',
          summary: 'Player defeated opponent with a devastating blow!'
      });

    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: initialPlayerCharacter,
        opponent: weakOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch,
        initialCombatState: undefined,
      })
    );

    // Simulate a player punch that does enough damage to reduce strength below 0

    await act(() => result.current.processRound(true, true));

     // Find the UPDATE_CHARACTER action to verify strength history
    const opponentUpdateAction = mockDispatch.mock.calls.find(
      (call) => call[0].type === "character/UPDATE_CHARACTER" && call[0].payload.id === "opponent"
    );
    expect(opponentUpdateAction).toBeDefined();

    const updatedOpponent = (
      opponentUpdateAction![0] as { type: "character/UPDATE_CHARACTER"; payload: UpdateCharacterPayload }
    ).payload;

    // Verify strength history for defeat
    expect(updatedOpponent.strengthHistory?.changes.length ?? 0).toBe(2);
    const defeatChange = updatedOpponent.strengthHistory!.changes[1];
    expect(defeatChange.previousValue).toBe(1); // Initial strength
    expect(defeatChange.newValue).toBeLessThanOrEqual(0); // Defeat
    expect(defeatChange.reason).toBe('damage');
    expect(defeatChange.timestamp).toBeInstanceOf(Date);

    // Verify combat ended with correct winner
    expect(mockOnCombatEnd).toHaveBeenCalledWith("player", expect.any(String));
  });
});
