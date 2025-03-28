---
title: Narrative Hook Testing Guide
aliases: [Testing Narrative Hooks]
tags: [testing, narrative, hooks, react-testing-library]
created: 2025-03-28
updated: 2025-03-28
---

# Narrative Hook Testing Guide

## Overview

This guide outlines the approach for testing the narrative hook system in Boot Hill GM. The narrative hooks have been refactored into a modular system with multiple specialized hooks that require targeted testing strategies.

## Testing Structure

For each narrative hook, we follow this testing structure:

1. **Unit tests** for each individual hook
2. **Integration tests** for hook composition
3. **Mock implementations** of dependencies
4. **Snapshot testing** of returned values

## Sample Testing Approach

Here's how to test each of the narrative hook modules:

### 1. Testing useDecisionPresentation

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useDecisionPresentation } from '../hooks/narrative/useDecisionPresentation';
import { presentDecision } from '../actions/narrativeActions';
import { EVENTS, triggerCustomEvent } from '../utils/events';
import { mockDecision, mockNarrativeState } from './fixtures/narrativeFixtures';

// Mock the events utility
jest.mock('../utils/events', () => ({
  EVENTS: {
    DECISION_READY: 'bhgm:decision:ready',
    DECISION_CLEARED: 'bhgm:decision:cleared',
    UI_FORCE_UPDATE: 'bhgm:ui:force-update',
  },
  triggerCustomEvent: jest.fn(),
}));

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn();
window.dispatchEvent = mockDispatchEvent;

describe('useDecisionPresentation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should present a decision correctly', () => {
    // Setup mock context
    const mockDispatch = jest.fn();
    const mockContext = {
      state: mockNarrativeState,
      dispatch: mockDispatch
    };
    
    // Render the hook
    const { result } = renderHook(() => useDecisionPresentation(mockContext));
    
    // Call presentPlayerDecision
    act(() => {
      result.current.presentPlayerDecision(mockDecision);
    });
    
    // Verify dispatch was called with the correct action
    expect(mockDispatch).toHaveBeenCalledWith(presentDecision(mockDecision));
    
    // Verify events were triggered
    expect(triggerCustomEvent).toHaveBeenCalledWith(EVENTS.DECISION_READY, mockDecision);
    expect(mockDispatchEvent).toHaveBeenCalled();
  });

  it('should clear a decision correctly', () => {
    // Setup mock context
    const mockDispatch = jest.fn();
    const mockContext = {
      state: mockNarrativeState,
      dispatch: mockDispatch
    };
    
    // Render the hook
    const { result } = renderHook(() => useDecisionPresentation(mockContext));
    
    // Call clearPlayerDecision
    act(() => {
      result.current.clearPlayerDecision();
    });
    
    // Verify dispatch was called with the correct action
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLEAR_CURRENT_DECISION' });
    
    // Verify events were triggered
    expect(triggerCustomEvent).toHaveBeenCalledWith(EVENTS.DECISION_CLEARED);
    expect(triggerCustomEvent).toHaveBeenCalledWith(EVENTS.UI_FORCE_UPDATE);
    expect(mockDispatchEvent).toHaveBeenCalled();
  });
});
```

### 2. Testing useNarrativeGeneration

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useNarrativeGeneration } from '../hooks/narrative/useNarrativeGeneration';
import { AIService } from '../services/ai';
import { mockNarrativeState } from './fixtures/narrativeFixtures';

// Mock the AIService
jest.mock('../services/ai', () => ({
  AIService: jest.fn().mockImplementation(() => ({
    getAIResponse: jest.fn().mockResolvedValue({
      narrative: 'Mock narrative response',
      acquiredItems: ['Item1'],
      removedItems: ['Item2']
    })
  }))
}));

describe('useNarrativeGeneration', () => {
  it('should generate a narrative response successfully', async () => {
    // Setup mock context
    const mockContext = {
      state: mockNarrativeState,
      dispatch: jest.fn()
    };
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useNarrativeGeneration(mockContext)
    );
    
    // Get the generate function and initial state
    const { generateNarrativeResponse, isGeneratingNarrative } = result.current;
    
    // Verify initial state
    expect(isGeneratingNarrative).toBe(false);
    
    // Call generate function
    let responsePromise;
    act(() => {
      responsePromise = generateNarrativeResponse('Test option', 'Test prompt');
    });
    
    // Wait for the state to update
    await waitForNextUpdate();
    
    // Verify loading state
    expect(result.current.isGeneratingNarrative).toBe(true);
    
    // Resolve the promise
    const response = await responsePromise;
    
    // Wait for the next state update
    await waitForNextUpdate();
    
    // Verify the response and final state
    expect(response).toEqual({
      narrative: 'Mock narrative response',
      acquiredItems: ['Item1'],
      removedItems: ['Item2']
    });
    
    expect(result.current.isGeneratingNarrative).toBe(false);
  });

  it('should handle errors and provide a fallback response', async () => {
    // Mock AIService to throw an error
    (AIService as jest.Mock).mockImplementationOnce(() => ({
      getAIResponse: jest.fn().mockRejectedValue(new Error('Test error'))
    }));
    
    // Setup mock context
    const mockContext = {
      state: mockNarrativeState,
      dispatch: jest.fn()
    };
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useNarrativeGeneration(mockContext)
    );
    
    // Call generate function
    let responsePromise;
    act(() => {
      responsePromise = result.current.generateNarrativeResponse('Test option', 'Test prompt');
    });
    
    // Wait for state updates
    await waitForNextUpdate();
    
    // Resolve the promise
    const response = await responsePromise;
    
    // Wait for final state update
    await waitForNextUpdate();
    
    // Verify we got a fallback response
    expect(response.narrative).toContain('The story continues as you test option');
    expect(response.acquiredItems).toEqual([]);
    expect(response.removedItems).toEqual([]);
    
    // Verify we're no longer in loading state
    expect(result.current.isGeneratingNarrative).toBe(false);
  });
});
```

### 3. Integration Testing the Main Hook

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useNarrativeContext } from '../hooks/narrative/useNarrativeContext';
import NarrativeContext from '../context/NarrativeContext';
import { mockNarrativeState, mockDecision } from './fixtures/narrativeFixtures';

// Mock the sub-hooks
jest.mock('../hooks/narrative/useDecisionPresentation', () => ({
  useDecisionPresentation: jest.fn(() => ({
    presentPlayerDecision: jest.fn(),
    clearPlayerDecision: jest.fn(),
  })),
}));

jest.mock('../hooks/narrative/useNarrativeGeneration', () => ({
  useNarrativeGeneration: jest.fn(() => ({
    generateNarrativeResponse: jest.fn(),
    isGeneratingNarrative: false,
    setIsGeneratingNarrative: jest.fn(),
  })),
}));

// Similar mocks for other hooks...

describe('useNarrativeContext', () => {
  const wrapper = ({ children }) => (
    <NarrativeContext.Provider 
      value={{ 
        state: mockNarrativeState, 
        dispatch: jest.fn() 
      }}
    >
      {children}
    </NarrativeContext.Provider>
  );

  it('should compose functionality from sub-hooks', () => {
    // Render the hook within the provider wrapper
    const { result } = renderHook(() => useNarrativeContext(), { wrapper });
    
    // Verify the hook returns expected properties
    expect(result.current).toHaveProperty('currentDecision');
    expect(result.current).toHaveProperty('decisionHistory');
    expect(result.current).toHaveProperty('presentPlayerDecision');
    expect(result.current).toHaveProperty('recordPlayerDecision');
    expect(result.current).toHaveProperty('clearPlayerDecision');
    expect(result.current).toHaveProperty('getDecisionHistory');
    expect(result.current).toHaveProperty('checkForDecisionTriggers');
    expect(result.current).toHaveProperty('triggerAIDecision');
    expect(result.current).toHaveProperty('ensureFreshState');
    expect(result.current).toHaveProperty('hasActiveDecision');
    expect(result.current).toHaveProperty('isGeneratingNarrative');
  });

  it('should throw an error when used outside NarrativeProvider', () => {
    // Attempt to render the hook without the provider
    expect(() => {
      renderHook(() => useNarrativeContext());
    }).toThrow('useNarrativeContext must be used within a NarrativeProvider');
  });
});
```

## Testing Fixtures

Create realistic fixtures to test with:

```typescript
// fixtures/narrativeFixtures.ts
import { NarrativeState, PlayerDecision } from '../../types/narrative.types';

export const mockDecision: PlayerDecision = {
  id: 'test-decision-1',
  prompt: 'Test decision prompt',
  timestamp: Date.now(),
  options: [
    { 
      id: 'option-1', 
      text: 'Test option 1',
      impact: 'Test impact 1'
    },
    { 
      id: 'option-2', 
      text: 'Test option 2',
      impact: 'Test impact 2'
    }
  ],
  context: 'Test context',
  importance: 'moderate',
  characters: ['Character 1'],
  aiGenerated: false
};

export const mockNarrativeState: NarrativeState = {
  currentStoryPoint: null,
  visitedPoints: [],
  availableChoices: [],
  narrativeHistory: [
    'Previous narrative entry 1',
    'Previous narrative entry 2',
    'Previous narrative entry 3'
  ],
  displayMode: 'standard',
  currentDecision: mockDecision,
  narrativeContext: {
    characterFocus: [],
    themes: [],
    worldContext: 'Test world context',
    importantEvents: [],
    decisionHistory: []
  },
  error: null
};
```

## Best Practices

1. **Test each hook in isolation** - Mock dependencies to test the hook logic independently
2. **Cover edge cases** - Test error handling, empty states, and boundary conditions
3. **Verify state transitions** - Confirm loading states are set and cleared correctly
4. **Check event triggering** - Verify custom events are dispatched when expected
5. **Test performance-sensitive code** - Verify memoization works by checking reference stability

## React Hooks Testing Parallels to Drupal

If you're coming from a Drupal background, here are some helpful parallels:

1. **Hook Testing vs. Plugin Testing**
   - React hooks are similar to Drupal plugins/services - small, specific units of functionality
   - Both require isolation in testing with mockable dependencies

2. **Context Providers vs. Service Containers**
   - React's Context API is similar to Drupal's service container
   - Both provide dependency injection for components/plugins

3. **Mocking Patterns**
   - Jest mocks for React hooks are similar to PHPUnit mocks in Drupal
   - Both use proper dependency injection to make testing easier

4. **Events System**
   - React's custom events parallel Drupal's event dispatcher
   - Both need verification in tests that events are properly triggered

## Setting Up Narrative Tests

Create a basic test setup file:

```typescript
// setupTests.ts
import '@testing-library/jest-dom';

// Mock window properties
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Global test timeout (narrative operations can be async)
jest.setTimeout(10000);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## Related Documentation

- [[hook-testing|General Hook Testing Guide]]
- [[narrative-architecture|Narrative System Architecture]]
- [[../core-systems/narrative-system|Narrative System Overview]]
- [[testing-overview|Testing Overview]]
