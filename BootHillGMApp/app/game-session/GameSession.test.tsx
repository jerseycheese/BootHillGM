// BootHillGMApp/app/game-session/GameSession.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GameSession from './page';
import { getAIResponse } from '../utils/aiService';
import { useGame } from '../utils/gameEngine';
import * as JournalManager from '../utils/JournalManager';

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the AI service
jest.mock('../utils/aiService', () => ({
  getAIResponse: jest.fn(),
}));

// Mock the game engine hook
jest.mock('../utils/gameEngine', () => ({
  useGame: jest.fn(),
}));

// Mock the JournalManager
jest.mock('../utils/JournalManager', () => ({
  getJournalContext: jest.fn(),
}));

describe('GameSession', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock return values for the AI response
    (getAIResponse as jest.Mock).mockResolvedValue({
      narrative: 'AI response',
      location: 'Test Town',
    });
    
    // Set up mock return values for the game state
    (useGame as jest.Mock).mockReturnValue({
      state: {
        character: { name: 'Test Character', health: 100 },
        location: 'Test Town',
        narrative: 'Initial narrative',
        inventory: [],
        journal: [],
      },
      dispatch: jest.fn(),
    });
    
    // Set up mock return value for the journal context
    (JournalManager.getJournalContext as jest.Mock).mockReturnValue('Journal context');
  });

  // Test case: Handling user input and updating the narrative
  test('handles user input and updates narrative', async () => {
    // Set up a mock dispatch function
    const mockDispatch = jest.fn();
    (useGame as jest.Mock).mockReturnValue({
      state: {
        character: { name: 'Test Character', health: 100 },
        location: 'Test Town',
        narrative: 'Initial narrative',
        inventory: [],
        journal: [],
      },
      dispatch: mockDispatch,
    });
  
    // Render the GameSession component
    render(<GameSession />);
  
    // Get the input field and submit button
    const input = screen.getByPlaceholderText('What would you like to do?');
    const submitButton = screen.getByText('Take Action');
  
    // Simulate user input and form submission
    fireEvent.change(input, { target: { value: 'Look around' } });
    fireEvent.click(submitButton);
  
    // Wait for and check if the necessary functions were called
    await waitFor(() => {
      expect(JournalManager.getJournalContext).toHaveBeenCalled();
      expect(getAIResponse).toHaveBeenCalledWith('Look around', 'Journal context');
    });
  
    // Check if the dispatch function was called with the expected action
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_NARRATIVE',
          payload: expect.stringContaining('AI response')
        })
      );
    });
  });
});