import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { WeaponCombatControls } from '../../../components/Combat/WeaponCombatControls';
import { WeaponCombatState, WEAPON_STATS } from '../../../types/combat';
import * as combatUtils from '../../../types/combat';

jest.mock('../../../types/combat', () => ({
  ...jest.requireActual('../../../types/combat'),
  rollForMalfunction: jest.fn(() => false),
  calculateWeaponModifier: jest.fn(() => 2),
  parseWeaponDamage: jest.fn(() => 6),
}));

describe('WeaponCombatControls', () => {
  const mockOpponent = {
    id: 'opponent-1',
    name: 'Test Opponent',
    isNPC: true,
    isPlayer: false,
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5
    },
    wounds: [],
    isUnconscious: false,
    inventory: []
  };

  const mockInitialState: WeaponCombatState = {
    round: 1,
    playerWeapon: {
      id: 'test-revolver',
      name: 'Colt Revolver',
      modifiers: WEAPON_STATS['Colt Revolver']
    },
    opponentWeapon: {
      id: 'test-rifle',
      name: 'Winchester Rifle',
      modifiers: WEAPON_STATS['Winchester Rifle']
    },
    currentRange: 15,
    roundLog: [],
    lastAction: undefined,
    playerCharacterId: 'player-1',
    opponentCharacterId: 'opponent-1'
  };

  const mockOnAction = jest.fn();

  const renderComponent = (props = { /* Intentionally empty */ }) => {
    return render(
      <WeaponCombatControls
        isProcessing={false}
        currentState={mockInitialState}
        onAction={mockOnAction}
        canAim={true}
        canFire={true}
        canReload={true}
        opponent={mockOpponent}
        {...props}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders weapon information correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Colt Revolver')).toBeInTheDocument();
    expect(screen.getByText('Winchester Rifle')).toBeInTheDocument();
    expect(screen.getByText(/Range: 15 yards/)).toBeInTheDocument();
  });

  test('disables actions when processing', () => {
    renderComponent({ isProcessing: true });
    
    const aimButton = screen.getByText('Aim');
    const fireButton = screen.getByText('Fire');
    
    expect(aimButton).toBeDisabled();
    expect(fireButton).toBeDisabled();
  });

  test('handles aim action correctly', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Aim'));
    
    expect(mockOnAction).toHaveBeenCalledWith({ type: 'aim' });
  });

  test('handles fire action correctly', async () => {
    (combatUtils.rollForMalfunction as jest.Mock).mockReturnValue(false);
    (combatUtils.calculateWeaponModifier as jest.Mock).mockReturnValue(2);
    (combatUtils.parseWeaponDamage as jest.Mock).mockReturnValue(6);
    renderComponent();
    
    fireEvent.click(screen.getByText('Fire'));
    
    expect(mockOnAction).toHaveBeenCalledWith({
      type: 'fire',
      modifier: expect.any(Number),
      damage: expect.any(Number)
    });
  });

  test('shows move options when move button clicked', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Move'));
    
    await waitFor(() => {
      expect(screen.getByText(/New range:/)).toBeInTheDocument();
    });
  });

  test('handles move action correctly', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Move'));
    const rangeInput = screen.getByRole('slider');
    fireEvent.change(rangeInput, { target: { value: '20' } });
    fireEvent.click(screen.getByText('Confirm Move'));
    
    expect(mockOnAction).toHaveBeenCalledWith({
      type: 'move',
      targetRange: 20,
      modifier: expect.any(Number)
    });
  });

  test('displays weapon modifiers correctly', () => {
    renderComponent();
    
    // Check player weapon stats
    const playerWeaponSection = screen.getByText('Your Weapon').parentElement!;
    expect(within(playerWeaponSection).getByText('Damage')).toBeInTheDocument();
    expect(within(playerWeaponSection).getByText('1d6')).toBeInTheDocument();
    expect(within(playerWeaponSection).getByText('Range')).toBeInTheDocument();
    expect(within(playerWeaponSection).getByText(/20\s*y/)).toBeInTheDocument();
    expect(within(playerWeaponSection).getByText('Accuracy')).toBeInTheDocument();
    expect(within(playerWeaponSection).getByText('+2')).toBeInTheDocument();
  });

  test('shows ammunition when available', () => {
    const stateWithAmmo = {
      ...mockInitialState,
      playerWeapon: {
        ...mockInitialState.playerWeapon!,
        ammunition: 6,
        maxAmmunition: 6
      }
    };
    
    renderComponent({ currentState: stateWithAmmo });
    
    expect(screen.getByText('Ammunition')).toBeInTheDocument();
    expect(screen.getByText(/6\s*\/\s*6/)).toBeInTheDocument();
  });

  test('handles malfunction state', () => {
    const stateWithMalfunction = {
      ...mockInitialState,
      lastAction: 'malfunction'
    };
    
    renderComponent({ currentState: stateWithMalfunction });
    
    expect(screen.getByText('Fire')).toBeDisabled();
  });
});
