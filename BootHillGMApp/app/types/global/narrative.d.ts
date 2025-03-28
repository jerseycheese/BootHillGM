import { NarrativeGenerationDebug } from '../../hooks/narrative/types';

declare global {
  interface Window {
    __debugNarrativeGeneration?: NarrativeGenerationDebug;
  }
}

export {};
