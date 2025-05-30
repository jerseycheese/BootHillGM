// components/Common/__tests__/ErrorBoundary.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Define a component that will throw an error
const ProblemComponent = () => {
  throw new Error('Test error');
  return <div>This will never render</div>;
};

// Define a safe component for comparison
const SafeComponent = () => {
  return <div>This is a safe component</div>;
};

// Mock console.error to prevent test output noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('This is a safe component')).toBeInTheDocument();
  });

  it('renders fallback UI when a child component throws', () => {
    // React testing library will log the error but test will still run
    jest.spyOn(console, 'error').mockImplementation(() => { /* Intentionally empty */ });
    
    render(
      <ErrorBoundary>
        <ProblemComponent />
      </ErrorBoundary>
    );
    
    // Update to match the actual text in the component
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('can handle multiple children with one throwing an error', () => {
    jest.spyOn(console, 'error').mockImplementation(() => { /* Intentionally empty */ });
    
    // When one component throws inside an error boundary,
    // all children are replaced with the fallback UI
    render(
      <ErrorBoundary>
        <SafeComponent />
        <ProblemComponent />
      </ErrorBoundary>
    );
    
    // Update to match the actual text in the component
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.queryByText('This is a safe component')).not.toBeInTheDocument();
  });
});
