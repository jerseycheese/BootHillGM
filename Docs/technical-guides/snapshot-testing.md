---
title: Snapshot Testing
aliases: [React Snapshot Tests, Visual Testing]
tags: [technical, testing, snapshots, jest, components]
created: 2025-03-22
updated: 2025-03-22
---

# Snapshot Testing

## Overview

Snapshot testing is a valuable technique for verifying that your UI components render consistently and that visual changes are intentional. In BootHillGM, snapshot tests help ensure the game's interface remains stable across code changes.

## Basic Snapshot Testing

Snapshot tests capture the output of a component and compare it against a previously saved "snapshot" to detect changes.

```typescript
// app/__tests__/components/CharacterCard.snap.test.tsx
import { render } from '@testing-library/react';
import CharacterCard from '../../components/CharacterCard';

describe('CharacterCard snapshots', () => {
  const defaultProps = {
    name: 'John Smith',
    profession: 'Gunslinger',
    health: 85,
    maxHealth: 100,
    level: 3,
    imageUrl: '/assets/gunslinger.png'
  };

  it('matches snapshot with default props', () => {
    const { container } = render(<CharacterCard {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with low health', () => {
    const { container } = render(
      <CharacterCard {...defaultProps} health={15} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with different profession', () => {
    const { container } = render(
      <CharacterCard {...defaultProps} profession="Gambler" imageUrl="/assets/gambler.png" />
    );
    expect(container).toMatchSnapshot();
  });
});
```

## Targeted Snapshot Testing

Rather than snapshotting entire components, focus on specific sections to reduce brittleness.

```typescript
// app/__tests__/components/StatPanel.snap.test.tsx
import { render, screen } from '@testing-library/react';
import StatPanel from '../../components/StatPanel';

describe('StatPanel snapshots', () => {
  const stats = {
    strength: 14,
    dexterity: 16,
    constitution: 12,
    intelligence: 10,
    wisdom: 8,
    charisma: 15
  };

  it('renders stat display sections consistently', () => {
    render(<StatPanel stats={stats} />);
    
    // Snapshot only the important part
    const statsSection = screen.getByTestId('primary-stats');
    expect(statsSection).toMatchSnapshot();
  });

  it('renders derived stats consistently', () => {
    render(<StatPanel stats={stats} />);
    
    const derivedStats = screen.getByTestId('derived-stats');
    expect(derivedStats).toMatchSnapshot();
  });
});
```

## Snapshot Testing with State Changes

Test how components appear in different states.

```typescript
// app/__tests__/components/TogglePanel.snap.test.tsx
import { render, fireEvent } from '@testing-library/react';
import TogglePanel from '../../components/TogglePanel';

describe('TogglePanel snapshots', () => {
  it('matches snapshot in collapsed state', () => {
    const { container } = render(
      <TogglePanel title="Inventory">
        <div>Panel content</div>
      </TogglePanel>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot in expanded state', () => {
    const { container } = render(
      <TogglePanel title="Inventory">
        <div>Panel content</div>
      </TogglePanel>
    );
    
    // Expand the panel
    fireEvent.click(container.querySelector('.toggle-button'));
    
    expect(container).toMatchSnapshot();
  });
});
```

## Snapshot Testing with Context

Components that rely on context need the appropriate context providers.

```typescript
// app/__tests__/components/ThemeAwareComponent.snap.test.tsx
import { render } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import ThemeAwareComponent from '../../components/ThemeAwareComponent';

describe('ThemeAwareComponent snapshots', () => {
  it('matches snapshot with light theme', () => {
    const { container } = render(
      <ThemeProvider initialTheme="light">
        <ThemeAwareComponent />
      </ThemeProvider>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with dark theme', () => {
    const { container } = render(
      <ThemeProvider initialTheme="dark">
        <ThemeAwareComponent />
      </ThemeProvider>
    );
    
    expect(container).toMatchSnapshot();
  });
});
```

## Snapshot Testing Dynamic Content

For components with dynamic content, provide consistent test data.

```typescript
// app/__tests__/components/CombatLog.snap.test.tsx
import { render } from '@testing-library/react';
import CombatLog from '../../components/CombatLog';

// Mock date to make snapshots deterministic
const originalDate = global.Date;
beforeAll(() => {
  const mockDate = new Date(2025, 2, 15, 12, 0, 0);
  global.Date = class extends Date {
    constructor() {
      return mockDate;
    }
  } as DateConstructor;
});

afterAll(() => {
  global.Date = originalDate;
});

describe('CombatLog snapshots', () => {
  const mockEntries = [
    { id: '1', message: 'Player attacks Bandit for 5 damage', timestamp: new Date() },
    { id: '2', message: 'Bandit counterattacks for 3 damage', timestamp: new Date() },
    { id: '3', message: 'Player dodges the attack', timestamp: new Date() }
  ];

  it('renders combat log entries consistently', () => {
    const { container } = render(<CombatLog entries={mockEntries} />);
    expect(container).toMatchSnapshot();
  });

  it('renders empty state consistently', () => {
    const { container } = render(<CombatLog entries={[]} />);
    expect(container).toMatchSnapshot();
  });
});
```

## Best Practices

### 1. Keep Snapshots Focused

Snapshot large components can lead to frequent, unnecessary test failures. Focus on critical UI elements:

```typescript
// ❌ Bad: Snapshotting entire large component
expect(container).toMatchSnapshot();

// ✅ Good: Snapshot specific elements
expect(screen.getByTestId('character-portrait')).toMatchSnapshot();
expect(screen.getByTestId('character-stats')).toMatchSnapshot();
```

### 2. Provide Descriptive Test Names

Descriptive names help identify what each snapshot represents:

```typescript
// ❌ Bad: Generic test name
it('matches snapshot', () => {
  // ...
});

// ✅ Good: Descriptive test name
it('matches snapshot when character has low health and active buffs', () => {
  // ...
});
```

### 3. Mock Dynamic Values

Ensure snapshots are deterministic by mocking dynamic values:

```typescript
// Mock random values
jest.spyOn(Math, 'random').mockReturnValue(0.5);

// Mock dates
jest.spyOn(Date, 'now').mockReturnValue(new Date(2025, 2, 15).getTime());

// Mock UUIDs or other generated IDs
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-123'
}));
```

### 4. Update Snapshots Intentionally

When making intentional UI changes, update snapshots with care:

```bash
# Update all snapshots
npm test -- -u

# Update only specific component snapshots
npm test -- -u CharacterCard

# Update interactive with watch mode
npm test -- --watch
```

### 5. Use Custom Serializers for Cleaner Snapshots

Create custom serializers to improve readability of snapshots:

```typescript
// test/setup/jest.setup.js
import { addSerializer } from 'jest-specific-snapshot';

// Custom serializer to hide unnecessary attributes
addSerializer({
  test: (val) => val && val.type === 'div',
  print: (val, serialize) => {
    const copy = { ...val };
    // Remove non-essential attributes
    delete copy.randomKey;
    delete copy.generatedId;
    return serialize(copy);
  }
});
```

### 6. Use Snapshots for Specific Component Types

Snapshots are particularly useful for:

- **Purely presentational components**
- **Components with multiple visual states**
- **Components with complex layout**
- **Reusable UI library components**

Snapshots are less useful for:

- Components with complex logic
- Components that primarily handle user interactions
- Components that frequently change

## Common Snapshot Testing Patterns

### Testing Responsive Variations

```typescript
// app/__tests__/components/ResponsiveLayout.snap.test.tsx
import { render } from '@testing-library/react';
import ResponsiveLayout from '../../components/ResponsiveLayout';

// Mock window width
const resizeWindow = (width) => {
  window.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
};

describe('ResponsiveLayout snapshots', () => {
  beforeAll(() => {
    jest.spyOn(window, 'innerWidth', 'get');
  });

  it('matches snapshot in desktop layout', () => {
    resizeWindow(1200);
    const { container } = render(<ResponsiveLayout />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot in tablet layout', () => {
    resizeWindow(768);
    const { container } = render(<ResponsiveLayout />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot in mobile layout', () => {
    resizeWindow(480);
    const { container } = render(<ResponsiveLayout />);
    expect(container).toMatchSnapshot();
  });
});
```

### Testing Animation States

```typescript
// app/__tests__/components/AnimatedButton.snap.test.tsx
import { render, fireEvent } from '@testing-library/react';
import AnimatedButton from '../../components/AnimatedButton';

// Mock animations
jest.mock('react-spring', () => {
  const actualReactSpring = jest.requireActual('react-spring');
  return {
    ...actualReactSpring,
    useSpring: jest.fn(() => [{
      // Fixed animation values for snapshot
      opacity: 1,
      transform: 'scale(1)'
    }, jest.fn()])
  };
});

describe('AnimatedButton snapshots', () => {
  it('matches snapshot in default state', () => {
    const { container } = render(<AnimatedButton>Click Me</AnimatedButton>);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot in hover state', () => {
    const { container } = render(<AnimatedButton>Click Me</AnimatedButton>);
    
    // Simulate hover
    fireEvent.mouseEnter(container.firstChild);
    
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot in pressed state', () => {
    const { container } = render(<AnimatedButton>Click Me</AnimatedButton>);
    
    // Simulate press
    fireEvent.mouseDown(container.firstChild);
    
    expect(container).toMatchSnapshot();
  });
});
```

### Testing Theme Variations

```typescript
// app/__tests__/components/ThemeSwitchablePanel.snap.test.tsx
import { render } from '@testing-library/react';
import ThemeSwitchablePanel from '../../components/ThemeSwitchablePanel';

describe('ThemeSwitchablePanel snapshots', () => {
  const themes = ['default', 'western', 'dark', 'retro'];
  
  // Generate a snapshot test for each theme
  themes.forEach(theme => {
    it(`matches snapshot with ${theme} theme`, () => {
      const { container } = render(
        <ThemeSwitchablePanel 
          theme={theme}
          title="Character Information"
          content="This is a panel with theme support."
        />
      );
      
      expect(container).toMatchSnapshot();
    });
  });
});
```

## Snapshot Format Example

A typical Jest snapshot file looks like this:

```javascript
// __snapshots__/CharacterCard.snap.test.tsx.snap
exports[`CharacterCard snapshots matches snapshot with default props 1`] = `
<div>
  <div
    class="character-card"
  >
    <h3
      class="character-name"
    >
      John Smith
    </h3>
    <div
      class="character-profession"
    >
      Gunslinger
    </div>
    <div
      class="health-bar"
    >
      <div
        class="health-fill"
        style="width: 85%;"
      />
      <span
        class="health-text"
      >
        85/100
      </span>
    </div>
    <div
      class="level-badge"
    >
      Level 3
    </div>
    <img
      alt="John Smith"
      class="character-image"
      src="/assets/gunslinger.png"
    />
  </div>
</div>
`;
```

## Troubleshooting Snapshot Tests

### Dealing with Brittle Snapshots

If snapshots break frequently due to minor changes:

1. Target specific elements instead of entire components
2. Create custom serializers to omit unstable attributes
3. Focus on structural elements rather than content that changes often

### Handling Dynamic Content

For components with dynamic content:

```typescript
// Custom matcher for more flexible snapshot comparison
expect(container).toMatchSnapshot({
  dynamic: expect.any(String),
  count: expect.any(Number),
  timestamp: expect.stringMatching(/\d{2}:\d{2}/)
});
```

### Snapshot Mismatch Debugging

When snapshots fail unexpectedly:

1. Use the `-u` flag to update snapshots interactively
2. Examine differences carefully - Jest will show diffs
3. Check if the component relies on dynamic data that needs mocking

## Related Documentation

- [[component-testing|Component Testing]]
- [[integration-testing|Integration Testing]]
- [[testing-guide|Testing Guide Overview]]
- [[../workflow/visual-regression-testing|Visual Regression Testing]]
