# BootHillGM Technical Specification

## 1. System Architecture

### 1.1 Core Technologies
- Framework: Next.js 14.x with App Router
- Programming Language: TypeScript 5.x
- AI Model: Gemini 1.5 Pro API
- State Management: React Context API with useReducer
- Client-Side Storage: localStorage
- UI: Tailwind CSS with CSS Modules for component-specific styles

### 1.2 Key Architectural Patterns
- Server-Side Rendering (SSR) for initial page loads
- Client-side routing for subsequent navigation
- Component-based architecture with hooks for reusable logic
- Event-driven state updates through Context/Reducer pattern
- Atomic state updates for combat and inventory systems
- Separation of concerns between game logic and UI components

## 2. Core Systems

### 2.1 State Management
```typescript
// Campaign State Provider
interface CampaignStateContextType {
  state: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
  saveGame: (state: GameState) => void;
  loadGame: () => GameState | null;
  cleanupState: () => void;
}

// Game Engine Actions
type GameEngineAction =
  | { type: 'SET_PLAYER'; payload: string }
  | { type: 'SET_CHARACTER'; payload: Character | null }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'SET_NARRATIVE'; payload: string }
  | { type: 'UPDATE_COMBAT_STATE'; payload: CombatState }
  | { type: 'SET_COMBAT_ACTIVE'; payload: boolean }
  | { type: 'SET_OPPONENT'; payload: Character | null }
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'USE_ITEM'; payload: string }
  | { type: 'UPDATE_JOURNAL'; payload: JournalEntry }
  | { type: 'SET_STATE'; payload: Partial<GameState> };
```

### 2.2 AI Integration
```typescript
interface AIResponse {
  narrative: string;
  location?: string;
  combatInitiated?: boolean;
  opponent?: Character;
  acquiredItems: string[];
  removedItems: string[];
  suggestedActions: SuggestedAction[];
}

interface AIConfig {
  modelName: string;
  maxRetries: number;
  temperature: number;
}

interface PromptOptions {
  inventory?: InventoryItem[];
  character?: Character;
  location?: string;
}
```

### 2.3 Combat System
```typescript
interface CombatState {
  playerHealth: number;
  opponentHealth: number;
  currentTurn: 'player' | 'opponent';
  combatLog: string[];
}

interface CombatMessageParams {
  attackerName: string;
  defenderName: string;
  weaponName: string;
  damage: number;
  roll: number;
  hitChance: number;
}

interface UseCombatEngineProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  onPlayerHealthChange: (health: number) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialState?: CombatState;
}
```

### 2.4 Journal System
```typescript
interface JournalEntry {
  type: 'narrative' | 'combat' | 'inventory' | 'quest';
  timestamp: number;
  content: string;
  narrativeSummary?: string;
}

interface CombatJournalEntry extends JournalEntry {
  type: 'combat';
  combatants: {
    player: string;
    opponent: string;
  };
  outcome: 'victory' | 'defeat' | 'escape' | 'truce';
}

interface InventoryJournalEntry extends JournalEntry {
  type: 'inventory';
  items: {
    acquired: string[];
    removed: string[];
  };
}
```

## 3. System Components

### 3.1 Core Components
```typescript
// Game Provider
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Campaign State Manager
export function CampaignStateProvider({ children }: { children: ReactNode }) {
  const [state, baseDispatch] = useReducer(gameReducer, getInitialState());
  const [isHydrated, setIsHydrated] = useState(false);
  const lastSavedRef = useRef<number>(0);
  // ... state management implementation
}
```

### 3.2 Custom Hooks
```typescript
// Combat Engine Hook
export const useCombatEngine = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  onPlayerHealthChange,
  dispatch,
  initialState
}: UseCombatEngineProps) => {
  const [playerHealth, setPlayerHealth] = useState(initialState?.playerHealth ?? 100);
  const [opponentHealth, setOpponentHealth] = useState(initialState?.opponentHealth ?? 100);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>(initialState?.currentTurn ?? 'player');
  // ... combat logic implementation
};

// AI Interactions Hook
export const useAIInteractions = (
  state: GameState,
  dispatch: React.Dispatch<GameEngineAction>,
  onInventoryChange: (acquired: string[], removed: string[]) => void,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ... AI interaction logic
};
```

## 4. Performance Considerations

### 4.1 State Updates
- Debounced state persistence (1000ms)
- Memoized component renders using useMemo and useCallback
- Atomic updates for combat state
- Selective journal context updates

### 4.2 AI Optimization
- Retry mechanism with exponential backoff
- Context management for token efficiency
- Response parsing optimization
- Error recovery with graceful degradation

## 5. Error Handling

### 5.1 Core Error Types
```typescript
interface GameError extends Error {
  type: 'ai' | 'state' | 'combat' | 'inventory';
  severity: 'low' | 'medium' | 'high';
  recoverable: boolean;
}
```

### 5.2 Recovery Strategies
- Automated retry for AI failures
- State validation on load
- Combat state restoration


## 6. Environment Configuration
```typescript
// next.config.mjs
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
};

// tailwind.config.ts
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
};
```

This technical specification reflects the current implementation state and serves as a comprehensive reference for development and AI analysis of the codebase.
