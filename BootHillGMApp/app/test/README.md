# Test Utilities

This directory contains utilities and helpers for tests throughout the application.

## Organization

- `/fixtures` - Test fixtures and mock data
- `/helpers` - Reusable test helper functions
- `/utils` - Utility functions for tests

## Newly Added Files

### Decision Context Test Helpers

`/helpers/decision-context.helpers.ts` - Contains helper functions for testing the decision service context refresh functionality. These helpers support the integration tests in `app/__tests__/services/ai/decision-context-refresh.test.ts`.

The file includes functions for:
- Setting up test environments
- Creating and verifying mock responses
- Updating narrative context
- Verifying decision responses
- And more

This refactoring was done to improve test organization and maintainability while reducing the size of the main test file.
