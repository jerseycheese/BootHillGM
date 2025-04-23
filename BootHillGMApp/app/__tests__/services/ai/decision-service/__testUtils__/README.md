# Decision Service Test Utilities

This directory contains utilities for testing the decision service components.

## Structure

- `mockData.ts`: Contains mock objects for narrative state, character data, API responses
- `mockDependencies.ts`: Contains mock implementations of service dependencies
- `testSetup.ts`: Common setup for the test environment
- `index.ts`: Re-exports all utilities with namespaces to avoid conflicts
- `dummy.test.ts`: Ensures Jest recognizes this directory correctly

## Usage

Import the utilities from this directory:

```typescript
// Import with namespaces to avoid naming conflicts
import { mockData, mockDependencies, testSetup } from './__testUtils__';

// Then use the specific items
const { mockNarrativeState, mockCharacter } = mockData;
const { setupMockFetch } = mockDependencies;
const { resetMocks } = testSetup;
```

Or import specific items directly:

```typescript
import { mockNarrativeState, mockCharacter } from './__testUtils__/mockData';
import { setupMockFetch } from './__testUtils__/mockDependencies';
import { resetMocks } from './__testUtils__/testSetup';
```

## Notes

- All test utilities follow the project's camelCase naming convention
- Mock data is documented with JSDoc comments for improved IDE support
- Utility functions are designed to be reusable across different test files
