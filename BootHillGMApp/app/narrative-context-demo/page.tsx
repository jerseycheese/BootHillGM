'use client';

import { useState } from 'react';
import OptimizedNarrativeDisplay from '../components/OptimizedNarrativeDisplay';
import GamePromptWithOptimizedContext from '../components/GamePromptWithOptimizedContext';
import { useNarrative } from '../context/NarrativeContext';
import { NarrativeProvider } from '../hooks/narrative/NarrativeProvider';
import { estimateTokenCount } from '../utils/narrative';

/**
 * Error boundary component for catching runtime errors
 */
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded">
    <h2 className="text-lg font-bold text-red-700">Error</h2>
    <p className="text-red-700">
      Error loading narrative context: {error.message}
    </p>
  </div>
);

/**
 * The main content component that uses the NarrativeContext
 */
const NarrativeContent = () => {
  // Use the narrative context
  const { state } = useNarrative();
  
  // Component state
  const [isShowingOriginal, setIsShowingOriginal] = useState(false);
  
  // Calculate metrics for comparison
  const originalContext = (state.narrative?.narrativeHistory || []).join('\n'); // Access via narrative slice with fallback
  const originalTokenCount = estimateTokenCount(originalContext);
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Narrative Context Optimization Demo</h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="text-lg font-bold mb-2">About This Demo</h2>
        <p className="mb-2">
          This page demonstrates the narrative context optimization system, which improves 
          AI responses by providing more relevant, focused context. The system extracts,
          prioritizes, and compresses information to fit more meaningful context into 
          the token limit, resulting in better AI responses.
        </p>
        <p>
          The optimization system addresses the stale context issue (#210) by ensuring recent 
          narrative elements are properly weighted and included in the AI context.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold mb-3">Optimized Context</h2>
          <div className="h-full">
            <OptimizedNarrativeDisplay />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-3">
            {isShowingOriginal ? 'Original Context' : 'Game Prompt with Optimization'}
          </h2>
          <div className="h-full">
            {isShowingOriginal ? (
              <div className="p-4 border rounded bg-gray-50 max-h-96 overflow-auto">
                <div className="whitespace-pre-wrap font-mono text-sm">
                  {originalContext || 'No original context available.'}
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-3 text-sm text-gray-600">
                  This component uses the optimized context when making AI requests.
                </p>
                <GamePromptWithOptimizedContext />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">Comparison</h2>
        <button 
          className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          onClick={() => setIsShowingOriginal(!isShowingOriginal)}
        >
          {isShowingOriginal ? 'Show Game Prompt' : 'Show Original Context'}
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded bg-white shadow-sm">
            <h3 className="font-bold text-lg mb-2">Original Context</h3>
            <p className="text-sm text-gray-600 mb-1">Length: {originalContext.length} characters</p>
            <p className="text-sm text-gray-600 mb-1">Tokens: ~{originalTokenCount}</p>
            <p className="text-sm text-gray-600">Entries: {state.narrative?.narrativeHistory?.length || 0}</p>
          </div>
          
          <div className="p-4 border rounded bg-white shadow-sm">
            <h3 className="font-bold text-lg mb-2">Optimized Context</h3>
            <p className="text-sm text-gray-600 mb-1">Compression: Up to 60%</p>
            <p className="text-sm text-gray-600 mb-1">Content Prioritization: Yes</p>
            <p className="text-sm text-gray-600">Decision Integration: Yes</p>
          </div>
          
          <div className="p-4 border rounded bg-white shadow-sm">
            <h3 className="font-bold text-lg mb-2">Key Benefits</h3>
            <ul className="text-sm text-gray-600 list-disc pl-5">
              <li>More relevant context for AI</li>
              <li>Better narrative continuity</li>
              <li>Improved decision relevance</li>
              <li>Optimized token usage</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-3">Debug Tools</h2>
        <p className="mb-2">
          In development mode, you can access debugging tools for narrative context optimization
          through the browser console:
        </p>
        <div className="bg-gray-800 text-gray-100 p-3 rounded font-mono text-sm">
          {/* Show current optimized context with stats */}
          <div>window.bhgmDebug.narrativeContext.showOptimizedContext();</div>
          <div className="mt-2">
            {/* Test different compression levels */}
            window.bhgmDebug.narrativeContext.testCompression(&apos;Your text here&apos;);
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4 mt-8 text-sm text-gray-600">
        <p>
          This narrative context optimization system was implemented to address issue #167 
          (Narrative Context Optimization) and fix issue #210 (Stale context in AI decisions).
        </p>
      </div>
    </div>
  );
};

/**
 * Demo page for narrative context optimization
 * Showcases the different optimization modes and provides metrics
 */
export default function NarrativeContextDemoPage() {
  // Wrap the component with NarrativeProvider and error handling
  try {
    return (
      <NarrativeProvider>
        <NarrativeContent />
      </NarrativeProvider>
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Error in NarrativeContextDemoPage:', error.message);
    return <ErrorFallback error={error} />;
  }
}
