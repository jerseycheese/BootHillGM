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
Areas to test, focusing on the modularized structure:

- **Individual AI Modules:** Test each module (`aiConfig.ts`, `characterCreationPrompts.ts`, etc.) in isolation to ensure their functions operate correctly.
- **aiService.tsx:** Test the `aiService.tsx` file to ensure it correctly imports and exports functions from the individual modules and that its main functions behave as expected.

```typescript
// Example: Testing aiConfig.ts
import { getAIModel } from '../../utils/ai/aiConfig';

describe('aiConfig', () => {
  test('getAIModel returns the correct model', () => {
    const model = getAIModel();
    expect(model).toBeDefined(); // Add more specific assertions based on your configuration
  });
});

// Example: Testing characterCreationPrompts.ts
import { getCharacterCreationStep } from '../../utils/ai/characterCreationPrompts';

describe('characterCreationPrompts', () => {
  test('getCharacterCreationStep returns a prompt', () => {
    const prompt = getCharacterCreationStep('name');
    expect(prompt).toBeDefined();
    expect(prompt).toContain('name'); // Add more specific assertions based on your prompts
  });
});

// Example: Testing aiService.tsx
import * as aiService from '../../utils/aiService';
import * as characterGeneration from '../../utils/ai/characterGeneration';

jest.mock('../../utils/ai/characterGeneration', () => ({
  generateCompleteCharacter: jest.fn(),
}));

describe('AIService', () => {
  test('calls generateCompleteCharacter correctly', async () => {
    const mockContext = 'test context';
    await aiService.generateCharacter(mockContext);
    expect(characterGeneration.generateCompleteCharacter).toHaveBeenCalledWith(mockContext);
  });

  // Add more tests for other functions in aiService.tsx, mocking the individual modules as needed.
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

### 6.3 Test Utilities
The project uses centralized test utilities and fixtures:
- test/fixtures.ts: Common test data and mock objects
- test/testUtils.ts: Shared test setup and helper functions

Test utilities provide:
- Consistent mock setup
- Reusable test operations
- Standard test environment configuration
- Common assertions and validations


This test strategy document serves as both a guide for implementing tests and a reference for AI systems analyzing the testing approach of the project.
