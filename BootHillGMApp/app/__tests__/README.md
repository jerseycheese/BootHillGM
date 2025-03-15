# Test Suite for Boot Hill GM

## Overview

This directory contains tests for the Boot Hill GM application. The test suite uses Jest and React Testing Library to verify component functionality and application behavior.

## Directory Structure

```
app/__tests__/
├── components/             # Component tests
│   ├── Common/             # Tests for common/shared components
│   ├── Debug/              # Tests for DevTools panel components
│   └── ...
├── hooks/                  # Tests for custom hooks
├── utils/                  # Tests for utility functions
└── README.md               # This file
```

## DevTools Component Tests

The DevTools components have been refactored from a single large component into smaller, more focused components. Current test coverage includes:

- `DevToolsPanel`: Basic rendering and panel collapse functionality
- `GameControlSection`: Button interactions and state changes
- `ErrorBoundary`: Error catching and fallback UI

## Test Patterns

Our tests follow these patterns (similar to Drupal's PHPUnit approach):

1. **Setup**: Prepare the test environment and mock dependencies
2. **Act**: Render components and interact with them
3. **Assert**: Verify the expected outcome
4. **Cleanup**: Reset mocks and test state

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run specific tests
npm test -- DevToolsPanel

# Run tests in watch mode
npm run test:watch
```

## Writing New Tests

When adding tests for new components:

1. Create test files in the appropriate subdirectory
2. Mock all external dependencies
3. Test component rendering and functionality
4. Test edge cases and error handling
5. Verify that props are used correctly

## Testing React Components vs. Drupal Twig Templates

If you're familiar with testing Drupal Twig templates and PHP components:

- React Testing Library's `render` is similar to Drupal's `renderRoot`
- React's mocking system replaces Drupal's service container mocking
- Component assertions work similarly to PHPUnit assertions
- React event testing replaces Drupal's JavaScript behaviors testing

## Future Improvements

See the GitHub issue "Add Comprehensive Testing for DevTools Components" for the full roadmap of testing improvements.
