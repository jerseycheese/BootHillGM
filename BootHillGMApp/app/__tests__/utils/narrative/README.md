# Narrative Context Optimization Tests

This directory contains tests for the narrative context optimization system, which intelligently prioritizes, compresses, and structures narrative context for AI prompts.

## Test Files

### Core Utility Tests
- `narrativeContextBuilder.test.ts` - Tests for the context building functionality
- `narrativeCompression.test.ts` - Tests for the compression and token optimization utilities

### Integration Tests
- `useAIWithOptimizedContext.test.tsx` - Tests for the React hook that provides AI integration
- `NarrativeOptimizationProvider.test.tsx` - Tests for the provider component

### Service Tests
- `gameServiceOptimizationPatch.test.ts` - Tests for the game service patching mechanism

### Performance Tests
- `narrativeOptimization.bench.ts` - Benchmarks and performance tests

## Running Tests

Run all narrative tests:
```sh
npm test -- --testPathPattern=narrative
```

Run specific test file:
```sh
npm test -- narrativeCompression.test.ts
```

Run performance benchmarks:
```sh
npm test -- narrativeOptimization.bench.ts
```

## Test Coverage

The test suite aims to cover:

1. **Functionality**: Ensuring all features work as expected
2. **Integration**: Testing how components work together
3. **Edge Cases**: Handling empty states, large inputs, errors
4. **Performance**: Verifying efficiency improvements

## Mocking Strategy

The tests use Jest's mocking capabilities to isolate components:

- `narrativeCompression.ts` - Mocked in context builder tests to isolate from compression implementation
- `gameService.ts` - Mocked in hook tests to avoid actual API calls
- `useNarrative` and context hooks - Mocked to provide controlled test data

## Performance Benchmarks

The performance benchmarks in `narrativeOptimization.bench.ts` measure:

1. Context building speed with different dataset sizes
2. Token efficiency across compression levels
3. Memory usage with large narrative histories
4. Caching effectiveness

## Success Criteria

The tests validate that the Narrative Context Optimization system meets its goals:

- **AI responses correctly reference recent narrative events** (fixes #210)
- **Context building performance improved for large histories**
- **Token usage efficiency improved by at least 30%**
- **Maintains stability with complex narrative sequences**
- **Memory usage remains stable even with large narrative histories**

## Running Tests with Coverage

To generate a coverage report:

```sh
npm test -- --coverage --testPathPattern=narrative
```

## Debugging Failed Tests

When tests fail, check:

1. Have the component interfaces changed? Update test mocks accordingly.
2. Are environment variables properly set? Some tests change NODE_ENV.
3. Are performance thresholds realistic? Adjust timing expectations on CI.
4. For flaky tests, increase the timeout or add retry logic.

## Test Data

Tests use generated test data and fixtures. The helper function `generateLargeNarrativeState()` 
in the benchmark tests is particularly useful for generating test data of different sizes.
