---
title: Component Testing
aliases: [React Component Tests, UI Component Testing]
tags: [technical, testing, components, react-testing-library, jest]
created: 2025-03-22
updated: 2025-03-22
---

# Component Testing

## Overview

This guide covers techniques for testing React components in the BootHillGM project. Component tests verify that components render correctly and respond appropriately to props, state changes, and user interactions.

## Component Test Types

### Standard Component Tests

These tests verify basic component rendering and interaction.

```typescript
// app/__tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/Button';

describe('Button component', () => {
  it('renders with default props', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className when provided', () => {
    render(<Button className="custom-btn">Click Me</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-btn');
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Form Component Tests

Form components require testing input changes, validation, and form submission.

```typescript
// app/__tests__/components/CharacterNameInput.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterNameInput from '../../components/CharacterNameInput';

describe('CharacterNameInput component', () => {
  it('renders input field with label', () => {
    render(<CharacterNameInput value="" onChange={() => {}} />);
    expect(screen.getByLabelText(/character name/i)).toBeInTheDocument();
  });

  it('displays current value in input', () => {
    render(<CharacterNameInput value="John" onChange={() => {}} />);
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
  });

  it('calls onChange handler when input changes', async () => {
    const handleChange = jest.fn();
    render(<CharacterNameInput value="" onChange={handleChange} />);
    
    const input = screen.getByLabelText(/character name/i);
    await userEvent.type(input, 'Jane');
    
    expect(handleChange).toHaveBeenCalledTimes('Jane'.length);
  });

  it('shows validation error for short names', async () => {
    render(
      <CharacterNameInput 
        value="Jo" 
        onChange={() => {}} 
        minLength={3}
        showValidation
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for reserved names', async () => {
    render(
      <CharacterNameInput 
        value="Admin" 
        onChange={() => {}} 
        reservedNames={['Admin', 'System']}
        showValidation
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/name is reserved/i)).toBeInTheDocument();
    });
  });
});
```

### Context Provider Tests

Context providers need to be tested for proper state management and value distribution.

```typescript
// app/__tests__/context/GameContext.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GameProvider, useGameContext } from '../../context/GameContext';

// Test component that consumes the context
const TestComponent = () => {
  const { state, dispatch } = useGameContext();
  
  return (
    <div>
      <div data-testid="game-state">{state.playerHealth}</div>
      <button 
        onClick={() => dispatch({ 
          type: 'UPDATE_HEALTH', 
          payload: state.playerHealth - 1 
        })}
      >
        Take Damage
      </button>
    </div>
  );
};

describe('GameProvider', () => {
  it('provides initial state to children', () => {
    render(
      <GameProvider initialHealth={100}>
        <TestComponent />
      </GameProvider>
    );
    
    expect(screen.getByTestId('game-state')).toHaveTextContent('100');
  });

  it('updates state when actions are dispatched', () => {
    render(
      <GameProvider initialHealth={100}>
        <TestComponent />
      </GameProvider>
    );
    
    fireEvent.click(screen.getByText('Take Damage'));
    expect(screen.getByTestId('game-state')).toHaveTextContent('99');
    
    fireEvent.click(screen.getByText('Take Damage'));
    expect(screen.getByTestId('game-state')).toHaveTextContent('98');
  });

  it('throws error when useGameContext is used outside Provider', () => {
    // Suppress console.error to prevent test output noise
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => render(<TestComponent />)).toThrow(
      'useGameContext must be used within a GameProvider'
    );
    
    console.error = originalError;
  });
});
```

## Advanced Component Testing

### Testing Complex Form Validation

```typescript
// app/__tests__/components/CharacterCreationForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterCreationForm from '../../components/CharacterCreationForm';

describe('CharacterCreationForm', () => {
  // Common test setup
  const renderForm = () => {
    const handleSubmit = jest.fn();
    const result = render(<CharacterCreationForm onSubmit={handleSubmit} />);
    return { ...result, handleSubmit };
  };

  it('validates required fields', async () => {
    const { handleSubmit } = renderForm();
    
    // Try to submit without entering anything
    userEvent.click(screen.getByRole('button', { name: /create/i }));
    
    // Check validation messages
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/profession is required/i)).toBeInTheDocument();
    });
    
    // Form should not submit
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('validates name length', async () => {
    renderForm();
    
    // Enter a short name
    userEvent.type(screen.getByLabelText(/name/i), 'Jo');
    userEvent.click(screen.getByRole('button', { name: /create/i }));
    
    // Check validation message
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument();
    });
    
    // Clear and enter a valid name
    userEvent.clear(screen.getByLabelText(/name/i));
    userEvent.type(screen.getByLabelText(/name/i), 'John Smith');
    
    // Validation message should disappear
    await waitFor(() => {
      expect(screen.queryByText(/name must be at least 3 characters/i)).not.toBeInTheDocument();
    });
  });

  it('allows valid form submission', async () => {
    const { handleSubmit } = renderForm();
    
    // Fill in the form with valid values
    userEvent.type(screen.getByLabelText(/name/i), 'John Smith');
    userEvent.selectOptions(screen.getByLabelText(/profession/i), 'Gunslinger');
    userEvent.type(screen.getByLabelText(/backstory/i), 'A troubled past...');
    
    // Select attributes
    userEvent.click(screen.getByText(/\+ strength/i));
    userEvent.click(screen.getByText(/\+ strength/i));
    userEvent.click(screen.getByText(/\+ dexterity/i));
    
    // Submit the form
    userEvent.click(screen.getByRole('button', { name: /create/i }));
    
    // Form should submit with correct values
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'John Smith',
        profession: 'Gunslinger',
        backstory: 'A troubled past...',
        attributes: {
          strength: 12,
          dexterity: 11,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        }
      });
    });
  });
});
```

### Testing Asynchronous Components

```typescript
// app/__tests__/components/DataFetcher.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import DataFetcher from '../../components/DataFetcher';

// Setup mock server
const server = setupServer(
  rest.get('/api/data', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('DataFetcher', () => {
  it('shows loading state initially', () => {
    render(<DataFetcher />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('fetches and displays data', async () => {
    render(<DataFetcher />);
    
    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
    
    // Loading indicator should be gone
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('handles error states', async () => {
    // Override handler to return an error
    server.use(
      rest.get('/api/data', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    render(<DataFetcher />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
    
    // Retry button should be visible
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('refetches data when refresh button is clicked', async () => {
    render(<DataFetcher />);
    
    // Wait for initial data
    await screen.findByText('Item 1');
    
    // Update mock response
    server.use(
      rest.get('/api/data', (req, res, ctx) => {
        return res(
          ctx.json([
            { id: 3, name: 'Updated Item' }
          ])
        );
      })
    );
    
    // Click refresh button
    userEvent.click(screen.getByRole('button', { name: /refresh/i }));
    
    // Wait for updated data
    await waitFor(() => {
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      expect(screen.getByText('Updated Item')).toBeInTheDocument();
    });
  });
});
```

### Testing Presentational Components

Presentational components focus purely on UI rendering based on props.

```typescript
// app/__tests__/components/CharacterPortrait.test.tsx
import { render, screen } from '@testing-library/react';
import CharacterPortrait from '../../components/CharacterPortrait';

describe('CharacterPortrait', () => {
  const defaultProps = {
    name: 'John Smith',
    imageUrl: '/images/john.png',
    profession: 'Gunslinger',
    level: 5
  };
  
  it('renders character information correctly', () => {
    render(<CharacterPortrait {...defaultProps} />);
    
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Gunslinger')).toBeInTheDocument();
    expect(screen.getByText('Level 5')).toBeInTheDocument();
    
    // Image should use the provided URL
    const image = screen.getByAltText('John Smith');
    expect(image).toHaveAttribute('src', '/images/john.png');
  });

  it('handles missing image with placeholder', () => {
    render(<CharacterPortrait {...defaultProps} imageUrl={undefined} />);
    
    // Placeholder should be shown
    const image = screen.getByAltText('John Smith');
    expect(image).toHaveAttribute('src', '/images/placeholder-character.png');
  });

  it('truncates long names', () => {
    render(
      <CharacterPortrait 
        {...defaultProps} 
        name="Bartholomew J. Winchester III" 
      />
    );
    
    // Name should be truncated
    expect(screen.getByTestId('character-name')).toHaveAttribute(
      'title', 
      'Bartholomew J. Winchester III'
    );
    expect(screen.getByText('Bartholomew J. Win...')).toBeInTheDocument();
  });
});
```

### Testing Higher-Order Components (HOCs)

Testing HOCs requires verifying they correctly enhance wrapped components.

```typescript
// app/__tests__/components/withTooltip.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import withTooltip from '../../components/withTooltip';

// Simple component for testing
const TestButton = (props) => (
  <button {...props}>Test Button</button>
);

// Enhanced component with tooltip
const ButtonWithTooltip = withTooltip(TestButton);

describe('withTooltip HOC', () => {
  it('passes through original props to wrapped component', () => {
    const handleClick = jest.fn();
    render(
      <ButtonWithTooltip 
        onClick={handleClick}
        className="custom-class"
        tooltipText="This is a tooltip"
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Test Button');
    expect(button).toHaveClass('custom-class');
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows tooltip on hover', () => {
    render(<ButtonWithTooltip tooltipText="This is a tooltip" />);
    
    // Initially tooltip should not be visible
    expect(screen.queryByText('This is a tooltip')).not.toBeInTheDocument();
    
    // Hover over button
    fireEvent.mouseOver(screen.getByRole('button'));
    
    // Tooltip should be visible
    expect(screen.getByText('This is a tooltip')).toBeInTheDocument();
    
    // Move mouse away
    fireEvent.mouseOut(screen.getByRole('button'));
    
    // Tooltip should be hidden
    expect(screen.queryByText('This is a tooltip')).not.toBeInTheDocument();
  });

  it('positions tooltip based on position prop', () => {
    render(
      <ButtonWithTooltip 
        tooltipText="This is a tooltip" 
        tooltipPosition="top"
      />
    );
    
    fireEvent.mouseOver(screen.getByRole('button'));
    
    const tooltip = screen.getByText('This is a tooltip');
    expect(tooltip).toHaveClass('tooltip-top');
  });
});
```

## Testing Best Practices

### User Interactions

Use `userEvent` (preferred) or `fireEvent` for simulating user interactions:

```typescript
// Using userEvent (modern approach)
await userEvent.type(input, 'Hello');
await userEvent.click(button);
await userEvent.selectOptions(select, 'Option 1');
await userEvent.clear(input);
await userEvent.tab();

// Using fireEvent (traditional approach)
fireEvent.change(input, { target: { value: 'Hello' } });
fireEvent.click(button);
```

### Testing Accessibility

Test keyboard navigation and focus management:

```typescript
test('component is keyboard accessible', async () => {
  render(<MyComponent />);
  
  // Focus the component
  const element = screen.getByRole('button');
  element.focus();
  expect(element).toHaveFocus();
  
  // Test keyboard interaction
  fireEvent.keyDown(element, { key: 'Enter' });
  expect(screen.getByText('Activated')).toBeInTheDocument();
});
```

## Related Documentation

- [[hook-testing|Hook Testing]]
- [[integration-testing|Integration Testing]]
- [[snapshot-testing|Snapshot Testing]]
- [[testing-guide|Testing Guide Overview]]
