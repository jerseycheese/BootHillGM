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
    expect(screen.getByTestId('strength-value')).toHaveTextContent('7/10'); // Expect 7/10 due to wound penalties
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
            attributes: { ...mockCharacter.attributes, strength: 50 },
          }}
          location="Test Town"
        />
      </CampaignStateProvider>
    );
    expect(screen.getByTestId('status-display')).toHaveTextContent('50 STR');
    expect(screen.getByText(/50 STR/).closest('div')).toHaveClass('text-green-600');
  });

  test('shows yellow text at 10 strength', () => {
    render(
      <CampaignStateProvider>
        <StatusDisplayManager
          character={{
            ...mockCharacter,
            attributes: { ...mockCharacter.attributes, strength: 10 },
          }}
          location="Test Town"
        />
      </CampaignStateProvider>
    );
    expect(screen.getByTestId('status-display')).toHaveTextContent('10 STR');
    expect(screen.getByText(/10 STR/).closest('div')).toHaveClass('text-yellow-600');
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
    expect(screen.getByTestId('status-display')).toHaveTextContent('0 STR');
    const strengthValueElement = screen.getByTestId('strength-value');
    console.log(`Current strength in test: ${strengthValueElement.textContent}`);
    console.log(`Applied class in test: ${strengthValueElement.className}`);
    expect(strengthValueElement).toHaveClass('text-red-600');
  });
});
