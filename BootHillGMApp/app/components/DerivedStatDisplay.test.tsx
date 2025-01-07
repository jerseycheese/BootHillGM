import React from 'react';
import { render, screen } from '@testing-library/react';
import DerivedStatDisplay from './DerivedStatDisplay';

describe('DerivedStatDisplay component', () => {
  it('renders derived stat without description', () => {
    render(<DerivedStatDisplay label="Hit Points" value={25} />);
    expect(screen.getByText('Hit Points')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders derived stat with description', () => {
    render(
      <DerivedStatDisplay
        label="Speed"
        value={10}
        description="Modified by wounds"
      />
    );
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Modified by wounds')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<DerivedStatDisplay label="Test" value={1} />);
    expect(container.firstChild).toHaveClass('stat-container');
    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('flex-col');
    expect(container.firstChild).toHaveClass('gap-2');
  });
});
