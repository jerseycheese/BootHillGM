---
title: Development Workflow
aliases: [Local Development Workflow, Development Process]
tags: [technical, workflow, development, process]
created: 2024-12-28
updated: 2024-12-28
---

# Development Workflow

This guide outlines the standard development workflow for contributing to BootHillGM.

## Local Development Setup

### Initial Setup
1. Clone the repository
2. Install dependencies ([[dependencies|see Dependencies Guide]])
3. Configure environment ([[environment-configuration|see Environment Configuration]])
4. Start development server

### Development Server
```bash
# Start the development server
npm run dev

# Run with specific port
npm run dev -- -p 3001

# Run with debugging
npm run dev -- --inspect
```

## Development Process

### 1. Feature Development
1. Create feature branch
   ```bash
   git checkout -b feature/feature-name
   ```
2. Implement changes
3. Run tests locally
   ```bash
   npm run test
   npm run test:watch # for development
   ```
4. Update documentation

### Creating and Testing Utility Functions

Utility functions are reusable pieces of code that perform specific tasks. They help keep the codebase DRY (Don't Repeat Yourself) and improve maintainability.

#### Example: `diceUtils.ts`

This utility function handles dice rolling for the game, supporting various options like the number of dice, sides, modifiers, advantage, and disadvantage.

**1. Creating the Utility Function:**

-   Create a new file for the utility function within the `app/utils/` directory. For example, `diceUtils.ts`.
-   Implement the function logic, ensuring it's well-documented and handles different scenarios.

```typescript
/**
 * Represents a dice roll configuration.
 */
interface DiceRoll {
  count: number;
  sides: number;
  modifier?: number;
  advantage?: boolean;
  disadvantage?: boolean;
}

/**
 * Rolls dice based on the given configuration.
 *
 * @param {DiceRoll} config - The dice roll configuration.
 * @returns {number} The total result of the dice roll.
 */
const rollDice = ({
  count,
  sides,
  modifier = 0,
  advantage = false,
  disadvantage = false,
}: DiceRoll): number => {
  if (sides === 0) {
    return 0;
  }
  let total = 0;
  if (advantage && disadvantage) {
    advantage = false;
    disadvantage = false;
  }

  if (advantage) {
    for (let i = 0; i < count; i++) {
      const roll1 = Math.floor(Math.random() * sides) + 1;
      const roll2 = Math.floor(Math.random() * sides) + 1;
      total += Math.max(roll1, roll2);
    }
  } else if (disadvantage) {
    for (let i = 0; i < count; i++) {
      const roll1 = Math.floor(Math.random() * sides) + 1;
      const roll2 = Math.floor(Math.random() * sides) + 1;
      total += Math.min(roll1, roll2);
    }
  } else {
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
  }

  return total + modifier;
};

export type { DiceRoll };
export { rollDice };
```

**2. Writing Comprehensive Tests:**

-   Create a corresponding test file in the `app/test/utils/` directory. For example, `diceUtils.test.ts`.
-   Use the Jest testing framework to write test cases that cover various scenarios, including:
    -   Different numbers of dice (`count`)
    -   Different numbers of sides (`sides`)
    -   Positive and negative modifiers
    -   Advantage rolls
    -   Disadvantage rolls
    -   Cases where both advantage and disadvantage are true (they should cancel each other out)
    -   Edge cases (e.g., 0 dice, 0 sides)

```typescript
import { rollDice, DiceRoll } from '../../utils/diceUtils';

describe('rollDice', () => {
  it('should roll the correct number of dice', () => {
    const roll: DiceRoll = { count: 3, sides: 6 };
    const result = rollDice(roll);
    expect(result).toBeGreaterThanOrEqual(3);
    expect(result).toBeLessThanOrEqual(18);
  });

  it('should handle different numbers of sides', () => {
    const roll: DiceRoll = { count: 2, sides: 10 };
    const result = rollDice(roll);
    expect(result).toBeGreaterThanOrEqual(2);
    expect(result).toBeLessThanOrEqual(20);
  });

  // ... other test cases ...

  it('should handle 0 sides', () => {
    const roll: DiceRoll = { count: 3, sides: 0 };
    const result = rollDice(roll);
    expect(result).toBe(0);
  });
});
```

**3. Addressing Test Failures:**

-   Run the tests using `npm test`.
-   If any tests fail, analyze the error messages and debug the code.
-   For example, an initial test for rolling 0 sides might fail if the function doesn't explicitly handle this case.
-   Update the function to handle the failing scenario and re-run the tests until all pass.

**4. Exporting the Function:**

-   Export the function using the `export` keyword so it can be imported and used in other parts of the application.
-   Export any associated types using `export type`.

```typescript
export type { DiceRoll };
export { rollDice };
```

### 2. Code Quality
- Run linting
  ```bash
  npm run lint
  npm run lint:fix
  ```
- Format code
  ```bash
  npm run format
  ```
- Type checking
  ```bash
  npm run type-check
  ```

### 3. Testing
- Unit tests
- Integration tests
- E2E tests (when applicable)
- Performance testing

### 4. Documentation
- Update relevant documentation
- Add JSDoc comments
- Update changelog
- Update README if needed

## Build Process

### Development Build
```bash
npm run build
npm run start
```

### Production Build
```bash
npm run build
npm run start:prod
```

## Git Workflow

### Branch Strategy
- main: Production-ready code
- develop: Development branch
- feature/*: New features
- bugfix/*: Bug fixes
- release/*: Release preparation

### Commit Guidelines
- Use conventional commits
- Include ticket numbers
- Keep commits focused

Example:
```bash
feat(combat): add weapon switching functionality (#123)
fix(ui): correct inventory display alignment (#124)
docs(api): update combat system documentation
```

## Code Review Process

### Pre-Review Checklist
- [ ] Tests passing
- [ ] Linting passing
- [ ] Documentation updated
- [ ] No console errors
- [ ] Performance verified

### Review Guidelines
1. Code quality
2. Test coverage
3. Performance impact
4. Security considerations
5. Documentation completeness

## Debugging

### Development Tools
- Chrome DevTools
- React Developer Tools
- Next.js Debug Tools

### Common Debug Commands
```bash
# Verbose logging
DEBUG=* npm run dev

# Node inspector
npm run dev -- --inspect

# Test debugging
npm run test:debug
```

## Related Documentation
- [[setup|Development Setup]]
- [[environment-configuration|Environment Configuration]]
- [[dependencies|Required Dependencies]]
- [[../technical-guides/testing|Testing Guide]]
- [[../technical-guides/contributing|Contributing Guide]]