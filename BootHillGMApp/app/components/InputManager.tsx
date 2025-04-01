/**
 * Handles player input during game sessions.
 * Manages input validation, loading states, and submission.
 * Disables input and shows feedback during processing.
 */
import React, { useState, useCallback } from 'react';
import { SuggestedAction } from '../types/campaign';

export default function InputManager({ 
  onSubmit, 
  isLoading, 
  suggestedActions = [] 
}: { 
  onSubmit: (input: string) => void;
  isLoading: boolean;
  suggestedActions?: SuggestedAction[];
}) {
  const [userInput, setUserInput] = useState('');

  const handleAction = useCallback((text: string) => {
    if (!isLoading) {
      onSubmit(text);
      setUserInput('');
    }
  }, [isLoading, onSubmit]);

  /**
   * Determines the CSS class for a suggested action button based on its type.
   * 
   * @param type - The type of the suggested action ('main', 'side', 'optional')
   * @returns A string containing the CSS class for the button
   */
  const actionClass = (type: string) => {
    return `px-3 py-1 text-sm rounded hover:bg-opacity-80 disabled:opacity-50 text-white ${
      type === 'combat' ? 'bg-red-500' : 
      type === 'basic' ? 'bg-blue-500' : 
      type === 'interaction' ? 'bg-green-500' : 
      'bg-black'
    }`;
  };

  return (
    <div id="bhgmInputManager" data-testid="input-manager" className="wireframe-section space-y-4 bhgm-input-manager">
      {suggestedActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedActions.map((action, index) => {
            return (
              <button
                key={`${action.type}-${index}`}
                onClick={() => handleAction(action.title)} // Use title instead of text
                disabled={isLoading}
                className={actionClass(action.type)}
                title={action.description || action.title} // Use description and title
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
          if (userInput.trim()) handleAction(userInput);
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
