'use client';

import { useState, useEffect } from 'react';
// Removed import { useNarrative } from '../context/NarrativeContext';
import { useGameState } from '../context/GameStateProvider'; // Import correct hook
import { useOptimizedNarrativeContext } from '../utils/narrative';

/**
 * A component that displays narrative content with optimization controls
 * This can be used as an example of how to use the optimization system
 */
export default function OptimizedNarrativeDisplay() {
  // Use the correct state hook
  const { state } = useGameState();
  const { 
    getDefaultContext, 
    getFocusedContext, 
    getCompactContext 
  } = useOptimizedNarrativeContext();
  
  const [optimizedContext, setOptimizedContext] = useState('');
  const [optimizationMode, setOptimizationMode] = useState<'default' | 'focused' | 'compact'>('default');
  const [focusTags, setFocusTags] = useState<string[]>([]);
  
  // Update context when state or optimization mode changes
  useEffect(() => {
    let context = '';
    
    switch (optimizationMode) {
      case 'focused':
        context = getFocusedContext(focusTags);
        break;
      case 'compact':
        context = getCompactContext();
        break;
      case 'default':
      default:
        context = getDefaultContext();
        break;
    }
    
    setOptimizedContext(context);
  }, [
    optimizationMode,
    focusTags,
    getDefaultContext,
    getFocusedContext,
    getCompactContext,
    // Access properties via the narrative slice
    state.narrative?.narrativeHistory,
    state.narrative?.narrativeContext
  ]);
  
  // Handle focus tag changes
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFocusTags(tags);
  };
  
  return (
    <div className="narrative-display">
      <div className="controls mb-4">
        <h3 className="text-lg font-bold mb-2">Narrative Context Optimization</h3>
        
        <div className="flex gap-3 mb-3">
          <button
            className={`px-3 py-1 rounded ${optimizationMode === 'default' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setOptimizationMode('default')}
          >
            Default
          </button>
          <button
            className={`px-3 py-1 rounded ${optimizationMode === 'focused' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setOptimizationMode('focused')}
          >
            Focused
          </button>
          <button
            className={`px-3 py-1 rounded ${optimizationMode === 'compact' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setOptimizationMode('compact')}
          >
            Compact
          </button>
        </div>
        
        {optimizationMode === 'focused' && (
          <div className="mb-3">
            <label className="block mb-1 text-sm">
              Focus Tags (comma-separated):
            </label>
            <input
              type="text"
              className="w-full px-2 py-1 border rounded"
              placeholder="character:Sheriff, town:Redemption"
              onChange={handleTagChange}
            />
          </div>
        )}
      </div>
      
      <div className="context-display p-4 border rounded bg-gray-50 max-h-96 overflow-auto">
        <div className="whitespace-pre-wrap font-mono text-sm">
          {optimizedContext || 'No narrative context available.'}
        </div>
      </div>
      
      <div className="stats mt-4 text-sm text-gray-600">
        <p>Narrative History Entries: {state.narrative?.narrativeHistory?.length || 0}</p>
        <p>Decision History Entries: {state.narrative?.narrativeContext?.decisionHistory?.length || 0}</p>
        <p>Character Focus: {state.narrative?.narrativeContext?.characterFocus?.join(', ') || 'None'}</p>
        <p>Optimization Mode: {optimizationMode}</p>
        {optimizationMode === 'focused' && (
          <p>Focus Tags: {focusTags.join(', ') || 'None'}</p>
        )}
      </div>
    </div>
  );
}
