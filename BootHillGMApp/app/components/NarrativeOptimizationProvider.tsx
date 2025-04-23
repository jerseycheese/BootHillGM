'use client';

/**
 * NarrativeOptimizationProvider
 * 
 * This component applies performance optimizations for narrative context processing
 * and wraps all components that require an optimized narrative rendering engine.
 * 
 * It should be placed high in the component tree but under the main state providers.
 */

import React, { useEffect, useRef, PropsWithChildren } from 'react';
import { applyGameServiceOptimization } from '../services/ai/gameServiceOptimizationPatch';
import { registerNarrativeContextDebugTools } from '../utils/narrative';

/**
 * The NarrativeOptimizationProvider applies optimizations to the narrative 
 * processing system on component mount.
 */
export const NarrativeOptimizationProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Remove unused state variable
  const initRef = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initRef.current) {
      return;
    }
    
    initRef.current = true;
    
    // Apply optimizations
    applyGameServiceOptimization();
    
    // Register debug tools in development mode
    if (process.env.NODE_ENV === 'development') {
      registerNarrativeContextDebugTools();
    }
    
    // Log initialization
    console.info(
      '[NarrativeOptimizationProvider] Narrative context optimization initialized'
    );
  }, []);

  // Render children regardless of initialization state
  return <>{children}</>;
};

export default NarrativeOptimizationProvider;