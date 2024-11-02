# BootHillGM Test Strategy Document

## 1. Testing Philosophy
The testing strategy for BootHillGM focuses on ensuring reliable gameplay, consistent state management, and proper AI integration. Our approach emphasizes automated testing while acknowledging the need for manual testing of AI interactions and game flow.

## 2. Test Types and Coverage

### 2.1 Unit Testing
Primary tool: Jest with React Testing Library

#### Core Components
```typescript
// Example: Combat Controls Test
describe('CombatControls', () => {
  test('renders player turn indicator correctly', () => {
    render(
      <CombatControls
        currentTurn="player"
        isProcessing={false}
        onAttack={mockAttack}
      />
    );

    expect(screen.getByText("Player's Turn")).toHaveClass('bg-green-100');
    expect(screen.getByText("Opponent's Turn")).not.toHaveClass('bg-green-100');
  });

  test('disables attack button when processing', () => {
    render(
      <CombatControls
        currentTurn="player"
        isProcessing={true}
        onAttack={mockAttack}
      />
    );

    expect(screen.queryByText('Attack')).not.toBeInTheDocument();
  });
});
```

#### State Management Tests
```typescript
describe('gameReducer', () => {
  test('updates state correctly', async () => {
    const action = { 
      type: 'SET_PLAYER', 
      payload: 'Test Player' 
    };
    
    const newState = gameReducer(initialState, action);
    expect(newState.currentPlayer).toBe('Test Player');
  });

  test('handles combat state updates', () => {
    const action = {
      type: 'UPDATE_COMBAT_STATE',
      payload: {
        playerHealth: 90,
        opponentHealth: 80,
        currentTurn: 'player',
        combatLog: ['Combat started']
      }
    };
    
    const newState = gameReducer(initialState, action);
    expect(newState.combatState).toEqual(action.payload);
  });
});
```

### 2.2 Integration Testing
Focus areas:
```typescript
// Example: Game Session Integration Test
describe('GameSession Integration', () => {
  test('handles player input and updates game state', async () => {
    render(<GameSession />);

    const input = screen.getByPlaceholderText('Enter your action');
    fireEvent.change(input, { target: { value: 'Look around' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByTestId('narrative-display'))
        .toHaveTextContent(/you see/i);
    });
  });

  test('transitions to combat mode correctly', async () => {
    render(<GameSession />);
    
    // Simulate combat trigger
    await act(async () => {
      const result = await mockAIService.getResponse('attack bandit');
      expect(result.combatInitiated).toBe(true);
    });

    expect(screen.getByTestId('combat-system')).toBeInTheDocument();
  });
});
```

### 2.3 Combat System Testing
```typescript
describe('CombatSystem', () => {
  test('handles full combat flow', async () => {
    render(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockEndHandler}
        onPlayerHealthChange={mockHealthHandler}
        dispatch={mockDispatch}
      />
    );

    // Test player attack
    await act(async () => {
      fireEvent.click(screen.getByText('Attack'));
      await waitFor(() => {
        expect(screen.getByTestId('combat-log')).toHaveTextContent(/hits/i);
      });
    });

    // Test opponent response
    await act(async () => {
      await waitFor(() => {
        expect(screen.getByTestId('opponent-turn-indicator'))
          .toHaveClass('bg-green-100');
      });
    });
  });
});
```

### 2.4 AI Integration Testing
Areas to test:
```typescript
describe('AIService', () => {
  test('generates basic response', async () => {
    const mockResponse = {
      response: {
        text: () => `
          You see a dusty saloon.
          ACQUIRED_ITEMS: []
          REMOVED_ITEMS: []
        `
      }
    };

    mockRetry.mockResolvedValueOnce(mockResponse);

    const result = await aiService.getResponse(
      'look around',
      'You entered the saloon',
      { inventory: [] }
    );

    expect(result.narrative).toContain('dusty saloon');
    expect(result.acquiredItems).toEqual([]);
    expect(result.removedItems).toEqual([]);
  });

  test('handles combat initiation', async () => {
    const mockResponse = {
      response: {
        text: () => `
          A bandit draws his gun!
          COMBAT: Angry Bandit
          ACQUIRED_ITEMS: []
          REMOVED_ITEMS: []
        `
      }
    };

    mockRetry.mockResolvedValueOnce(mockResponse);

    const result = await aiService.getResponse(
      'attack the bandit',
      'test context',
      { inventory: [] }
    );

    expect(result.combatInitiated).toBe(true);
    expect(result.opponent).toBeDefined();
    expect(result.opponent?.name).toBe('Angry Bandit');
  });
});
```

## 3. Testing Tools and Setup

### 3.1 Required Dependencies
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/jest": "^29.5.13",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

### 3.2 Jest Configuration
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/*.config.js',
    '!<rootDir>/coverage/**',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

## 4. Test Coverage Goals

### 4.1 Coverage Targets
- Overall coverage: 80%+
- Critical components: 90%+
- Utility functions: 95%+

### 4.2 Priority Areas
1. Game state management
2. Combat system
3. Character management
4. Inventory system
5. Journal system

## 5. Manual Testing Requirements

### 5.1 AI Interaction Testing
- Test narrative consistency
- Verify combat scenario generation
- Check character creation guidance
- Validate error handling behavior

### 5.2 Game Flow Testing
- Character creation process
- Combat initiation and resolution
- Inventory management
- Journal system functionality

## 6. Test Implementation Guidelines

### 6.1 Component Testing
```typescript
// Best practices for component tests
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Render test
  test('renders correctly', () => {
    render(<Component prop={value} />);
    expect(screen.getByTestId('component-id')).toBeInTheDocument();
  });

  // Interaction test
  test('handles user interaction', async () => {
    render(<Component prop={value} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  // State test
  test('updates state correctly', async () => {
    render(<Component prop={value} />);
    act(() => {
      // Trigger state change
    });
    expect(screen.getByText('new state')).toBeInTheDocument();
  });
});
```

### 6.2 AI Service Testing
```typescript
// Example of mocking AI service
jest.mock('../../services/ai/aiService', () => ({
  AIService: jest.fn().mockImplementation(() => ({
    getResponse: jest.fn(),
    retryLastAction: jest.fn(),
  }))
}));

describe('AI Service Tests', () => {
  test('handles AI response correctly', async () => {
    // Test implementation
  });
});
```

This test strategy document serves as both a guide for implementing tests and a reference for AI systems analyzing the testing approach of the project.
