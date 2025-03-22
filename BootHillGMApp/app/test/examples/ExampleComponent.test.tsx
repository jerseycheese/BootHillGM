/**
 * Example test to demonstrate the testing setup
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Create a simple test component
const ExampleButton = ({ 
  onClick = () => {}, 
  label = 'Click Me',
  disabled = false
}) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    data-testid="example-button"
  >
    {label}
  </button>
);

// Test the component
describe('ExampleButton', () => {
  it('renders correctly', () => {
    render(<ExampleButton />);
    expect(screen.getByTestId('example-button')).toBeInTheDocument();
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('handles custom label', () => {
    render(<ExampleButton label="Custom Label" />);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const mockFn = jest.fn();
    render(<ExampleButton onClick={mockFn} />);
    
    const user = userEvent.setup();
    await user.click(screen.getByTestId('example-button'));
    
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', async () => {
    const mockFn = jest.fn();
    render(<ExampleButton onClick={mockFn} disabled={true} />);
    
    const user = userEvent.setup();
    await user.click(screen.getByTestId('example-button'));
    
    expect(mockFn).not.toHaveBeenCalled();
  });
});
