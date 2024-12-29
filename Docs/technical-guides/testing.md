---
title: Testing Guide
aliases: [Test Strategy, Testing Documentation]
tags: [technical, testing, development, jest, react-testing-library]
created: 2024-12-28
updated: 2024-12-28
---

# Testing Guide

## Overview
This guide outlines the testing strategy and implementation details for the BootHillGM project. It covers unit testing, integration testing, and end-to-end testing approaches.

## Test Structure

### Unit Tests
Located in `app/__tests__/` with subdirectories matching the source structure:
- components/
- game-session/
- hooks/
- services/
- types/
- utils/

## Testing Tools

### Primary Tools
- Jest: Test runner and assertion library
- React Testing Library: Component testing
- MSW (Mock Service Worker): API mocking
- Jest-DOM: DOM assertions

### Configuration
- jest.config.js: Main Jest configuration
- jest.setup.js: Test environment setup
- test/setup/: Custom test configurations

## Testing Patterns

### Component Testing
```typescript
import { render, screen } from '@testing-library/react'
import { GameProviderWrapper } from '../components/GameProviderWrapper'

describe('Component Tests', () => {
  it('renders with required props', () => {
    render(<Component prop="value" />)
    expect(screen.getByText('expected text')).toBeInTheDocument()
  })
})
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react'
import { useGameSession } from '../hooks/useGameSession'

describe('Hook Tests', () => {
  it('manages state correctly', () => {
    const { result } = renderHook(() => useGameSession())
    act(() => {
      result.current.someAction()
    })
    expect(result.current.state).toBe(expectedValue)
  })
})
```

## Test Categories

### 1. Unit Tests
- Individual component rendering
- Hook behavior
- Utility function logic
- State management
- Type validations

### 2. Integration Tests
- Component interactions
- State flow between components
- API integration
- Event handling chains

### 3. Combat System Tests
- Turn management
- Damage calculations
- State transitions
- Combat log accuracy

### 4. AI Integration Tests
- Response processing
- Error handling
- Context management
- Token optimization

## Best Practices

### Test Organization
- Group related tests
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and atomic

### Mocking
- Mock external dependencies
- Use MSW for API mocks
- Create reusable mock data
- Document mock assumptions

### State Management
- Test state transitions
- Verify persistence
- Check error states
- Test recovery mechanisms

## Test Data

### Fixtures
Located in `app/test/fixtures.ts`:
- Mock game states
- Sample character data
- Combat scenarios
- API responses

### Utils
Located in `app/test/utils/`:
- Test helpers
- Custom matchers
- Setup utilities
- Mock generators

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Single file
npm test -- path/to/test
```

### Coverage Requirements
- Minimum 80% coverage for:
  * Statements
  * Branches
  * Functions
  * Lines

## Continuous Integration

### GitHub Actions
- Automated test runs
- Coverage reports
- Pull request checks
- Integration validations

## Debug Tools

### Console Output
- Use test.only() for focused testing
- Enable verbose output
- Use debug logging
- Check coverage reports

## Related Documentation
- [[../development/test-strategy|Test Strategy]]
- [[setup|Development Setup]]
- [[deployment|Deployment Guide]]
- [[contributing|Contributing Guide]]
- [[../architecture/component-structure|Component Structure]]