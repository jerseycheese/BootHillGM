import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { NarrativeDisplay } from '../../components/NarrativeDisplay';

describe('Narrative Processing', () => {
  it('processes player actions correctly', () => {
    render(React.createElement(NarrativeDisplay, { narrative: "Player: swings the sword" }));
    const playerActionContainer = screen.getByTestId('player-action');
    const playerAction = within(playerActionContainer).getByText(/swings the sword/);
    expect(playerAction).toHaveClass('player-action');
  });

  it('processes GM responses correctly', () => {
    render(React.createElement(NarrativeDisplay, { narrative: "GM: The sword hits its target" }));
    const gmResponseContainer = screen.getByTestId('gm-response');
    const gmResponse = within(gmResponseContainer).getByText(/The sword hits its target/);
    expect(gmResponse).toHaveClass('gm-response');
  });

  it('processes item acquisitions correctly', () => {
    const narrative = `
      Player: searches the corpse
      GM: You find some items
      ACQUIRED_ITEMS: gold pouch, silver dagger
    `;
    render(React.createElement(NarrativeDisplay, { narrative }));
    const itemUpdates = screen.getAllByTestId('item-update-acquired');
    expect(itemUpdates).toHaveLength(1);
    expect(itemUpdates[0]).toHaveTextContent('Acquired Items: gold pouch, silver dagger');
  });

  it('processes item removals correctly', () => {
    const narrative = `
      Player: uses the healing potion
      REMOVED_ITEMS: healing potion
    `;
    render(React.createElement(NarrativeDisplay, { narrative }));
    const itemUpdate = screen.getByTestId('item-update-used');
    expect(itemUpdate).toHaveTextContent('Used/Removed Items: healing potion');
  });

  it('handles empty lines correctly', () => {
    // Using a single newline to test empty line handling
    render(React.createElement(NarrativeDisplay, { narrative: "Line 1\n\nLine 2" }));
    const spacers = screen.getAllByTestId('empty-spacer');
    expect(spacers).toHaveLength(1); // One empty line between two content lines
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

    render(React.createElement(NarrativeDisplay, { narrative }));

    const playerActions = screen.getAllByTestId('player-action');
    const gmResponses = screen.getAllByTestId('gm-response');
    const narratives = screen.getAllByTestId('narrative-line');

    expect(playerActions).toHaveLength(3);
    expect(gmResponses).toHaveLength(3);
    expect(narratives).toHaveLength(1);

    playerActions.forEach(action => expect(action).toHaveClass('player-action'));
    gmResponses.forEach(response => expect(response).toHaveClass('gm-response'));
    narratives.forEach(narrative => expect(narrative).toHaveClass('narrative-line'));
  });

  it('handles metadata markers without affecting narrative display', () => {
    const narrative = `
      Player: looks around
      GM: You see various items
      SUGGESTED_ACTIONS: examine items, move forward
      The room is dimly lit
    `;
    render(React.createElement(NarrativeDisplay, { narrative }));

    expect(screen.getByTestId('narrative-display')).not.toHaveTextContent('SUGGESTED_ACTIONS');
    expect(screen.getByText(/looks around/)).toHaveClass('player-action');
    expect(screen.getByText(/You see various items/)).toHaveClass('gm-response');
    expect(screen.getByText('The room is dimly lit')).toHaveClass('narrative-line');
  });

  it('processes consecutive player actions and GM responses', () => {
    const narrative = `
      Player: draws sword
      GM: You ready your weapon
      Player: attacks the goblin
      GM: Your attack hits true
    `;
    render(React.createElement(NarrativeDisplay, { narrative }));

    const playerActions = screen.getAllByText(/draws sword|attacks the goblin/);
    const gmResponses = screen.getAllByText(/You ready your weapon|Your attack hits true/);

    expect(playerActions).toHaveLength(2);
    expect(gmResponses).toHaveLength(2);
    playerActions.forEach(action => expect(action).toHaveClass('player-action'));
    gmResponses.forEach(response => expect(response).toHaveClass('gm-response'));
  });

  it('handles multiple item updates in sequence', () => {
    const narrative = `
      Player: opens the chest
      GM: You find several items
      ACQUIRED_ITEMS: healing potion, gold coins
      Player: drinks the potion
      REMOVED_ITEMS: healing potion
    `;
    render(React.createElement(NarrativeDisplay, { narrative }));

    const itemUpdates = screen.getAllByTestId('item-update-acquired');
    const removedUpdate = screen.getByTestId('item-update-used');

    expect(itemUpdates).toHaveLength(1);
    expect(itemUpdates[0]).toHaveTextContent('Acquired Items: gold coins, healing potion');
    expect(removedUpdate).toHaveTextContent('Used/Removed Items: healing potion');
  });
});
