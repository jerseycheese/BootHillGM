---
title: State Adapters Testing
aliases: [State Adapters Test Structure]
tags: [technical, testing, state-management, adapters]
created: 2025-03-30
updated: 2025-03-30
---

# State Adapters Testing

## Overview

This document describes the testing approach for the state adapters system, which provides backward compatibility between the new slice-based architecture and the legacy state shape. The tests have been refactored into a modular structure to improve maintainability while maintaining complete test coverage.

## Test Structure

### Directory Organization

The state adapters tests follow a modular organization:

```
app/__tests__/unit/
├── stateAdapters.test.ts         # Main entry point
└── stateAdapters/                # Individual test files
    ├── adaptStateForTests.test.ts  # Tests for the combined adapter
    ├── combatAdapter.test.ts     # Combat adapter tests
    ├── inventoryAdapter.test.ts  # Inventory adapter tests
    ├── journalAdapter.test.ts    # Journal adapter tests
    ├── migrationAdapter.test.ts  # Migration adapter tests
    ├── narrativeAdapter.test.ts  # Narrative adapter tests
    ├── testHelpers.ts            # Re-export of helper functions
    ├── testTypes.ts              # Re-export of type definitions
    └── support/                  # Helper directory
        ├── helpers.ts            # Helper functions and type guards
        └── types.ts              # Type definitions
```

### Test Files Structure

Each adapter test file follows a consistent pattern:

1. **Header comment** - Explaining the purpose of the adapter and test
2. **Imports** - Including the adapter, types, and test helpers
3. **Test suite** - Using Jest's `describe` and `test` functions
4. **Test cases** - Covering core functionality and edge cases

## Adapter Test Files

### Main Entry Point

The main entry point (`stateAdapters.test.ts`) imports all the individual test files, allowing them to be run together or independently.

### Individual Adapter Tests

Each adapter has a dedicated test file that focuses on its specific functionality:

- **Inventory Adapter** - Tests array-like behavior for inventory items
- **Journal Adapter** - Tests array-like behavior for journal entries
- **Combat Adapter** - Tests combat flags and state adaptation
- **Narrative Adapter** - Tests narrative context and scene data
- **Migration Adapter** - Tests legacy state migration capabilities

### Combined Adapter Tests

The `adaptStateForTests.test.ts` file tests the combined functionality of all adapters working together.

## Support Files

### Helper Functions

The `support/helpers.ts` file contains type guard functions and test utilities:

- `hasArrayMethods` - Checks if inventory has array methods
- `hasEntriesArray` - Checks if journal entries have array methods
- `hasCombatFlags` - Checks if combat flags are present
- `hasNarrativeContext` - Checks if narrative context is present
- `isFullyAdapted` - Checks if all adapters have been applied

### Type Definitions

The `support/types.ts` file contains TypeScript interfaces for:

- Partial game state interfaces for each adapter
- Array-like interface definitions
- Legacy state format type definitions

## Test Implementation Notes

### Type Safety

The tests use TypeScript type assertions to maintain type safety:

```typescript
// Example type guard
function hasArrayMethods(obj: unknown): obj is { inventory: InventoryArrayLike } {
  return obj !== null && 
         typeof obj === 'object' && 
         'inventory' in obj && 
         obj.inventory !== null &&
         typeof obj.inventory === 'object' && 
         'find' in obj.inventory &&
         'filter' in obj.inventory;
}

// Example usage in tests
if (hasArrayMethods(adapted)) {
  expect(adapted.inventory.find(item => item.id === 'item1')).toBeDefined();
}
```

### Jest Configuration

The support directory is not processed as test files by Jest, instead serving as a shared utility for test files. The main test modules import from these support files.

## Running Tests

```bash
# Run all state adapter tests
npm test -- app/__tests__/unit/stateAdapters.test.ts

# Run a specific adapter test
npm test -- app/__tests__/unit/stateAdapters/inventoryAdapter.test.ts
```

## Related Documentation

- [[testing-guide|Testing Guide]] - General testing approach
- [[state-management|State Management]] - State architecture overview
