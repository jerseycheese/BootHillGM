import React from 'react';
import { render, screen, act } from '@testing-library/react';
import StatusDisplayManager from '../../components/StatusDisplayManager';
import { LocationType } from '../../services/locationService';
import { CampaignStateProvider } from '../../components/CampaignStateManager';
import { Character } from '../../types/character';
import { useLocation } from '../../hooks/useLocation';

// Mock useLocation hook
jest.mock('../../hooks/useLocation');

const mockCharacter: Character = {
  isNPC: false,
  isPlayer: true,
  id: 'test-character',
  name: 'Test Character',
  inventory: { items: [] },
  attributes: {
    speed: 5,
    gunAccuracy: 5,
    throwingAccuracy: 5,
    strength: 20,
    baseStrength: 20,
    bravery: 5,
    experience: 0,
  },
  minAttributes: {
    speed: 1,
    gunAccuracy: 1,
    throwingAccuracy: 1,
    strength: 8,
    baseStrength: 8,
    bravery: 1,
    experience: 0,
  },
  maxAttributes: {
    speed: 20,
    gunAccuracy: 20,
    throwingAccuracy: 20,
    strength: 20,
    baseStrength: 20,
    bravery: 20,
    experience: 11,
  },
  wounds: [],
  isUnconscious: false,
  strengthHistory: { changes: [], baseStrength: 20 },
};

describe('LocationDisplay', () => {
  const renderWithContext = (
    location: LocationType,
    character: Character = mockCharacter
  ) => {
    (useLocation as jest.Mock).mockReturnValue({
      locationState: {
        currentLocation: location,
        history: [location],
      },
      updateLocation: jest.fn(),
    });

    return render(
      <CampaignStateProvider>
        <StatusDisplayManager character={character} location={location} />
      </CampaignStateProvider>
    );
  };

  it('displays "Unknown Location" for unknown location type', () => {
    renderWithContext({ type: 'unknown' });
    expect(screen.getByTestId('character-location')).toHaveTextContent(
      'Location: Unknown Location'
    );
  });

  it('displays town name for town location type', () => {
    renderWithContext({ type: 'town', name: 'Dusty Gulch' });
    expect(screen.getByTestId('character-location')).toHaveTextContent(
      'Location: Dusty Gulch'
    );
  });

  it('displays wilderness description for wilderness location type', () => {
    renderWithContext({ type: 'wilderness', description: 'Open plains' });
    expect(screen.getByTestId('character-location')).toHaveTextContent(
      'Location: Open plains'
    );
  });

  it('displays landmark name and description for landmark location type', () => {
    renderWithContext({
      type: 'landmark',
      name: 'Hidden Valley',
      description: 'A secluded valley',
    });
    expect(screen.getByTestId('character-location')).toHaveTextContent(
      'Location: Hidden Valley (A secluded valley)'
    );
  });

  it('updates location display when useLocation hook updates', () => {
      const mockUpdateLocation = jest.fn();
      const initialLocation: LocationType = { type: 'unknown' };
      (useLocation as jest.Mock).mockReturnValue({
          locationState: {
              currentLocation: initialLocation,
              history: [],
          },
          updateLocation: mockUpdateLocation,
      });

      const { rerender } = render(
          <CampaignStateProvider>
              <StatusDisplayManager character={mockCharacter} location={initialLocation} />
          </CampaignStateProvider>
      );

      expect(screen.getByTestId('character-location')).toHaveTextContent('Location: Unknown Location');

      const newLocation: LocationType = { type: 'town', name: 'New Town' };
      act(() => {
          mockUpdateLocation(newLocation); // Simulate location update
      });

    (useLocation as jest.Mock).mockReturnValue({
      locationState: {
        currentLocation: newLocation,
        history: [newLocation],
      },
      updateLocation: mockUpdateLocation
    });

      // Use rerender to update the existing component with new props
      rerender(
          <CampaignStateProvider>
              <StatusDisplayManager character={mockCharacter} location={newLocation} />
          </CampaignStateProvider>
      );

    expect(screen.getByTestId('character-location')).toHaveTextContent('Location: New Town');
  });
});
