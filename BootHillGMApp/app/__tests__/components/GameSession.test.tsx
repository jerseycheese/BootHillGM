import React from 'react';
import { render, screen } from '@testing-library/react';
import GameSession from '../../components/GameSession';
import { CampaignStateProvider } from '../../components/CampaignStateManager';
import { Character } from '../../types/character';
import * as GameInitializationHook from '../../hooks/useGameInitialization';
import * as GameSessionHook from '../../hooks/useGameSession';
import { GameSessionProps } from '../../components/GameArea/types';

const mockCharacter: Character = {
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
  skills: {
    shooting: 5,
    riding: 5,
    brawling: 5
  },
  wounds: [],
  isUnconscious: false
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
  handleUseItem: jest.fn(),
  initiateCombat: jest.fn(),
  getCurrentOpponent: jest.fn(),
  dispatch: jest.fn()
};

// Mock the hooks
jest.mock('../../hooks/useGameInitialization');
jest.mock('../../hooks/useGameSession');

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
    
    // Check for main components
    expect(screen.getByTestId('main-game-area')).toBeInTheDocument();
    expect(screen.getByTestId('side-panel')).toBeInTheDocument();
    expect(screen.getByTestId('narrative-display')).toBeInTheDocument();
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
    expect(screen.getByText(/Loading session/i)).toBeInTheDocument();
  });

  it('renders combat system when combat is active', () => {
    const enemyCharacter: Character = {
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
      skills: {
        shooting: 5,
        riding: 5,
        brawling: 5
      },
      wounds: [],
      isUnconscious: false
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
    expect(screen.getByTestId('combat-system')).toBeInTheDocument();
    expect(screen.queryByTestId('narrative-display')).not.toBeInTheDocument();
  });
});
