/**
 * Narrative Context Debug Tools
 * 
 * Provides development tools for debugging and optimizing narrative context.
 * These tools are only available in development mode.
 */

import { CompressionLevel } from '../../types/narrative/context.types';
import { 
  compressNarrativeText, 
  estimateTokenCount
} from './narrativeCompression';
import { buildNarrativeContext } from './narrativeContextBuilder';
import { NarrativeContextDebugTools as DebugToolsInterface } from '../../types/global';
import { EstimatorComparisonResult, CompressionBenchmarkResult } from '../../types/optimization.types';

/**
 * Registers narrative context debug tools in the global namespace
 * 
 * This function is only meant to be used in development mode
 */
export function registerNarrativeContextDebugTools(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') {
    return;
  }
  
  // Ensure debug namespace exists
  if (!window.bhgmDebug) {
    window.bhgmDebug = {
      version: '1.0.0',
      triggerDecision: () => {},
      clearDecision: () => {},
      listLocations: () => [],
      sendCommand: () => {}
    };
  }
  
  // Create debug tools matching the interface from global.d.ts
  const debugTools: DebugToolsInterface = {
    /**
     * Shows the current optimized context in the console
     */
    showOptimizedContext: () => {
      try {
        // Attempt to get current state
        const state = window.bhgmDebug?.getState?.();
        
        if (!state?.narrative) {
          console.error('Cannot access narrative state');
          return undefined;
        }
        
        console.group('Optimized Narrative Context');
        
        // Build and show optimized context
        const result = buildNarrativeContext(state.narrative);
        
        // Display stats in a structured way if needed, or return them
        console.table({ // Example: Removed table logging
          'Token Estimate': result.tokenEstimate,
          'History Entries': result.includedElements.historyEntries,
          'Decisions': result.includedElements.decisions,
          'Characters': result.includedElements.characters.join(', '),
          'Compression Ratio': `${Math.round(result.metadata.compressionRatio * 100)}%`,
          'Build Time': `${result.metadata.buildTime.toFixed(2)}ms`
        });
        
        console.groupEnd();
        
        return {
          formattedContext: result.formattedContext,
          tokenEstimate: result.tokenEstimate,
          metadata: {
            compressionRatio: result.metadata.compressionRatio,
            buildTime: result.metadata.buildTime
          },
          includedElements: {
            historyEntries: result.includedElements.historyEntries,
            decisions: result.includedElements.decisions,
            characters: result.includedElements.characters
          }
        };
      } catch (error) {
        console.error('Error showing optimized context:', error);
        return undefined;
      }
    },
    
    /**
     * Tests compression on a text sample across all levels
     */
    testCompression: (text: string) => {
      try {
        const compressionLevels: CompressionLevel[] = ['none', 'low', 'medium', 'high'];
        const results = compressionLevels.map(level => {
          const compressed = compressNarrativeText(text, level);
          
          return {
            level,
            compressed,
            originalLength: text.length
          };
        });
        
        console.group('Compression Test Results');
        console.groupEnd();
        
        return results;
      } catch (error) {
        console.error('Error testing compression:', error);
        return undefined;
      }
    },
    
    /**
     * Compares token estimation with actual token count
     * Note: Currently uses our estimation method as actual tokens are not available
     */
    compareTokenEstimation: (text: string): EstimatorComparisonResult | { message: string } => {
      try {
        const basicEstimate = Math.ceil(text.length / 4); // Simple character-based estimate
        const enhancedEstimate = estimateTokenCount(text); // Our more sophisticated estimate
        
        const result: EstimatorComparisonResult = {
          text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
          length: text.length,
          basicEstimate,
          enhancedEstimate,
          difference: enhancedEstimate - basicEstimate,
          diffPercentage: `${Math.round(Math.abs(enhancedEstimate - basicEstimate) / 
            (basicEstimate > 0 ? basicEstimate : 1) * 100)}%`
        };
        
        // Log comparison result if needed
        // Example: Removed table logging
        
        return result;
      } catch (error) {
        console.error('Error comparing token estimation:', error);
        return { message: 'Error comparing token estimation methods.' };
      }
    },
    
    /**
     * Benchmarks compression efficiency across different levels
     */
    benchmarkCompressionEfficiency: (sampleSize: number = 5): CompressionBenchmarkResult[] | { message: string } => {
      try {
        // Attempt to get current state
        const state = window.bhgmDebug?.getState?.();
        
        if (!state?.narrative?.narrativeHistory) {
          return { message: 'No narrative history available for benchmark' };
        }
        
        // Get sample of history
        const history = state.narrative.narrativeHistory;
        const samples = history.slice(-Math.min(sampleSize, history.length));
        
        if (samples.length === 0) {
          return { message: 'No samples available for benchmark' };
        }
        
        // Test each compression level
        const compressionLevels: CompressionLevel[] = ['none', 'low', 'medium', 'high'];
        const results: CompressionBenchmarkResult[] = [];
        
        compressionLevels.forEach(level => {
          let totalOriginalLength = 0;
          let totalCompressedLength = 0;
          let totalTime = 0;
          
          // Process each sample
          samples.forEach(sample => {
            const start = performance.now();
            const compressed = compressNarrativeText(sample, level);
            const end = performance.now();
            
            totalOriginalLength += sample.length;
            totalCompressedLength += compressed.length;
            totalTime += (end - start);
          });
          
          // Calculate averages
          const compressionRatio = totalOriginalLength > 0 
            ? 1 - (totalCompressedLength / totalOriginalLength) 
            : 0;
          
          results.push({
            level,
            originalLength: totalOriginalLength,
            resultLength: totalCompressedLength,
            compressionRatio: `${(compressionRatio * 100).toFixed(1)}%`,
            processingTime: `${(totalTime / samples.length).toFixed(2)}ms`
          });
        });
        
        // Log benchmark results if needed
        // Example: Removed table logging
        
        return results;
      } catch (error) {
        console.error('Error in benchmark:', error);
        return { message: 'Error during benchmark' };
      }
    },
    
    /**
     * Gets the optimal compression level based on history length
     */
    getOptimalCompression: (): CompressionLevel => {
      // Try to get history length from state
      let historyLength = 0;
      
      if (window.bhgmDebug?.getState) {
        const state = window.bhgmDebug.getState();
        historyLength = state?.narrative?.narrativeHistory?.length || 0;
      }
      
      // Recommend compression level based on history length
      if (historyLength <= 5) {
        return 'low';
      } else if (historyLength <= 15) {
        return 'medium';
      } else {
        return 'high';
      }
    }
  };
  
  // Register debug tools
  window.bhgmDebug.narrativeContext = Object.assign(
    debugTools,
    window.bhgmDebug.narrativeContext || {}
  );
  
  console.info('📚🔍 Narrative context debug tools registered');
}

// Export the type for use in other files
export type { DebugToolsInterface as NarrativeContextDebugTools };
