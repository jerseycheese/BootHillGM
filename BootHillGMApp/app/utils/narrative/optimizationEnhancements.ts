/**
 * Narrative Context Optimization Enhancements
 * 
 * This file provides additional utilities and enhancements for the narrative context
 * optimization system, including telemetry, debugging tools, and performance improvements.
 */

import { NarrativeState } from '../../types/narrative.types';
import { CompressionLevel, NarrativeContextOptions } from '../../types/narrative/context.types';
import { EstimatorComparisonResult, CompressionBenchmarkResult, OptimizationAverages } from '../../types/optimization.types';
import { estimateTokenCount } from './narrativeCompression';

/**
 * Interface for cached context entry
 */
interface CachedContextEntry {
  context: string;
  timestamp: number;
  tokenEstimate: number;
}

/**
 * Cache for narrative context optimization
 * Reduces duplicate context building operations
 */
export class AdaptiveContextCache {
  private cache: Map<string, CachedContextEntry> = new Map();
  
  private maxSize: number;
  private ttlMs: number;
  
  /**
   * Creates a new adaptive context cache
   * 
   * @param maxSize Maximum number of cached items (default: 30)
   * @param ttlMs Time-to-live in milliseconds (default: 30000 - 30 seconds)
   */
  constructor(maxSize = 30, ttlMs = 30000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }
  
  /**
   * Gets a cached context if available
   * 
   * @param key Cache key
   * @returns Cached context or undefined if not found
   */
  get(key: string): string | undefined {
    this.cleanExpired();
    
    const cached = this.cache.get(key);
    if (!cached) return undefined;
    
    // Update timestamp on access to implement LRU behavior
    cached.timestamp = Date.now();
    return cached.context;
  }
  
  /**
   * Stores a context in the cache
   * 
   * @param key Cache key
   * @param context Context to cache
   * @param tokenEstimate Estimated token count of the context
   */
  set(key: string, context: string, tokenEstimate: number): void {
    this.cleanExpired();
    
    // If we're at capacity, remove least recently used item
    if (this.cache.size >= this.maxSize) {
      let oldestKey = '';
      let oldestTime = Infinity;
      
      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    // Add new context to cache
    this.cache.set(key, {
      context,
      timestamp: Date.now(),
      tokenEstimate
    });
  }
  
  /**
   * Cleans expired entries from the cache
   */
  private cleanExpired(): void {
    const now = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttlMs) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Gets statistics about the cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    avgAge: number;
    totalTokens: number;
  } {
    let totalAge = 0;
    let totalTokens = 0;
    const now = Date.now();
    
    for (const value of this.cache.values()) {
      totalAge += now - value.timestamp;
      totalTokens += value.tokenEstimate;
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this._getHitRate(),
      avgAge: this.cache.size ? totalAge / this.cache.size : 0,
      totalTokens
    };
  }
  
  // Hit rate tracking
  private hits = 0;
  private misses = 0;
  
  /**
   * Tracks a cache hit
   */
  trackHit(): void {
    this.hits++;
  }
  
  /**
   * Tracks a cache miss
   */
  trackMiss(): void {
    this.misses++;
  }
  
  /**
   * Gets the current hit rate
   */
  private _getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }
  
  /**
   * Clears the cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

// Create a global cache instance
export const globalContextCache = new AdaptiveContextCache();

/**
 * Interface for state key in cache
 */
interface StateKeyForCache {
  historyLength: number;
  lastHistoryEntry: string;
  decisionHistoryLength: number;
  lastDecision: string;
  charactersCount: number;
  options: NarrativeContextOptions | Record<string, unknown>;
}

/**
 * Creates a cache key for narrative context
 * 
 * @param narrativeState Narrative state
 * @param options Context options
 * @returns Cache key
 */
export function createContextCacheKey(
  narrativeState: NarrativeState,
  options?: NarrativeContextOptions | Record<string, unknown>
): string {
  // Create a digest of the narrative state and options
  const stateKey: StateKeyForCache = {
    historyLength: narrativeState.narrativeHistory.length,
    lastHistoryEntry: narrativeState.narrativeHistory.slice(-1)[0] || '',
    decisionHistoryLength: narrativeState.narrativeContext?.decisionHistory?.length || 0,
    lastDecision: narrativeState.narrativeContext?.decisionHistory?.slice(-1)[0]?.decisionId || '',
    charactersCount: narrativeState.narrativeContext?.characterFocus?.length || 0,
    options: options || {}
  };
  
  return JSON.stringify(stateKey);
}

/**
 * Enhanced token estimation function that uses a more accurate model
 * 
 * @param text Text to estimate tokens for
 * @returns Estimated token count
 */
export function enhancedTokenEstimation(text: string): number {
  // Basic implementation uses 4 characters per token on average
  // This is a simplified approach - a real implementation would use a more sophisticated model
  if (!text) return 0;
  
  // Count whitespace as 0.25 tokens
  const whitespaceCount = (text.match(/\s/g) || []).length;
  const nonWhitespaceCount = text.length - whitespaceCount;
  
  // Count special characters as 1 token each
  const specialCharCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  
  // Apply the formula: (non-whitespace chars + 0.25*whitespace + special chars) / 4
  return Math.ceil((nonWhitespaceCount + (whitespaceCount * 0.25) + specialCharCount) / 4);
}

/**
 * Get the optimal compression level based on narrative state
 * 
 * @param narrativeState Narrative state
 * @returns Optimal compression level
 */
export function getOptimalCompressionLevel(narrativeState: NarrativeState): CompressionLevel {
  const historyLength = narrativeState.narrativeHistory.length;
  const historyText = narrativeState.narrativeHistory.join(' ');
  const tokenEstimate = estimateTokenCount(historyText);
  
  // Based on token count and history length, determine optimal compression
  if (tokenEstimate > 3000 || historyLength > 30) {
    return 'high';
  } else if (tokenEstimate > 1500 || historyLength > 15) {
    return 'medium';
  } else if (tokenEstimate > 500 || historyLength > 5) {
    return 'low';
  }
  
  return 'none';
}

/**
 * Interface for optimization metrics
 */
interface OptimizationMetrics {
  tokenSavings: number[];
  compressionRatios: number[];
  processingTimes: number[];
  record: (originalLength: number, optimizedLength: number, processingTime: number) => void;
  getAverages: () => OptimizationAverages;
  clear: () => void;
}

/**
 * Interface for debug tools
 */
interface NarrativeContextDebugTools {
  compareEstimators: (text: string) => EstimatorComparisonResult | { message: string };
  benchmarkCompression: (text: string) => CompressionBenchmarkResult[] | { message: string };
  getMetrics: () => OptimizationAverages;
  clearMetrics: () => void;
  metrics: OptimizationMetrics;
  getCacheStats: () => {
    size: number;
    maxSize: number;
    hitRate: number;
    avgAge: number;
    totalTokens: number;
  };
  clearCache: () => void;
}

/**
 * Creates debugging tools for narrative context optimization
 * 
 * @returns Object containing debug tools
 */
export function createNarrativeContextDebugTools(): NarrativeContextDebugTools {
  // Optimization metrics tracking
  const metrics: OptimizationMetrics = {
    tokenSavings: [] as number[],
    compressionRatios: [] as number[],
    processingTimes: [] as number[],
    
    // Record metrics
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
    
    // Get average metrics
    getAverages() {
      const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);
      const avg = (arr: number[]): number => sum(arr) / (arr.length || 1);
      
      return {
        avgTokenSaving: Math.round(avg(this.tokenSavings)),
        avgCompressionRatio: avg(this.compressionRatios).toFixed(2),
        avgProcessingTime: avg(this.processingTimes).toFixed(2),
        sampleCount: this.tokenSavings.length
      };
    },
    
    // Clear metrics
    clear() {
      this.tokenSavings = [];
      this.compressionRatios = [];
      this.processingTimes = [];
    }
  };
  
  return {
    // Compare different token estimators
    compareEstimators: (text: string) => {
      if (!text) return { message: 'No text provided' };
      
      const basic = estimateTokenCount(text);
      const enhanced = enhancedTokenEstimation(text);
      
      return {
        text: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
        length: text.length,
        basicEstimate: basic,
        enhancedEstimate: enhanced,
        difference: enhanced - basic,
        diffPercentage: basic > 0 ? (((enhanced - basic) / basic) * 100).toFixed(1) + '%' : 'N/A'
      };
    },
    
    // Benchmark compression performance
    benchmarkCompression: (text: string) => {
      if (!text) return { message: 'No text provided' };
      
      const levels: CompressionLevel[] = ['none', 'low', 'medium', 'high'];
      
      // Measure performance for each compression level
      const results: CompressionBenchmarkResult[] = levels.map(level => {
        const start = performance.now();
        const result = level === 'none' ? text : text.substring(0, Math.floor(text.length * (1 - (levels.indexOf(level) * 0.1))));
        const end = performance.now();
        
        return {
          level,
          originalLength: text.length,
          resultLength: result.length,
          compressionRatio: (1 - (result.length / text.length)).toFixed(2),
          processingTime: (end - start).toFixed(2)
        };
      });
      
      return results;
    },
    
    // Get optimization metrics
    getMetrics: () => metrics.getAverages(),
    
    // Clear metrics
    clearMetrics: () => metrics.clear(),
    
    // Expose metrics object
    metrics,
    
    // Get cache stats
    getCacheStats: () => globalContextCache.getStats(),
    
    // Clear cache
    clearCache: () => globalContextCache.clear()
  };
}
