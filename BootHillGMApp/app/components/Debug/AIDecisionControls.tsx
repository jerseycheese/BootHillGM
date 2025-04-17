'use client';

import React, { useState, useEffect } from 'react';
import { 
  DecisionGenerationMode, 
  getDecisionGenerationMode, 
  setDecisionGenerationMode 
} from '../../utils/contextualDecisionGenerator';

/**
 * Props for AIDecisionControls component
 */
interface AIDecisionControlsProps {
  /**
   * Function to trigger an AI-powered decision
   */
  onGenerateDecision: () => void;
  
  /**
   * Whether a decision is currently being generated
   */
  isGenerating?: boolean;
  
  /**
   * Current detection score (if available)
   */
  detectionScore?: number;
}

/**
 * Component for controlling AI-driven decision generation in DevTools
 */
const AIDecisionControls: React.FC<AIDecisionControlsProps> = ({
  onGenerateDecision,
  isGenerating = false,
  detectionScore
}) => {
  // Track panel expanded state
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Track current generation mode
  const [generationMode, setGenerationMode] = useState<DecisionGenerationMode>(
    getDecisionGenerationMode()
  );
  
  // Update UI when generation mode changes externally
  useEffect(() => {
    const currentMode = getDecisionGenerationMode();
    if (currentMode !== generationMode) {
      setGenerationMode(currentMode);
    }
  }, [generationMode]);
  
  // Handle mode change
  const handleModeChange = (mode: DecisionGenerationMode) => {
    setDecisionGenerationMode(mode);
    setGenerationMode(mode);
  };
  
  return (
    <div className="w-full mt-2 p-2 border border-gray-700 rounded bg-gray-900">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold">AI Decision System</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded hover:bg-gray-700"
          aria-label="Toggle AI Decision Controls"
        >
          {isExpanded ? 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg> : 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          }
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-3">
          {/* Generation Mode Selection */}
          <div>
            <label className="block text-sm mb-1">Decision Generation Mode:</label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded ${generationMode === 'template' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => handleModeChange('template')}
                title="Use only template-based decision generation"
              >
                Template
              </button>
              <button
                className={`px-3 py-1 rounded ${generationMode === 'ai' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => handleModeChange('ai')}
                title="Use only AI-driven decision generation"
              >
                AI Only
              </button>
              <button
                className={`px-3 py-1 rounded ${generationMode === 'hybrid' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => handleModeChange('hybrid')}
                title="Use AI with template fallback"
              >
                Hybrid
              </button>
            </div>
          </div>
          
          {/* AI Decision Generator Button */}
          <div>
            <button
              className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded"
              onClick={onGenerateDecision}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating AI Decision...' : 'Generate AI Decision'}
            </button>
          </div>
          
          {/* Detection Score Display */}
          {detectionScore !== undefined && (
            <div className="flex items-center mt-2">
              <div className="text-sm mr-2">Detection Score:</div>
              <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    detectionScore >= 0.65 ? 'bg-green-500' : 
                    detectionScore >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, detectionScore * 100))}%` }}
                />
              </div>
              <div className="text-sm ml-2">{(detectionScore * 100).toFixed(0)}%</div>
            </div>
          )}
          
          {/* Documentation Section */}
          <div className="text-xs text-gray-400 mt-2">
            <div>The AI decision system analyzes narrative context and game state to generate decisions that feel natural and relevant.</div>
            <div className="mt-1">
              <strong>Modes:</strong>
              <ul className="mt-1 ml-4 list-disc">
                <li><span className="text-blue-400">Template</span>: Uses the pre-defined decision templates only</li>
                <li><span className="text-blue-400">AI Only</span>: Uses Gemini AI to generate contextual decisions</li>
                <li><span className="text-blue-400">Hybrid</span>: Combines AI with template fallbacks for reliability</li>
              </ul>
            </div>
            <div className="mt-1">
              <strong>Console API:</strong>
              <ul className="mt-1 ml-4 list-disc">
                <li><code>window.bhgmDebug.decisions.setMode(&apos;ai&apos;|&apos;template&apos;|&apos;hybrid&apos;)</code></li>
                <li><code>window.bhgmDebug.decisions.generateDecision(gameState, locationType)</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDecisionControls;