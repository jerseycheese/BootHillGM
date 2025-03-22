# Snapshot Testing Guide

## Overview

Snapshot testing is a testing technique that captures the rendered output of a component and compares it to a previously saved "snapshot" to detect unintended changes in UI components.

## When to Use Snapshot Testing

### Good Candidates for Snapshot Testing
- UI components with minimal logic
- Components that render different output based on props
- Visual elements like icons, buttons, and cards
- Components that have different visual states

### Poor Candidates for Snapshot Testing
- Components with complex logic
- Components that change frequently
- Components with dynamic content (dates, random values)
- Components with many internal states

## Best Practices

### 1. Keep Snapshots Small and Focused
Test specific elements rather than entire pages:

```tsx
// Instead of entire component:
const { getByTestId } = render(<LargeComponent />);
const headerElement = getByTestId('header-section');
expect(headerElement).toMatchSnapshot();
```

### 2. Name Snapshots Clearly
Use descriptive test names that explain what aspect is being tested.

### 3. Updating Snapshots
When a component changes intentionally, update snapshots with:

```bash
npm run test:update-snapshots
```

To update a single snapshot:

```bash
npm run test:update-snapshot-single "specific test name"
```

### 4. Handling Dynamic Data
For components that display dynamic data like dates or IDs:

- Mock the data generators to return consistent values
- Use data-testid for dynamic elements and snapshot only specific parts
- Create custom serializers to normalize dynamic values

```tsx
// Mock date to be consistent
jest.spyOn(global.Date, 'now').mockImplementation(() => 1648635000000);
```

### 5. Reviewing Snapshot Changes
When snapshots change:

1. Review the changes carefully in the diff
2. Verify that changes are intentional
3. Check if the component's behavior has changed
4. Update the snapshot if changes are expected

## File Organization

- Name files with `.snap.test.tsx` extension
- Keep snapshots alongside other tests for the component
- Group related snapshots by component behavior

## Running Snapshot Tests

```bash
# Run all snapshot tests
npm run test:snapshots

# Update all snapshots
npm run test:update-snapshots

# Update a specific snapshot
npm run test:update-snapshot-single "StatDisplay with max value"
```

## Maintenance Strategy

1. Run snapshot tests with every pull request
2. Update snapshots when UI components change intentionally
3. Delete snapshots for removed components
4. Periodically review snapshot coverage

## Common Issues

### Snapshots Too Large
- Focus on smaller, more specific parts of components
- Snapshot test just the parts that should remain stable

### Too Many Snapshot Updates
- Consider if the component is a good candidate for snapshot testing
- Look for dynamic content that should be mocked or normalized

### Difficult to Review Changes
- Keep snapshots small and focused on specific behavior
- Add comments to clarify expected rendering behavior

## BootHillGM Specific Guidelines

1. Always use the mock fixtures from `app/test/fixtures/mockComponents.ts` for consistent test data
2. For components that use context, use the custom renderers from `app/test/utils/testRenderers.tsx`
3. Follow the existing naming pattern: `ComponentName.snap.test.tsx`
4. Include snapshots for all major component variations
5. Test edge cases like empty lists, error states, and loading states
