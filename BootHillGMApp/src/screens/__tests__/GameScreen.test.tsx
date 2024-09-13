import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import GameScreen from '../GameScreen';

// Mock the Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe('GameScreen', () => {
  it('renders correctly and starts game on button press', () => {
    const mockDispatch = jest.fn();
    (useSelector as jest.Mock).mockReturnValue(false);
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    const { getByText } = render(<GameScreen />);

    expect(getByText('Game Started: No')).toBeTruthy();

    fireEvent.press(getByText('Start Game'));

    expect(mockDispatch).toHaveBeenCalled();
  });
});