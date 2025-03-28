---
title: Integrating Existing Test Utilities
aliases: [Test Utilities Usage, Testing Best Practices]
tags: [development, testing, utilities, jest, react-testing-library]
created: 2025-03-23
updated: 2025-03-23
---

# Integrating Existing Test Utilities

> [!note]
> Guidelines for leveraging the project's existing test utilities when writing new tests.

## Available Test Utilities

The BootHillGM project includes a comprehensive set of testing utilities located in `/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/test`. These utilities should be used whenever possible to maintain consistency and reduce duplication.

### Key Utility Types

1. **Custom Render Functions**:
   - `customRender` - Wraps components in necessary providers
   - `renderCharacterCreation` - Specialized renderer for character creation flow
   - `renderCharacterForm` - Specialized renderer for character form testing

2. **Mocks**:
   - `aiService` - AI generation functionality mocks
   - `navigation` - Next.js navigation mocks
   - `gameEngine` - Game state and engine mocks

3. **Testing Helpers**:
   - Character test utilities
   - User event utilities
   - Mock data generators

## Using Test Utilities in New Tests

When writing new tests, follow these practices:

### 1. Import From Central Export

Always import test utilities from the central export in `testUtils.ts`:

```typescript
// PREFERRED: Import from central export
import { 
  customRender, 
  renderCharacterForm,
  setupMocks 
} from '../../../test/testUtils';

// AVOID: Direct imports from specific files
// import { customRender } from '../../../test/render/componentRenderer';
```

### 2. Use Custom Render Instead of RTL's Render

```typescript
// PREFERRED: Use custom render with context providers
import { customRender } from '../../../test/testUtils';

test('component renders correctly', () => {
  const { getByText } = customRender(<MyComponent />);
  expect(getByText('Expected text')).toBeInTheDocument();
});

// AVOID: Direct usage of React Testing Library's render
// import { render } from '@testing-library/react';
```

### 3. Leverage Specialized Renderers

For component types that have specialized renderers:

```typescript
import { renderCharacterForm } from '../../../test/testUtils';

test('character form renders attributes correctly', () => {
  const { getByTestId } = renderCharacterForm({
    // Override only the props you need
    character: {
      ...defaultCharacter,
      name: 'Custom Test Name'
    }
  });
  
  expect(getByTestId('character-name')).toHaveValue('Custom Test Name');
});
```

### 4. Utilize Mock Data

```typescript
import { setupMocks } from '../../../test/testUtils';

beforeEach(() => {
  // Setup all mocks with default configuration
  setupMocks();
});

test('using mocked AI service', async () => {
  // The AI service is already mocked by setupMocks()
  const result = await myComponentThatUsesAI();
  expect(result).toContain('AI-generated');
});
```

## Extending Test Utilities

When adding new functionality that needs tests:

1. **Check for Existing Utilities First**:
   - Review `/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/test` to see if helpers already exist
   - Check if existing utilities can be extended rather than creating new ones

2. **Add New Utilities to Existing Structure**:
   - Place new test utilities in the appropriate subdirectory
   - Export them from the central `testUtils.ts` file

3. **Follow Existing Patterns**:
   - Maintain consistent naming conventions
   - Add JSDoc comments to document usage
   - Include return type annotations

## Test Templates and Examples

### Basic Component Test Template

```typescript
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../../test/testUtils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('renders correctly with default props', () => {
    customRender(<MyComponent />);
    expect(screen.getByTestId('my-component')).toBeInTheDocument();
  });
  
  test('handles user interaction', async () => {
    customRender(<MyComponent />);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText('Submitted!')).toBeInTheDocument();
  });
});
```

### Component with Mocked Service Test

```typescript
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender, setupMocks } from '../../../test/testUtils';
import CharacterGenerator from './CharacterGenerator';

// Mock default is used via setupMocks()
jest.mock('../../../services/aiService');

describe('CharacterGenerator', () => {
  beforeEach(() => {
    setupMocks();
  });
  
  test('generates character name', async () => {
    customRender(<CharacterGenerator />);
    
    await userEvent.click(screen.getByTestId('generate-name-button'));
    
    await waitFor(() => {
      // We can rely on the mock returning one of the predefined names
      expect(screen.getByTestId('character-name')).toHaveValue(expect.stringMatching(/Billy the Kid|Wyatt Earp|Annie Oakley|Doc Holliday|Jesse James/));
    });
  });
});
```

## Integration with Claude Workflow

When using Claude to help with test definition, use the following prompt template to ensure test utilities are properly leveraged:

```
Let's define tests for this component using our existing test utilities.

Component Code:
[paste component code]

Test requirements:
1. [requirement 1]
2. [requirement 2]

Important: Use the following test utilities from our project:
- Import from '../../../test/testUtils' instead of directly from testing-library
- Use customRender instead of render
- Use any specialized renderers if applicable (renderCharacterForm, etc.)
- Utilize setupMocks() for setting up test environment
```

## Common Testing Patterns

### Testing Asynchronous Operations

```typescript
import { customRender, setupMocks } from '../../../test/testUtils';

test('loads data asynchronously', async () => {
  // Set up mocks
  setupMocks();
  
  // Render with custom renderer
  customRender(<AsyncComponent />);
  
  // Verify loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Wait for content to appear
  await waitFor(() => {
    expect(screen.getByText('Data loaded!')).toBeInTheDocument();
  });
});
```

### Testing Form Submission

```typescript
import { customRender } from '../../../test/testUtils';

test('submits form data', async () => {
  const handleSubmit = jest.fn();
  
  customRender(<MyForm onSubmit={handleSubmit} />);
  
  // Fill form fields
  await userEvent.type(screen.getByLabelText('Name'), 'Jesse James');
  
  // Submit the form
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  // Verify submission
  expect(handleSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Jesse James' })
  );
});
```

## Related Documents
- [[claude-app-workflow|Claude App Workflow]]
- [[tdd-with-kiss|Test-Driven Development with KISS]]
- [[feature-development-workflow|Feature Development Workflow]]
- [[post-implementation-fixes|Handling Post-Implementation Issues]]