---
title: Integration Testing
aliases: [React Integration Tests, Component Integration Testing]
tags: [technical, testing, integration, react-testing-library, jest, msw]
created: 2025-03-22
updated: 2025-03-22
---

# Integration Testing

## Overview

Integration tests verify that multiple components or systems work together correctly. In BootHillGM, integration tests focus on component interactions, API integrations, and complex user flows.

## Component Interaction Tests

These tests verify that multiple components interact correctly when used together.

```typescript
// app/__tests__/integration/InventorySystem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GameProvider } from '../../context/GameContext';
import { InventoryPanel } from '../../components/InventoryPanel';
import { CharacterStats } from '../../components/CharacterStats';

describe('Inventory System Integration', () => {
  const renderInventorySystem = () => {
    return render(
      <GameProvider>
        <div>
          <CharacterStats />
          <InventoryPanel />
        </div>
      </GameProvider>
    );
  };

  it('equipping weapon updates character stats', () => {
    renderInventorySystem();
    
    // Initial strength should be the base value
    expect(screen.getByTestId('stat-strength')).toHaveTextContent('5');
    
    // Find and equip a weapon
    fireEvent.click(screen.getByTestId('inventory-item-rusty-sword'));
    fireEvent.click(screen.getByText('Equip'));
    
    // Strength should be updated with weapon bonus
    expect(screen.getByTestId('stat-strength')).toHaveTextContent('7');
  });

  it('using healing item increases health', () => {
    renderInventorySystem();
    
    // Set initial health to a lower value
    fireEvent.click(screen.getByText('Take Damage')); // Assuming this button exists
    
    // Initial health value
    const initialHealth = screen.getByTestId('stat-health').textContent;
    
    // Use healing potion
    fireEvent.click(screen.getByTestId('inventory-item-healing-potion'));
    fireEvent.click(screen.getByText('Use'));
    
    // Health should increase
    expect(parseInt(screen.getByTestId('stat-health').textContent)).toBeGreaterThan(
      parseInt(initialHealth)
    );
    
    // Item should be removed from inventory
    expect(screen.queryByTestId('inventory-item-healing-potion')).not.toBeInTheDocument();
  });

  it('dropping item removes it from inventory', () => {
    renderInventorySystem();
    
    // Verify item exists in inventory
    expect(screen.getByTestId('inventory-item-gold-coin')).toBeInTheDocument();
    
    // Drop the item
    fireEvent.click(screen.getByTestId('inventory-item-gold-coin'));
    fireEvent.click(screen.getByText('Drop'));
    
    // Item should be removed
    expect(screen.queryByTestId('inventory-item-gold-coin')).not.toBeInTheDocument();
  });
});
```

## API Integration Tests

These tests verify that components correctly interact with backend APIs, using MSW to mock network requests.

```typescript
// app/__tests__/integration/AIIntegration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { GameProvider } from '../../context/GameContext';
import { AIResponsePanel } from '../../components/AIResponsePanel';
import { PlayerActionInput } from '../../components/PlayerActionInput';

// Mock server for API responses
const server = setupServer(
  rest.post('/api/ai/generate-response', (req, res, ctx) => {
    return res(
      ctx.json({
        response: "The saloon door creaks as you enter. Several patrons turn to look at you.",
        suggestions: ["Order a drink", "Ask about the sheriff", "Leave quietly"]
      })
    );
  })
);

describe('AI Integration Tests', () => {
  // Setup mock server
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('sends player action to API and displays response', async () => {
    render(
      <GameProvider>
        <AIResponsePanel />
        <PlayerActionInput />
      </GameProvider>
    );
    
    // Enter player action
    const input = screen.getByPlaceholderText(/what do you do/i);
    await userEvent.type(input, 'I walk into the saloon');
    
    // Submit action
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);
    
    // Verify loading state is shown
    expect(screen.getByText(/thinking/i)).toBeInTheDocument();
    
    // Verify response is displayed
    await waitFor(() => {
      expect(screen.getByText(/saloon door creaks/i)).toBeInTheDocument();
    });
    
    // Verify suggestions are displayed
    await waitFor(() => {
      expect(screen.getByText(/order a drink/i)).toBeInTheDocument();
      expect(screen.getByText(/ask about the sheriff/i)).toBeInTheDocument();
      expect(screen.getByText(/leave quietly/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Override default handler for this test
    server.use(
      rest.post('/api/ai/generate-response', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    render(
      <GameProvider>
        <AIResponsePanel />
        <PlayerActionInput />
      </GameProvider>
    );
    
    // Enter and submit action
    const input = screen.getByPlaceholderText(/what do you do/i);
    await userEvent.type(input, 'I check my weapons');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/couldn't connect to AI/i)).toBeInTheDocument();
    });
  });

  it('maintains conversation history', async () => {
    // Set up multiple response handlers
    let requestCount = 0;
    server.use(
      rest.post('/api/ai/generate-response', (req, res, ctx) => {
        requestCount++;
        if (requestCount === 1) {
          return res(ctx.json({
            response: "The sheriff looks tired but attentive.",
            suggestions: ["Ask about bandits", "Offer help"]
          }));
        } else {
          return res(ctx.json({
            response: "The sheriff mentions a gang hideout north of town.",
            suggestions: ["Ask for more details", "Volunteer to investigate"]
          }));
        }
      })
    );
    
    render(
      <GameProvider>
        <AIResponsePanel />
        <PlayerActionInput />
      </GameProvider>
    );
    
    // First interaction
    await userEvent.type(screen.getByPlaceholderText(/what do you do/i), 'I talk to the sheriff');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/sheriff looks tired/i)).toBeInTheDocument();
    });
    
    // Second interaction
    await userEvent.type(screen.getByPlaceholderText(/what do you do/i), 'I ask about bandits');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/gang hideout north/i)).toBeInTheDocument();
    });
    
    // Both responses should be visible in the conversation history
    expect(screen.getByText(/sheriff looks tired/i)).toBeInTheDocument();
    expect(screen.getByText(/gang hideout north/i)).toBeInTheDocument();
  });
});
```

## Multi-Context Integration

Testing components that rely on multiple context providers.

```typescript
// app/__tests__/integration/ProfileAndInventory.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GameProvider } from '../../context/GameContext';
import { UserProvider } from '../../context/UserContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { ProfilePanel } from '../../components/ProfilePanel';
import { InventoryPanel } from '../../components/InventoryPanel';

// Wrapper with all needed contexts
const AllProvidersWrapper = ({ children }) => (
  <ThemeProvider initialTheme="light">
    <UserProvider initialUser={{ name: 'John', role: 'gunslinger' }}>
      <GameProvider>
        {children}
      </GameProvider>
    </UserProvider>
  </ThemeProvider>
);

describe('Profile and Inventory Integration', () => {
  it('displays user profile and inventory together', () => {
    render(
      <>
        <ProfilePanel />
        <InventoryPanel />
      </>,
      { wrapper: AllProvidersWrapper }
    );
    
    // Profile elements should be visible
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('gunslinger')).toBeInTheDocument();
    
    // Inventory elements should be visible
    expect(screen.getByTestId('inventory-panel')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('theme changes apply to both components', () => {
    render(
      <>
        <ProfilePanel />
        <InventoryPanel />
      </>,
      { wrapper: AllProvidersWrapper }
    );
    
    // Both components should have light theme initially
    expect(screen.getByTestId('profile-panel')).toHaveClass('theme-light');
    expect(screen.getByTestId('inventory-panel')).toHaveClass('theme-light');
    
    // Toggle theme
    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));
    
    // Both components should have dark theme now
    expect(screen.getByTestId('profile-panel')).toHaveClass('theme-dark');
    expect(screen.getByTestId('inventory-panel')).toHaveClass('theme-dark');
  });

  it('profile actions affect inventory state', () => {
    render(
      <>
        <ProfilePanel />
        <InventoryPanel />
      </>,
      { wrapper: AllProvidersWrapper }
    );
    
    // Initially inventory should show all items
    expect(screen.getAllByTestId(/^inventory-item-/)).toHaveLength(3);
    
    // Set profile to "travel mode" (which should filter inventory)
    fireEvent.click(screen.getByRole('button', { name: /travel mode/i }));
    
    // Inventory should now only show essential items
    expect(screen.getAllByTestId(/^inventory-item-/)).toHaveLength(1);
    expect(screen.getByTestId('inventory-item-water-canteen')).toBeInTheDocument();
  });
});
```

## Form Submission Flow

Test complete flows from form input to submission and response.

```typescript
// app/__tests__/integration/CharacterCreationFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { CharacterCreationForm } from '../../components/CharacterCreationForm';
import { CharacterSummary } from '../../components/CharacterSummary';
import { GameProvider } from '../../context/GameContext';

// Mock server
const server = setupServer(
  rest.post('/api/characters', (req, res, ctx) => {
    const { name, profession } = req.body;
    return res(
      ctx.json({
        id: 'char123',
        name,
        profession,
        created: new Date().toISOString()
      })
    );
  })
);

describe('Character Creation Flow', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('completes full character creation flow', async () => {
    render(
      <GameProvider>
        <div>
          <CharacterCreationForm />
          <CharacterSummary />
        </div>
      </GameProvider>
    );
    
    // Initially, summary should not be visible
    expect(screen.queryByTestId('character-summary')).not.toBeInTheDocument();
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/name/i), 'Doc Holliday');
    await userEvent.selectOptions(screen.getByLabelText(/profession/i), 'Gambler');
    await userEvent.type(screen.getByLabelText(/backstory/i), 'A troubled past in the West...');
    
    // Allocate attribute points
    await userEvent.click(screen.getByText(/\+ dexterity/i));
    await userEvent.click(screen.getByText(/\+ dexterity/i));
    await userEvent.click(screen.getByText(/\+ intelligence/i));
    await userEvent.click(screen.getByText(/\+ charisma/i));
    await userEvent.click(screen.getByText(/\+ charisma/i));
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    
    // Loading indicator should appear
    expect(screen.getByText(/creating character/i)).toBeInTheDocument();
    
    // Character summary should appear after submission
    await waitFor(() => {
      expect(screen.getByTestId('character-summary')).toBeInTheDocument();
    });
    
    // Summary should display correct information
    expect(screen.getByText('Doc Holliday')).toBeInTheDocument();
    expect(screen.getByText('Gambler')).toBeInTheDocument();
    expect(screen.getByText('Dexterity: 12')).toBeInTheDocument();
    expect(screen.getByText('Intelligence: 11')).toBeInTheDocument();
    expect(screen.getByText('Charisma: 12')).toBeInTheDocument();
    
    // Game state should be updated
    expect(screen.getByTestId('game-message')).toHaveTextContent(/character created successfully/i);
  });

  it('handles submission errors', async () => {
    // Override server to return an error
    server.use(
      rest.post('/api/characters', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ error: 'Character name already taken' })
        );
      })
    );
    
    render(
      <GameProvider>
        <div>
          <CharacterCreationForm />
          <CharacterSummary />
        </div>
      </GameProvider>
    );
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/name/i), 'Doc Holliday');
    await userEvent.selectOptions(screen.getByLabelText(/profession/i), 'Gambler');
    
    // Allocate attribute points
    await userEvent.click(screen.getByText(/\+ strength/i));
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    
    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/character name already taken/i)).toBeInTheDocument();
    });
    
    // Summary should not appear
    expect(screen.queryByTestId('character-summary')).not.toBeInTheDocument();
    
    // Form should still be visible with entered data
    expect(screen.getByLabelText(/name/i)).toHaveValue('Doc Holliday');
    expect(screen.getByLabelText(/profession/i)).toHaveValue('Gambler');
  });
});
```

## Testing with Router Integration

Testing components that interact with routing.

```typescript
// app/__tests__/integration/Navigation.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import HomePage from '../../pages/HomePage';
import CharacterPage from '../../pages/CharacterPage';
import InventoryPage from '../../pages/InventoryPage';
import { GameProvider } from '../../context/GameContext';

describe('Navigation Integration', () => {
  it('navigates between pages', async () => {
    render(
      <GameProvider>
        <MemoryRouter initialEntries={['/']}>
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/character" element={<CharacterPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
          </Routes>
        </MemoryRouter>
      </GameProvider>
    );
    
    // Home page should be initially rendered
    expect(screen.getByText(/welcome to boot hill/i)).toBeInTheDocument();
    
    // Click character link
    await userEvent.click(screen.getByRole('link', { name: /character/i }));
    
    // Character page should be rendered
    await waitFor(() => {
      expect(screen.getByText(/character sheet/i)).toBeInTheDocument();
    });
    
    // Click inventory link
    await userEvent.click(screen.getByRole('link', { name: /inventory/i }));
    
    // Inventory page should be rendered
    await waitFor(() => {
      expect(screen.getByText(/your items/i)).toBeInTheDocument();
    });
  });

  it('syncs page state with URL parameters', async () => {
    render(
      <GameProvider>
        <MemoryRouter initialEntries={['/character?id=char123']}>
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/character" element={<CharacterPage />} />
          </Routes>
        </MemoryRouter>
      </GameProvider>
    );
    
    // Character page should load with the specified character
    await waitFor(() => {
      expect(screen.getByText(/loading character char123/i)).toBeInTheDocument();
    });
    
    // After loading completes, character details should be shown
    await waitFor(() => {
      expect(screen.getByText(/character details/i)).toBeInTheDocument();
    });
  });
});
```

## Advanced Integration Patterns

### Testing Drag and Drop

```typescript
// app/__tests__/integration/InventoryDragDrop.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GameProvider } from '../../context/GameContext';
import { InventoryPanel } from '../../components/InventoryPanel';
import { EquipmentSlots } from '../../components/EquipmentSlots';

// Helper function to simulate drag and drop
const simulateDragDrop = (dragElement, dropElement) => {
  // Mock dataTransfer object
  const dataTransfer = {
    data: {},
    setData: function(type, val) {
      this.data[type] = val;
    },
    getData: function(type) {
      return this.data[type];
    },
    clearData: function() {
      this.data = {};
    }
  };

  // Trigger drag events
  fireEvent.dragStart(dragElement, { dataTransfer });
  fireEvent.dragEnter(dropElement, { dataTransfer });
  fireEvent.dragOver(dropElement, { dataTransfer });
  fireEvent.drop(dropElement, { dataTransfer });
  fireEvent.dragEnd(dragElement, { dataTransfer });
};

describe('Inventory Drag and Drop', () => {
  const renderInventorySystem = () => {
    return render(
      <DndProvider backend={HTML5Backend}>
        <GameProvider>
          <div>
            <InventoryPanel />
            <EquipmentSlots />
          </div>
        </GameProvider>
      </DndProvider>
    );
  };

  it('allows dragging item from inventory to equipment slot', async () => {
    renderInventorySystem();
    
    // Find draggable item and drop target
    const item = screen.getByTestId('inventory-item-rusty-sword');
    const weaponSlot = screen.getByTestId('equipment-slot-weapon');
    
    // Initially weapon slot should be empty
    expect(weaponSlot).toHaveTextContent(/empty/i);
    
    // Simulate drag and drop
    simulateDragDrop(item, weaponSlot);
    
    // Weapon slot should now contain the item
    await waitFor(() => {
      expect(weaponSlot).toHaveTextContent(/rusty sword/i);
    });
    
    // Item should be removed from inventory
    expect(screen.queryByTestId('inventory-item-rusty-sword')).not.toBeInTheDocument();
  });

  it('prevents incompatible items from being equipped', async () => {
    renderInventorySystem();
    
    // Find draggable item and incompatible drop target
    const healingPotion = screen.getByTestId('inventory-item-healing-potion');
    const weaponSlot = screen.getByTestId('equipment-slot-weapon');
    
    // Simulate drag and drop
    simulateDragDrop(healingPotion, weaponSlot);
    
    // Weapon slot should still be empty
    expect(weaponSlot).toHaveTextContent(/empty/i);
    
    // Item should remain in inventory
    expect(screen.getByTestId('inventory-item-healing-potion')).toBeInTheDocument();
    
    // Error message should be shown
    await waitFor(() => {
      expect(screen.getByText(/cannot equip consumable in weapon slot/i)).toBeInTheDocument();
    });
  });
});
```

### Testing WebSocket Communications

```typescript
// app/__tests__/integration/ChatSystem.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WS from 'jest-websocket-mock';
import { GameProvider } from '../../context/GameContext';
import { ChatPanel } from '../../components/ChatPanel';

describe('Chat System', () => {
  let ws;
  
  beforeEach(() => {
    // Create a mock WebSocket server
    ws = new WS('ws://localhost:8080');
  });
  
  afterEach(() => {
    WS.clean();
  });

  it('connects to chat server and displays messages', async () => {
    render(
      <GameProvider>
        <ChatPanel serverUrl="ws://localhost:8080" />
      </GameProvider>
    );
    
    // Wait for connection
    await ws.connected;
    
    // Connection status should be shown
    expect(screen.getByText(/connected to chat/i)).toBeInTheDocument();
    
    // Send a message from the server
    ws.send(JSON.stringify({
      type: 'message',
      sender: 'GameMaster',
      content: 'Welcome to Boot Hill!'
    }));
    
    // Message should be displayed
    await waitFor(() => {
      expect(screen.getByText('GameMaster:')).toBeInTheDocument();
      expect(screen.getByText('Welcome to Boot Hill!')).toBeInTheDocument();
    });
  });

  it('sends user messages to server', async () => {
    render(
      <GameProvider>
        <ChatPanel serverUrl="ws://localhost:8080" userName="Player1" />
      </GameProvider>
    );
    
    // Wait for connection
    await ws.connected;
    
    // Type a message
    await userEvent.type(screen.getByPlaceholderText(/type your message/i), 'Hello everyone!');
    
    // Send the message
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    
    // Server should receive the message
    await expect(ws).toReceiveMessage(JSON.stringify({
      type: 'message',
      sender: 'Player1',
      content: 'Hello everyone!'
    }));
    
    // Input should be cleared
    expect(screen.getByPlaceholderText(/type your message/i)).toHaveValue('');
    
    // Own message should be displayed
    expect(screen.getByText('Player1:')).toBeInTheDocument();
    expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
  });

  it('handles disconnections gracefully', async () => {
    render(
      <GameProvider>
        <ChatPanel serverUrl="ws://localhost:8080" />
      </GameProvider>
    );
    
    // Wait for connection
    await ws.connected;
    
    // Close the connection
    ws.close();
    
    // Disconnection status should be shown
    await waitFor(() => {
      expect(screen.getByText(/disconnected from chat/i)).toBeInTheDocument();
    });
    
    // Reconnect button should be available
    expect(screen.getByRole('button', { name: /reconnect/i })).toBeInTheDocument();
    
    // Create a new server instance (simulating server coming back online)
    ws = new WS('ws://localhost:8080');
    
    // Click reconnect
    await userEvent.click(screen.getByRole('button', { name: /reconnect/i }));
    
    // Should reconnect
    await ws.connected;
    
    // Connected status should be shown again
    await waitFor(() => {
      expect(screen.getByText(/connected to chat/i)).toBeInTheDocument();
    });
  });
});
```

## Best Practices

### Setup Test Environment

Configure all the providers and mocks needed for integration tests:

```typescript
// Common test setup
const setupTest = (initialRoute = '/') => {
  return render(
    <ThemeProvider>
      <UserProvider>
        <GameProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <Navigation />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/character" element={<CharacterPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
            </Routes>
          </MemoryRouter>
        </GameProvider>
      </UserProvider>
    </ThemeProvider>
  );
};
```

### Test User Flows, Not Implementation

Focus on user flows rather than implementation details:

```typescript
it('completes character creation flow', async () => {
  setupTest('/create-character');
  
  // Test the user flow:
  // 1. Fill out character details
  // 2. Allocate attributes
  // 3. Submit form
  // 4. Verify character was created
  // 5. Verify navigation to character page
  
  // Don't test implementation details like:
  // - Internal state updates
  // - Function calls
  // - Private methods
});
```

### Mock External Dependencies

Use MSW to mock API calls and service responses:

```typescript
// Setup mock API response patterns
rest.get('/api/game-state', (req, res, ctx) => {
  return res(ctx.json({
    // Mock game state
  }));
});

rest.post('/api/action', (req, res, ctx) => {
  // Verify request body if needed
  const { action } = req.body;
  
  if (action === 'invalid') {
    return res(ctx.status(400), ctx.json({ error: 'Invalid action' }));
  }
  
  return res(ctx.json({
    // Mock response based on action
  }));
});
```

### Use Page Objects for Complex Flows

Encapsulate page interactions in helper objects for readability:

```typescript
// Page object for character creation
const CharacterCreationPage = {
  fillBasicInfo: async (name, profession, backstory) => {
    await userEvent.type(screen.getByLabelText(/name/i), name);
    await userEvent.selectOptions(screen.getByLabelText(/profession/i), profession);
    if (backstory) {
      await userEvent.type(screen.getByLabelText(/backstory/i), backstory);
    }
  },
  
  allocateAttributes: async (attributes) => {
    for (const attr in attributes) {
      const points = attributes[attr];
      for (let i = 0; i < points; i++) {
        await userEvent.click(screen.getByText(new RegExp(`\\+ ${attr}`, 'i')));
      }
    }
  },
  
  submit: async () => {
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
  }
};

// Use in test
it('creates a character with all details', async () => {
  setupTest('/create-character');
  
  await CharacterCreationPage.fillBasicInfo('John Smith', 'Gunslinger', 'A man with no past');
  await CharacterCreationPage.allocateAttributes({
    strength: 2,
    dexterity: 1,
    constitution: 2
  });
  await CharacterCreationPage.submit();
  
  // Verify character was created successfully
  await waitFor(() => {
    expect(screen.getByText(/character created/i)).toBeInTheDocument();
  });
});
```

## Related Documentation

- [[component-testing|Component Testing]]
- [[hook-testing|Hook Testing]]
- [[snapshot-testing|Snapshot Testing]]
- [[testing-guide|Testing Guide Overview]]
