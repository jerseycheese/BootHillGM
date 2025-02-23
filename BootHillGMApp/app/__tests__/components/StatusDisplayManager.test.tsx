import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { Character } from '../../types/character';
import StatusDisplayManager from '../../components/StatusDisplayManager';
import { CampaignStateProvider, useCampaignState } from '../../components/CampaignStateManager';

// Wrapper component to set up location state
import { LocationType } from '../../services/locationService';

const LocationStateWrapper = ({ children, location }: { children: React.ReactNode; location: LocationType }) => {
  const { dispatch } = useCampaignState();
  
  useEffect(() => {
    if (location) {
      dispatch({ type: 'SET_LOCATION', payload: location });
    }
  }, [dispatch, location]);

  return <>{children}</>;
};

describe('StatusDisplayManager', () => {
  const mockCharacter: Character = {
    isNPC: false,
    isPlayer: true,
    id: 'some-id',
    strengthHistory: {
      baseStrength: 10,
      changes: [
        {
          previousValue: 10,
          newValue: 8,
          reason: 'Test Wound',
          timestamp: new Date(),
        },
      ],
    },
    name: 'Test Character',
    inventory: [],
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5,
    },
    wounds: [
      {
        location: 'head',
        severity: 'light',
        damage: 1,
        strengthReduction: 1,
        turnReceived: 1,
      },
      {
        location: 'chest',
        severity: 'serious',
        damage: 2,
        strengthReduction: 2,
        turnReceived: 2,
      },
    ],
    isUnconscious: false,
  };

  test('renders character information correctly', () => {
    const location = { type: 'town' as const, name: 'Test Town' };
    
    render(
      <CampaignStateProvider>
        <LocationStateWrapper location={location}>
          <StatusDisplayManager 
            character={mockCharacter}
            location={location}
          />
        </LocationStateWrapper>
      </CampaignStateProvider>
    );

    expect(screen.getByText('Test Character')).toBeInTheDocument();
    expect(screen.getByText('Test Town')).toBeInTheDocument();
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByTestId('strength-value')).toHaveTextContent('4/10'); // Current strength is reduced by wound penalties (10 - (1-(-2)) - (2-(-1)) = 10 - 3 - 3 = 4)
  });

  test('displays "Unknown" when location is null', () => {
    render(
      <CampaignStateProvider>
        <StatusDisplayManager character={mockCharacter} location={null} />
      </CampaignStateProvider>
    );

    expect(screen.getByText(/Unknown/)).toBeInTheDocument();
  });

  test('displays wounds correctly', () => {
    const location = { type: 'town' as const, name: 'Test Town' };
    render(
      <CampaignStateProvider>
        <LocationStateWrapper location={location}>
          <StatusDisplayManager character={mockCharacter} location={location} />
        </LocationStateWrapper>
      </CampaignStateProvider>
    );

    expect(screen.getByText('Wounds')).toBeInTheDocument();
    expect(screen.getByText('head')).toBeInTheDocument();
    expect(screen.getByText('chest')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Serious')).toBeInTheDocument();

    // Check for strength reduction text
    expect(screen.getByText('-1 STR')).toBeInTheDocument();
    expect(screen.getByText('-2 STR')).toBeInTheDocument();
  });

  test('displays unconscious state correctly', () => {
    const unconsciousCharacter = {
      ...mockCharacter,
      isUnconscious: true,
    };
    const location = { type: 'town' as const, name: 'Test Town' };
    render(
      <CampaignStateProvider>
        <LocationStateWrapper location={location}>
          <StatusDisplayManager character={unconsciousCharacter} location={location} />
        </LocationStateWrapper>
      </CampaignStateProvider>
    );

    expect(screen.getByText('(Unconscious)')).toBeInTheDocument();
  });
  test('displays strength correctly', () => {
    const location = { type: 'town' as const, name: 'Test Town' };
    render(
      <CampaignStateProvider>
        <LocationStateWrapper location={location}>
          <StatusDisplayManager
            character={{
              ...mockCharacter,
              attributes: { ...mockCharacter.attributes, baseStrength: 50, strength: 50 },
              wounds: []
            }}
            location={location}
          />
        </LocationStateWrapper>
      </CampaignStateProvider>
    );
    expect(screen.getByTestId('strength-value')).toHaveTextContent('50/50');
    expect(screen.getByTestId('strength-value')).toHaveClass('text-green-600');
  });

  test('shows yellow text for strength between 6 and 12', () => {
    const location = { type: 'town' as const, name: 'Test Town' };
    render(
      <CampaignStateProvider>
        <LocationStateWrapper location={location}>
          <StatusDisplayManager
            character={{
              ...mockCharacter,
              attributes: { ...mockCharacter.attributes, strength: 10, baseStrength: 10 },
              wounds: [] // No wounds to keep strength at 10
            }}
            location={location}
          />
        </LocationStateWrapper>
      </CampaignStateProvider>
    );
    expect(screen.getByTestId('strength-value')).toHaveTextContent('10/10');
    expect(screen.getByTestId('strength-value')).toHaveClass('text-yellow-600');
  });

  test('shows red text at zero strength', () => {
    const location = { type: 'town' as const, name: 'Test Town' };
    render(
      <CampaignStateProvider>
        <LocationStateWrapper location={location}>
          <StatusDisplayManager
            character={{
              ...mockCharacter,
              attributes: { ...mockCharacter.attributes, strength: 0, baseStrength: 0 },
              wounds: [] // Clear wounds to ensure strength is 0
            }}
            location={location}
          />
        </LocationStateWrapper>
      </CampaignStateProvider>
    );
    expect(screen.getByTestId('strength-value')).toHaveTextContent('1/0');
    expect(screen.getByTestId('strength-value')).toHaveClass('text-red-600');
  });

  test('updates strength display after taking damage', () => {
    const testCharacter = { ...mockCharacter }; // Create mutable copy
    const location = { type: 'town' as const, name: 'Test Town' };
    const { rerender } = render(
      <CampaignStateProvider>
        <LocationStateWrapper location={location}>
          <StatusDisplayManager character={testCharacter} location={location} />
        </LocationStateWrapper>
      </CampaignStateProvider>
    );
    expect(screen.getByTestId('strength-value')).toHaveTextContent('4/10'); // Initial strength with wound penalties (10 - (1-(-2)) - (2-(-1)) = 10 - 3 - 3 = 4)

    // Simulate damage - add a new wound
    const damagedCharacter = {
      ...testCharacter,
      wounds: [
        ...testCharacter.wounds,
        {
          location: 'leftArm' as const,
          severity: 'light' as const,
          damage: 1,
          strengthReduction: 1,
          turnReceived: 3, // Example turn
        },
      ],
    };

    // Re-render component with updated character
    rerender(
      <CampaignStateProvider>
        <LocationStateWrapper location={location}>
          <StatusDisplayManager character={damagedCharacter} location={location} />
        </LocationStateWrapper>
      </CampaignStateProvider>
    );
    expect(screen.getAllByTestId('strength-value')[0]).toHaveTextContent('3/10'); // Strength reduced to minimum of 1 due to wounds
  });

  test('does not show strength history when no changes exist', () => {
    const mockCharacterWithoutHistory: Character = {
      ...mockCharacter,
      strengthHistory: { baseStrength: 10, changes: [] },
    };
    const location = { type: 'town' as const, name: 'Test Town' };
    render(
      <CampaignStateProvider>
        <LocationStateWrapper location={location}>
          <StatusDisplayManager character={mockCharacterWithoutHistory} location={location} />
        </LocationStateWrapper>
      </CampaignStateProvider>
    );
    expect(screen.queryByTestId('strength-history')).not.toBeInTheDocument();
  });

  test('shows strength history when changes exist', () => {
    const characterWithHistory: Character = {
      ...mockCharacter,
    };
    const location = { type: 'town' as const, name: 'Test Town' };
    render(
      <CampaignStateProvider>
        <LocationStateWrapper location={location}>
          <StatusDisplayManager character={characterWithHistory} location={location} />
        </LocationStateWrapper>
      </CampaignStateProvider>
    );

    const historySection = screen.getByTestId('strength-history');
    expect(historySection).toBeInTheDocument();

    // Check if changes are displayed in reverse chronological order
    const changes = screen.getAllByTestId(/strength-change-/);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toHaveTextContent('10 → 8');
  });
});
