# Storybook Styling Guide

## Overview

This document explains the styling approach used in our Storybook implementation for BootHillGM. It covers how we handle CSS, Tailwind integration, and component styling in isolation.

## Styling Architecture

Our Storybook implementation uses a layered approach to ensure components are always properly styled:

1. **Primary Layer**: Tailwind CSS via proper directives
2. **Secondary Layer**: Application-specific global CSS 
3. **Fallback Layer**: Component-specific inline styles
4. **Critical Layer**: Basic HTML/CSS in preview-head.html

This ensures that even if one styling approach fails, the components remain visible and functional.

## How it Works

### CSS Processing Flow

1. Tailwind directives are processed first (`tailwind-directives.css`)
2. Storybook-specific styles are loaded (`storybook.css`)
3. Application global styles are applied (`globals.css`)
4. Component-specific styles from story files are applied

### Configuration Files

- **postcss.config.js**: Configures Tailwind processing for Storybook
- **main.js**: Sets up webpack to correctly handle CSS files
- **preview.js**: Imports CSS files in the correct order
- **preview-head.html**: Provides critical backup styles
- **StoryWrapper.jsx**: Wraps all stories with consistent styling

## Best Practices

### Creating Component Stories

When creating new component stories, follow these guidelines:

1. **Use Tailwind Classes First**: Leverage Tailwind utility classes for styling
2. **Add Inline Style Fallbacks**: For critical styling, add inline styles as a fallback
3. **Component-Specific Wrappers**: Use decorators for complex styling needs
4. **Test in Both Modes**: Check your components in both light and dark mode

### Example Component Story

```tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import YourComponent from './YourComponent';

// Optional component-specific wrapper
const ComponentWrapper = ({ children }) => (
  <div className="p-4 border border-gray-200 rounded-lg">
    {/* Inline style fallback */}
    <div style={{ padding: '1rem', border: '1px solid #e5e7eb' }}>
      {children}
    </div>
  </div>
);

const meta: Meta<typeof YourComponent> = {
  title: 'Category/YourComponent',
  component: YourComponent,
  // Add component-specific decorator if needed
  decorators: [
    (Story) => (
      <ComponentWrapper>
        <Story />
      </ComponentWrapper>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof YourComponent>;

export const Default: Story = {
  args: {
    // Your component props
  },
};
```

## Troubleshooting

If styles are not applying correctly:

1. Check browser console for errors
2. Verify CSS import order in preview.js
3. Check that component is using the expected class names
4. Inspect element to see which styles are being applied
5. Try adding the class to the Tailwind safelist in tailwind.config.ts

## Further Reading

- [Storybook + Tailwind Documentation](https://storybook.js.org/recipes/tailwindcss)
- [Next.js + Storybook Integration](https://storybook.js.org/recipes/next)
