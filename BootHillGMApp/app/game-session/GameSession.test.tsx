import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import GameSession from './page';
import { getAIResponse } from '../utils/aiService';
import { useGame } from '../utils/gameEngine';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../utils/aiService', () => ({
  getAIResponse: jest.fn(),
}));

jest.mock('../utils/gameEngine', () => ({
  useGame: jest.fn(),
}));

describe('GameSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAIResponse as jest.Mock).mockResolvedValue({
      narrative: 'AI response',
      location: 'Test Town',
    });
    (useGame as jest.Mock).mockReturnValue({
      state: {
        character: { name: 'Test Character', health: 100 },
        currentLocation: 'Test Town',
        narrative: 'Initial narrative',
        inventory: [],
      },
      dispatch: jest.fn((action) => {
        if (action.type === 'SET_NARRATIVE') {
          (useGame as jest.Mock).mockReturnValue({
            state: {
              character: { name: 'Test Character', health: 100 },
              currentLocation: 'Test Town',
              narrative: action.payload,
              inventory: [],
            },
            dispatch: jest.fn(),
          });
        }
      }),
    });
  });

  test('renders game session with initial state', async () => {
    await act(async () => {
      render(<GameSession />);
    });

    expect(screen.getByText('Game Session')).toBeInTheDocument();
    expect(screen.getByText('Character Status')).toBeInTheDocument();
    expect(screen.getByText('Name: Test Character')).toBeInTheDocument();
    expect(screen.getByText('Location: Test Town')).toBeInTheDocument();
    expect(screen.getByText('Your inventory is empty.')).toBeInTheDocument();
  });

  test('handles user input and updates narrative', async () => {
    await act(async () => {
      render(<GameSession />);
    });

    const input = screen.getByPlaceholderText('What would you like to do?');
    const submitButton = screen.getByText('Take Action');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Look around' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(getAIResponse).toHaveBeenCalledWith('Look around');
    });

    await waitFor(() => {
      const narrativeElement = screen.getByText(/Game Master: AI response/);
      expect(narrativeElement).toBeInTheDocument();
    });
  });
});