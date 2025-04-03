import React from 'react';
import { render, screen } from '@testing-library/react';
import { SidePanel } from '../../components/GameArea/SidePanel';
import { initialCharacterState } from '../../types/state';
import { initialState } from '../../types/initialState';
import { GameState } from '../../types/gameState';
import { Character } from '../../types/character';
import { GameSessionProps } from '../../components/GameArea/types';

// Mock child components to isolate SidePanel logic
jest.mock('@/components/StatusDisplayManager', () => { const Mock = () => <div data-testid="status-display-manager">StatusDisplayManager</div>; Mock.displayName = 'MockStatusDisplayManager'; return Mock; });
jest.mock('@/components/Inventory', () => ({
  Inventory: () => <div data-testid="inventory">Inventory</div>
}));
jest.mock('@/components/JournalViewer', () => { const Mock = () => <div data-testid="journal-viewer">JournalViewer</div>; Mock.displayName = 'MockJournalViewer'; return Mock; });

const mockHandleEquipWeapon = jest.fn();

const createMockProps = (overrides: Partial<GameState> = {}): GameSessionProps => {
  const mockState: GameState = {
    ...initialState,
    ...overrides,
    // Ensure nested states are properly initialized if not overridden
    character: overrides.character !== undefined ? overrides.character : initialCharacterState,
    location: overrides.location !== undefined ? overrides.location : initialState.location,
    journal: overrides.journal !== undefined ? overrides.journal : initialState.journal,
    inventory: overrides.inventory !== undefined ? overrides.inventory : initialState.inventory,
    combat: overrides.combat !== undefined ? overrides.combat : initialState.combat,
    narrative: overrides.narrative !== undefined ? overrides.narrative : initialState.narrative,
    ui: overrides.ui !== undefined ? overrides.ui : initialState.ui,
  };

  return {
    state: mockState,
    dispatch: jest.fn(), // Mock dispatch if needed, otherwise unused in SidePanel directly
    isLoading: false,
    error: null,
    handleEquipWeapon: mockHandleEquipWeapon,
    isCombatActive: false,
    opponent: null,
    handleCombatEnd: jest.fn(),
    handlePlayerHealthChange: jest.fn(),
    handleUseItem: jest.fn(),
  };
};

describe('SidePanel Component', () => {
  beforeEach(() => {
    mockHandleEquipWeapon.mockClear();
  });

  it('should render loading state if isLoading prop is true', () => {
    // Simulate loading state by setting isLoading prop
    const mockProps = createMockProps();
    mockProps.isLoading = true;
    render(<SidePanel {...mockProps} />);
    // Check for the correct loading message based on isLoading prop
    expect(screen.getByText(/Loading Game Data.../i)).toBeInTheDocument();
  });

  // This test case might be less relevant now as the component relies on the isLoading prop
  // Instead, test the 'unavailable' state when isLoading is false but character is null
  // it('should render loading state if character state is missing', () => { ... });

  it('should render unavailable state if isLoading is false and player character is null', () => {
    const mockProps = createMockProps({
      character: { // Provide character slice, but with null player
        player: null,
        opponent: null
      }
    });
    mockProps.isLoading = false; // Ensure loading is finished
    render(<SidePanel {...mockProps} />);
    expect(screen.getByText(/Character data not available/i)).toBeInTheDocument();
    // Ensure the old retry button is gone
    expect(screen.queryByText('Retry Loading Character')).not.toBeInTheDocument();
  });

  it('should render player character details when available', () => {
    const mockPlayer: Character = {
      id: 'test-player',
      name: 'Test Player',
      attributes: {
        strength: 10,
        baseStrength: 10,
        speed: 5,
        gunAccuracy: 5,
        throwingAccuracy: 5,
        bravery: 5,
        experience: 0
      },
      wounds: [],
      // Add missing required properties
      isNPC: false,
      isPlayer: true,
      inventory: { items: [] },
      minAttributes: { strength: 1, baseStrength: 1, speed: 1, gunAccuracy: 1, throwingAccuracy: 1, bravery: 1, experience: 0 },
      maxAttributes: { strength: 10, baseStrength: 10, speed: 10, gunAccuracy: 10, throwingAccuracy: 10, bravery: 10, experience: 1000 },
      isUnconscious: false,
    };
    const mockProps = createMockProps({
      character: {
        player: mockPlayer,
        opponent: null
      }
    });

    render(<SidePanel {...mockProps} />);

    // Check that child components are rendered
    expect(screen.getByTestId('status-display-manager')).toBeInTheDocument();
    expect(screen.getByTestId('inventory')).toBeInTheDocument();
    expect(screen.getByTestId('journal-viewer')).toBeInTheDocument();
    // We can't easily check props passed to mocked children without more complex setup,
    // but rendering them confirms SidePanel didn't crash.
  });

  // Remove redundant/outdated test case
  // it('should gracefully handle when character state is explicitly null', () => { ... });
});
