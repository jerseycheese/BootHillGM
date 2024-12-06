import React from 'react';
import { render, screen } from '@testing-library/react';
import { Character } from '../../types/character';
import StatusDisplayManager from '../../components/StatusDisplayManager';
import { CampaignStateProvider } from '../../components/CampaignStateManager';

describe('StatusDisplayManager', () => {
  const mockCharacter: Character = {
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
});
