/**
 * Testing Render Utilities
 * 
 * Provides helper functions for rendering components with context providers
 * for testing.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Options for provider wrapper
 */
interface ProviderOptions {
  // Add your context values here
  gameState?: Record<string, unknown>; 
  combatActive?: boolean;
  narrativeState?: Record<string, unknown>;
}

/**
 * Custom render function that wraps components with all necessary providers
 * 
 * Usage:
 * ```
 * // Basic usage
 * renderWithProviders(<YourComponent />);
 * 
 * // With custom state
 * renderWithProviders(<YourComponent />, {
 *   gameState: { character: { name: 'Test' } },
 *   combatActive: true
 * });
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options: ProviderOptions & Omit<RenderOptions, 'wrapper'> = {}
) {
  // Destructure with defaults but keep ESLint happy by using _destructured names
  // These will be renamed when you implement the context
  const _gameState = options.gameState || {};
  const _combatActive = options.combatActive || false;
  const _narrativeState = options.narrativeState || {};
  
  // Filter out our custom options to get just the render options
  const renderOptions = { ...options };
  delete renderOptions.gameState;
  delete renderOptions.combatActive;
  delete renderOptions.narrativeState;
  
  // Create simple wrapper without context dependencies
  // This avoids errors if the contexts aren't set up yet
  function Wrapper({ children }: { children: React.ReactNode }) {
    // Use a simple wrapper until your contexts are fully implemented
    return <>{children}</>;
    
    // UNCOMMENT THIS CODE WHEN YOUR CONTEXTS ARE READY:
    /*
    // Remove the underscores when uncommenting
    return (
      <GameContext.Provider value={{ state: _gameState, dispatch: jest.fn() }}>
        <CombatContext.Provider value={{ active: _combatActive }}>
          <NarrativeContext.Provider value={{ ..._narrativeState }}>
            {children}
          </NarrativeContext.Provider>
        </CombatContext.Provider>
      </GameContext.Provider>
    );
    */
  }
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Specialized render functions for specific component types
 */

/**
 * Render a character-related component with mock character data
 */
export function renderCharacterComponent(ui: ReactElement, options = {}) {
  return renderWithProviders(ui, {
    gameState: {
      character: {
        current: {
          id: 'test-character',
          name: 'Test Character',
          strength: 10,
          dexterity: 8,
          will: 6,
          health: 20,
          maxHealth: 20
        }
      }
    },
    ...options
  });
}

/**
 * Render a combat-related component with mock combat state
 */
export function renderCombatComponent(ui: ReactElement, options = {}) {
  return renderWithProviders(ui, {
    gameState: {
      combat: {
        active: true,
        type: 'brawling',
        state: {
          round: 1,
          isPlayerTurn: true
        }
      }
    },
    combatActive: true,
    ...options
  });
}
