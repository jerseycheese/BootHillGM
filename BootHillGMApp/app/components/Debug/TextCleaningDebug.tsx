import React from 'react';
import { debugTracker } from '../../utils/debugUtils';

export const TextCleaningDebug: React.FC = () => {
  const entries = debugTracker.getEntries();

  if (entries.length === 0) return null;

  return (
    <div className="mt-8 p-4 border-t-2 border-gray-200">
      <h2 className="text-lg font-bold mb-4">Text Cleaning Debug Info</h2>
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={entry.timestamp} className="p-4 bg-gray-50 rounded">
            <div className="font-medium text-sm text-gray-600">
              Source: {entry.source} | Function: {entry.cleaningFunction}
            </div>
            <div className="mt-2 space-y-2">
              <div>
                <div className="text-sm font-medium text-red-600">Original:</div>
                <pre className="text-sm bg-white p-2 rounded">{entry.originalText}</pre>
              </div>
              <div>
                <div className="text-sm font-medium text-green-600">Cleaned:</div>
                <pre className="text-sm bg-white p-2 rounded">{entry.cleanedText}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
