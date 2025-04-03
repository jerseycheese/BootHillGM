---
title: Coding Naming Conventions
aliases: [Code Naming Standards, Variable Naming Guide]
tags: [development, standards, naming, conventions, code]
created: 2025-04-02
updated: 2025-04-02
---

# Coding Naming Conventions

This document outlines the naming conventions for various code elements in the Boot Hill GM application, serving as a reference for both developers and AI assistants.

## General Principles

1. Names should be descriptive and convey purpose
2. Consistency takes precedence over personal preferences
3. Follow established patterns in the codebase
4. Use appropriate case conventions based on the element type
5. Avoid abbreviations unless they are widely understood

## JavaScript/TypeScript Conventions

### Variables

| Type | Convention | Example |
|------|------------|---------|
| Regular variables | camelCase | `playerStatus`, `gameSessionId` |
| Boolean variables | camelCase with prefix "is", "has", "should" | `isActive`, `hasPermission`, `shouldUpdate` |
| Constants | UPPER_SNAKE_CASE | `MAX_PLAYERS`, `DEFAULT_TIMEOUT` |
| Private properties | camelCase with underscore prefix | `_privateValue` |

### Functions

| Type | Convention | Example |
|------|------------|---------|
| Regular functions | camelCase verb phrases | `getPlayerStatus()`, `calculateDamage()` |
| Event handlers | camelCase with "handle" prefix | `handleClick()`, `handleChange()` |
| Callback functions | camelCase with "on" prefix | `onComplete()`, `onError()` |
| Async functions | camelCase with verb phrases | `fetchGameData()`, `loadPlayerProfile()` |

### React Components

| Type | Convention | Example |
|------|------------|---------|
| Component files | PascalCase | `PlayerCard.tsx`, `GameSession.tsx` |
| Component names | PascalCase | `PlayerCard`, `GameSession` |
| Higher-Order Components | camelCase with "with" prefix | `withAuthentication()`, `withTheme()` |
| Custom hooks | camelCase with "use" prefix | `useGameState()`, `usePlayerActions()` |

### Types and Interfaces

| Type | Convention | Example |
|------|------------|---------|
| TypeScript interfaces | PascalCase with "I" prefix | `IPlayerProps`, `IGameSession` |
| TypeScript types | PascalCase | `PlayerStatus`, `GameConfig` |
| Enums | PascalCase | `GamePhase`, `CharacterClass` |

## CSS/Tailwind Conventions

Refer to [[component-naming-convention|Component Naming Convention]] for detailed CSS class naming.

Additional guidelines:

| Type | Convention | Example |
|------|------------|---------|
| CSS variables | kebab-case | `--primary-color`, `--font-heading` |
| Animation names | kebab-case | `fade-in`, `slide-up` |
| Media query aliases | camelCase | `smallScreen`, `tabletPortrait` |

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component files | PascalCase | `PlayerCard.tsx`, `GameSession.tsx` |
| Utility files | camelCase | `formatUtils.ts`, `playerHelpers.ts` |
| Hook files | camelCase with "use" prefix | `useGameState.ts`, `usePlayerActions.ts` |
| Test files | Same as source file with `.test` or `.spec` suffix | `PlayerCard.test.tsx` |
| Style files | Same as component file with `.styles` suffix | `PlayerCard.styles.ts` |
| Index files | `index.ts` or `index.tsx` | `index.ts` |

## Redux/State Management

| Type | Convention | Example |
|------|------------|---------|
| Actions | UPPER_SNAKE_CASE | `FETCH_PLAYER_DATA`, `UPDATE_GAME_STATE` |
| Action creators | camelCase | `fetchPlayerData()`, `updateGameState()` |
| Reducers | camelCase | `playerReducer`, `gameSessionReducer` |
| Selectors | camelCase with "select" prefix | `selectPlayerData`, `selectActiveGame` |
| State interfaces | PascalCase with "State" suffix | `PlayerState`, `GameSessionState` |
| Slices | camelCase with "Slice" suffix | `playerSlice`, `gameSessionSlice` |

## Tests

| Type | Convention | Example |
|------|------------|---------|
| Test descriptions | Natural language, descriptive | `'should render player card with correct name'` |
| Test groups | Component/function name | `describe('PlayerCard', () => {...})` |
| Test variables | camelCase with descriptive names | `mockPlayerData`, `renderedComponent` |
| Test utilities | camelCase with descriptive names | `createMockGame()`, `renderWithProviders()` |

## Data Attributes

| Type | Convention | Example |
|------|------------|---------|
| `data-testid` | kebab-case | `data-testid="player-card-name"` |
| Custom data attributes | kebab-case | `data-player-id="123"`, `data-game-phase="combat"` |

## Documentation

| Type | Convention | Example |
|------|------------|---------|
| JSDoc comments | Natural language, full sentences | `/** Returns the player's current health points. */` |
| TODO comments | Capital "TODO" with description | `// TODO: Implement damage calculation` |
| Section comments | Clear, consistent formatting | `// ===== Player Actions ===== //` |

## Examples of Complete Variable Names

### Player-related
- `playerCharacter` - A player's character object
- `isPlayerActive` - Boolean indicating if player is active
- `handlePlayerSelection` - Event handler for player selection
- `fetchPlayerStats` - Async function to get player stats
- `usePlayerInventory` - Custom hook for player inventory
- `IPlayerProps` - Interface for player component props
- `PlayerActionType` - Type definition for player actions

### Game-related
- `gameSession` - Current game session object
- `isGamePaused` - Boolean for game pause state
- `handleGameStart` - Event handler for game start
- `loadGameState` - Async function to load game state
- `useGameControls` - Custom hook for game controls
- `IGameSessionProps` - Interface for game session props
- `GamePhaseEnum` - Enum for game phases

This document serves as a reference for maintaining consistent naming conventions throughout the Boot Hill GM codebase. Always follow these conventions when creating new code or refactoring existing code.

## Related Documents
- [[component-naming-convention|Component Naming Convention]]
- [[kiss-principles-react|KISS Principles for React]]
- [[updated-claude-app-workflow|Updated Claude App Workflow]]
