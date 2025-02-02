import React from 'react';
import { render, screen } from '@testing-library/react';
import { Character } from '../../types/character';
import StatusDisplayManager from '../../components/StatusDisplayManager';
import { CampaignStateProvider } from '../../components/CampaignStateManager';

describe('StatusDisplayManager', () => {
  const mockCharacter: Character = {
    isNPC: false,
    isPlayer: true,
    id: 'some-id',
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
        strengthReduction: 1,
        turnReceived: 1,
      },
      {
        location: 'chest',
        severity: 'serious',
        strengthReduction: 2,
        turnReceived: 2,
      },
    ],
    isUnconscious: false,
  };

  test('renders character information correctly', () => {
    render(
      <CampaignStateProvider>
        <StatusDisplayManager character={mockCharacter} location="Test Town" />
      </CampaignStateProvider>
    );

    expect(screen.getByText('Test Character')).toBeInTheDocument();
    expect(screen.getByText(/Test Town/)).toBeInTheDocument();
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
    render(
      <CampaignStateProvider>
        <StatusDisplayManager character={mockCharacter} location="Test Town" />
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
    render(
      <CampaignStateProvider>
        <StatusDisplayManager character={unconsciousCharacter} location="Test Town" />
      </CampaignStateProvider>
    );

    expect(screen.getByText('(Unconscious)')).toBeInTheDocument();
  });
  test('displays strength correctly', () => {
    render(
      <CampaignStateProvider>
        <StatusDisplayManager
          character={{
            ...mockCharacter,
            attributes: { ...mockCharacter.attributes, baseStrength: 50, strength: 50 },
            wounds: []
          }}
          location="Test Town"
        />
      </CampaignStateProvider>
    );
    expect(screen.getByTestId('strength-value')).toHaveTextContent('50/50');
    expect(screen.getByTestId('strength-value')).toHaveClass('text-green-600');
  });

  test('shows yellow text for strength between 6 and 12', () => {
    render(
      <CampaignStateProvider>
        <StatusDisplayManager
          character={{
            ...mockCharacter,
            attributes: { ...mockCharacter.attributes, strength: 10, baseStrength: 10 },
            wounds: [] // No wounds to keep strength at 10
          }}
          location="Test Town"
        />
      </CampaignStateProvider>
    );
    expect(screen.getByTestId('strength-value')).toHaveTextContent('10/10');
    expect(screen.getByTestId('strength-value')).toHaveClass('text-yellow-600');
  });

  test('shows red text at zero strength', () => {
    render(
      <CampaignStateProvider>
        <StatusDisplayManager
          character={{
            ...mockCharacter,
            attributes: { ...mockCharacter.attributes, strength: 0, baseStrength: 0 },
            wounds: [] // Clear wounds to ensure strength is 0
          }}
          location="Test Town"
        />
      </CampaignStateProvider>
    );
    expect(screen.getByTestId('strength-value')).toHaveTextContent('1/0');
    expect(screen.getByTestId('strength-value')).toHaveClass('text-red-600');
  });

  test('updates strength display after taking damage', () => {
    const testCharacter = { ...mockCharacter }; // Create mutable copy
    const { rerender } = render(
      <CampaignStateProvider>
        <StatusDisplayManager character={testCharacter} location="Test Town" />
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
          strengthReduction: 3,
          turnReceived: 3, // Example turn
        },
      ],
    };

    // Re-render component with updated character
    rerender(
      <CampaignStateProvider>
        <StatusDisplayManager character={damagedCharacter} location="Test Town" />
      </CampaignStateProvider>
    );
    expect(screen.getAllByTestId('strength-value')[0]).toHaveTextContent('1/10'); // Strength reduced to minimum of 1 due to wounds
  });
});
