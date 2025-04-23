# ESLint Rule for ActionTypes

This document explains the custom ESLint rule for enforcing the use of the centralized `ActionTypes` constants throughout the BootHillGM codebase.

## Overview

The `no-action-literals` rule detects string literals used as action types that follow the `domain/ACTION_NAME` pattern and suggests using the corresponding `ActionTypes` constant instead.

## Rule Details

When enabled, this rule will produce warnings for code like:

```typescript
// This will trigger a warning
dispatch({ 
  type: 'inventory/ADD_ITEM', 
  payload: newItem 
});
```

And suggest using:

```typescript
// This is the correct pattern
import { ActionTypes } from '../types/actionTypes';

dispatch({ 
  type: ActionTypes.ADD_ITEM, 
  payload: newItem 
});
```

## Configuration

The rule is configured in `.eslintrc.json` with a warning level by default:

```json
"rules": {
  "no-action-literals/no-action-literals": "warn"
}
```

## Auto-fixing

The rule supports auto-fixing. When using the `--fix` option with ESLint, it will automatically convert string literals to the appropriate `ActionTypes` constant. However, it will not add the necessary import statement, so you'll need to do that manually.

## When to Use

This rule should be enabled for all TypeScript files in the project to ensure consistent usage of action types. It helps maintain the single source of truth for action types and makes the codebase more maintainable.

## Ignoring the Rule

In rare cases where you need to use a string literal for an action type (e.g., in tests), you can disable the rule for a specific line using:

```typescript
// eslint-disable-next-line no-action-literals/no-action-literals
dispatch({ type: 'inventory/ADD_ITEM', payload: newItem });
```

## Implementation

The rule is implemented in `/eslint-plugins/no-action-literals.js` and is a custom ESLint plugin for the BootHillGM project.
