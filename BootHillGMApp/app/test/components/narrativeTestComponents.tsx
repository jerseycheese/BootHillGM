/**
 * Reusable test components for the NarrativeProvider tests
 * 
 * This file contains test-specific React components that are
 * used to test the functionality of the NarrativeProvider context.
 * 
 * @example
 * // In your test file
 * import { NarrativeTestComponent } from '../components/narrativeTestComponents';
 * 
 * test('dispatches actions correctly', () => {
 *   render(
 *     <NarrativeProvider>
 *       <NarrativeTestComponent 
 *         actionType="ADD_NARRATIVE_HISTORY"
 *         actionPayload="Test narrative"
 *       />
 *     </NarrativeProvider>
 *   );
 *   
 *   // Run your test assertions...
 * });
 */
import React, { useState, useEffect } from 'react';
import { mockUseNarrative } from '../utils/narrativeProviderMocks';
import { GameAction, NarrativeAction } from '../../types/actions';

// Define the permitted payload types for actions
type ActionPayloadType = string | string[] | Record<string, unknown> | undefined;

/**
 * Props for the NarrativeTestComponent
 */
interface NarrativeTestComponentProps {
  /** Optional callback function that runs when the component renders */
  onRender?: () => void;
  /** The action type to dispatch when the button is clicked */
  actionType?: string;
  /** The payload to include with the dispatched action */
  actionPayload?: ActionPayloadType;
}

/**
 * Generic test component that displays state and can dispatch actions
 * 
 * This component uses the mockUseNarrative hook to access and display
 * the current state, and provides a button to dispatch actions.
 * 
 * @param props - Component props
 * @returns A React component for testing narrative context
 */
export const NarrativeTestComponent: React.FC<NarrativeTestComponentProps> = ({ 
  onRender, 
  actionType, 
  actionPayload 
}) => {
  const { state, dispatch } = mockUseNarrative();

  // Call the onRender callback if provided
  useEffect(() => {
    if (onRender) {
      onRender();
    }
  }, [onRender]);

  const handleAction = (): void => {
    if (actionType) {
      // Create an action object with the correct type structure
      const action: GameAction = {
        type: actionType as NarrativeAction['type'], 
      } as GameAction;
      
      // Only add payload if it's defined
      if (actionPayload !== undefined) {
        // Need to use type assertion here because GameAction has different payload types
        (action as unknown as { payload: ActionPayloadType }).payload = actionPayload;
      }
      
      dispatch(action);
    }
  };

  return (
    <div>
      <div data-testid="state">{JSON.stringify(state)}</div>
      {actionType && (
        <button data-testid="action-button" onClick={handleAction}>
          Dispatch Action
        </button>
      )}
    </div>
  );
};

/**
 * Props for the ErrorTestComponent
 */
interface ErrorTestComponentProps {
  /** The error message to display if an error is caught */
  errorMessage: string;
}

/**
 * Error test component that tries to use the useNarrative hook outside a provider
 * and displays an error if caught
 * 
 * @param props - Component props
 * @returns A React component that displays errors when they occur
 */
export const ErrorTestComponent: React.FC<ErrorTestComponentProps> = ({ 
  errorMessage 
}) => {
  const [hasError, setHasError] = useState(false);
  
  // Try to use the hook and catch the error
  useEffect(() => {
    try {
      // This should throw the mock error
      mockUseNarrative();
    } catch {
      setHasError(true);
    }
  }, []);
  
  // Render based on whether there was an error
  return hasError ? (
    <div data-testid="error">{errorMessage}</div>
  ) : (
    <div>No error occurred</div>
  );
};
