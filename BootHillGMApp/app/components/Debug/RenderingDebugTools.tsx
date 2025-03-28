import React from 'react';

interface RenderingDebugToolsProps {
  renderCount: number;
  forceRender: () => void;
  showDecisionHistory: boolean;
  setShowDecisionHistory: (show: boolean) => void;
}

/**
 * Debug tools for triggering re-renders and showing/hiding decision history
 */
const RenderingDebugTools: React.FC<RenderingDebugToolsProps> = ({
  renderCount,
  forceRender,
  showDecisionHistory,
  setShowDecisionHistory
}) => {
  return (
    <div className="w-full mt-2 p-2 border border-gray-600 rounded bg-gray-900">
      <h3 className="text-md font-semibold mb-2">Rendering Debug</h3>
      <div className="flex gap-2 flex-wrap">
        <button
          className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded"
          onClick={forceRender}
        >
          Force Re-render (#{renderCount})
        </button>
        
        <button
          className={`${showDecisionHistory ? 'bg-yellow-500' : 'bg-gray-500'} hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded`}
          onClick={() => setShowDecisionHistory(!showDecisionHistory)}
        >
          {showDecisionHistory ? 'Hide History Debug' : 'Show History Debug'}
        </button>
      </div>
    </div>
  );
};

export default RenderingDebugTools;