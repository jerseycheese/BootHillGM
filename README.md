# BootHillGM Project

BootHillGM is a web application providing an AI-driven Game Master for the Boot Hill tabletop RPG, offering an engaging, user-friendly experience for solo players in the Western genre. Built with Next.js, it's designed to run in modern web browsers.

**Project Status**: Alpha development - Core features implementation in progress

## Key Features

- Boot Hill Character Creation with AI-driven generation
- AI-powered Game Mastering for Western settings using Gemini 1.5 Pro
- AI-powered NPCs with persistent memory
- Game Session and State Management with automatic saving and restoration
- Boot Hill's percentile dice system for chance-based outcomes
- Character Sheet View with stat and status displays
- Inventory Management with item usage and tracking
- Turn-based combat system with Boot Hill mechanics
- Strength system implementation with derived stats and modifiers
- Automatic journal entry system with search and filtering
- Player Decision System with narrative integration
- Lore Management System for consistent world facts

## Technical Stack

- **Frontend**: Next.js 14.x with App Router
- **AI Integration**: Gemini 1.5 Pro API (Google Generative AI)
- **Development**: VS Code, ESLint, Prettier
- **UI**: React with Tailwind CSS
- **State Management**: React Context with useReducer
- **Storage**: localStorage for persistence
- **Testing**: React Testing Library with Jest

## Getting Started

1. Clone the repository
2. Install Node.js and npm if not already installed
3. Navigate to the `BootHillGMApp` directory and run: `npm install`
4. Set up your Gemini API key:
   ```
   # .env.local
   GEMINI_API_KEY=your_api_key_here
   ```
5. Start development server: `npm run dev`
6. Run tests: `npm test`

## Core Systems

- **AI Integration**: Game Master intelligence, NPC behaviors, and narrative generation
- **Character System**: Creation, management, and progression
- **Combat System**: Turn-based mechanics with weapons and modifiers
- **Journal System**: Automatic narrative recording and organization
- **Player Decision System**: Interactive choice management with narrative impact
- **State Management**: Game session persistence and restoration
- **Lore Management System**: Tracking and maintaining consistent world facts during narrative generation

## Development Approach

The project follows test-driven development principles using React Testing Library and Jest. The testing workflow includes:

- Planning tests that define expected behavior
- Implementing minimal code to pass tests
- Refactoring for code quality while maintaining behavior
- Organization of tests alongside their components

For more details, see the [testing documentation](Docs/technical-guides/testing-guide.md) and [workflow guide](Docs/development/workflows/testing-workflow.md).

## Documentation

Documentation is maintained in the `/Docs` directory, organized by:

- **Technical Guides**: Setup, configuration, and development practices
- **Core Systems**: Implementation details for major features
- **Development Workflows**: Processes and best practices
- **Architecture**: Design decisions and component structure
- **Meta**: Project overview and planning documents

The complete documentation structure provides detailed information on all aspects of the project's implementation and design.

## Recent Updates

### Lore Management System (March 2025)

The newly implemented Lore Management System enhances narrative coherence by:

- Systematically tracking and organizing world facts during gameplay
- Extracting lore from AI responses with categorization and metadata
- Intelligently selecting relevant facts for AI context building
- Preventing fact contradictions in long-running play sessions

For more information, see the [Lore Management System documentation](Docs/core-systems/lore-management-system.md) and [usage guide](Docs/technical-guides/using-lore-system.md).