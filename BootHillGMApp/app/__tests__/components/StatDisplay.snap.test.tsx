import React from 'react';
import { render } from '@testing-library/react';
import StatDisplay from '@/app/components/StatDisplay';

describe('StatDisplay snapshots', () => {
  it('matches snapshot with basic props', () => {
    const { container } = render(<StatDisplay label="Strength" value={10} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with max value', () => {
    const { container } = render(<StatDisplay label="Health" value={8} max={10} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with description', () => {
    const { container } = render(
      <StatDisplay 
        label="Speed" 
        value={6} 
        description="Affects reaction time and movement"
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with all props', () => {
    const { container } = render(
      <StatDisplay 
        label="Luck" 
        value={3} 
        max={7}
        description="Influences critical hits and random events"
      />
    );
    expect(container).toMatchSnapshot();
  });

  // Edge cases
  it('matches snapshot with zero value', () => {
    const { container } = render(<StatDisplay label="Empty Stat" value={0} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with large values', () => {
    const { container } = render(<StatDisplay label="Damage" value={9999} max={10000} />);
    expect(container).toMatchSnapshot();
  });

  // Testing specific elements
  it('renders with accessible attributes', () => {
    const { getByTestId } = render(
      <StatDisplay label="Accessibility" value={5} />
    );
    const statDisplay = getByTestId('stat-display');
    expect(statDisplay).toBeInTheDocument();
    expect(statDisplay).toMatchSnapshot();
  });
});
