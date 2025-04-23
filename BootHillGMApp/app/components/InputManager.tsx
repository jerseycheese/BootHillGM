/**
 * Handles player input during game sessions.
 * Manages input validation, loading states, and submission.
 * Disables input and shows feedback during processing.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { SuggestedAction } from '../types/campaign';

export default function InputManager({ 
  onSubmit, 
  isLoading, 
  suggestedActions = [] 
}: { 
  onSubmit: (input: string, actionType?: string) => void;
  isLoading: boolean;
  suggestedActions?: SuggestedAction[];
}) {
  const [userInput, setUserInput] = useState('');

  // Debug: Log the suggested actions and their types on component mount and when they change
  useEffect(() => {
  }, [suggestedActions]);

  /**
   * Handles user action submission, either from suggested actions or manual input.
   * Only processes actions when not in loading state and onSubmit handler exists.
   * 
   * @param text - The action text to submit
   * @param actionType - Optional action type
   */
  const handleAction = useCallback((text: string, actionType?: string) => {
    if (!isLoading && onSubmit) {
      // Call onSubmit with the text and action type
      onSubmit(text, actionType);
      // Reset input field after submission
      setUserInput('');
    }
  }, [isLoading, onSubmit]);

  /**
   * Determines the CSS class for a suggested action button based on its type.
   * Maps game action types (like 'combat', 'basic', etc.) to appropriate color classes.
   * 
   * @param type - The type of the suggested action
   * @returns A string containing the CSS class for the button
   */
  const actionClass = (type: string) => {
    const typeClasses = {
      // Primary action types from campaign.ts and extended types
      'combat': 'bg-red-500',
      'basic': 'bg-blue-500',
      'interaction': 'bg-green-500',
      'chaotic': 'bg-black',
      'main': 'bg-blue-500',
      'side': 'bg-green-500', 
      'optional': 'bg-purple-500',
      'danger': 'bg-red-500'
    };
    
    // Debug: Log the type and the class being used
    
    // Use the mapped class or default to gray for unknown types
    const bgClass = typeClasses[type as keyof typeof typeClasses] || 'bg-gray-500';
    
    return `px-3 py-1 text-sm rounded hover:bg-opacity-80 disabled:opacity-50 text-white ${bgClass}`;
  };

  return (
    <div id="bhgmInputManager" data-testid="input-manager" className="wireframe-section space-y-4 bhgm-input-manager">
      {suggestedActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedActions.map((action, index) => {
            // Always log action type for debugging
            
            return (
              <button
                key={`${action.id || `${action.type}-${index}`}`}
                onClick={() => handleAction(action.title, action.type)}
                disabled={isLoading}
                className={actionClass(action.type)}
                title={action.description || action.title}
                data-action-type={action.type} // Add data attribute for easier debugging/testing
              >
                {action.title}
              </button>
            );
          })}
        </div>
      )}

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (userInput.trim()) handleAction(userInput, 'custom');
        }} 
        className="flex flex-col space-y-2"
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className={`wireframe-input px-3 py-2 ${isLoading ? 'opacity-50' : ''}`}
          placeholder="Or type any action..."
          disabled={isLoading}
          aria-label="Custom action input"
        />
        <button 
          type="submit" 
          className={`wireframe-button ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading || !userInput.trim()}
          aria-busy={isLoading}
        >
          {isLoading ? 'Processing...' : 'Take Action'}
        </button>
      </form>
    </div>
  );
}