import 'react-native';
import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock the Redux store
jest.mock('../src/store', () => ({
  store: {
    getState: () => ({}),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  },
}));

// Mock the AppNavigator
jest.mock('../src/navigation/AppNavigator', () => 'MockedAppNavigator');

describe('App', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('mocked-app-navigator')).toBeTruthy();
  });
});