import { renderHook, act } from '@testing-library/react';
import { useCombatManager } from '../../hooks/useCombatManager';
import { CampaignStateProvider } from '../../components/CampaignStateManager';
import type { Character } from '../../types/character';

describe('useCombatManager', () => {
  const mockUpdateNarrative = jest.fn();
  const mockOpponent: Character = {
    name: 'Test Opponent',
    health: 100,
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      bravery: 10,
      experience: 5
    },
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with inactive combat state', () => {
    const { result } = renderHook(
      () => useCombatManager({ onUpdateNarrative: mockUpdateNarrative }), 
      { wrapper: CampaignStateProvider }
    );

    expect(result.current.isCombatActive).toBe(false);
    expect(result.current.opponent).toBeNull();
  });

  it('should handle combat initiation', () => {
    const { result } = renderHook(
      () => useCombatManager({ onUpdateNarrative: mockUpdateNarrative }), 
      { wrapper: CampaignStateProvider }
    );

    act(() => {
      result.current.initiateCombat(mockOpponent);
    });

    expect(result.current.isCombatActive).toBe(true);
    expect(result.current.opponent).toEqual(mockOpponent);
  });

  it('should handle combat end', () => {
    const { result } = renderHook(
      () => useCombatManager({ onUpdateNarrative: mockUpdateNarrative }), 
      { wrapper: CampaignStateProvider }
    );

    act(() => {
      result.current.initiateCombat(mockOpponent);
      result.current.handleCombatEnd('player', 'Test combat summary');
    });

    expect(result.current.isCombatActive).toBe(false);
    expect(result.current.opponent).toBeNull();
    expect(mockUpdateNarrative).toHaveBeenCalledWith(
      expect.stringContaining('Test combat summary')
    );
  });

  it('should handle player health changes', () => {
    const { result } = renderHook(
      () => useCombatManager({ onUpdateNarrative: mockUpdateNarrative }), 
      { wrapper: CampaignStateProvider }
    );

    act(() => {
      result.current.handlePlayerHealthChange(80);
    });
  });

  it('should return current opponent', () => {
    const { result } = renderHook(
      () => useCombatManager({ onUpdateNarrative: mockUpdateNarrative }), 
      { wrapper: CampaignStateProvider }
    );

    act(() => {
      result.current.initiateCombat(mockOpponent);
    });

    expect(result.current.getCurrentOpponent()).toEqual(mockOpponent);
  });
});
