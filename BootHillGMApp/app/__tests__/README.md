# Boot Hill GM Tests

This directory contains tests for the Boot Hill GM application. The tests are organized by component, hook, or utility function to maintain a clear structure and improve maintainability.

## Documentation

For comprehensive documentation on testing structure, patterns, and best practices, please refer to the main documentation:

- [Test Structure Guide](/Docs/technical-guides/app-tests-structure.md)
- [React Testing Guide](/Docs/technical-guides/testing-guide.md)
- [Testing Overview](/Docs/technical-guides/testing-overview.md)

## Recent Additions

- **Reset Functionality Tests**: Tests for game reset with character persistence
  - Unit tests in `/reset/resetFunctionality.test.tsx`
  - Integration tests in `/integration/resetIntegration.test.tsx`
  - E2E tests in `/e2e/resetE2E.test.tsx`