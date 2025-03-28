/**
 * Global type declarations for narrative features
 */

// Import the type from our module
import { NarrativeGenerationDebug } from './app/hooks/narrative/types';

// Extend the Window interface
declare global {
  interface Window {
    __debugNarrativeGeneration?: NarrativeGenerationDebug;
  }
}

// Export empty object to make this a proper module
export {};