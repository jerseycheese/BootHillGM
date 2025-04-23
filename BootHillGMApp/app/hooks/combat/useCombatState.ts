import { useRef, useState } from 'react';

/**
 * Custom hook for managing the core combat state.
 * 
 * This hook handles:
 * - Initializing and maintaining the combat processing state.
 * - Providing a reference to track whether state updates are in progress.
 * 
 * @returns An object containing the combat state and related functions.
 */
export const useCombatState = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isUpdatingRef = useRef(false);

  return {
    isProcessing,
    setIsProcessing,
    isUpdatingRef
  };
};
