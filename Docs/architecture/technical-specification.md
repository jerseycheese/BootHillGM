---
title: Technical Specification
created: 2024-12-28
updated: 2024-12-28
---

# Technical Specification

For implementation details, see:
- [[state-management|State Management]]
- [[api-integration|API Integration]]
- [[../core-systems/combat-system|Combat System]]
- [[../core-systems/journal-system|Journal System]]
- [[component-structure|Component Architecture]]

## System Architecture

### Core Technologies
- Framework: Next.js 14.x with App Router
- Programming Language: TypeScript 5.x
- AI Model: Gemini 1.5 Pro API
- State Management: React Context API with useReducer
- Client-Side Storage: localStorage
- UI: Tailwind CSS with CSS Modules for component-specific styles

### Key Architectural Patterns
- Server-Side Rendering (SSR) for initial page loads
- Client-side routing for subsequent navigation
- Component-based architecture with hooks for reusable logic
- Event-driven state updates through Context/Reducer pattern
- Atomic state updates for combat and inventory systems
- Separation of concerns between game logic and UI components

For details on architectural decisions, see [[architecture-decisions|Architecture Decision Record]].

## Core Systems

### State Management
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
  | { type: 'SET_STATE'; payload: Partial<GameState> }
  | { type: 'SET_SAVED_TIMESTAMP'; payload: number };
```

For state management implementation details, see [[state-management|State Management]].

### AI Integration
The AI service in `aiService.tsx` handles communication with the Gemini API to generate narrative content, character attributes, and other dynamic game elements. It manages API requests, processes responses, and updates the game state accordingly.

For AI integration details, see [[../ai/gemini-integration|Gemini Integration]].

### Combat System
```typescript
interface CombatSummary {
  winner: 'player' | 'opponent';
  results: string;
  stats: {
    rounds: number;
    damageDealt: number;
    damageTaken: number;
  }
}

interface CombatState {
  playerHealth: number;
  opponentHealth: number;
  currentTurn: 'player' | 'opponent';
  combatLog: LogEntry[];
  summary?: CombatSummary;
  weapon?: {
    round: number;
    playerWeapon: Weapon | null;
    opponentWeapon: Weapon | null;
    currentRange: number;
    roundLog: LogEntry[];
    lastAction?: WeaponCombatAction['type'];
  };
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

interface Wound {
  location: 'chest';
  severity: 'light' | 'serious' | 'mortal';
  strengthReduction: number;
  turnReceived: number;
}

interface WeaponCombatResult {
  type: 'fire' | 'aim' | 'move' | 'reload' | 'malfunction';
  hit: boolean;
  roll: number;
  modifiedRoll: number;
  targetNumber: number;
  message: string;
  damage?: number;
  newStrength?: number;
  targetRange?: number;
  weaponMalfunction?: boolean;
}
```

For combat system implementation details, see [[../core-systems/combat-system|Combat System]].

### Journal System
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

interface JournalFilter {
  type?: 'narrative' | 'combat' | 'inventory' | 'quest';
  startDate?: number;
  endDate?: number;
  searchText?: string;
}
```

For journal system implementation details, see [[../core-systems/journal-system|Journal System]].

### Character Creation System
```typescript
interface CharacterFormProps {
  character: Character;
  isGeneratingField: boolean;
  isProcessingStep: boolean;
  error?: string;
  onFieldChange: (field: keyof Character['attributes'] | 'name', value: string | number) => void;
  onGenerateField: (field: keyof Character['attributes'] | 'name') => Promise<void>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}
```

For character creation details, see [[../features/_completed/character-creation|Character Creation]].

## System Components

### Core Components
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
  const [state, baseDispatch] = useReducer(gameReducer, initialState);
  const lastSavedRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const stateRef = useRef<GameState | null>(null);
  const previousNarrativeRef = useRef<string>('');
  const isInitializedRef = useRef(false);
}
```

For component architecture details, see [[Components|Component Architecture]].

### Custom Hooks
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
};

// Character Creation Hook
export const useCharacterCreation = () => {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [showSummary, setShowSummary] = useState(false);
  const [isGeneratingField, setIsGeneratingField] = useState(false);
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
};

// AI Interactions Hook
export const useAIInteractions = (
  state: GameState,
  dispatch: React.Dispatch<GameEngineAction>,
  onInventoryChange: (acquired: string[], removed: string[]) => void,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
};
```

## Performance Considerations

### State Updates
- Debounced state persistence (1000ms)
- Memoized component renders using useMemo and useCallback
- Atomic updates for combat state
- Selective journal context updates
- Deduplication of narrative item updates
- Prevention of rapid consecutive saves

### AI Optimization
- Retry mechanism with exponential backoff
- Context management for token efficiency
- Response parsing optimization
- Error recovery with graceful degradation

## Error Handling

### Core Error Types
```typescript
interface GameError extends Error {
  type: 'ai' | 'state' | 'combat' | 'inventory';
  severity: 'low' | 'medium' | 'high';
  recoverable: boolean;
}
```

### State Validation System
The technical architecture includes a comprehensive state validation system with:

- **Validation Layers**
  - Schema validation for state structure
  - Type validation for property values
  - Business rule validation for game logic
  - Cross-state consistency checks

- **Validation Triggers**
  - State initialization
  - State updates
  - State restoration
  - Combat transitions

### Recovery Strategies
- Automated retry for AI failures
- State validation on load
- Combat state restoration
- Character creation state persistence
- Initialization flag management
- Graceful degradation for invalid states
- State version compatibility checks

For implementation details, see [[../core-systems/combat-system|Combat System]] and [[../architecture/state-management|State Management]] documentation.

For error handling details, see [[../meta/risk-assessment|Risk Assessment]].

## Environment Configuration
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