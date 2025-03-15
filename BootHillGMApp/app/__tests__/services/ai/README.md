# AI Decision Service Tests

This directory contains unit tests for the AI Decision Service modules. The tests use Jest and focus on verifying the core functionality of each component.

## Test Coverage

- **aiDecisionService.test.ts**: Tests for the main service orchestration
- **aiDecisionDetector.test.ts**: Tests for decision detection logic
- **aiServiceClient.test.ts**: Tests for the external API client

## Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific file
npm test -- aiDecisionService.test.ts

# Run tests with coverage report
npm test -- --coverage
```

## Test Strategy

The current tests provide MVP-level coverage with a focus on:

1. **Core Logic**: Testing the fundamental logic in each module
2. **Error Handling**: Verifying that errors are handled gracefully
3. **Integration**: Ensuring the modules work together correctly

See GitHub issue for plans to expand test coverage.

## Adding New Tests

When adding new tests:

1. Follow the AAA pattern (Arrange, Act, Assert)
2. Use descriptive test names that explain what's being tested
3. Mock external dependencies where appropriate
4. Focus on testing behavior, not implementation details
