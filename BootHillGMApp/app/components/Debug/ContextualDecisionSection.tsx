// components/Debug/ContextualDecisionSection.tsx
import React, { useState } from "react";
import { ContextualDecisionSectionProps } from "../../types/debug.types";
import { LocationType } from "../../services/locationService";

/**
 * Contextual Decision Testing UI component
 * Allows selecting location types and triggering AI decisions
 */
const ContextualDecisionSection: React.FC<ContextualDecisionSectionProps> = ({
  selectedLocationType,
  setSelectedLocationType,
  loading,
  hasActiveDecision,
  handleContextualDecision
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  /**
   * Toggles visibility of the contextual decision testing panel
   */
  const toggleContextualPanel = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="w-full mt-2 p-2 border border-gray-700 rounded bg-gray-900">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold">Contextual Decision Testing</h3>
        <button
          onClick={toggleContextualPanel}
          className="p-1 rounded hover:bg-gray-700"
          aria-label="Toggle Decision Testing Panel"
        >
          {isCollapsed ? 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg> : 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          }
        </button>
      </div>
      
      {!isCollapsed && (
        <>
          <div className="mb-3">
            <label className="block text-sm mb-1" htmlFor="location-type">Location Type:</label>
            <select
              id="location-type"
              className="bg-gray-700 text-white p-1 rounded w-full"
              value={selectedLocationType.type}
              onChange={(e) => {
                const selectedValue = e.target.value;
                let newLocation: LocationType;
                switch (selectedValue) {
                  case 'town':
                    newLocation = { type: 'town', name: 'Some Town' };
                    break;
                  case 'wilderness':
                    newLocation = { type: 'wilderness', description: 'Some Wilderness' };
                    break;
                  case 'ranch':
                    newLocation = { type: 'landmark', name: 'Some Ranch' };
                    break;
                  case 'mine':
                    newLocation = { type: 'landmark', name: 'Some Mine' };
                    break;
                  case 'camp':
                    newLocation = { type: 'landmark', name: 'Some Camp' };
                    break;
                  default:
                    newLocation = { type: 'unknown' };
                }
                setSelectedLocationType(newLocation);
              }}
              aria-label="Location Type:"
            >
              <option value="town">Town</option>
              <option value="wilderness">Wilderness</option>
              <option value="ranch">Ranch</option>
              <option value="mine">Mine</option>
              <option value="camp">Camp</option>
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              className="bg-teal-600 hover:bg-teal-800 text-white font-bold py-2 px-4 rounded relative"
              onClick={() => handleContextualDecision()}
              disabled={loading === "contextual-decision" || hasActiveDecision}
            >
              <span className={loading === "contextual-decision" ? "opacity-0" : ""}>
                Trigger Contextual Decision
              </span>
              {loading === "contextual-decision" && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-block w-5 h-5 border-t-2 border-white rounded-full animate-spin"></span>
                  <span className="ml-2">Generating...</span>
                </span>
              )}
            </button>

            <div className="text-xs text-gray-400 mt-2">
              This generates decisions based on current game state and narrative context.
              Console command: <code>window.bhgmDebug.triggerDecision(&apos;town&apos;)</code>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContextualDecisionSection;