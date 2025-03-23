---
title: Testing Overview
aliases: [Test Strategy, Testing Documentation]
tags: [technical, testing, development, jest, react-testing-library]
created: 2024-12-28
updated: 2025-03-22
---

# Testing Overview

## Introduction
This document provides a high-level overview of the testing strategy and implementation details for the BootHillGM project. For comprehensive React component testing guidelines, see the [[testing-guide|React Testing Guide]].

## Test Structure

### Unit Tests
Located in `app/__tests__/` with subdirectories matching the source structure:
- components/
  - Common/ (shared components)
  - Debug/ (DevTools components)
  - ...
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

For detailed configuration information, see [[test-configuration|Test Configuration]].

## Test Categories

### 1. Unit Tests
- Individual component rendering
- Hook behavior
- Utility function logic
- State management
- Type validations

### 2. Snapshot Tests
- UI component rendering consistency
- Visual presentation of different component states
- Style and layout verification
- Component variations with different props

### 3. Integration Tests
- Component interactions
- State flow between components
- API integration
- Event handling chains

### 4. Combat System Tests
- Turn management
- Damage calculations
- State transitions
- Combat log accuracy

### 5. AI Integration Tests
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
Located in `app/test/fixtures/`:
- Mock game states
- Sample character data
- Combat scenarios
- API responses
- Mock component data (for snapshot tests)

### Utils
Located in `app/test/utils/`:
- Test helpers
- Custom matchers
- Setup utilities
- Mock generators
- Test renderers (for components with context)

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

# Run only snapshot tests
npm run test:snapshots

# Update snapshots when UI changes
npm run test:update-snapshots

# Update a specific snapshot
npm run test:update-snapshot-single "test name pattern"
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
- Snapshot testing verification

## Debug Tools

### Console Output
- Use test.only() for focused testing
- Enable verbose output
- Use debug logging
- Check coverage reports

## Related Documentation
- [[testing-guide|React Testing Guide]] - Comprehensive details on React component testing
- [[test-configuration|Test Configuration]] - Jest and testing setup details
- [[../development/workflows/testing-workflow|Testing Workflow]] - Testing process and workflows
- [[../development/test-strategy|Test Strategy]]
- [[../development/debug-tools|Debug Tools Documentation]]
- [[../architecture/component-structure|Component Structure]]
