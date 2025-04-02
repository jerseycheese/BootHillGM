---
title: AI Game Service Testing
aliases: [Game Service Test Structure, AI Response Testing]
tags: [ai, testing, documentation, best-practices]
created: 2025-04-01
updated: 2025-04-01
---

# AI Game Service Testing

## Overview

This document outlines the testing approach for the AI Game Service component, which is a critical part of Boot Hill GM's narrative and gameplay systems. The testing strategy follows the modular structure established in the service itself, with separate files for mocks, helpers, and test cases.

## Test Structure

The AI Game Service tests follow a modular organization pattern:

```
/app/__tests__/services/ai/
├── gameService.test.ts           # Main test file with organized test groups
├── __mocks__/                    # Mock data directories
│   └── gameServiceMocks.ts       # Mock data for AI responses and actions
└── helpers/                      # Test helper functions
    └── gameServiceTestHelpers.ts # Test utilities specific to AI services
```

## Mock Data

Mock data is centralized in the `gameServiceMocks.ts` file and organized by category:

### Suggested Actions
- `successPathDefaultActions`: Default actions used in successful AI responses
- `fallbackPathDefaultActions`: Default actions used in fallback responses

### Response Objects
- Basic responses
- Player decision responses
- Location variants (town, wilderness, landmark)
- Combat scenarios
- Error cases

## Test Helpers

The `gameServiceTestHelpers.ts` file provides common utilities to simplify test setup and reduce duplication:

### Key Helper Functions

```typescript
// Setup mocks before each test
setupGameServiceMocks();

// Mock successful AI response
mockSuccessfulAIResponse(mockResponseData);

// Mock failed AI response
mockFailedAIResponse(new Error('AI error'));

// Create expected response with default actions
const expected = createExpectedResponse(partialResponse);
```

## Test Organization

Tests are organized into logical groups based on functionality:

### Basic Response Handling
- Successful AI response processing
- Error handling and fallback responses

### Player Decision Handling
- Valid decision extraction and validation
- Invalid decision handling

### Location Type Handling
- Town, wilderness, landmark, and unknown locations
- Location type validation
- Narrative-location consistency

### Combat Handling
- Combat initiation
- Opponent data validation
- Missing opponent handling

### Error Handling
- Invalid JSON structure
- Invalid location types
- API errors and timeouts

## Running the Tests

To run all AI service tests:

```bash
npm test app/__tests__/services/ai/gameService.test.ts
```

To run specific test groups:

```bash
npm test -- -t "Combat Handling"
```

## Best Practices

When writing new tests for the AI Game Service:

1. **Add mock data first**: Add any new mock response data to `gameServiceMocks.ts`
2. **Use existing helpers**: Leverage the helper functions in `gameServiceTestHelpers.ts`
3. **Organize by functionality**: Add tests to the appropriate functional group
4. **Focus on edge cases**: Particularly for response validation and error handling
5. **Maintain test isolation**: Each test should be independent and not rely on other tests

## Code Coverage

The AI Game Service maintains 100% code coverage for:
- Input parameter handling (both object and positional styles)
- Response validation and processing
- Error handling and fallback mechanisms
- Timeout scenarios

## Example Test

```typescript
describe('Player Decision Handling', () => {
  it('should extract and validate playerDecision from AI response', async () => {
    mockSuccessfulAIResponse(mockPlayerDecisionResponse);
    
    const result = await getAIResponse('test prompt', '', []);
    
    expect(result.playerDecision).toBeDefined();
    expect(result.playerDecision?.prompt).toBe('What will you do?');
    expect(result.playerDecision?.options).toHaveLength(2);
    expect(result.playerDecision?.importance).toBe('significant');
  });
});
```