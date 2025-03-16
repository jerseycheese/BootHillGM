// __tests__/components/Debug/GameControlSection.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameControlSection from '../../../components/Debug/GameControlSection';
import { resetGame, initializeTestCombat } from '../../../utils/debugActions';

// Mock dependencies with implementation that returns action objects
jest.mock('../../../utils/debugActions', () => ({
  resetGame: jest.fn().mockReturnValue({ 
    type: 'SET_STATE', 
    payload: {} 
  }),
  initializeTestCombat: jest.fn().mockReturnValue({ 
    type: 'SET_STATE', 
    payload: {} 
  }),
}));

describe('GameControlSection', () => {
  const mockProps = {
    dispatch: jest.fn(),
    loading: null,
    setLoading: jest.fn(),
    setError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the reset game and test combat buttons', () => {
    render(<GameControlSection {...mockProps} />);
    
    expect(screen.getByText('Reset Game')).toBeInTheDocument();
    expect(screen.getByText('Test Combat')).toBeInTheDocument();
  });

  it('calls resetGame action when reset button is clicked', () => {
    render(<GameControlSection {...mockProps} />);
    
    const resetButton = screen.getByText('Reset Game');
    fireEvent.click(resetButton);
    
    expect(mockProps.setLoading).toHaveBeenCalledWith('reset');
    expect(mockProps.dispatch).toHaveBeenCalled();
    expect(resetGame).toHaveBeenCalled();
  });

  it('calls initializeTestCombat action when test combat button is clicked', () => {
    render(<GameControlSection {...mockProps} />);
    
    const combatButton = screen.getByText('Test Combat');
    fireEvent.click(combatButton);
    
    expect(mockProps.setLoading).toHaveBeenCalledWith('combat');
    expect(mockProps.dispatch).toHaveBeenCalled();
    expect(initializeTestCombat).toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    const loadingProps = {
      ...mockProps,
      loading: 'reset',
    };
    
    render(<GameControlSection {...loadingProps} />);
    
    const resetButton = screen.getByText('Resetting...');
    expect(resetButton).toBeDisabled();
    
    // The combat button should not be disabled
    const combatButton = screen.getByText('Test Combat');
    expect(combatButton).not.toBeDisabled();
  });
});
