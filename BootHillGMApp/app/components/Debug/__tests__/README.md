# DevTools Component Tests

## Overview

This directory contains tests for the DevTools panel components. These components have been refactored from a single large component into smaller, more focused components to improve maintainability and testability.

## Current Test Coverage

Currently, we have implemented MVP-level tests for:

- `DevToolsPanel`: Basic rendering and panel collapse functionality
- `GameControlSection`: Button interactions and state changes
- `ErrorBoundary`: Error catching and fallback UI

## Test Structure

Each test file follows this general structure:

1. **Mocks**: Mock any external dependencies like hooks or services
2. **Test Suites**: Grouped by component functionality
3. **Basic Tests**: Verify rendering and base interactions
4. **Edge Cases**: Test unusual scenarios when appropriate

## Running Tests

Run all tests:
```bash
npm test
# or
yarn test
```

Run tests for a specific component:
```bash
npm test -- DevToolsPanel
# or
yarn test DevToolsPanel
```

Run tests in watch mode:
```bash
npm run test:watch
# or
yarn test:watch
```

## Future Testing Plans

See the GitHub issue "Add Comprehensive Testing for DevTools Components" for the complete test plan. We aim to achieve at least 80% test coverage for all DevTools components.

## Testing Guidelines

When adding new tests, follow these guidelines:

1. **Component Tests**: Each component should have its own test file
2. **Mock Dependencies**: Always mock external dependencies
3. **Test Props**: Verify that props are correctly used
4. **Test Events**: Verify user interactions work as expected
5. **Test Edge Cases**: Include tests for loading states, errors, etc.

## Additional Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing React Components](https://nextjs.org/docs/testing)