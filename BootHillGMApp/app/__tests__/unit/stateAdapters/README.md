# State Adapters Tests

This directory contains tests for the state adapters which provide backward compatibility between the new slice-based architecture and the legacy state shape.

## Directory Structure

- `stateAdapters.test.ts`: Main entry point that imports all adapter tests
- `adaptStateForTests.test.ts`: Tests for the combined adapter function
- `combatAdapter.test.ts`: Tests for combat state adapter
- `inventoryAdapter.test.ts`: Tests for inventory state adapter  
- `journalAdapter.test.ts`: Tests for journal state adapter
- `migrationAdapter.test.ts`: Tests for migration state adapter
- `narrativeAdapter.test.ts`: Tests for narrative state adapter
- `testHelpers.ts`: Re-exports helper functions for backward compatibility
- `testTypes.ts`: Re-exports type definitions for backward compatibility
- `support/`: Helper directory (not processed as test files)
  - `helpers.ts`: Helper functions and type guards
  - `types.ts`: Type definitions for test data

## Usage

Individual adapter tests can be run directly, or you can run all tests through the main entry point:

```bash
# Run all state adapter tests
npm test -- app/__tests__/unit/stateAdapters.test.ts

# Run a specific adapter test
npm test -- app/__tests__/unit/stateAdapters/inventoryAdapter.test.ts
```

## Notes for Developers

- Each test file focuses on a single adapter's functionality
- Helper functions and types are shared via the support directory
- The original file structure is maintained with re-export files
- All tests maintain the same behavior as the original implementation
