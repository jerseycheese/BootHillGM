/**
 * Narrative Context Optimization Integration Module
 * 
 * This module integrates all narrative context optimization components
 * into the existing BootHillGM application. It serves as the entry point
 * for consuming the optimized narrative context functionality.
 */

// Re-export all components for easy consumption
export { buildNarrativeContext } from './narrativeContextBuilder';
export { compressNarrativeText, createNarrativeSummaries, createConciseSummary, estimateTokenCount } from './narrativeCompression';
export { 
  useOptimizedNarrativeContext, 
  useMemoizedNarrativeContext,
  enrichPromptWithContext,
  getOptimizedContextForAI,
  useNarrativeContextSynchronization
} from './narrativeContextIntegration';
export { useAIWithOptimizedContext } from './useAIWithOptimizedContext';

// Export optimization enhancements
export { 
  enhancedTokenEstimation,
  AdaptiveContextCache,
  createContextCacheKey,
  getOptimalCompressionLevel,
  createNarrativeContextDebugTools
} from './optimizationEnhancements';

// Export types needed by consumers
export type { 
  NarrativeContextOptions,
  BuiltNarrativeContext,
  CompressionLevel,
  NarrativeSummary,
  ContextSection
} from '../../types/narrative/context.types';

// Import the function directly to avoid circular dependencies
import { getOptimizedContextForAI } from './narrativeContextIntegration';
import { NarrativeState, initialNarrativeState, NarrativeContext } from '../../types/narrative.types';

// Define appropriate types
interface GameServiceInterface {
  getAIResponse: (...args: unknown[]) => Promise<unknown>;
  [key: string]: unknown;
}

// Import BHGMDebug type from global.d.ts
import { BHGMDebug } from '../../types/global';
import { CompressionBenchmarkResult } from '../../types/optimization.types';

// Import directly to avoid scope issues
import { getOptimalCompressionLevel } from './optimizationEnhancements';

/**
 * Interface for window with our debug properties
 */
interface WindowWithDebug extends Window {
  bhgmDebug: BHGMDebug;
}

/**
 * Utility function to configure narrative context optimization with the game service
 * 
 * This function should be called during application initialization to set up
 * the necessary integration between the optimized context and AI service.
 * 
 * @param gameServiceInstance The game service instance (or any service that uses narrative context)
 */
export function setupNarrativeContextOptimization(gameServiceInstance: GameServiceInterface): void {
  // Store original method reference
  const originalGetAIResponse = gameServiceInstance.getAIResponse;
  
  // Wrap original method with optimized context version
  gameServiceInstance.getAIResponse = async function(...args: unknown[]) {
    try {
      const [prompt, journalContext, inventory, storyProgressionContext, narrativeContext] = args as [
        string, 
        string, 
        unknown[], 
        string | undefined, 
        NarrativeContext | undefined
      ];
      
      // Build a complete narrative state using initialNarrativeState as base
      const narrativeState: NarrativeState = {
        ...initialNarrativeState,
        narrativeHistory: journalContext.split('\n').filter(Boolean),
        // Only set narrativeContext if provided
        ...(narrativeContext ? { narrativeContext } : {})
      };
      
      // Get optimized context
      const optimizedContext = getOptimizedContextForAI(
        prompt,
        journalContext,
        narrativeState
      );
      
      // Log optimization metrics in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Using optimized narrative context:', {
          originalLength: journalContext.length,
          optimizedLength: optimizedContext.length,
          compressionRatio: journalContext.length > 0 
            ? (1 - (optimizedContext.length / journalContext.length)).toFixed(2)
            : 'N/A'
        });
      }
      
      // Call original method with optimized context
      return originalGetAIResponse.call(
        gameServiceInstance,
        prompt,
        optimizedContext, // Replace journal context with optimized context
        inventory,
        storyProgressionContext,
        narrativeContext
      );
    } catch (error) {
      // If optimization fails, fall back to original implementation
      console.error('Context optimization failed, using original context:', error);
      return originalGetAIResponse.apply(gameServiceInstance, args);
    }
  };
}

// Import buildNarrativeContext for the debug tools
import { buildNarrativeContext } from './narrativeContextBuilder';
import { createNarrativeContextDebugTools } from './optimizationEnhancements';
import { CompressionLevel, compressNarrativeText } from './narrativeCompression';

/**
 * Registers debugging tools for narrative context
 * This is useful during development to inspect context building
 */
export function registerNarrativeContextDebugTools(): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // Add to global debugging namespace
    const windowWithDebug = window as WindowWithDebug;
    if (!windowWithDebug.bhgmDebug) {
      windowWithDebug.bhgmDebug = {} as BHGMDebug;
    }
    
    // Get enhanced debug tools
    const enhancedTools = createNarrativeContextDebugTools();
    
    // Add context optimization tools
    windowWithDebug.bhgmDebug.narrativeContext = {
      // Build and display optimized context
      showOptimizedContext: () => {
        const state = windowWithDebug.bhgmDebug.getState?.();
        if (!state?.narrative) {
          console.error('No narrative state available');
          return undefined;
        }
        
        const result = buildNarrativeContext(state.narrative);
        
        return result;
      },
      
      // Test different compression levels
      testCompression: (text: string) => {
        if (!text) {
          console.error('No text provided for compression test');
          return undefined;
        }
        
        const levels: CompressionLevel[] = ['none', 'low', 'medium', 'high'];
        const results = levels.map(level => ({
          level,
          compressed: compressNarrativeText(text, level),
          originalLength: text.length
        }));
        
        return results;
      },
      
      // Add enhanced tools
      ...enhancedTools,
      
      // Token estimation comparison
      compareTokenEstimation: (text: string) => {
        return enhancedTools.compareEstimators?.(text) || { message: 'Estimator comparison failed' };
      },
      
      // Benchmark different compression approaches
      benchmarkCompressionEfficiency: (sampleSize?: number): CompressionBenchmarkResult[] | { message: string } | undefined => {
        const state = windowWithDebug.bhgmDebug.getState?.();
        if (!state?.narrative) {
          console.error('No narrative state available');
          return { message: 'No narrative state available' };
        }
        
        // Get sample texts from narrative history
        const samples = state.narrative.narrativeHistory
          .slice(-(sampleSize || 5))
          .filter(Boolean);
        
        if (samples.length === 0) {
          console.error('No samples available for benchmarking');
          return { message: 'No samples available for benchmarking' };
        }
        
        // Run benchmark on each sample
        const results: (CompressionBenchmarkResult[] | { message: string; } | undefined)[] = samples.map(sample => 
          enhancedTools.benchmarkCompression?.(sample)
        ).filter(Boolean);
        
        // If we have array results, flatten them into a single array of CompressionBenchmarkResult
        const flattenedResults: CompressionBenchmarkResult[] = [];
        
        // Process each result
        for (const result of results) {
          if (Array.isArray(result)) {
            // Add each benchmark result to our flattened array
            result.forEach(item => flattenedResults.push(item));
          }
        }
        
        // If we have no results, return error message
        if (flattenedResults.length === 0) {
          return { message: 'Benchmarking produced no valid results' };
        }
        
        console.group('Compression Efficiency Benchmark');
        console.table(flattenedResults);
        console.groupEnd();
        
        return flattenedResults;
      },
      
      // Get optimal compression level for current state
      getOptimalCompression: () => {
        const state = windowWithDebug.bhgmDebug.getState?.();
        if (!state?.narrative) {
          console.error('No narrative state available');
          return 'none' as CompressionLevel;
        }
        
        return getOptimalCompressionLevel(state.narrative);
      }
    };
    
    console.info('Narrative context debug tools registered. Access via window.bhgmDebug.narrativeContext');
  }
}

// Initialize debug tools if in development
if (process.env.NODE_ENV !== 'production') {
  registerNarrativeContextDebugTools();
}
