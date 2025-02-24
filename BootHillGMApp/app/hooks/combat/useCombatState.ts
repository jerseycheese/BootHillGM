import { useRef, useState } from 'react';
import { createStateProtection } from '../../utils/stateProtection';

/**
 * Custom hook for managing the core combat state.
 * 
 * This hook handles:
 * - Initializing and maintaining the combat processing state.
 * - Providing a reference to track whether state updates are in progress.
 * - Integrating with the `StateProtection` utility to prevent race conditions.
 * 
 * @returns An object containing the combat state and related functions.
 */
export const useCombatState = () => {
  const stateProtection = useRef(createStateProtection());
  const [isProcessing, setIsProcessing] = useState(false);
  const isUpdatingRef = useRef(false);

  return {
    isProcessing,
    setIsProcessing,
    isUpdatingRef,
    combatQueueLength: stateProtection.current.getQueueLength('combat-end'),
    stateProtection
  };
};
