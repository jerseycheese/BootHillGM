# BootHillGM Technical Specification (MVP)

## 1. Technical Stack
- [x] Framework: Next.js 14.x (React-based framework for web applications)
- [x] Routing: Next.js App Router
- [x] Programming Language: TypeScript 5.x for enhanced type safety
- [x] AI Model: Gemini 1.5 Pro API (Google Generative AI)
- [x] Development Environment: Visual Studio Code with ESLint and Prettier
- [x] Version Control: Git
- [x] UI Components: Custom React components
- [x] State Management: React Context API with useReducer for more complex state updates
- [x] Styling: CSS Modules and Tailwind CSS
- [x] Data Persistence: localStorage for client-side storage (MVP phase)

## 2. Architecture Overview
- [x] Next.js pages and API routes
- [x] React component-based architecture
- [x] Server-side rendering (SSR) for initial page load
- [x] Client-side navigation for subsequent page transitions

## 3. Key Components
1. Pages (now using App Router):
   - Home (app/page.tsx)
   - Character Creation (app/character-creation/page.tsx)
   - Game Session (app/game-session/page.tsx)
   - Character Sheet (app/character-sheet/page.tsx)
2. Layout (app/layout.tsx): Defines the main layout for the application
3. Game Engine: Manages game state, turns, and basic game flow
4. AI Integration Service: Handles communication with the Gemini API
5. Character Management System: Manages character creation and stats
6. Narrative Engine: Generates basic storylines and dialogues
7. Combat System: Manages simplified combat mechanics
8. Inventory System: Manages character inventory and item interactions
9. UI Components: Basic reusable React components
10. Campaign State Manager: Handles saving, loading, and managing campaign state
11. Journal System: Manages the storage and retrieval of important story information

## 4. Data Flow
1. User interacts with the UI
2. Client-side components dispatch actions to update state
3. Reducer functions process actions and update the global state
4. Components re-render based on state changes
5. API routes handle server-side logic, including AI interactions
6. Server responds with updated data
7. Campaign state is saved after significant game events
8. Journal entries are added based on important story developments
9. AI responses are generated with context from the journal

## 5. AI Integration
- [x] Implement interface for AI model interaction with uncensored responses
- [x] Design prompts for character creation, dialogue, and unrestricted player actions
- [x] Implement error handling for common failure scenarios
- [x] Maintain minimal context for the current game session
- [x] Generate combat scenarios and opponent details
- [ ] Integrate journal context into AI prompts for story continuity

## 6. State Management
- [x] Utilize React Context for global game state
- [x] Implement reducers for state updates
- [x] Use dispatch function for all state updates
- [ ] Store game state in localStorage for persistence
- [ ] Create a CampaignStateManager for handling save/load operations
- [ ] Implement a Journal system as part of the campaign state

## 7. UI/UX Design
- [x] Develop responsive layouts using CSS Modules
- [x] Create basic UI components (buttons, inputs, cards)
- [ ] Implement simple animations for transitions (optional)

## 8. Performance Considerations
- [x] Utilize Next.js built-in performance optimizations
- [ ] Implement basic caching for frequently accessed data
- [ ] Optimize critical API routes for efficient processing
- [ ] Optimize journal context selection for AI prompts to minimize token usage
- [ ] Implement efficient serialization/deserialization of campaign state

## 9. Security Measures
- [x] Secure storage of API keys using Next.js environment variables
- [x] Implement HTTPS for all network requests
- [x] Use Next.js API routes to handle sensitive operations server-side

## 10. Testing Strategy
- [ ] Implement comprehensive unit tests for core logic components
- [ ] Conduct manual testing for game scenarios and AI interactions
- [ ] Implement integration tests for key user flows
- [ ] Aim for at least 80% test coverage across the application

### Unit Testing
Unit tests should be implemented for all core logic components, including:

1. Game Engine functions
2. AI Integration Service methods
3. Character Management System
4. Narrative Engine
5. Combat System
6. Inventory System
7. Campaign State Manager
8. Journal System

For each component, create a corresponding test file (e.g., `gameEngine.test.ts` for `gameEngine.ts`). Use Jest and React Testing Library for writing and running tests.

Example unit test structure:

```typescript
import { functionToTest } from './componentToTest';

describe('Component Name', () => {
  test('should perform expected action', () => {
    // Arrange
    const input = // ...

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).toBe(/* expected output */);
  });
});
```

### Integration Testing
Integration tests should cover key user flows and interactions between components. Focus on the following areas:

1. Character Creation flow
2. Game Session initialization
3. Player input and AI response cycle
4. Combat initiation and resolution
5. Inventory management
6. Saving and loading game state

Example integration test structure:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import GameSession from './GameSession';

describe('Game Session Integration', () => {
  test('should handle player input and update game state', async () => {
    render(<GameSession />);

    // Simulate player input
    const input = screen.getByPlaceholderText('Enter your action');
    fireEvent.change(input, { target: { value: 'Look around' } });
    fireEvent.click(screen.getByText('Submit'));

    // Wait for AI response
    await screen.findByText(/The AI responds/);

    // Assert that game state has been updated
    expect(screen.getByText(/Current location/)).toHaveTextContent('New location');
  });
});
```

### Test Coverage
Use Jest's built-in coverage reporting to track test coverage. Aim for at least 80% coverage across the application. To run tests with coverage, use the following command:

```
npm test -- --coverage
```

Focus on increasing coverage for critical components and user flows first. Regularly review and update tests as new features are added or existing ones are modified.

## 11. Deployment
- [ ] Deploy to Vercel (optimized for Next.js applications)
- [ ] Set up basic continuous integration (CI) pipeline

## 12. Accessibility (Basic Considerations)
- [x] Ensure proper heading structure and semantic HTML
- [ ] Implement keyboard navigation for essential functions
- [x] Maintain sufficient color contrast for text readability

## 13. Performance Targets
- [x] Initial page load time: < 3 seconds on average broadband
- [x] Time to interactive: < 5 seconds
- [x] API response time: < 1 second for non-AI operations
- [x] AI response time: < 5 seconds for typical interactions

## 14. Browser Support
- [x] Modern evergreen browsers (latest two versions)
- [ ] Basic functionality in IE11 (optional, if required for specific users)

## 15. Monitoring and Logging
- [x] Implement basic error logging to console
- [ ] Set up simple analytics for usage tracking (e.g., Google Analytics)

## 16. Data Structures
### Campaign State
```typescript
interface CampaignState {
  character: Character;
  currentLocation: string;
  gameProgress: number;
  journal: JournalEntry[];
  narrative: string;
  inventory: InventoryItem[];
}

interface JournalEntry {
  timestamp: number;
  content: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
}
```

## 17. Key Functions
- `saveCampaignState(state: CampaignState): void`
- `loadCampaignState(): CampaignState | null`
- `updateJournal(entry: string): void`
- `getJournalContext(): string`
- `dispatch(action: Action): void`

These functions will be implemented in the CampaignStateManager and GameEngine components.

## 18. Combat System
The combat system is implemented as a separate component (`CombatSystem.tsx`) that integrates with the main game flow. Key features include:

- Turn-based combat mechanics
- Integration with the AI service for generating combat scenarios and opponents
- Health tracking for both player and opponent
- Basic attack actions with hit chance calculations
- Combat log for narrating the fight progression

### Combat Flow
1. AI service detects a combat scenario and generates an opponent
2. Game session switches to combat mode, rendering the CombatSystem component
3. Players and opponents take turns performing actions
4. Combat results are reflected in the game state and narrative
5. Combat ends when either the player or opponent's health reaches zero

### Future Enhancements
- Implement critical hits and misses
- Add combat-specific inventory interactions (e.g., weapon switching, item usage)
- Enhance combat UI with more detailed statistics and options

## 19. Inventory System
The inventory system is implemented as a separate component (`Inventory.tsx`) that integrates with the main game flow. Key features include:

- Display of player's current items
- Add and remove items from inventory
- Use items from inventory
- Integration with the game state management system

### Inventory Flow
1. Initial items are added to the inventory during game session initialization
2. Players can view their inventory at any time during the game session
3. Items can be added or removed based on game events or player actions
4. Using an item triggers appropriate effects in the game state

### Future Enhancements
- Implement item categories (e.g., weapons, consumables, quest items)
- Add item rarity and value for economic interactions
- Implement inventory capacity limits

This technical specification outlines the essential requirements for the BootHillGM MVP, including the newly implemented combat system and inventory system. It focuses on core functionality and maintainable architecture, suitable for implementation by a single developer new to React and Next.js. As development progresses and skills improve, this specification can be expanded to include more advanced features and optimizations.