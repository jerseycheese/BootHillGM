/**
 * Test suite for InputManager component
 * 
 * Tests the following functionality:
 * - Basic rendering of the component (input field, submit button)
 * - Rendering of suggested actions
 * - Clicking on suggested actions to trigger onSubmit
 * - Submitting custom text input
 * - Proper handling of loading states
 * - Input field clearing after submission
 * - Empty input validation
 * - Edge case: handling undefined onSubmit callback
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputManager from '../../components/InputManager';
import { SuggestedAction } from '../../types/campaign';

describe('InputManager', () => {
  // Test data
  const mockSuggestedActions: SuggestedAction[] = [
    { 
      id: 'action-1', 
      title: 'Explore town', 
      type: 'optional', // Changed from 'basic' to 'optional' to match allowed types
      description: 'Explore the town of Boot Hill' 
    },
    { 
      id: 'action-2', 
      title: 'Talk to sheriff', 
      type: 'side', // Changed from 'interaction' to 'side' to match allowed types
      description: 'Have a conversation with the sheriff' 
    }
  ];
  
  // Test setup
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });
  
  // Basic rendering tests
  
  test('renders input field and submit button', () => {
    render(<InputManager onSubmit={mockOnSubmit} isLoading={false} />);
    
    expect(screen.getByPlaceholderText('Or type any action...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Take Action' })).toBeInTheDocument();
  });
  
  test('renders suggested actions when provided', () => {
    render(
      <InputManager 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        suggestedActions={mockSuggestedActions} 
      />
    );
    
    expect(screen.getByText('Explore town')).toBeInTheDocument();
    expect(screen.getByText('Talk to sheriff')).toBeInTheDocument();
  });
  
  // Action submission tests
  
  test('clicking a suggested action calls onSubmit with action title', () => {
    render(
      <InputManager 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        suggestedActions={mockSuggestedActions} 
      />
    );
    
    const exploreButton = screen.getByText('Explore town');
    fireEvent.click(exploreButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('Explore town');
  });
  
  test('submitting custom input calls onSubmit with input text', () => {
    render(<InputManager onSubmit={mockOnSubmit} isLoading={false} />);
    
    const inputField = screen.getByPlaceholderText('Or type any action...');
    const submitButton = screen.getByRole('button', { name: 'Take Action' });
    
    fireEvent.change(inputField, { target: { value: 'Draw my weapon' } });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('Draw my weapon');
  });
  
  // Loading state tests
  
  test('disables input and buttons when isLoading is true', () => {
    render(
      <InputManager 
        onSubmit={mockOnSubmit} 
        isLoading={true} 
        suggestedActions={mockSuggestedActions} 
      />
    );
    
    const inputField = screen.getByPlaceholderText('Or type any action...');
    const submitButton = screen.getByRole('button', { name: 'Processing...' });
    const actionButton = screen.getByText('Explore town');
    
    expect(inputField).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(actionButton).toBeDisabled();
  });
  
  test('does not call onSubmit when isLoading is true', () => {
    render(
      <InputManager 
        onSubmit={mockOnSubmit} 
        isLoading={true} 
        suggestedActions={mockSuggestedActions} 
      />
    );
    
    const actionButton = screen.getByText('Explore town');
    fireEvent.click(actionButton);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  // Input field behavior tests
  
  test('clears input field after submission', () => {
    render(<InputManager onSubmit={mockOnSubmit} isLoading={false} />);
    
    const inputField = screen.getByPlaceholderText('Or type any action...');
    const submitButton = screen.getByRole('button', { name: 'Take Action' });
    
    fireEvent.change(inputField, { target: { value: 'Draw my weapon' } });
    fireEvent.click(submitButton);
    
    expect(inputField).toHaveValue('');
  });
  
  test('does not submit empty input', () => {
    render(<InputManager onSubmit={mockOnSubmit} isLoading={false} />);
    
    const submitButton = screen.getByRole('button', { name: 'Take Action' });
    
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // Edge case tests
  
  test('handles onSubmit when it is undefined', () => {
    // This test verifies our fix for the defensive coding
    // No onSubmit provided to ensure it doesn't throw an error
    const { getByText } = render(
      <InputManager 
        onSubmit={undefined as unknown as (input: string) => void} 
        isLoading={false} 
        suggestedActions={mockSuggestedActions} 
      />
    );
    
    // This should not throw an error
    const exploreButton = getByText('Explore town');
    expect(() => {
      fireEvent.click(exploreButton);
    }).not.toThrow();
  });
});