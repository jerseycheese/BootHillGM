import React from 'react';
import { render, screen } from '@testing-library/react';
import StatDisplay from './StatDisplay';

describe('StatDisplay component', () => {
  it('renders basic stat without max value', () => {
    render(<StatDisplay label="Speed" value={5} />);
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders stat with max value', () => {
    render(<StatDisplay label="Strength" value={8} max={10} />);
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('/ 10')).toBeInTheDocument();
  });

  it('renders stat with description', () => {
    render(
      <StatDisplay
        label="Bravery"
        value={6}
        description="Affects combat decisions"
      />
    );
    expect(screen.getByText('Bravery')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('Affects combat decisions')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<StatDisplay label="Test" value={1} />);
    expect(container.firstChild).toHaveClass('stat-container');
    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('flex-col');
    expect(container.firstChild).toHaveClass('gap-2');
  });
});
