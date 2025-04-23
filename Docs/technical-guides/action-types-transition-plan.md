# ActionTypes Transition Plan

This document outlines the timeline and strategy for transitioning to standardized ActionTypes across the BootHillGM codebase.

## Current Status

- ✅ Centralized ActionTypes defined in `/app/types/actionTypes.ts`
- ✅ Core reducers updated to use standardized types
- ✅ Major components updated
- ✅ Standard action creators created for all domains
- ✅ Compatibility helpers implemented
- ✅ ESLint rule created for enforcing ActionTypes usage
- ✅ Documentation completed

## Transition Timeline

### Phase 1: Implementation (Current Phase)
- ✅ Create centralized ActionTypes
- ✅ Update core reducers to support both standard and legacy types
- ✅ Update major components and hooks
- ✅ Create documentation
- ✅ Implement ESLint rule

### Phase 2: Propagation (2 Weeks)
- Apply ESLint rule across codebase
- Update all remaining components and hooks
- Update all test files
- Monitor and fix any issues

### Phase 3: Stabilization (2 Weeks)
- Run comprehensive test suite
- Resolve any issues
- Review and standardize any inconsistencies
- Update all imports to use ActionTypes consistently

### Phase 4: Legacy Removal (4 Weeks after Phase 3)
- Remove legacy action type support from reducers
- Update compatibility helpers to use only standardized types
- Enforce stricter ESLint rules for ActionTypes
- Update documentation to remove legacy references

## Implementation Approach

### Backwards Compatibility
During Phases 1-3, we maintain compatibility with:
- String literal action types (`'domain/ACTION_NAME'`)
- ActionTypes constants (`ActionTypes.ACTION_NAME`)

This allows for gradual adoption without breaking existing functionality.

### Helper Functions

We use compatibility helper functions to check action types in a way that works with both formats:

```typescript
const isInventoryAction = (actionType: string): boolean => {
  return (
    actionType.startsWith('inventory/') || 
    actionType === ActionTypes.ADD_ITEM ||
    // other inventory actions...
  );
};
```

These functions will be simplified after Phase 4 to only check against ActionTypes constants.

## Testing Strategy

1. Run existing unit tests throughout the transition
2. Add specific tests for ActionTypes constants
3. Ensure test coverage for both legacy and standardized formats during the transition
4. Update test fixtures to use standardized types

## Enforcement

1. Use ESLint warning during Phases 1-3
2. Change to ESLint error in Phase 4
3. Add pre-commit hooks to prevent commits with legacy action types after Phase 4

## Monitoring

1. Track adoption of standardized ActionTypes through code reviews
2. Use ESLint reports to identify remaining usage of legacy action types
3. Document any issues or edge cases encountered during transition

This phased approach ensures a smooth migration to standardized action types while maintaining application stability.
