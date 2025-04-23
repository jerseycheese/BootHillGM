import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { NarrativeDisplay } from '../../components/NarrativeDisplay';
import { CampaignStateContext } from '../../hooks/useCampaignStateContext';
import { initialNarrativeState } from '../../types/narrative.types';
import { initialGameState } from '../../types/gameState';
import { MockNarrativeProvider } from '../../test/utils/narrativeProviderMock';

describe('Narrative Processing', () => {
  // Create a test wrapper function that provides the CampaignStateContext and NarrativeProvider
  const renderWithContext = (ui: React.ReactElement) => {
    const mockState = {
      ...initialGameState,
      narrative: {
        ...initialNarrativeState,
        storyProgression: {
          currentPoint: null,
          progressionPoints: { /* Intentionally empty */ },
          mainStorylinePoints: [],
          branchingPoints: { /* Intentionally empty */ },
          lastUpdated: Date.now()
        }
      }
    };

    // Fix: Add missing properties required by CampaignStateContextType
    const mockContextValue: import('../../types/campaignState.types').CampaignStateContextType = {
      state: mockState,
      dispatch: jest.fn(),
      saveGame: jest.fn(),
      loadGame: jest.fn(),
      cleanupState: jest.fn(),
      player: null, // Add missing property
      opponent: null, // Add missing property
      inventory: [], // Add missing property
      entries: [], // Add missing property
      isCombatActive: false, // Add missing property
      narrativeContext: undefined // Add missing property
    };

    return render(
      <CampaignStateContext.Provider value={mockContextValue}>
        <MockNarrativeProvider>
          {ui}
        </MockNarrativeProvider>
      </CampaignStateContext.Provider>
    );
  };

  it('processes player actions correctly', () => {
    renderWithContext(
      <NarrativeDisplay narrative="Player: swings the sword" />
    );
    const playerActionContainer = screen.getByTestId('narrative-item-player-action');
    const playerAction = within(playerActionContainer).getByText(/swings the sword/);
    expect(playerAction).toHaveClass('narrative-player-action');
  });

  it('processes GM responses correctly', () => {
    renderWithContext(
      <NarrativeDisplay narrative="GM: The sword hits its target" />
    );
    const gmResponseContainer = screen.getByTestId('narrative-item-gm-response');
    const gmResponse = within(gmResponseContainer).getByText(/The sword hits its target/);
    expect(gmResponse).toHaveClass('narrative-gm-response');
  });

  it('processes item acquisitions correctly', () => {
    const narrative = `
      Player: searches the corpse
      GM: You find some items
      ACQUIRED_ITEMS: gold pouch, silver dagger
    `;
    renderWithContext(
      <NarrativeDisplay narrative={narrative} />
    );
    const itemUpdates = screen.getAllByTestId('item-update-acquired');
    expect(itemUpdates).toHaveLength(1);
    expect(itemUpdates[0]).toHaveTextContent('Acquired Items: gold pouch, silver dagger');
  });

  it('processes item removals correctly', () => {
    const narrative = `
      Player: uses the healing potion
      REMOVED_ITEMS: healing potion
    `;
    renderWithContext(
      <NarrativeDisplay narrative={narrative} />
    );
    const itemUpdate = screen.getByTestId('item-update-used');
    expect(itemUpdate).toHaveTextContent('Used/Removed Items: healing potion');
  });

  it('processes complex narrative sequences correctly', () => {
    const narrative = `
      Player: enters the room
      GM: You see a treasure chest
      Player: opens the chest
      GM: Inside you find valuable items
      ACQUIRED_ITEMS: ruby necklace, gold coins
      The chest closes with a loud thud
      Player: examines the wall
      GM: You notice a hidden switch
    `;

    renderWithContext(
      <NarrativeDisplay narrative={narrative} />
    );

    const playerActions = screen.getAllByTestId('narrative-item-player-action');
    const gmResponses = screen.getAllByTestId('narrative-item-gm-response');
    const narratives = screen.getAllByTestId('narrative-item-narrative');

    expect(playerActions).toHaveLength(3);
    expect(gmResponses).toHaveLength(3);
    expect(narratives).toHaveLength(1);

    playerActions.forEach(action => expect(action).toHaveClass('narrative-player-action'));
    gmResponses.forEach(response => expect(response).toHaveClass('narrative-gm-response'));
    narratives.forEach(narrative => expect(narrative).toHaveClass('narrative-text'));
  });

  it('handles metadata markers without affecting narrative display', () => {
    const narrative = `
      Player: looks around
      GM: You see various items
      SUGGESTED_ACTIONS: examine items, move forward
      The room is dimly lit
    `;
    renderWithContext(
      <NarrativeDisplay narrative={narrative} />
    );

    expect(screen.getByTestId('narrative-display')).not.toHaveTextContent('SUGGESTED_ACTIONS');
    expect(screen.getByText(/looks around/)).toHaveClass('narrative-player-action');
    expect(screen.getByText(/You see various items/)).toHaveClass('narrative-gm-response');
    expect(screen.getByText('The room is dimly lit')).toHaveClass('narrative-text');
  });

  it('processes consecutive player actions and GM responses', () => {
    const narrative = `
      Player: draws sword
      GM: You ready your weapon
      Player: attacks the goblin
      GM: Your attack hits true
    `;
    renderWithContext(
      <NarrativeDisplay narrative={narrative} />
    );

    const playerActions = screen.getAllByText(/draws sword|attacks the goblin/);
    const gmResponses = screen.getAllByText(/You ready your weapon|Your attack hits true/);

    expect(playerActions).toHaveLength(2);
    expect(gmResponses).toHaveLength(2);
    playerActions.forEach(action => expect(action).toHaveClass('narrative-player-action'));
    gmResponses.forEach(response => expect(response).toHaveClass('narrative-gm-response'));
  });

  it('handles multiple item updates in sequence', () => {
    const narrative = `
      Player: opens the chest
      GM: You find several items
      ACQUIRED_ITEMS: healing potion, gold coins
      Player: drinks the potion
      REMOVED_ITEMS: healing potion
    `;
    renderWithContext(
      <NarrativeDisplay narrative={narrative} />
    );

    const itemUpdates = screen.getAllByTestId('item-update-acquired');
    const removedUpdate = screen.getByTestId('item-update-used');

    expect(itemUpdates).toHaveLength(1);
    expect(itemUpdates[0]).toHaveTextContent('Acquired Items: gold coins, healing potion');
    expect(removedUpdate).toHaveTextContent('Used/Removed Items: healing potion');
  });
});