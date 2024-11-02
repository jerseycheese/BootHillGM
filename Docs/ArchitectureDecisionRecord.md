# Architecture Decision Record (ADR) - MVP Focus

## ADR 1: Web Application Framework for BootHillGM

### Date: 10/1/2024

### Status: Accepted

## Context and Problem Statement

We need to design a maintainable architecture for the BootHillGM MVP that can handle basic AI-driven game management, user interactions, and data persistence. The architecture should support the core requirements of a text-based RPG with AI integration and be accessible across various devices, while being manageable for a single developer new to React.

## Decision

We have decided to use Next.js for the development of the BootHillGM web application MVP.

## Rationale

- Next.js provides server-side rendering (SSR) out of the box, improving initial load performance.
- It offers a straightforward developer experience with features like file-based routing and API routes.
- Next.js has good TypeScript support, enhancing code quality and developer productivity.
- It allows for easy deployment on platforms like Vercel, simplifying the deployment process.
- The framework's structure helps enforce good practices, beneficial for a developer new to React.

## Consequences

### Positive

- Simplified development process with built-in features like routing and API routes.
- Easier deployment and basic scaling options.
- Potential for better user experience across various devices due to web-based nature.
- Good documentation and community support for learning and problem-solving.

### Negative

- Learning curve for a developer new to both React and Next.js.
- May require additional effort to make the application feel "app-like" on mobile devices.

## MVP-Focused Decisions and Trade-offs

1. **State Management**: Use React's Context API for global state management in the MVP. This approach is simpler to implement and understand compared to more complex solutions like Redux.

2. **Styling**: Use CSS Modules for component-specific styles. This approach provides a good balance between simplicity and style encapsulation.

3. **API Routes**: Use Next.js API routes for server-side operations and AI interactions. This keeps our backend logic colocated with our frontend code, simplifying development.

4. **Data Persistence**: For the MVP, primarily use client-side storage (localStorage) for saving game state. This simplifies our data architecture for initial development.

5. **Authentication**: Defer implementing user authentication for the MVP, focusing instead on core gameplay features.

## ADR 2: Transition to Next.js App Router

### Date: 10/2/2024

### Status: Accepted

## Context and Problem Statement

With the upgrade to Next.js 14.x, we needed to decide whether to continue using the Pages Router or transition to the new App Router. The App Router offers new features and is the recommended approach for new Next.js projects.

## Decision

We have decided to transition the BootHillGM project to use the Next.js App Router.

## Rationale

- The App Router is the future of Next.js and offers improved performance and features.
- It provides a more intuitive project structure, aligning closely with the file-system based routing.
- The App Router supports easier implementation of layouts and nested routing.
- It offers better support for server-side rendering and static site generation.

## Consequences

### Positive

- Improved performance and scalability for the application.
- Better alignment with modern Next.js best practices.
- Simplified routing and layout management.
- Enhanced server-side rendering capabilities.

### Negative

- Requires refactoring of existing pages and components.
- Learning curve for developers unfamiliar with the App Router.
- Potential compatibility issues with some third-party libraries not yet updated for App Router.

## ADR 3: Game State Initialization Pattern

### Date: 10/23/2024

### Status: Accepted

## Context and Problem Statement
We needed to establish a reliable pattern for initializing game state, particularly handling the async nature of AI-driven content generation while maintaining state consistency.

## Decision
Implemented a centralized state initialization approach using:
- Single `SET_STATE` dispatch for atomic state updates
- Dedicated initialization hook (useGameInitialization)
- Clear separation between state updates and persistence

## Rationale
- Prevents race conditions during initialization
- Ensures consistent state across page navigation
- Simplifies error handling and recovery
- Provides clear separation of concerns

## Consequences

### Positive
- More predictable state initialization
- Reduced race conditions
- Better error handling
- Clearer separation of concerns

### Negative
- Slightly more complex initialization logic
- Need to ensure state shape consistency

### Implementation Notes
- Uses React's useRef to prevent duplicate initialization
- Implements proper client-side hydration checks
- Maintains atomic state updates

## ADR 4: Combat System Architecture

### Date: 11/1/2024

### Status: Accepted

## Context and Problem Statement
We needed to design an efficient and maintainable combat system that could handle turn-based gameplay, state management, and AI integration.

## Decision
Implemented a separated combat system architecture:
- Combat logic extracted to useCombatEngine hook
- UI components focused on presentation
- State management through context updates
- Automatic state persistence

## Rationale
- Separates concerns between combat logic and presentation
- Simplifies testing and maintenance
- Provides clear data flow
- Supports state restoration

## Consequences

### Positive
- Improved testability
- Cleaner component architecture
- Better performance through optimized renders
- Easier state management

### Negative
- More complex initial setup
- Need to manage multiple state updates

## ADR 5: Journal System Design

### Date: 11/1/2024

### Status: Accepted

## Context and Problem Statement
We needed to design a journal system that could automatically track game events, combat results, and inventory changes while maintaining performance.

## Decision
Implemented a structured journal system with:
- Typed journal entries
- Automatic entry generation
- Summary generation using AI
- Efficient state updates

## Rationale
- Provides clear structure for different entry types
- Automates record keeping
- Maintains game state history
- Supports future feature expansion

## Consequences

### Positive
- Consistent record keeping
- Automated entry creation
- Clear type safety
- Efficient updates

### Negative
- Additional state management complexity
- Need to manage AI token usage
- Storage size considerations

## Implementation Notes

### Client-Side Considerations
- State hydration management
- Efficient component updates
- Error boundary implementation
- Loading state management

### Performance Optimization
- Debounced state updates
- Memoized components
- Selective rendering
- Efficient context usage

This ADR will be reviewed and updated as the project progresses beyond the MVP phase.
