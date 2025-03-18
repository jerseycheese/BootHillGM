/**
 * Optimization Types
 * 
 * This file contains type definitions for optimization-related functionality
 * in the BootHillGM application.
 */

import { CompressionLevel } from './narrative/context.types';

/**
 * Result of a compression benchmark test
 */
export interface CompressionBenchmarkResult {
  level: CompressionLevel;
  originalLength: number;
  resultLength: number;
  compressionRatio: string;
  processingTime: string;
}

/**
 * Result of comparing different token estimators
 */
export interface EstimatorComparisonResult {
  text: string;
  length: number;
  basicEstimate: number;
  enhancedEstimate: number;
  difference: number;
  diffPercentage: string;
}

/**
 * Interface for optimization metric averages
 */
export interface OptimizationAverages {
  avgTokenSaving: number;
  avgCompressionRatio: string;
  avgProcessingTime: string;
  sampleCount: number;
}
