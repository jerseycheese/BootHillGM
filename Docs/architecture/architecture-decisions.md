---
title: Architecture Decision Record
created: 2024-12-28
updated: 2024-12-28
---

# Architecture Decision Record (ADR) - MVP Focus

For implementation details, see [[next-js-setup|Next.js Setup]] and [[state-management|State Management Architecture]].

## ADR 1: Web Application Framework for BootHillGM

### Date: 10/1/2024
### Status: Accepted

### Context and Problem Statement
We need to design a maintainable architecture for the BootHillGM MVP that can handle basic AI-driven game management, user interactions, and data persistence. The architecture should support the core requirements of a text-based RPG with AI integration and be accessible across various devices, while being manageable for a single developer new to React.

### Decision
We have decided to use Next.js for the development of the BootHillGM web application MVP.

### Rationale
- Next.js provides server-side rendering (SSR) out of the box, improving initial load performance.
- It offers a straightforward developer experience with features like file-based routing and API routes.
- Next.js has good TypeScript support, enhancing code quality and developer productivity.
- It allows for easy deployment on platforms like Vercel, simplifying the deployment process.
- The framework's structure helps enforce good practices, beneficial for a developer new to React.

### Consequences

#### Positive
- Simplified development process with built-in features like routing and API routes.
- Easier deployment and basic scaling options.
- Potential for better user experience across various devices due to web-based nature.
- Good documentation and community support for learning and problem-solving.

#### Negative
- Learning curve for a developer new to both React and Next.js.
- May require additional effort to make the application feel "app-like" on mobile devices.

### MVP-Focused Decisions and Trade-offs
1. **State Management**: Use React's Context API for global state management in the MVP. This approach is simpler to implement and understand compared to more complex solutions like Redux.

2. **Styling**: Use CSS Modules for component-specific styles. This approach provides a good balance between simplicity and style encapsulation.

3. **API Routes**: Use Next.js API routes for server-side operations and AI interactions. This keeps our backend logic colocated with our frontend code, simplifying development.

4. **Data Persistence**: For the MVP, primarily use client-side storage (localStorage) for saving game state. This simplifies our data architecture for initial development.

5. **Authentication**: Defer implementing user authentication for the MVP, focusing instead on core gameplay features.

## ADR 2: Transition to Next.js App Router

### Date: 10/2/2024
### Status: Accepted

### Context and Problem Statement
With the upgrade to Next.js 14.x, we needed to decide whether to continue using the Pages Router or transition to the new App Router. The App Router offers new features and is the recommended approach for new Next.js projects.

### Decision
We have decided to transition the BootHillGM project to use the Next.js App Router.

### Rationale
- The App Router is the future of Next.js and offers improved performance and features.
- It provides a more intuitive project structure, aligning closely with the file-system based routing.
- The App Router supports easier implementation of layouts and nested routing.
- It offers better support for server-side rendering and static site generation.

### Consequences

#### Positive
- Improved performance and scalability for the application.
- Better alignment with modern Next.js best practices.
- Simplified routing and layout management.
- Enhanced server-side rendering capabilities.

#### Negative
- Requires refactoring of existing pages and components.
- Learning curve for developers unfamiliar with the App Router.
- Potential compatibility issues with some third-party libraries not yet updated for App Router.

## ADR 3: Game State Initialization Pattern

### Date: 10/23/2024
### Status: Accepted

### Context and Problem Statement
We needed to establish a reliable pattern for initializing game state, particularly handling the async nature of AI-driven content generation while maintaining state consistency.

### Decision
Implemented a centralized state initialization approach using:
- Single `SET_STATE` dispatch for atomic state updates
- Dedicated initialization hook (useGameInitialization)
- Clear separation between state updates and persistence

For implementation details, see [[../core-systems/state-management|State Management]].

### Rationale
- Prevents race conditions during initialization
- Ensures consistent state across page navigation
- Simplifies error handling and recovery
- Provides clear separation of concerns

### Consequences

#### Positive
- More predictable state initialization
- Reduced race conditions
- Better error handling
- Clearer separation of concerns

#### Negative
- Slightly more complex initialization logic
- Need to ensure state shape consistency

### Implementation Notes
- Uses React's useRef to prevent duplicate initialization
- Implements proper client-side hydration checks
- Maintains atomic state updates

## ADR 4: Combat System Architecture

### Date: 11/1/2024
### Status: Accepted

### Context and Problem Statement
We needed to design an efficient and maintainable combat system that could handle turn-based gameplay, state management, and AI integration.

### Decision
Implemented a separated combat system architecture:
- Combat logic extracted to useCombatEngine hook
- UI components focused on presentation
- State management through context updates
- Automatic state persistence

For implementation details, see [[../core-systems/combat-system|Combat System]].

### Rationale
- Separates concerns between combat logic and presentation
- Simplifies testing and maintenance
- Provides clear data flow
- Supports state restoration

### Consequences

#### Positive
- Improved testability
- Cleaner component architecture
- Better performance through optimized renders
- Easier state management

#### Negative
- More complex initial setup
- Need to manage multiple state updates

## ADR 5: Journal System Design

### Date: 11/1/2024
### Status: Accepted

### Context and Problem Statement
We needed to design a journal system that could automatically track game events, combat results, and inventory changes while maintaining performance.

### Decision
Implemented a structured journal system with:
- Typed journal entries
- Automatic entry generation
- Summary generation using AI
- Efficient state updates

For implementation details, see [[../core-systems/journal-system|Journal System]].

### Rationale
- Provides clear structure for different entry types
- Automates record keeping
- Maintains game state history
- Supports future feature expansion

### Consequences

#### Positive
- Consistent record keeping
- Automated entry creation
- Clear type safety
- Efficient updates

#### Negative
- Additional state management complexity
- Need to manage AI token usage
- Storage size considerations

### Implementation Notes

#### Client-Side Considerations
- State hydration management
- Efficient component updates
- Error boundary implementation
- Loading state management

#### Performance Optimization
- Debounced state updates
- Memoized components
- Selective rendering
- Efficient context usage

## ADR 6: State Restoration Pattern

### Date: 11/6/2024
### Status: Accepted

### Context and Problem Statement
We needed to simplify the complex state restoration logic in the CampaignStateManager component while ensuring proper type safety and data structure preservation.

### Decision
Extracted state restoration logic into a dedicated hook (useCampaignStateRestoration) and implemented a clear separation between state initialization and restoration logic.

### Rationale
- Improves code organization and maintainability
- Separates concerns between state management and restoration logic
- Makes the restoration process more testable
- Provides clearer error handling

### Consequences

#### Positive
- Cleaner component code
- Better error handling
- More maintainable state restoration
- Improved type safety

#### Negative
- Additional file to maintain
- Small increase in bundle size

### Implementation Notes
- Uses TypeScript for type safety
- Maintains existing state structure
- Preserves combat state restoration

## ADR 7: State Protection Pattern

### Date: 11/9/2024
### Status: Accepted

### Context and Problem Statement
We needed to prevent race conditions and ensure safe state updates during complex operations like combat resolution.

### Decision
Implemented a reusable StateProtection utility that provides:
- Protected state updates with operation queueing
- Timeout handling for long-running operations
- Error recovery for failed state updates

### Rationale
- Prevents race conditions in complex state updates
- Provides consistent error handling
- Makes state protection reusable across the application
- Supports operation queueing for better user experience

### Consequences

#### Positive
- More reliable state updates
- Better error handling and recovery
- Reusable state protection pattern
- Clear operation queuing behavior

#### Negative
- Slight increase in complexity
- Need to consider operation timeouts
- Additional testing requirements

### Implementation Notes
- Uses TypeScript for type safety
- Implements queue management for concurrent operations
- Provides timeout protection
- Maintains error handling consistency

## ADR 8: Brawling Combat System Refactoring

### Date: 11/9/2024
### Status: Accepted

### Context and Problem Statement
The brawling combat system contained mixed concerns between state management and combat rules logic, making it difficult to test and maintain.

### Decision
Implemented a dedicated BrawlingEngine class to handle pure combat calculations and rules, separate from state management.

For implementation details, see [[../core-systems/combat-system|Combat System]].

### Rationale
- Separates pure combat logic from state management
- Improves testability of combat rules
- Makes the code more maintainable
- Follows single responsibility principle

### Consequences

#### Positive
- Cleaner separation of concerns
- Better testability
- More maintainable combat rules
- Easier to modify combat logic

#### Negative
- Additional layer of abstraction
- Need to maintain backwards compatibility

### Implementation Notes
- Extracted combat calculations to BrawlingEngine class
- Updated tests to use new structure
- Maintained existing hook interface

## ADR 9: Loading Screen Consolidation

### Date: 11/26/2024
### Status: Accepted

### Context and Problem Statement
Multiple loading screen implementations were causing inconsistency in user experience and maintenance overhead.

### Decision
Implemented a unified LoadingScreen component with type-specific messages and built-in error handling.

### Rationale
- Reduces code duplication
- Provides consistent loading experience
- Simplifies maintenance
- Improves error handling

### Consequences

#### Positive
- Single source of truth for loading states
- Consistent user experience
- Reduced code complexity

#### Negative
- Slightly more complex component API
- Need to update existing loading screen usage

## ADR 10: Weapon Combat Hook Refactoring

### Date: 12/10/2024
### Status: Accepted

### Context and Problem Statement
The `useWeaponCombat` hook was becoming complex and difficult to maintain due to handling both combat state and action resolution.

### Decision
Refactored `useWeaponCombat` into two separate hooks:
- `useWeaponCombatState` for managing combat state
- `useWeaponCombatAction` for resolving combat actions

Additionally, extracted combat action resolution logic into utility functions:
- `weaponCombatActions` for processing player and opponent actions
- `weaponCombatResolver` for resolving individual actions
- `weaponCombatState` for updating combat state based on action results

For implementation details, see [[../core-systems/combat-system|Combat System]].

### Rationale
- Separates concerns between state management and action resolution
- Improves testability and maintainability
- Follows single responsibility principle
- Enhances readability and modularity

### Consequences

#### Positive
- Cleaner and more modular code
- Better testability
- Easier maintenance
- Improved readability

### Implementation Notes
- Used TypeScript for type safety
- Maintained existing hook interface for compatibility
- Added comments to explain the purpose and functionality of new code

## ADR 11: AI Service Modularization

### Date: 12/18/2024
### Status: Accepted

### Context and Problem Statement
The `aiService.tsx` file contained a growing number of responsibilities related to AI interactions, making it increasingly complex and harder to maintain. To improve organization and maintainability, it was necessary to refactor the service into smaller, more focused modules.

### Decision
The `aiService.tsx` file has been modularized into several smaller modules located in the `BootHillGMApp/app/utils/ai/` directory. Each module focuses on a specific aspect of AI functionality, promoting a separation of concerns.

For implementation details, see [[../ai/gemini-integration|Gemini Integration]].

### Rationale
- Improves code organization and readability by separating concerns
- Enhances maintainability by isolating related functionalities into individual modules
- Increases testability by allowing focused testing of individual AI components
- Promotes code reuse by creating independent, self-contained modules

### Consequences

#### Positive
- Improved code organization and readability
- Enhanced maintainability and scalability
- Increased testability of AI functionalities
- Better code reuse potential

#### Negative
- Requires updating import statements in files that use the modularized functions
- Introduces a larger number of files, which might seem initially more complex

### Implementation Notes
New modules created under `BootHillGMApp/app/utils/ai/`:
- `aiConfig.ts`: Contains the AI configuration and the `getAIModel` function
- `characterCreationPrompts.ts`: Contains the `getCharacterCreationStep` function
- `attributeValidation.ts`: Contains the `validateAttributeValue` function and the `validRanges` object
- `characterGeneration.ts`: Contains the `generateCompleteCharacter` function
- `fieldValueGeneration.ts`: Contains the `generateFieldValue` and `generateRandomValue` functions
- `narrativeSummary.ts`: Contains the `generateNarrativeSummary` function
- `weaponDetermination.ts`: Contains the `determineIfWeapon` function
- `characterSummary.ts`: Contains the `generateCharacterSummary` function

The `aiService.tsx` file was updated to import and re-export these functions from their respective modules, acting as a facade.