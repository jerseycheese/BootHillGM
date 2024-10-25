import React from 'react';
import { render } from '@testing-library/react';
import GameSession from '../../components/GameSession';
import { CampaignStateProvider } from '../../components/CampaignStateManager';

describe('GameSession', () => {
  it('renders game session component', () => {
    const { container } = render(
      <CampaignStateProvider>
        <GameSession />
      </CampaignStateProvider>
    );
    expect(container).toBeTruthy();
  });
});
