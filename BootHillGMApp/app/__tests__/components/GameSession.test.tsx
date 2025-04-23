import React from 'react';
import { render, screen } from '@testing-library/react';
import GameSession from '../../components/GameSession';
import CampaignStateProvider from '../../components/CampaignStateProvider';
import { Character } from '../../types/character';
import * as GameInitializationHook from '../../hooks/useGameInitialization';
import * as GameSessionHook from '../../hooks/useGameSession';
import { GameSessionProps } from '../../components/GameArea/types';
import { NarrativeProvider } from '../../context/NarrativeContext';
import { CharacterState } from '../../types/state/characterState';
import { InventoryState } from '../../types/state/inventoryState';
import { JournalState } from '../../types/state/journalState';
import { CombatState } from '../../types/state/combatState';
import { UIState } from '../../types/state/uiState';
import { NarrativeState } from '../../types/narrative.types';

const mockCharacter: Character = {
  id: 'test-character-id',
  name: 'Test Character',
  attributes: {
    speed: 5,
    gunAccuracy: 5,
    throwingAccuracy: 5,
    strength: 5,
    baseStrength: 5,
    bravery: 5,
    experience: 0
  },
  wounds: [],
  isUnconscious: false,
  inventory: [],
  isNPC: false,
  isPlayer: true
};

// Create proper state slices
const mockCharacterState: CharacterState = {
  player: mockCharacter,
  opponent: null
};

const mockInventoryState: InventoryState = {
  items: []
};

const mockJournalState: JournalState = {
  entries: []
};

const mockCombatState: CombatState = {
  isActive: false,
  combatType: 'brawling',
  rounds: 0,
  currentTurn: null,
  playerTurn: true,
  playerCharacterId: 'test-character-id',
  opponentCharacterId: '',
  combatLog: [],
  roundStartTime: 0,
  modifiers: {
    player: 0,
    opponent: 0
  }
};

const mockNarrativeState: NarrativeState = {
  currentStoryPoint: null,
  visitedPoints: [],
  availableChoices: [],
  narrativeHistory: [],
  displayMode: 'standard'
};

const mockUIState: UIState = {
  isLoading: false,
  modalOpen: null,
  notifications: []
};

// Create the complete slice-based game state
const mockGameState = {
  currentPlayer: 'Test Player',
  npcs: [],
  character: mockCharacterState,
  location: null,
  gameProgress: 0,
  journal: mockJournalState,
  narrative: mockNarrativeState,
  inventory: mockInventoryState,
  quests: [],
  combat: mockCombatState,
  ui: mockUIState,
  savedTimestamp: Date.now(),
  isClient: true,
  suggestedActions: [],
  // Add getters for backward compatibility
  get player() { return this.character?.player ?? null; },
  get opponent() { return this.character?.opponent ?? null; },
  get isCombatActive() { return this.combat?.isActive ?? false; }
};

const mockGameSession = {
  state: mockGameState,
  isLoading: false,
  error: null,
  isCombatActive: false,
  player: mockCharacter,
  opponent: null,
  handleUserInput: jest.fn(),
  retryLastAction: jest.fn(),
  handleCombatEnd: jest.fn(),
  handleStrengthChange: jest.fn(),
  handlePlayerHealthChange: jest.fn(),
  handleUseItem: jest.fn(),
  initiateCombat: jest.fn(),
  getCurrentOpponent: jest.fn().mockReturnValue(null),
  executeCombatRound: jest.fn(),
  dispatch: jest.fn()
};

// Mock the hooks
jest.mock('../../hooks/useGameInitialization');
jest.mock('../../hooks/useGameSession');
jest.mock('../../hooks/useCombatStateRestoration', () => ({
  useCombatStateRestoration: jest.fn(),
  adaptHealthChangeHandler: jest.fn().mockImplementation((fn) => fn)
}));

// Mock the components that use narrative context
jest.mock('../../components/Debug/DevToolsPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="dev-tools-panel">DevTools Mock</div>
}));

// Mock the child components
jest.mock('../../components/GameArea/MainGameArea', () => ({
  __esModule: true,
  MainGameArea: (props: GameSessionProps) => (
    <div data-testid="main-game-area">
      {props.isCombatActive ? (
        <div data-testid="combat-system" />
      ) : (
        <div data-testid="narrative-display" />
      )}
    </div>
  ),
}));

jest.mock('../../components/GameArea/SidePanel', () => ({
  __esModule: true,
  SidePanel: () => <div data-testid="side-panel" />
}));

jest.mock('../../components/GameArea/LoadingScreen', () => ({
  __esModule: true,
  LoadingScreen: (props: { type?: string }) => <div>Loading {props.type || 'general'}...</div>
}));

// Mock NarrativeProvider
jest.mock('../../context/NarrativeContext', () => ({
  NarrativeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Create combined provider wrapper for test rendering
const TestWrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <CampaignStateProvider>
      <NarrativeProvider>
        {children}
      </NarrativeProvider>
    </CampaignStateProvider>
  );
};

describe('GameSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (GameInitializationHook.useGameInitialization as jest.Mock).mockReturnValue({
      isInitializing: false,
      isClient: true
    });
    (GameSessionHook.useGameSession as jest.Mock).mockReturnValue(mockGameSession);
  });

  const renderGameSession = () => {
    return render(
      <TestWrapper>
        <GameSession />
      </TestWrapper>
    );
  };

  it('renders game components when loaded', () => {
    renderGameSession();
    
    // Check for main components
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
    expect(screen.getByTestId('main-game-area')).toBeInTheDocument();
    expect(screen.getByTestId('side-panel')).toBeInTheDocument();
    expect(screen.getByTestId('narrative-display')).toBeInTheDocument();
  });

  it('renders loading state when initializing', () => {
    (GameInitializationHook.useGameInitialization as jest.Mock).mockReturnValue({
      isInitializing: true,
      isClient: true
    });

    renderGameSession();
    expect(screen.getByText(/Loading session/i)).toBeInTheDocument();
  });

  it('renders loading state when character is null', () => {
    (GameSessionHook.useGameSession as jest.Mock).mockReturnValue({
      ...mockGameSession,
      state: {
        ...mockGameState,
        character: null
      }
    });

    renderGameSession();
    expect(screen.getByText(/Loading session/i)).toBeInTheDocument();
  });

  it('renders combat system when combat is active', () => {
    const enemyCharacter: Character = {
      id: 'enemy-id',
      name: 'Enemy',
      attributes: {
        speed: 5,
        gunAccuracy: 5,
        throwingAccuracy: 5,
        strength: 5,
        baseStrength: 5,
        bravery: 5,
        experience: 0
      },
      wounds: [],
      isUnconscious: false,
      inventory: [],
      isNPC: true,
      isPlayer: false
    };

    (GameSessionHook.useGameSession as jest.Mock).mockReturnValue({
      ...mockGameSession,
      state: {
        ...mockGameState,
        combat: {
          ...mockCombatState,
          isActive: true
        },
        character: {
          player: mockCharacter,
          opponent: enemyCharacter
        }
      },
      isCombatActive: true,
      opponent: enemyCharacter,
      getCurrentOpponent: jest.fn().mockReturnValue(enemyCharacter)
    });

    renderGameSession();
    expect(screen.getByTestId('combat-system')).toBeInTheDocument();
    expect(screen.queryByTestId('narrative-display')).not.toBeInTheDocument();
  });
});