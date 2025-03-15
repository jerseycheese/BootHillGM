// components/Debug/NarrativeDebugPanel.tsx
import React from "react";
import { NarrativeDebugPanelProps } from "../../types/debug.types";

/**
 * Debug panel showing narrative context, decision history, and current decision information
 */
const NarrativeDebugPanel: React.FC<NarrativeDebugPanelProps> = ({
  narrativeContext,
  renderCount,
  showDecisionHistory,
  decisionHistory
}) => {

  return (
    <div className="mb-4 p-2 border border-gray-700 rounded">
      <h3 className="text-md font-semibold mb-2">Narrative Context Status</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="font-medium">Has Active Decision:</div>
        <div>{narrativeContext.state.currentDecision ? '✅ Yes' : '❌ No'}</div>

        <div className="font-medium">Decision Records:</div>
        <div className="flex items-center gap-2">
          {decisionHistory.length || 0}
          <span className="text-xs text-gray-400">{decisionHistory.length ? '(click Show History Debug)' : ''}</span>
        </div>

        <div className="font-medium">Narrative History:</div>
        <div>{narrativeContext.state.narrativeHistory.length} entries</div>

        <div className="font-medium">Re-render Count:</div>
        <div>{renderCount}</div>

        <div className="font-medium">Context State:</div>
        <div className="flex items-center gap-2">
          {narrativeContext.state.narrativeContext ? '✅ Initialized' : '❌ Missing'}
        </div>
      </div>

      {/* Decision History Debug */}
      {showDecisionHistory && decisionHistory.length > 0 && (
        <div className="mt-4 bg-gray-900 p-2 rounded">
          <h4 className="font-medium border-b border-gray-700 pb-1 mb-2">Decision History ({decisionHistory.length} records)</h4>
          {decisionHistory.map((record, index) => (
            <div key={record.decisionId} className="text-xs mb-3 pb-2 border-b border-gray-700 last:border-none">
              <div className="font-semibold">#{index + 1}: {record.decisionId.slice(0, 10)}...</div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <div className="text-gray-400">Option:</div>
                <div className="col-span-2">{record.selectedOptionId}</div>

                <div className="text-gray-400">Impact:</div>
                <div className="col-span-2">{record.impactDescription.slice(0, 40)}...</div>

                <div className="text-gray-400">Tags:</div>
                <div className="col-span-2 flex flex-wrap gap-1">
                  {record.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="bg-gray-700 px-1 rounded-sm">{tag}</span>
                  ))}
                  {record.tags.length > 3 && <span className="text-gray-500">+{record.tags.length - 3} more</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Decision Info */}
      {narrativeContext.state.currentDecision && (
        <div className="mt-2 p-2 bg-gray-700 rounded">
          <h4 className="font-medium">Current Decision:</h4>
          <div className="text-xs mt-1">
            <div><span className="font-medium">ID:</span> {narrativeContext.state.currentDecision.id}</div>
            <div><span className="font-medium">Prompt:</span> {narrativeContext.state.currentDecision.prompt}</div>
            <div><span className="font-medium">Importance:</span> {narrativeContext.state.currentDecision.importance}</div>
            <div><span className="font-medium">Options:</span> {narrativeContext.state.currentDecision.options.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NarrativeDebugPanel;