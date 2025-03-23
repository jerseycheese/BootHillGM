---
title: Hook Testing
aliases: [React Hook Tests, Custom Hook Testing]
tags: [technical, testing, hooks, react-testing-library, jest]
created: 2025-03-22
updated: 2025-03-22
---

# Hook Testing

## Overview

This guide covers techniques for testing custom React hooks in the BootHillGM project. Hook tests verify that hooks manage state correctly and interact properly with other hooks and context.

## Basic Hook Testing

React Testing Library provides `renderHook` for testing hooks in isolation.

```typescript
// app/__tests__/hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../../hooks/useCounter';

describe('useCounter hook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('initializes with provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(6);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  it('does not decrement below minimum value', () => {
    const { result } = renderHook(() => useCounter(0, { min: 0 }));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(0);
  });

  it('does not increment above maximum value', () => {
    const { result } = renderHook(() => useCounter(10, { max: 10 }));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(10);
  });
});
```

## Testing Hooks with Dependencies

Many hooks depend on context or other hooks. These need wrapper components.

```typescript
// app/__tests__/hooks/useCharacterStats.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useCharacterStats } from '../../hooks/useCharacterStats';
import { GameProvider } from '../../context/GameContext';

describe('useCharacterStats hook', () => {
  // Wrapper component to provide context for the hook
  const wrapper = ({ children }) => (
    <GameProvider initialHealth={100} initialStamina={50}>
      {children}
    </GameProvider>
  );

  it('returns current stats from context', () => {
    const { result } = renderHook(() => useCharacterStats(), { wrapper });
    
    expect(result.current.stats).toEqual({
      health: 100,
      stamina: 50,
      // ...other default stats
    });
  });

  it('updates stat when modifyStat is called', () => {
    const { result } = renderHook(() => useCharacterStats(), { wrapper });
    
    act(() => {
      result.current.modifyStat('health', -10);
    });
    
    expect(result.current.stats.health).toBe(90);
  });

  it('calculates derived stats correctly', () => {
    const { result } = renderHook(() => useCharacterStats(), { wrapper });
    
    // Assuming strength affects damage bonus
    act(() => {
      result.current.modifyStat('strength', 5);
    });
    
    expect(result.current.derivedStats.damageBonus).toBe(2);
  });

  it('handles stat updates with minimum values', () => {
    const { result } = renderHook(() => useCharacterStats(), { wrapper });
    
    act(() => {
      result.current.modifyStat('health', -200); // Large negative adjustment
    });
    
    // Health should not go below 0
    expect(result.current.stats.health).toBe(0);
  });
});
```

## Advanced Hook Testing

### Testing Hooks that Interact with Other Hooks

```typescript
// app/__tests__/hooks/useCombatState.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useEffect } from 'react';
import { CombatProvider } from '../../context/CombatContext';
import { useCombatState } from '../../hooks/useCombatState';

describe('useCombatState hook', () => {
  const wrapper = ({ children }) => (
    <CombatProvider 
      initialState={{
        combatants: [
          { id: 'player', name: 'Player', health: 100, initiative: 15 },
          { id: 'enemy1', name: 'Bandit', health: 50, initiative: 12 }
        ],
        turn: 0,
        round: 1,
        status: 'active'
      }}
    >
      {children}
    </CombatProvider>
  );

  it('provides combat state from context', () => {
    const { result } = renderHook(() => useCombatState(), { wrapper });
    
    expect(result.current.combatants).toHaveLength(2);
    expect(result.current.turn).toBe(0);
    expect(result.current.round).toBe(1);
    expect(result.current.status).toBe('active');
  });

  it('advances turn when nextTurn is called', () => {
    const { result } = renderHook(() => useCombatState(), { wrapper });
    
    // Current combatant should be player
    expect(result.current.currentCombatant.id).toBe('player');
    
    act(() => {
      result.current.nextTurn();
    });
    
    // Turn should advance to enemy
    expect(result.current.currentCombatant.id).toBe('enemy1');
  });

  it('advances round when all combatants have acted', () => {
    const { result } = renderHook(() => useCombatState(), { wrapper });
    
    expect(result.current.round).toBe(1);
    
    // Advance through all combatants
    act(() => {
      result.current.nextTurn(); // To enemy1
      result.current.nextTurn(); // Back to player, new round
    });
    
    expect(result.current.round).toBe(2);
    expect(result.current.currentCombatant.id).toBe('player');
  });
});
```

### Testing Hooks with Side Effects

```typescript
// app/__tests__/hooks/useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('useLocalStorage hook', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with default value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('defaultValue');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey');
  });

  it('initializes with stored value when it exists', () => {
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify('storedValue'));
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('storedValue');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey');
  });

  it('updates stored value when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    act(() => {
      result.current[1]('newValue');
    });
    
    expect(result.current[0]).toBe('newValue');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'testKey',
      JSON.stringify('newValue')
    );
  });

  it('handles functional updates', () => {
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(10));
    
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    
    act(() => {
      result.current[1](prev => prev + 1);
    });
    
    expect(result.current[0]).toBe(11);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'counter',
      JSON.stringify(11)
    );
  });
});
```

### Testing Hooks with Async Logic

```typescript
// app/__tests__/hooks/useDataFetching.test.tsx
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { useDataFetching } from '../../hooks/useDataFetching';

// Mock fetch
global.fetch = jest.fn();

describe('useDataFetching hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with loading state', () => {
    // Mock a promise that doesn't resolve immediately
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    const { result } = renderHook(() => useDataFetching('https://api.example.com/data'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('sets data when fetch succeeds', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    );
    
    const { result } = renderHook(() => useDataFetching('https://api.example.com/data'));
    
    // Initially loading
    expect(result.current.loading).toBe(true);
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Should have data and no error
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('sets error when fetch fails', async () => {
    const mockError = new Error('Network error');
    global.fetch.mockImplementationOnce(() => Promise.reject(mockError));
    
    const { result } = renderHook(() => useDataFetching('https://api.example.com/data'));
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Should have error and no data
    expect(result.current.data).toBe(null);
    expect(result.current.error).toEqual(mockError);
  });

  it('refetches data when URL changes', async () => {
    // First fetch
    const mockData1 = { id: 1, name: 'Data 1' };
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData1)
      })
    );
    
    const { result, rerender } = renderHook(
      (url) => useDataFetching(url), 
      { initialProps: 'https://api.example.com/data/1' }
    );
    
    // Wait for first fetch to complete
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });
    
    // Second fetch with different URL
    const mockData2 = { id: 2, name: 'Data 2' };
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData2)
      })
    );
    
    // Rerender with new URL
    rerender('https://api.example.com/data/2');
    
    // Should go back to loading state
    expect(result.current.loading).toBe(true);
    
    // Wait for second fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Should have new data
    expect(result.current.data).toEqual(mockData2);
  });
});
```

### Testing Hooks with Cleanup

```typescript
// app/__tests__/hooks/useEventListener.test.tsx
import { renderHook } from '@testing-library/react';
import { useEventListener } from '../../hooks/useEventListener';

describe('useEventListener hook', () => {
  it('adds event listener to element', () => {
    // Create a DOM element for testing
    const element = document.createElement('div');
    const addEventListener = jest.spyOn(element, 'addEventListener');
    const removeEventListener = jest.spyOn(element, 'removeEventListener');
    
    // Mock event handler
    const handler = jest.fn();
    
    const { unmount } = renderHook(() => 
      useEventListener('click', handler, element)
    );
    
    // Event listener should be added
    expect(addEventListener).toHaveBeenCalledWith('click', handler, undefined);
    
    // Unmount to trigger cleanup
    unmount();
    
    // Event listener should be removed during cleanup
    expect(removeEventListener).toHaveBeenCalledWith('click', handler, undefined);
  });

  it('uses document as default element if none provided', () => {
    const addEventListener = jest.spyOn(document, 'addEventListener');
    const removeEventListener = jest.spyOn(document, 'removeEventListener');
    
    // Mock event handler
    const handler = jest.fn();
    
    const { unmount } = renderHook(() => 
      useEventListener('mousedown', handler)
    );
    
    // Event listener should be added to document
    expect(addEventListener).toHaveBeenCalledWith('mousedown', handler, undefined);
    
    // Unmount to trigger cleanup
    unmount();
    
    // Event listener should be removed from document during cleanup
    expect(removeEventListener).toHaveBeenCalledWith('mousedown', handler, undefined);
  });

  it('updates event listener when handler changes', () => {
    const element = document.createElement('div');
    const addEventListener = jest.spyOn(element, 'addEventListener');
    const removeEventListener = jest.spyOn(element, 'removeEventListener');
    
    // Initial handler
    const initialHandler = jest.fn();
    
    const { rerender } = renderHook(
      ({ handler }) => useEventListener('click', handler, element),
      { initialProps: { handler: initialHandler } }
    );
    
    // Event listener should be added with initial handler
    expect(addEventListener).toHaveBeenCalledWith('click', initialHandler, undefined);
    
    // New handler
    const newHandler = jest.fn();
    
    // Rerender with new handler
    rerender({ handler: newHandler });
    
    // Old handler should be removed
    expect(removeEventListener).toHaveBeenCalledWith('click', initialHandler, undefined);
    
    // New handler should be added
    expect(addEventListener).toHaveBeenCalledWith('click', newHandler, undefined);
  });
});
```

## Common Hook Testing Patterns

### Testing State Updates

```typescript
it('updates state correctly', () => {
  const { result } = renderHook(() => useState(0));
  
  act(() => {
    result.current[1](5);
  });
  
  expect(result.current[0]).toBe(5);
});
```

### Testing Effects

```typescript
it('runs effect when dependencies change', () => {
  const effectCallback = jest.fn();
  
  const { rerender } = renderHook(
    ({ dependency }) => {
      useEffect(effectCallback, [dependency]);
      return dependency;
    },
    { initialProps: { dependency: 'initial' } }
  );
  
  // Effect runs on mount
  expect(effectCallback).toHaveBeenCalledTimes(1);
  
  // Rerender with same dependency
  rerender({ dependency: 'initial' });
  
  // Effect should not run again
  expect(effectCallback).toHaveBeenCalledTimes(1);
  
  // Rerender with different dependency
  rerender({ dependency: 'changed' });
  
  // Effect should run again
  expect(effectCallback).toHaveBeenCalledTimes(2);
});
```

### Testing Memoization

```typescript
it('memoizes computed value', () => {
  const computeMock = jest.fn(a => a * 2);
  
  const { rerender } = renderHook(
    ({ value }) => useMemo(() => computeMock(value), [value]),
    { initialProps: { value: 5 } }
  );
  
  // Compute function called once
  expect(computeMock).toHaveBeenCalledTimes(1);
  expect(computeMock).toHaveBeenCalledWith(5);
  
  // Rerender with same value
  rerender({ value: 5 });
  
  // Compute function should not be called again
  expect(computeMock).toHaveBeenCalledTimes(1);
  
  // Rerender with different value
  rerender({ value: 10 });
  
  // Compute function should be called again
  expect(computeMock).toHaveBeenCalledTimes(2);
  expect(computeMock).toHaveBeenCalledWith(10);
});
```

## Best Practices

### Use `act()` for State Updates

Always wrap state updates in `act()` to ensure React processes them before assertions:

```typescript
act(() => {
  result.current.increment();
});

// Now make assertions
expect(result.current.count).toBe(1);
```

### Test Cleanup

Test that hooks properly clean up resources when unmounted:

```typescript
it('cleans up resources on unmount', () => {
  const cleanup = jest.fn();
  
  const { unmount } = renderHook(() => {
    useEffect(() => {
      return cleanup;
    }, []);
  });
  
  // Unmount the hook
  unmount();
  
  // Cleanup should have been called
  expect(cleanup).toHaveBeenCalledTimes(1);
});
```

### Test Edge Cases

Test edge cases and error handling:

```typescript
it('handles invalid inputs gracefully', () => {
  // Test with undefined
  const { result: result1 } = renderHook(() => useCounter(undefined));
  expect(result1.current.count).toBe(0); // Should use default value
  
  // Test with negative initial value
  const { result: result2 } = renderHook(() => useCounter(-5));
  expect(result2.current.count).toBe(-5); // Should accept negative value
  
  // Test with non-numeric value
  const { result: result3 } = renderHook(() => useCounter('not a number' as any));
  expect(result3.current.count).toBe(0); // Should handle gracefully
});
```

### Async Testing Tips

For async hooks:

1. Use `async/await` with `waitFor` to wait for async operations
2. Set reasonable timeouts (default is 1000ms)
3. Mock timers for operations involving `setTimeout`:

```typescript
// Test for a hook with debounced functions
it('debounces function calls', async () => {
  jest.useFakeTimers();
  
  const callback = jest.fn();
  const { result } = renderHook(() => useDebounce(callback, 500));
  
  // Call the debounced function
  act(() => {
    result.current();
    result.current();
    result.current();
  });
  
  // Function should not be called yet
  expect(callback).not.toHaveBeenCalled();
  
  // Fast-forward time
  act(() => {
    jest.advanceTimersByTime(600);
  });
  
  // Function should be called once
  expect(callback).toHaveBeenCalledTimes(1);
  
  jest.useRealTimers();
});
```

## Related Documentation

- [[component-testing|Component Testing]]
- [[integration-testing|Integration Testing]]
- [[testing-guide|Testing Guide Overview]]
