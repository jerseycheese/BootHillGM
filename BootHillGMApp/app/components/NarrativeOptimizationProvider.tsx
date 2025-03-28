'use client';

import { useEffect } from 'react';
import { applyGameServiceOptimization } from '../services/ai/gameServiceOptimizationPatch';
import { registerNarrativeContextDebugTools } from '../utils/narrative';
import { CompressionLevel } from '../types/narrative/context.types';

/**
 * Interface for optimization metrics
 */
interface OptimizationMetrics {
  tokenSavings: number[];
  compressionRatios: number[];
  processingTimes: number[];
  record: (originalLength: number, optimizedLength: number, processingTime: number) => void;
  getSummary: () => OptimizationSummary;
  reset: () => void;
}

/**
 * Interface for optimization summary
 */
interface OptimizationSummary {
  avgTokenSaving: number;
  avgCompressionRatio: string;
  avgProcessingTime: string;
  totalSamples: number;
  totalTokensSaved: number;
}

/**
 * NarrativeOptimizationProvider
 * 
 * This component initializes the narrative context optimization system,
 * applying the game service patch and registering debug tools.
 * 
 * It should be included high in the component tree, typically in the app's layout.
 */
export default function NarrativeOptimizationProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  useEffect(() => {
    // Apply the game service optimization patch
    applyGameServiceOptimization();
    
    // Register debugging tools for development
    if (process.env.NODE_ENV !== 'production') {
      registerNarrativeContextDebugTools();
    }
    
    // Setup optimization telemetry
    setupOptimizationTelemetry();
    
    // Log success message
    console.info('📚 Narrative context optimization initialized');
  }, []);
  
  /**
   * Setup telemetry for optimization metrics
   */
  function setupOptimizationTelemetry() {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      // Ensure debug namespace exists
      if (!window.bhgmDebug) {
        // Initialize with required properties to match the interface
        window.bhgmDebug = {
          version: '1.0.0',
          triggerDecision: () => {},
          clearDecision: () => {},
          listLocations: () => [], // Return empty array
          sendCommand: () => {}
        };
      }
      
      // Add optimization metrics to debug namespace
      if (!window.bhgmDebug.narrativeContext) {
        const debugObject = window.bhgmDebug;
        
        // Create metrics object
        const metrics: OptimizationMetrics = {
          tokenSavings: [],
          compressionRatios: [],
          processingTimes: [],
          
          // Record new metric
          record(originalLength: number, optimizedLength: number, processingTime: number) {
            const tokenSaving = originalLength - optimizedLength;
            const compressionRatio = originalLength > 0 
              ? (tokenSaving / originalLength) 
              : 0;
              
            this.tokenSavings.push(tokenSaving);
            this.compressionRatios.push(compressionRatio);
            this.processingTimes.push(processingTime);
            
            // Keep only last 100 metrics
            if (this.tokenSavings.length > 100) {
              this.tokenSavings.shift();
              this.compressionRatios.shift();
              this.processingTimes.shift();
            }
          },
          
          // Get summary of metrics
          getSummary() {
            const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);
            const avg = (arr: number[]): number => arr.length ? sum(arr) / arr.length : 0;
            
            return {
              avgTokenSaving: Math.round(avg(this.tokenSavings)),
              avgCompressionRatio: (avg(this.compressionRatios) * 100).toFixed(1) + '%',
              avgProcessingTime: avg(this.processingTimes).toFixed(2) + 'ms',
              totalSamples: this.tokenSavings.length,
              totalTokensSaved: sum(this.tokenSavings)
            };
          },
          
          // Reset metrics
          reset() {
            this.tokenSavings = [];
            this.compressionRatios = [];
            this.processingTimes = [];
            console.info('Narrative optimization metrics reset');
          }
        };
        
        // Create the analyze history function
        const analyzeHistory = () => {
          try {
            const state = debugObject.getState?.();
            
            if (!state?.narrative?.narrativeHistory) {
              console.error('No narrative history available');
              return undefined;
            }
            
            const history = state.narrative.narrativeHistory;
            
            return {
              totalEntries: history.length,
              totalChars: history.join(' ').length,
              avgEntryLength: Math.round(history.join(' ').length / history.length)
            };
          } catch (error) {
            console.error('Error analyzing history:', error);
            return undefined;
          }
        };
        
        // Add to debug namespace using Object.assign to preserve existing props
        debugObject.narrativeContext = Object.assign({
          // Required methods from NarrativeContextDebugTools interface
          showOptimizedContext: () => undefined,
          testCompression: () => undefined,
          compareTokenEstimation: () => ({ message: 'Not implemented' }),
          benchmarkCompressionEfficiency: () => ({ message: 'Not implemented' }),
          getOptimalCompression: () => 'medium' as CompressionLevel,
          
          // Our added functionality
          metrics,
          analyzeHistory
        }, debugObject.narrativeContext || {});
      }
    }
  }
  
  // This component doesn't render anything visible
  return <>{children}</>;
}
