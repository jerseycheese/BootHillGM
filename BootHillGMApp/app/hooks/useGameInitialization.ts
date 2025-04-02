// /app/hooks/useGameInitialization.ts
/**
 * Main hook for game initialization
 * This is a wrapper around useGameSession to maintain backward compatibility
 * while reducing the overall file size through modularization
 */
import { useGameSession } from "./initialization/useGameSession";

/**
 * Hook to handle game session initialization and state management
 * This hook delegates to useGameSession for the actual initialization logic
 * 
 * Responsibilities:
 * - Initialize new character game sessions
 * - Restore existing game sessions
 * - Generate suggested actions for the player
 * - Handle errors and provide fallback states
 * - Manage client-side initialization state
 * 
 * @returns Object containing initialization state flags
 */
export const useGameInitialization = (): { isInitializing: boolean; isClient: boolean } => {
  // Delegate to the modularized implementation
  return useGameSession();
};
