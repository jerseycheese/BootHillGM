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
  | { type: 'SET_STATE'; payload: Partial<GameState> }
  | { type: 'SET_SAVED_TIMESTAMP'; payload: number };
```

### 2.2 AI Integration
The AI service in `aiService.tsx` handles communication with the Gemini API to generate narrative content, character attributes, and other dynamic game elements. It manages API requests, processes responses, and updates the game state accordingly.

### 2.3 Combat System
```typescript
interface CombatState {
  playerHealth: number;
  opponentHealth: number;
  currentTurn: 'player' | 'opponent';
  combatLog: string[];
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

interface JournalFilter {
  type?: 'narrative' | 'combat' | 'inventory' | 'quest';
  startDate?: number;
  endDate?: number;
  searchText?: string;
}

export class JournalManager {
  static async addNarrativeEntry(
    journal: JournalEntry[],
    content: string,
    context: string = ''
  ): Promise<JournalEntry[]> {
    try {
      const cleanedContent = cleanText(content);
      const narrativeSummary = await generateNarrativeSummary(cleanedContent, context);
      
      // Create a new narrative journal entry
      const newEntry: NarrativeJournalEntry = {
        type: 'narrative',
        timestamp: Date.now(),
        content: cleanedContent,
        narrativeSummary
      };
      
      return [...journal, newEntry];
    } catch (error) {
      console.error('Error adding narrative entry:', error);
      return journal;
    }
  }

  static addCombatEntry(
    journal: JournalEntry[],
    playerName: string,
    opponentName: string,
    outcome: CombatJournalEntry['outcome'],
    summary: string
  ): JournalEntry[] {
    const cleanedSummary = cleanText(summary);
    
    // Create a new combat journal entry
    const newEntry: CombatJournalEntry = {
      type: 'combat',
      timestamp: Date.now(),
      content: cleanedSummary,
      combatants: {
        player: playerName,
        opponent: opponentName
      },
      outcome,
      narrativeSummary: cleanedSummary
    };
    
    return [...journal, newEntry];
  }

  static addInventoryEntry(
    journal: JournalEntry[],
    acquiredItems: string[],
    removedItems: string[],
    context: string
  ): JournalEntry[] {
    if (acquiredItems.length === 0 && removedItems.length === 0) {
      return journal;
    }

    // Create a new inventory journal entry
    const newEntry: InventoryJournalEntry = {
      type: 'inventory',
      timestamp: Date.now(),
      content: cleanText(context),
      items: {
        acquired: acquiredItems,
        removed: removedItems
      },
      narrativeSummary: this.generateInventorySummary(acquiredItems, removedItems)
    };
    
    return [...journal, newEntry];
  }

  static filterJournal(journal: JournalEntry[], filter: JournalFilter): JournalEntry[] {
    return journal.filter(entry => {
      if (filter.type && entry.type !== filter.type) return false;
      if (filter.startDate && entry.timestamp < filter.startDate) return false;
      if (filter.endDate && entry.timestamp > filter.endDate) return false;
      if (filter.searchText && !this.entryMatchesSearch(entry, filter.searchText)) return false;
      return true;
    });
  }

  private static entryMatchesSearch(entry: JournalEntry, searchText: string): boolean {
    const searchLower = searchText.toLowerCase();
    return (
      entry.content.toLowerCase().includes(searchLower) ||
      (entry.narrativeSummary?.toLowerCase().includes(searchLower) ?? false)
    );
  }

  private static generateInventorySummary(acquired: string[], removed: string[]): string {
    const parts: string[] = [];
    if (acquired.length) {
      parts.push(`Acquired: ${acquired.join(', ')}`);
    }
    if (removed.length) {
      parts.push(`Used/Lost: ${removed.join(', ')}`);
    }
    return parts.join('. ');
  }

  // Backward compatibility method
  static async addJournalEntry(
    journal: JournalEntry[],
    entry: string | JournalEntry,
    context: string = ''
  ): Promise<JournalEntry[]> {
    if (typeof entry === 'string') {
      return this.addNarrativeEntry(journal, entry, context);
    }
    
    // If it's already a JournalEntry, ensure it has required fields
    const timestamp = entry.timestamp || Date.now();
    const type = entry.type || 'narrative';
    
    // Create a properly typed entry based on the type
    switch (type) {
      case 'narrative':
        return [...journal, {
          ...entry,
          timestamp,
          type: 'narrative'
        } as NarrativeJournalEntry];
      case 'combat':
        return [...journal, {
          ...entry,
          timestamp,
          type: 'combat'
        } as CombatJournalEntry];
      case 'inventory':
        return [...journal, {
          ...entry,
          timestamp,
          type: 'inventory'
        } as InventoryJournalEntry];
      case 'quest':
        return [...journal, {
          ...entry,
          timestamp,
          type: 'quest'
        } as JournalEntry];
      default:
        return [...journal, {
          ...entry,
          timestamp,
          type: 'narrative'
        } as NarrativeJournalEntry];
    }
  }
}
```

### 2.5 Character Creation System
```typescript
// Character Creation System
interface CharacterFormProps {
  character: Character;
  isGeneratingField: boolean;
  isProcessingStep: boolean;
  error?: string;
  onFieldChange: (field: keyof Character['attributes'] | 'name', value: string | number) => void;
  onGenerateField: (field: keyof Character['attributes'] | 'name') => Promise<void>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

// Added inventory and ammunition properties for characters and weapons
// Improved character name cleaning to handle metadata markers and narrative text
// Enhanced AI response processing to better handle opponent names and narrative text
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
  const [state, baseDispatch] = useReducer(gameReducer, initialState);
  const lastSavedRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const stateRef = useRef<GameState | null>(null);
  const previousNarrativeRef = useRef<string>('');
  const isInitializedRef = useRef(false);
  // ... state management implementation
}

// Character Form Component
export const CharacterForm: React.FC<CharacterFormProps> = ({
  character,
  isGeneratingField,
  isProcessingStep,
  error,
  onFieldChange,
  onGenerateField,
  onSubmit
}) => {
  // Unified form interface for character creation
  // Supports field-level generation and validation
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

// Character Creation Hook
export const useCharacterCreation = () => {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [showSummary, setShowSummary] = useState(false);
  const [isGeneratingField, setIsGeneratingField] = useState(false);
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
  // ... character creation logic
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

## 4. Performance Considerations

### 4.1 State Updates
- Debounced state persistence (1000ms)
- Memoized component renders using useMemo and useCallback
- Atomic updates for combat state
- Selective journal context updates
- Deduplication of narrative item updates
- Prevention of rapid consecutive saves

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
- Character creation state persistence
- Initialization flag management

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
