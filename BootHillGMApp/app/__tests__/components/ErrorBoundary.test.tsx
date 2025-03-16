import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

// Mock component that throws an error
const ErrorComponent = () => {
  throw new Error('Test Error');
};

describe('ErrorBoundary', () => {
  test('renders fallback UI when an error is caught', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText('An error occurred in this component.')).toBeInTheDocument();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>No Error</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('No Error')).toBeInTheDocument();
  });
});
