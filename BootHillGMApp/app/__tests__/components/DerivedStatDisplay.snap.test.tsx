import React from 'react';
import { render } from '@testing-library/react';
import DerivedStatDisplay from '@/app/components/DerivedStatDisplay';

describe('DerivedStatDisplay snapshots', () => {
  it('matches snapshot with basic props', () => {
    const { container } = render(<DerivedStatDisplay label="Hit Points" value={24} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with description', () => {
    const { container } = render(
      <DerivedStatDisplay 
        label="Speed" 
        value={5} 
        description="Determines movement range and initiative"
      />
    );
    expect(container).toMatchSnapshot();
  });

  // Edge cases
  it('matches snapshot with zero value', () => {
    const { container } = render(<DerivedStatDisplay label="Bonus" value={0} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with large value', () => {
    const { container } = render(<DerivedStatDisplay label="Damage Potential" value={999} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with negative value', () => {
    const { container } = render(<DerivedStatDisplay label="Modifier" value={-3} />);
    expect(container).toMatchSnapshot();
  });

  // Testing specific elements
  it('renders with accessible attributes', () => {
    const { getByTestId } = render(
      <DerivedStatDisplay label="Accessibility" value={5} />
    );
    const derivedStatDisplay = getByTestId('derived-stat-display');
    expect(derivedStatDisplay).toBeInTheDocument();
    expect(derivedStatDisplay).toMatchSnapshot();
  });
});
