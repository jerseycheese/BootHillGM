/**
 * Snapshot Test Template
 * 
 * Use this template to test component appearance with snapshots:
 * 1. Basic component rendering
 * 2. Component variations with different props
 * 3. Component states (loading, error, success)
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { render } from '@testing-library/react';
// import ComponentName from '@/app/components/ComponentName';
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Template for a basic snapshot test suite.
 * Replace ComponentName with your actual component.
 */
describe('ComponentName Snapshots', () => {
  // Basic snapshot test
  it('matches snapshot with default props', () => {
    // const { container } = render(<ComponentName />);
    // expect(container).toMatchSnapshot();
  });
  
  // Snapshot with specific props
  it('matches snapshot with custom props', () => {
    // const props = {
    //   title: 'Custom Title',
    //   description: 'Custom description text',
    //   isActive: true
    // };
    // const { container } = render(<ComponentName {...props} />);
    // expect(container).toMatchSnapshot();
  });
  
  // Snapshot for specific component state
  it('matches snapshot in loading state', () => {
    // const { container } = render(<ComponentName isLoading={true} />);
    // expect(container).toMatchSnapshot();
  });
  
  // Snapshot for error state
  it('matches snapshot in error state', () => {
    // const { container } = render(
    //   <ComponentName 
    //     error="Something went wrong" 
    //     isError={true}
    //   />
    // );
    // expect(container).toMatchSnapshot();
  });
  
  // Snapshot for specific UI element
  it('matches snapshot of a specific element', () => {
    // const { getByTestId } = render(<ComponentName />);
    // const element = getByTestId('specific-element');
    // expect(element).toMatchSnapshot();
  });
});
