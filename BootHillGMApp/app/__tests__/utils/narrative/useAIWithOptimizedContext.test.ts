/**
 * Tests for useAIWithOptimizedContext hook
 * 
 * These tests verify the hook's ability to:
 * 1. Properly transform AI responses with various opponent structures
 * 2. Handle error scenarios gracefully
 * 3. Integrate with the narrative context synchronization
 * 4. Apply proper context optimization
 */

import { renderHook, act } from '@testing-library/react';
import { useAIWithOptimizedContext } from '../../../utils/narrative/useAIWithOptimizedContext';
import { InventoryItem } from '../../../types/item.types';
import { NarrativeContextOptions } from '../../../types/narrative/context.types';
import { Character } from '../../../types/character';

jest.mock('../../../context/NarrativeContext');
jest.mock('../../../services/ai/gameService');
jest.mock('../../../utils/narrative/narrativeContextIntegration'); 
jest.mock('../../../utils/narrative/narrativeCompression');


import { 
  setupAIContextMocks, 
  mockGetAIResponse, 
  mockUseOptimizedNarrativeContext, 
  mockUseNarrativeContextSynchronization 
} from '../../../test/utils/narrativeTestHelpers';

// Import fixtures
import { 
  createMockAIResponse 
} from '../../../test/fixtures/aiResponses';

// Test constants
const MOCK_PROMPT = "What should I do next?";
const MOCK_INVENTORY: InventoryItem[] = [{ id: 'item-revolver', name: "Revolver", quantity: 1, description: "A reliable six-shooter", category: 'weapon' }];

const mockCharacterBanditJoe: Partial<Character> = { id: 'npc-bandit-joe', name: "Bandit Joe", attributes: { strength: 70, baseStrength: 80, speed: 8, gunAccuracy: 7, throwingAccuracy: 6, bravery: 6, experience: 5 } };
const mockCharacterSheriff: Partial<Character> = { id: 'npc-sheriff', name: "Sheriff Williams", attributes: { strength: 85, baseStrength: 85, speed: 7, gunAccuracy: 9, throwingAccuracy: 6, bravery: 8, experience: 7 } };
const mockCharacterOutlaw: Partial<Character> = { id: 'npc-outlaw-pete', name: "Outlaw Pete", attributes: { strength: 75, baseStrength: 75, speed: 8, gunAccuracy: 6, throwingAccuracy: 5, bravery: 7, experience: 4 } };
const mockCharacterStranger: Partial<Character> = { id: 'npc-stranger', name: "Mysterious Stranger", attributes: { strength: 10, baseStrength: 10, speed: 10, gunAccuracy: 10, throwingAccuracy: 10, bravery: 10, experience: 0 } };

describe('useAIWithOptimizedContext', () => {
  beforeEach(() => {
    setupAIContextMocks();
  });
  
  afterEach(() => {
    jest.resetModules(); 
  });
  
  it('should make an AI request with default context', async () => {
    const mockRawAIResponse = createMockAIResponse({
      narrative: "You see the sheriff approaching.",
      opponent: undefined 
    });
    mockGetAIResponse.mockResolvedValue(mockRawAIResponse);
    
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    expect(mockUseNarrativeContextSynchronization().ensureFreshContext).toHaveBeenCalled();
    expect(mockUseOptimizedNarrativeContext().getDefaultContext).toHaveBeenCalled();
    expect(mockGetAIResponse).toHaveBeenCalledWith(
      MOCK_PROMPT,
      "Recent events: You arrived in Tombstone.", 
      MOCK_INVENTORY,
      undefined,
      expect.anything()
    );
    
    expect(response!).toEqual({
      ...mockRawAIResponse,
      opponent: undefined, 
      storyProgression: undefined, 
      contextQuality: {
        optimized: true,
        compressionLevel: 'medium',
        tokensUsed: 100,
        buildTimeMs: expect.any(Number)
      }
    });
  });
  
  it('should handle an opponent with direct health property', async () => {
    const mockRawAIResponse = createMockAIResponse({
      narrative: "A bandit approaches, ready to fight!",
      location: { type: 'wilderness', description: 'Dusty trail outside town' }, 
      combatInitiated: true,
      opponent: mockCharacterBanditJoe as Character 
    });
    mockGetAIResponse.mockResolvedValue(mockRawAIResponse);
    
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    expect(response!.opponent).toEqual({
      name: "Bandit Joe",
      strength: 70,
      health: 70 
    });
  });
  
  it('should handle an opponent with health in attributes', async () => {
    const mockRawAIResponse = createMockAIResponse({
      narrative: "The sheriff challenges you to a duel!",
      combatInitiated: true,
      opponent: mockCharacterSheriff as Character 
    });
    mockGetAIResponse.mockResolvedValue(mockRawAIResponse);
    
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    expect(response!.opponent).toEqual({
      name: "Sheriff Williams",
      strength: 85,
      health: 85 
    });
  });
  
  it('should fall back to strength when health is missing', async () => {
    const mockRawAIResponse = createMockAIResponse({
      narrative: "An outlaw appears!",
      location: { type: 'wilderness', description: 'Rocky canyon pass' }, 
      combatInitiated: true,
      opponent: mockCharacterOutlaw as Character 
    });
    mockGetAIResponse.mockResolvedValue(mockRawAIResponse);
    
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    expect(response!.opponent).toEqual({
      name: "Outlaw Pete",
      strength: 75,
      health: 75 
    });
  });
  
  it('should use default health value when neither health nor strength available', async () => {
    const mockRawAIResponse = createMockAIResponse({
      narrative: "A stranger approaches.",
      combatInitiated: true,
      opponent: mockCharacterStranger as Character 
    });
    mockGetAIResponse.mockResolvedValue(mockRawAIResponse);
    
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    expect(response!.opponent).toEqual({
      name: "Mysterious Stranger",
      strength: 10, 
      health: 10 
    });
  });
  
  it('should handle errors gracefully', async () => {
    const mockError = new Error('AI service error');
    mockGetAIResponse.mockRejectedValue(mockError); 
    
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    await act(async () => {
      await expect(result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY))
        .rejects.toThrow('AI service error');
    });
    
    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
  });
  
  it('should use custom context options when provided', async () => {
    const mockRawAIResponse = createMockAIResponse({
      narrative: "You look around the town.",
      opponent: undefined
    });
    mockGetAIResponse.mockResolvedValue(mockRawAIResponse);
    
    const customOptions: NarrativeContextOptions = {
      compressionLevel: 'high',
      maxTokens: 1000,
      prioritizeRecentEvents: true
    };
    
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    await act(async () => {
      await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY, customOptions);
    });
    
    expect(mockUseOptimizedNarrativeContext().buildOptimizedContext)
      .toHaveBeenCalledWith(customOptions);
  });
  
  it('should include storyProgression with non-nullable description', async () => {
    const mockRawAIResponse = createMockAIResponse({
      narrative: "The sheriff reveals a secret.",
      opponent: undefined,
      storyProgression: {
        title: "Sheriff's Secret",
        description: null as unknown as string, 
        significance: 'major' 
      }
    });
    mockGetAIResponse.mockResolvedValue(mockRawAIResponse);
    
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    expect(response!.storyProgression).toEqual({
      title: "Sheriff's Secret",
      description: '', 
      significance: 'major' 
    });
  });
  
  it('should correctly handle makeAIRequestWithFocus', async () => {
    const mockRawAIResponse = createMockAIResponse({
      narrative: "You focus on the wanted poster.",
      opponent: undefined
    });
    mockGetAIResponse.mockResolvedValue(mockRawAIResponse);
    
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    await act(async () => {
      await result.current.makeAIRequestWithFocus(MOCK_PROMPT, MOCK_INVENTORY, ['sheriff', 'bounty']);
    });
    
    expect(mockUseOptimizedNarrativeContext().buildOptimizedContext)
      .toHaveBeenCalledWith(expect.objectContaining({
        compressionLevel: 'medium',
        maxTokens: 1500,
        prioritizeRecentEvents: true,
        relevanceThreshold: 6
      }));
  });
  
  it('should correctly handle makeAIRequestWithCompactContext', async () => {
    const mockRawAIResponse = createMockAIResponse({
      narrative: "Quick response in compact form.",
      opponent: undefined
    });
    mockGetAIResponse.mockResolvedValue(mockRawAIResponse);
    
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    await act(async () => {
      await result.current.makeAIRequestWithCompactContext(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    expect(mockUseOptimizedNarrativeContext().buildOptimizedContext)
      .toHaveBeenCalledWith(expect.objectContaining({
        compressionLevel: 'high',
        maxTokens: 1000,
        maxHistoryEntries: 5,
        maxDecisionHistory: 3
      }));
  });
  
});
