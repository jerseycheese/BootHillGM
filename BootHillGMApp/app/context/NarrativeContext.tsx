/**
 * NarrativeContext
 * 
 * Context for narrative state management.
 * This is a compatibility layer for components that haven't been
 * migrated to use GameStateContext directly.
 * 
 * IMPORTANT: This file re-exports from hooks/narrative/NarrativeProvider
 * to avoid circular dependencies.
 */

import { NarrativeContext, useNarrative, NarrativeProvider } from '../hooks/narrative/NarrativeProvider';

// Re-export everything
export { NarrativeContext, useNarrative, NarrativeProvider };
export default NarrativeContext;
