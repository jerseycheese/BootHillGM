import React from 'react';

interface DevToolsHeaderProps {
  isPanelCollapsed: boolean;
  toggleDevPanel: () => void;
}

/**
 * Header component for the DevTools panel with collapse toggle functionality
 */
const DevToolsHeader: React.FC<DevToolsHeaderProps> = ({ 
  isPanelCollapsed, 
  toggleDevPanel 
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">DevTools</h2>
      <button 
        onClick={toggleDevPanel} 
        className="p-1 rounded hover:bg-gray-700"
        aria-label="Toggle DevTools Panel"
      >
        {isPanelCollapsed ? 
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg> : 
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        }
      </button>
    </div>
  );
};

export default DevToolsHeader;