import { render, screen } from '@testing-library/react';
import { CombatTypeSelection } from '../CombatTypeSelection';
import { useCampaignState } from '../../CampaignStateManager';

// Mock the campaign state hook
jest.mock('../../CampaignStateManager');

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
    const opponent = {
      name: 'Rancher\nSUGGESTED_ACTIONS: []',
      // ... other required properties
    };

    render(
      <CombatTypeSelection
        playerCharacter={{} as any}
        opponent={opponent}
        onSelectType={mockOnSelectType}
      />
    );

    // Check that the opponent name is cleaned and weapon is shown
    expect(screen.getByText('Rancher: Colt Revolver')).toBeInTheDocument();
  });

  it('shows available weapons for both combatants', () => {
    const opponent = {
      name: 'Rancher',
      // ... other required properties
    };

    render(
      <CombatTypeSelection
        playerCharacter={{} as any}
        opponent={opponent}
        onSelectType={mockOnSelectType}
      />
    );

    // Check player weapon
    expect(screen.getByText('You: Colt Peacemaker')).toBeInTheDocument();
    // Check opponent default weapon
    expect(screen.getByText('Rancher: Colt Revolver')).toBeInTheDocument();
  });
});
