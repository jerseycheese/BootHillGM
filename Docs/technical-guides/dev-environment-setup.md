# Development Environment Setup Guide

## Introduction

This guide outlines the recommended development environment setup for the BootHillGM project. Following these instructions will ensure a consistent development experience and help you be more productive with React and Next.js.

## VS Code Setup

### Recommended Extensions

We recommend using Visual Studio Code with the following extensions:

1. **ESLint** (`dbaeumer.vscode-eslint`) - Integrates ESLint into VS Code for real-time linting and code quality checks
   
2. **Prettier** (`esbenp.prettier-vscode`) - Code formatter that enforces a consistent style automatically
   
3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - Provides autocomplete for Tailwind CSS classes
   
4. **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`) - Comprehensive React snippets collection
   
5. **Simple React Snippets** (`burkeholland.simple-react-snippets`) - Additional React snippets with simple syntax
   
6. **TypeScript Nightly** (`ms-vscode.vscode-typescript-next`) - Latest TypeScript language features and improvements

When you open the BootHillGM project in VS Code, you should see these recommended extensions in the Extensions view.

### React Snippets Cheat Sheet

Both snippet extensions provide useful shortcuts. Here are the most helpful ones:

#### Simple React Snippets (burkeholland.simple-react-snippets)

| Prefix | Description |
|--------|-------------|
| `imr` | Import React |
| `imrc` | Import React and Component |
| `sfc` | Stateless Function Component |
| `uef` | useEffect Hook |
| `usf` | useState Hook |
| `ust` | useEffect with setTimeout |

Example using `sfc`:
```tsx
// Type: sfc<Tab>
// Result:
const ComponentName = (props) => {
    return (  );
}
 
export default ComponentName;
```

#### ES7+ React/Redux/React-Native Snippets (dsznajder.es7-react-js-snippets)

| Prefix | Description |
|--------|-------------|
| `rafce` | React Arrow Function Component with ES7+ export |
| `rfc` | React Functional Component |
| `rfce` | React Functional Component with ES7+ export |
| `usestate` | useState Hook |
| `useeffect` | useEffect Hook |
| `useref` | useRef Hook |
| `usememo` | useMemo Hook |
| `usecallback` | useCallback Hook |

Example using `rafce`:
```tsx
// Type: rafce<Tab>
// Result:
import React from 'react'

const ComponentName = () => {
  return (
    <div>ComponentName</div>
  )
}

export default ComponentName
```

TypeScript-specific snippets:

| Prefix | Description |
|--------|-------------|
| `tsrafce` | TypeScript React Arrow Function Component with ES7+ export |
| `tsrfc` | TypeScript React Functional Component |
| `tsrpce` | TypeScript React Pure Component with ES7+ export |

### Workspace Settings

The project includes workspace settings that configure VS Code for optimal React and TypeScript development:

- Format on save is enabled (automatically applies Prettier formatting)
- ESLint auto-fix on save is enabled (fixes common issues automatically)
- Tailwind CSS is configured for TypeScript files
- TypeScript is configured to use the project's TypeScript version

## React Developer Tools

React Developer Tools is a browser extension that helps with debugging React applications by providing insight into component structures, props, and state.

### Installation

- For Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- For Firefox: [React Developer Tools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Configuration

After installing the extension:

1. Open your app in the browser
2. Open Developer Tools (F12)
3. Go to the Components tab (this will show your React component tree)
4. Click the settings gear icon
5. Add the following component filters:
   - Hide components where name matches: `/^(Provider|Consumer)$/`
   - Hide components where name matches: `/^(ForwardRef|Memo)$/`
   - Hide components where name matches: `/^.+\..+$/` (to filter out minified components)

### Usage Tips

- Use the Components tab to inspect component props and state
- Use the Profiler tab to identify performance issues and render times
- Click on components in the Component tree to see their props and state
- Use the search box to find specific components in complex applications

### React DevTools Component Example

When working with a component, you'll see a structure like this:

```
App
└── GameSession
    ├── CharacterSheet
    │   ├── StatsDisplay
    │   └── InventoryList
    └── CombatSystem
```

You can click on any component to see:
- Props passed to the component
- Current state values
- Hooks being used
- The source file location

This gives you much more visibility into your React app than browser inspection alone.

## Fast Refresh

Next.js includes Fast Refresh, which provides near-instant feedback for changes to React components.

### Benefits of Fast Refresh

- Only updates changed components instead of full page reloads
- Preserves component state during edits
- Provides near-instant updates to see changes immediately
- Maintains UI position (scroll, focus) during updates

### Best Practices for Fast Refresh

1. Keep component state in hooks when possible
   
2. Avoid putting logic in module scope that should be in components
   
3. Export components as named exports when possible
   ```javascript
   // Better for Fast Refresh
   export function Button() { /* ... */ }
   
   // Slightly less optimal
   export default function Button() { /* ... */ }
   ```
   
4. If state resets unexpectedly, check for syntax errors in your components

### Troubleshooting Fast Refresh

If Fast Refresh doesn't work as expected:

1. Check for syntax errors in the console
2. Ensure you're not using anonymous functions as components
   ```javascript
   // Problematic for Fast Refresh
   export default () => <div>Hello</div>;
   
   // Better for Fast Refresh
   export function Greeting() {
     return <div>Hello</div>;
   }
   ```
3. Make sure you're not exporting multiple components from the same file
4. If necessary, restart the development server

## Component Structure Best Practices

React has established patterns for organizing components that lead to more maintainable code:

### Component File Organization

```
/components
  /CharacterSheet
    CharacterSheet.tsx      // Main component
    CharacterSheet.test.tsx // Tests
    useCharacterStats.ts    // Related hook
    types.ts                // TypeScript definitions
```

### Component Composition

```tsx
// Breaking down a complex component into smaller pieces
export function CharacterSheet({ character }) {
  return (
    <Card>
      <CardHeader>
        <CharacterName name={character.name} />
      </CardHeader>
      <CardBody>
        <StatsDisplay stats={character.stats} />
        <InventoryList items={character.inventory} />
      </CardBody>
    </Card>
  );
}
```

## Running the Development Server

To start the development server:

```bash
npm run dev
```

The server will run at `http://localhost:3000` by default.

## Debugging React Applications

For effective debugging in React applications:

1. **Console logging** - For quick inspection of values
   ```javascript
   console.log('Character data:', character);
   ```

2. **React Developer Tools** - For component-specific debugging

3. **Browser DevTools** - For network, performance, and general debugging

4. **React Error Boundaries** - To catch and handle errors gracefully
   ```jsx
   <ErrorBoundary fallback={<ErrorDisplay />}>
     <GameComponent />
   </ErrorBoundary>
   ```

## VS Code Keyboard Shortcuts for React Development

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Quick file navigation | Ctrl+P | Cmd+P |
| Find in files | Ctrl+Shift+F | Cmd+Shift+F |
| Format document | Shift+Alt+F | Shift+Option+F |
| Go to definition | F12 | F12 |
| Rename symbol | F2 | F2 |
| Toggle terminal | Ctrl+` | Cmd+` |

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
