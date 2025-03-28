# Boot Hill GM App

This is a Next.js application for managing Boot Hill tabletop RPG game sessions, providing tools for Game Masters to run narrative-driven Western adventures.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The application is organized using a feature-based structure:

```
BootHillGMApp/
├── app/               # Main application code
│   ├── actions/       # Action creators
│   ├── components/    # Reusable UI components
│   │   └── docs/      # Component documentation
│   ├── context/       # React context providers
│   │   └── docs/      # State architecture documentation
│   ├── docs/          # General app documentation
│   ├── hooks/         # Custom React hooks
│   ├── reducers/      # Redux-style reducers
│   ├── services/      # API services and external integrations
│   ├── styles/        # CSS and styling utilities
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
│       └── docs/      # Development tool documentation
├── public/            # Static assets
└── tests/             # Test files
```

## Key Features

- **Character Management:** Create and manage Boot Hill characters
- **Combat System:** Handle Western-style combat encounters
- **Narrative Engine:** Drive story-based gameplay with decision tracking
- **Inventory System:** Manage items, weapons, and equipment
- **Location Services:** Track and explore the Western frontier

## Documentation

### Application-Specific Documentation

Documentation for specific components and implementation details is co-located with the relevant code:

- **Component Documentation:** `/app/components/docs/`
  - [Player Decision Card](/app/components/docs/PlayerDecisionCard.md)

- **State Architecture:** `/app/context/docs/`
  - [State Architecture V2](/app/context/docs/state-architecture-v2.md)
  - [Selector Migration Guide](/app/context/docs/selector-migration-guide.md)
  - [State Architecture Test Patterns](/app/context/docs/state-architecture-test-patterns.md)

- **Development Tools:** `/app/utils/docs/`
  - [Debug Tools](/app/utils/docs/debug-tools.md)

### Project-Level Documentation

Broader documentation about architecture, planning, and systems is maintained in the centralized documentation repository:

- **Project Documentation:** `/Users/jackhaas/Projects/BootHillGM/Docs/`
  - Core Systems: `/Docs/core-systems/`
  - Architecture: `/Docs/architecture/`
  - Planning & Implementation: `/Docs/planning/implementation-plans/`
    - [Player Decision Impact Implementation](/Users/jackhaas/Projects/BootHillGM/Docs/planning/implementation-plans/player-decision-impact-implementation.md)
    - [Story Progression System](/Users/jackhaas/Projects/BootHillGM/Docs/planning/implementation-plans/story-progression-system.md)

## Development Conventions

### Code Organization

- Files are organized by feature and responsibility
- Reducers manage state for specific domains
- Components should be focused and reusable
- Types are defined in dedicated files

### Size Limits

- Reducers: < 300 lines
- Components: < 500 lines
- Utility files: < 200 lines

### Naming Conventions

- PascalCase for components
- camelCase for functions and variables
- UPPERCASE_SNAKE_CASE for constants
- .ts extension for TypeScript files
- .tsx extension for TypeScript + JSX files

## Technology Stack

- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Jest](https://jestjs.io/) - Testing

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
