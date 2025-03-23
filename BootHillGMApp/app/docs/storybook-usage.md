# BootHillGM Storybook Usage

Storybook provides a way to develop and test UI components in isolation. This document covers how to use our Storybook setup for the BootHillGM application.

## Running Storybook

```bash
# From the BootHillGMApp directory
npm run storybook
```

This will start Storybook on port 6006. Open http://localhost:6006 in your browser.

## Implemented Component Stories

We've set up stories for these key components:

- **Combat Controls**: Shows different combat states (player turn, opponent turn, processing)
- **Character Sheet Content**: Displays character attributes, stats, and wounds
- **Journal Viewer**: Shows different journal entry types (narrative, combat, inventory, quest)

## Architecture Notes

- **Styling**: Tailwind CSS is integrated using directives in `.storybook/tailwind-directives.css`
- **App Router Compatibility**: All stories support Next.js App Router with the `nextjs: { appDirectory: true }` parameter
- **Context Handling**: Components requiring app context use stub components or mock providers

## Component Stubbing Pattern

For components with complex context dependencies, we use a stubbing pattern:

```tsx
// Example: CharacterSheetContent stub
const CharacterSheetStub = ({ character }: { character?: CharacterData }) => {
  const displayCharacter = character || mockCharacter;
  
  return (
    <div className="wireframe-container">
      {/* Simplified version of the component that doesn't require context */}
    </div>
  );
};
```

This approach allows us to:
1. Avoid context errors in Storybook
2. Focus on the visual aspects of components
3. Test different states and variations

## Adding New Stories

### Basic Story Pattern

```tsx
import React from 'react';
import YourComponent from './YourComponent';

const meta = {
  title: 'Category/YourComponent',
  component: YourComponent,
  parameters: {
    // Required for Next.js App Router compatibility
    nextjs: {
      appDirectory: true,
    },
  },
  // Optional tags for StoryBook organization
  tags: ['autodocs'],
  // Define controls for component props
  argTypes: {
    propName: { 
      control: 'text', // or 'boolean', 'select', etc.
      description: 'Description of the prop'
    },
  }
};

export default meta;

// Default state
export const Default = {
  args: {
    // Your component props
    propName: 'value',
  },
};

// Additional variations
export const AnotherState = {
  args: {
    propName: 'different value',
  },
};
```

### Using Decorators

Decorators provide a consistent wrapper for your stories:

```tsx
const YourComponentWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border border-gray-200 rounded-lg bg-white">
    {children}
  </div>
);

// Type for story rendering function
type StoryRenderFn = () => ReactElement;

const meta = {
  // ... other meta properties
  
  // Add component-specific decorator
  decorators: [
    (Story: StoryRenderFn) => (
      <YourComponentWrapper>
        <Story />
      </YourComponentWrapper>
    )
  ]
};
```

### Using Mock Data

Create realistic mock data for your components:

```tsx
// Create mock data
const mockData = {
  id: 'mock-1',
  name: 'Example Item',
  // Other properties
};

// Use in stories
export const WithData = {
  args: {
    data: mockData
  },
};
```

## CSS/Tailwind in Storybook

Storybook uses a dedicated Tailwind CSS setup:

1. Tailwind directives are loaded in `.storybook/tailwind-directives.css`
2. This file is imported in `.storybook/preview.js`
3. Component-specific styles can be added in `.storybook/storybook.css`

Any Tailwind classes used in your components will work in Storybook without additional configuration.

## Tips for Effective Stories

1. **Create Multiple Variations**: Show different states of your component
2. **Use Realistic Data**: Mock data should represent real-world scenarios
3. **Keep It Simple**: Stub complex dependencies when necessary
4. **Document Props**: Use `argTypes` to document component props
5. **Test Edge Cases**: Include stories for empty states, errors, etc.
