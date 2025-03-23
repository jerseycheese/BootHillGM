---
title: Test Configuration
aliases: [Jest Configuration, Test Setup]
tags: [technical, testing, jest, react-testing-library]
created: 2025-03-22
updated: 2025-03-22
---

# Test Configuration

This document explains the testing configuration for Boot Hill GM, including Jest setup, test scripts, and common usage patterns.

## Test Scripts

Boot Hill GM provides several npm scripts for running tests in different ways:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests for specific parts of the application
npm run test:component  # Test only components
npm run test:hooks      # Test only hooks
npm run test:utils      # Test only utility functions
npm run test:combat     # Test only combat system
npm run test:narrative  # Test only narrative system

# Run only snapshot tests
npm run test:snapshots  # Run tests matching *.snap.test.tsx

# Update snapshots
npm run test:update-snapshots

# Update a specific snapshot by test name
npm run test:update-snapshot-single "specific test name"

# Generate coverage report
npm run test:coverage
```

## Test File Organization

Tests are organized in a parallel structure to the source code:

```
app/
  components/   <- Source components
  hooks/        <- Source hooks
  __tests__/    <- Test files
    components/ <- Component tests
    hooks/      <- Hook tests
    ...
  test/         <- Test utilities and templates
    templates/  <- Test templates
    utils/      <- Test utility functions
    fixtures/   <- Mock data generators and fixed data
    docs/       <- Testing documentation
    __mocks__/  <- Mock implementations
```

## Test Templates

The `app/test/templates/` directory contains reusable templates for different types of tests:

- `ComponentTest.tsx` - Template for testing React components
- `HookTest.tsx` - Template for testing custom hooks
- `ReducerTest.tsx` - Template for testing reducers and state management
- `ApiTest.tsx` - Template for testing API integrations
- `SnapshotTest.tsx` - Template for snapshot testing

These templates provide starting points and best practices for writing tests.

## Test Utilities

The `app/test/utils/` directory contains utilities to make testing easier:

- `renderUtils.tsx` - Utilities for rendering components with context providers
- `userEventUtils.ts` - Helpers for simulating user interactions
- `testRenderers.tsx` - Custom renderers for components with context

## Mock Data

The `app/test/fixtures/` directory contains utilities for generating consistent mock data:

- `mockDataGenerators.ts` - Functions to generate mock data for tests
- `mockComponents.ts` - Mock data specifically for component testing

## Jest Configuration

The Jest configuration is defined in `jest.config.js` and includes:

```javascript
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    // Other paths to ignore
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/*.config.js',
    '!<rootDir>/coverage/**',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  snapshotFormat: {
    printBasicPrototype: false,
  },
}
```

## Snapshot Testing Configuration

Snapshot tests use these specific settings:

```javascript
// In jest.config.js
snapshotFormat: {
  printBasicPrototype: false,
},
```

Snapshot tests should:
- Be saved with the `.snap.test.tsx` file extension
- Live alongside other tests for the same component
- Use consistent mock data from the fixtures directory
- Focus on UI presentation, not logic

## Test Setup

The `jest.setup.js` file configures the test environment with necessary mocks and global setup:

```javascript
// Add React Testing Library setup
import '@testing-library/jest-dom';

// Mock window.matchMedia for responsive component testing
Object.defineProperty(window, 'matchMedia', {
  // Implementation...
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  // Implementation...
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  // Implementation...
};

// Mock localStorage and sessionStorage
class LocalStorageMock {
  // Implementation...
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: new LocalStorageMock(),
});
```

## Watch Mode

When running tests in watch mode (`npm run test:watch`), you have access to several commands:

- `a` - Run all tests
- `f` - Run only failed tests
- `p` - Filter by filename (powered by jest-watch-typeahead)
- `t` - Filter by test name (powered by jest-watch-typeahead)
- `q` - Quit watch mode

The watch mode is particularly useful during development as it allows you to run tests continuously as you make changes.

## Coverage Reports

When running `npm run test:coverage`, Jest generates a coverage report in the `coverage` directory. This report shows:

- Line coverage: Percentage of code lines executed during tests
- Statement coverage: Percentage of statements executed
- Branch coverage: Percentage of branches (if/else, switch) executed
- Function coverage: Percentage of functions called

You can open `coverage/lcov-report/index.html` in a browser to view a detailed coverage report.

## Debugging Tests

If you need to debug tests, you can use the following techniques:

1. **Console debugging**: Add `console.log()` statements to your tests or components
2. **Screen debugging**: Use `screen.debug()` to view the rendered DOM
3. **Element debugging**: Use `screen.debug(element)` to debug specific elements
4. **Breakpoints**: Use the debugger statement or set breakpoints in your IDE

## Custom Matchers

The `@testing-library/jest-dom` package adds custom matchers for DOM assertions:

```javascript
// Examples
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('Expected text');
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveClass('expected-class');
```

## Snapshot Testing Best Practices

### When to Use Snapshots
- Use for UI components that should maintain consistent appearance
- Use for components where the HTML structure is important
- Use for testing different visual states of the same component

### When Not to Use Snapshots
- Avoid for components that change frequently
- Avoid for testing logic or behavior
- Avoid for components with dynamic content like dates or IDs

### Managing Snapshots
- Review snapshot changes carefully in PRs
- Update snapshots when UI changes are intentional
- Keep snapshots small and focused
- Use consistent mock data

## Related Documents
- [[testing|Testing Guide]]
- [[development/workflows/testing-workflow|Testing Workflow]]
- [[app/test/docs/snapshot-testing-guide|Snapshot Testing Guide]]
