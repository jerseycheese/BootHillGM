import { NarrativeState as OriginalNarrativeState, initialNarrativeState as originalInitialState } from '../narrative.types';

// Re-export the existing narrative state type
export type NarrativeState = OriginalNarrativeState;

// Re-export the existing initial state
export const initialNarrativeState: NarrativeState = originalInitialState;
