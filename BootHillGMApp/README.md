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
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── reducers/      # Redux-style reducers
│   ├── services/      # API services and external integrations
│   ├── styles/        # CSS and styling utilities
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
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

The comprehensive documentation for this application is maintained in the centralized documentation repository:

`/Users/jackhaas/Projects/BootHillGM/Docs/`

Key documentation sections:

- **Core Systems:** `/Docs/core-systems/` - High-level system documentation
  - [Narrative System](/Docs/core-systems/narrative-system.md)
  - [Player Decision System](/Docs/core-systems/player-decision-system.md)

- **Architecture:** `/Docs/architecture/` - Technical implementation details
  - [Narrative Architecture](/Docs/architecture/narrative-architecture.md)
  - [Decision Service](/Docs/architecture/decision-service.md)

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
