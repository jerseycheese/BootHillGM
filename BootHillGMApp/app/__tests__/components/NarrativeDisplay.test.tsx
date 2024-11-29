import React from 'react';
import { render, screen } from '@testing-library/react';
import { NarrativeDisplay } from '../../components/NarrativeDisplay';
import { NarrativeContent } from '../../components/NarrativeContent';
import { NarrativeItem } from '../../components/NarrativeDisplay';

describe('Narrative System', () => {
  describe('NarrativeDisplay Integration', () => {
    test('processes complete narrative correctly', () => {
      const narrative = `
        Player: draws weapon
        GM: You ready your weapon
        ACQUIRED_ITEMS: [Gun, Bullets]
        Player: aims carefully
        SUGGESTED_ACTIONS: [{"text": "Fire weapon", "type": "combat"}]
      `;
      
      render(<NarrativeDisplay narrative={narrative} />);
      
      // Check player actions
      const playerActions = screen.getAllByTestId('player-action');
      expect(playerActions).toHaveLength(2);
      expect(playerActions[0]).toHaveTextContent('draws weapon');
      expect(playerActions[1]).toHaveTextContent('aims carefully');
      
      // Check GM response
      expect(screen.getByTestId('gm-response')).toHaveTextContent('You ready your weapon');
      
      // Check item updates
      const itemUpdate = screen.getByTestId('item-update-acquired');
      expect(itemUpdate).toHaveTextContent(/Acquired Items:.*gun.*bullets|Acquired Items:.*bullets.*gun/);
    });

    test('handles error display and retry', () => {
      const mockError = 'Test error';
      const mockRetry = jest.fn();
      
      render(
        <NarrativeDisplay 
          narrative="Test narrative"
          error={mockError}
          onRetry={mockRetry}
        />
      );
      
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent(mockError);
      
      const retryButton = screen.getByText('Retry');
      retryButton.click();
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe('NarrativeContent Core Functionality', () => {
    const processedUpdates = new Set<string>();

    beforeEach(() => {
      processedUpdates.clear();
    });

    test('handles all content types correctly', () => {
      const items: NarrativeItem[] = [
        {
          type: 'player-action',
          content: 'draws weapon'
        },
        {
          type: 'gm-response',
          content: 'You ready your weapon'
        },
        {
          type: 'item-update',
          content: '',
          metadata: {
            updateType: 'acquired',
            items: ['Gun', 'Bullets']
          }
        }
      ];

      items.forEach(item => {
        render(
          <NarrativeContent 
            item={item} 
            processedUpdates={processedUpdates}
          />
        );

        switch(item.type) {
          case 'player-action':
            expect(screen.getByTestId('player-action')).toHaveTextContent('draws weapon');
            break;
          case 'gm-response':
            expect(screen.getByTestId('gm-response')).toHaveTextContent('You ready your weapon');
            break;
          case 'item-update':
            expect(screen.getByTestId('item-update-acquired')).toHaveTextContent(/gun, bullets|bullets, gun/);
            break;
        }
      });
    });
  });
});
