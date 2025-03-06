# Component Naming Convention

This document outlines the naming conventions for components in the Boot Hill GM application.

## Classes

We use a BEM-like naming convention for CSS classes:

```
bhgm-[component]-[element]
```

*   `bhgm`: Prefix for all Boot Hill GM related classes.
*   `[component]`: Name of the component (e.g., `narrative`, `inventory`, `gameSession`).
*   `[element]`: Name of a specific element within the component (e.g., `player-action`, `container`, `list`).

Example: `bhgm-narrative-player-action`

## IDs

IDs should be unique across the entire application and use camelCase:

```
bhgmComponentName
```

Example: `bhgmMainGameArea`

## data-testid Attributes

`data-testid` attributes are used for testing purposes and should use kebab-case:

```
component-name-element
```
Example: `narrative-display-container`

## General Guidelines

*   Maintain existing Tailwind classes where used.
*   Add ARIA attributes where appropriate to improve accessibility.
*   Ensure IDs are unique across the application.