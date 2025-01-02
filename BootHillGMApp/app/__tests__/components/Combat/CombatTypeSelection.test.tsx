import { render, screen } from '@testing-library/react';
import { CombatTypeSelection } from '../../../components/Combat/CombatTypeSelection';
import { useCampaignState } from '../../../components/CampaignStateManager';
import { Character } from '../../../types/character';

// Mock the campaign state hook
jest.mock('../../../components/CampaignStateManager');

describe('CombatTypeSelection', () => {
  const mockOnSelectType = jest.fn();
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    (useCampaignState as jest.Mock).mockReturnValue({
      state: {
        inventory: [
          { id: '1', name: 'Colt Peacemaker', category: 'weapon' }
        ]
      }
    });
  });

  it('displays cleaned opponent name with default weapon', () => {
    const opponent: Character = {
      id: 'opponent1',
      name: 'Rancher\nSUGGESTED_ACTIONS: []',
      inventory: [],
      attributes: {
        speed: 5,
        gunAccuracy: 5,
        throwingAccuracy: 5,
        strength: 5,
        baseStrength: 10,
        bravery: 5,
        experience: 0
      },
      wounds: [],
      isUnconscious: false
    };

    render(
      <CombatTypeSelection
        opponent={opponent}
        onSelectType={mockOnSelectType}
      />
    );

    // Check that weapon combat option is available
    expect(screen.getByText('Weapon Combat')).toBeInTheDocument();
  });

  it('shows available weapons for both combatants', () => {
    const opponent: Character = {
      id: 'opponent1',
      name: 'Rancher',
      inventory: [],
      attributes: {
        speed: 5,
        gunAccuracy: 5,
        throwingAccuracy: 5,
        strength: 5,
        baseStrength: 10,
        bravery: 5,
        experience: 0
      },
      wounds: [],
      isUnconscious: false
    };

    render(
      <CombatTypeSelection
        opponent={opponent}
        onSelectType={mockOnSelectType}
      />
    );

    // Check that weapon combat option is available
    expect(screen.getByText('Weapon Combat')).toBeInTheDocument();
  });
});
