import React from 'react';
import { render, screen } from '@testing-library/react';
import GameSession from '../../components/GameSession';
import { CampaignStateProvider } from '../../components/CampaignStateManager';
import { Character } from '../../types/character';
import * as GameInitializationHook from '../../hooks/useGameInitialization';
import * as GameSessionHook from '../../hooks/useGameSession';

const mockCharacter: Character = {
  name: 'Test Character',
  health: 100,
  attributes: {
    speed: 5,
    gunAccuracy: 5,
    throwingAccuracy: 5,
    strength: 5,
    bravery: 5,
    experience: 0
  },
  skills: {
    shooting: 5,
    riding: 5,
    brawling: 5
  }
};

const mockGameState = {
  currentPlayer: 'Test Player',
  npcs: [],
  character: mockCharacter,
  location: 'Test Location',
  gameProgress: 0,
  journal: [],
  narrative: '',
  inventory: [],
  quests: [],
  isCombatActive: false,
  opponent: null,
  isClient: true,
  savedTimestamp: Date.now()
};

const mockGameSession = {
  state: mockGameState,
  isLoading: false,
  error: null,
  isCombatActive: false,
  opponent: null,
  handleUserInput: jest.fn(),
  retryLastAction: jest.fn(),
  handleCombatEnd: jest.fn(),
  handlePlayerHealthChange: jest.fn(),
  handleManualSave: jest.fn(),
  handleUseItem: jest.fn(),
  initiateCombat: jest.fn(),
  getCurrentOpponent: jest.fn()
};

// Mock the hooks
jest.mock('../../hooks/useGameInitialization');
jest.mock('../../hooks/useGameSession');

// Mock the child components
jest.mock('../../components/InputManager', () => ({
  __esModule: true,
  default: ({ onSubmit, isLoading }: { onSubmit: (input: string) => void, isLoading: boolean }) => (
    <div data-testid="input-manager">
      <input
        type="text"
        onChange={(e) => onSubmit(e.target.value)}
        disabled={isLoading}
      />
    </div>
  ),
}));

jest.mock('../../components/StatusDisplayManager', () => ({
  __esModule: true,
  default: ({ character, location }: { character: Character, location: string }) => (
    <div data-testid="status-display">
      <span>{character.name}</span>
      <span>{location}</span>
    </div>
  ),
}));

jest.mock('../../components/NarrativeDisplay', () => ({
  __esModule: true,
  default: () => <div data-testid="narrative-display" />
}));

jest.mock('../../components/Inventory', () => ({
  __esModule: true,
  default: () => <div data-testid="inventory" />
}));

jest.mock('../../components/JournalViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="journal-viewer" />
}));

jest.mock('../../components/CombatSystem', () => ({
  __esModule: true,
  default: () => <div data-testid="combat-system" />
}));

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
      <CampaignStateProvider>
        <GameSession />
      </CampaignStateProvider>
    );
  };

  it('renders game components when loaded', () => {
    renderGameSession();
    
    // Since we've mocked the hooks to return loaded state,
    // components should render immediately
    expect(screen.getByTestId('input-manager')).toBeInTheDocument();
    expect(screen.getByTestId('status-display')).toBeInTheDocument();
    expect(screen.getByTestId('narrative-display')).toBeInTheDocument();
    expect(screen.getByTestId('inventory')).toBeInTheDocument();
    expect(screen.getByTestId('journal-viewer')).toBeInTheDocument();
  });

  it('renders loading state when initializing', () => {
    (GameInitializationHook.useGameInitialization as jest.Mock).mockReturnValue({
      isInitializing: true,
      isClient: true
    });

    (GameSessionHook.useGameSession as jest.Mock).mockReturnValue({
      ...mockGameSession,
      state: null
    });

    renderGameSession();
    expect(screen.getByText(/Loading game session/i)).toBeInTheDocument();
  });

  it('renders combat system when combat is active', () => {
    const enemyCharacter: Character = {
      name: 'Enemy',
      health: 100,
      attributes: {
        speed: 5,
        gunAccuracy: 5,
        throwingAccuracy: 5,
        strength: 5,
        bravery: 5,
        experience: 0
      },
      skills: {
        shooting: 5,
        riding: 5,
        brawling: 5
      }
    };

    (GameSessionHook.useGameSession as jest.Mock).mockReturnValue({
      ...mockGameSession,
      state: {
        ...mockGameState,
        isCombatActive: true,
        opponent: enemyCharacter
      },
      isCombatActive: true,
      opponent: enemyCharacter
    });

    renderGameSession();
    expect(screen.queryByTestId('input-manager')).not.toBeInTheDocument();
    expect(screen.getByTestId('combat-system')).toBeInTheDocument();
    expect(screen.getByTestId('status-display')).toBeInTheDocument();
  });
});
